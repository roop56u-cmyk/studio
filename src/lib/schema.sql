
-- Drop existing tables and functions to ensure a clean slate
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Custom function to safely delete the admin user from auth.users if it exists
DO $$
DECLARE
    admin_email_to_delete TEXT := 'admin@stakinghub.com';
BEGIN
    -- This requires the service_role key to be set up, but will execute safely if not.
    -- In a local or dashboard context, this should work.
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email_to_delete) THEN
        BEGIN
            DELETE FROM auth.users WHERE email = admin_email_to_delete;
            RAISE NOTICE 'Admin user % deleted from auth.users.', admin_email_to_delete;
        EXCEPTION
            WHEN insufficient_privilege THEN
                RAISE WARNING 'Insufficient privileges to delete from auth.users. This is expected if not running as a superuser. Continuing...';
            WHEN OTHERS THEN
                RAISE WARNING 'An error occurred while trying to delete from auth.users: %', SQLERRM;
        END;
    END IF;
END $$;


-- Create a table for public user profiles
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    full_name TEXT,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    status TEXT DEFAULT 'inactive'::text NOT NULL,
    is_account_active BOOLEAN DEFAULT false NOT NULL,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    override_level INTEGER,
    is_bonus_disabled BOOLEAN DEFAULT false,
    withdrawal_restriction_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    activated_at TIMESTAMPTZ
);

-- Create a table for system-wide settings
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- Function to insert a new user profile when a user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    referral_code_val TEXT;
BEGIN
    -- Generate a unique referral code
    LOOP
        referral_code_val := 'TRH-' || substr(md5(random()::text), 1, 8);
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = referral_code_val);
    END LOOP;

    -- Insert into public.users
    INSERT INTO public.users (id, full_name, referral_code, referred_by)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        referral_code_val,
        new.raw_user_meta_data->>'referred_by'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Trigger to execute the function on new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Function to create the admin user
DO $$
DECLARE
    admin_email TEXT := 'admin@stakinghub.com';
    admin_password TEXT := 'admin123'; -- Your desired admin password
    admin_uuid UUID;
BEGIN
    -- Create the user in auth.users and get the ID
    -- Use ON CONFLICT to avoid errors if the user already exists in auth.users
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_sent_at)
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            admin_email,
            crypt(admin_password, gen_salt('bf')), -- !! Securely hashes the password !!
            NOW(),
            '',
            NULL,
            NULL,
            '{"provider":"email","providers":["email"]}',
            '{}',
            NOW(),
            NOW(),
            '',
            '',
            NULL
        )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO admin_uuid;

    -- If the user was newly inserted, admin_uuid will have a value.
    -- If the user already existed, we need to fetch their UUID.
    IF admin_uuid IS NULL THEN
        SELECT id INTO admin_uuid FROM auth.users WHERE email = admin_email;
    END IF;

    -- Create or update the corresponding profile in public.users
    -- Use ON CONFLICT to prevent errors if the profile already exists.
    INSERT INTO public.users (id, full_name, referral_code, status, is_account_active, is_admin, activated_at)
    VALUES (
        admin_uuid,
        'Admin User',
        'ADMIN-CODE', -- Admin's unique referral code
        'active',
        true,
        true,
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = 'Admin User',
        referral_code = 'ADMIN-CODE',
        status = 'active',
        is_account_active = true,
        is_admin = true;

    RAISE NOTICE 'Admin user setup complete for %', admin_email;
END $$;


-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
    ('system_signup_bonus_enabled', 'true'::jsonb),
    ('system_signup_bonus_approval_required', 'false'::jsonb),
    ('system_signup_bonuses', $$[{"id": "default-signup", "minDeposit": 100, "bonusAmount": 8}]$$::jsonb),
    ('system_referral_bonus_enabled', 'true'::jsonb),
    ('system_referral_bonus_approval_required', 'false'::jsonb),
    ('system_referral_bonuses', $$[{"id": "default-referral", "minDeposit": 100, "bonusAmount": 5}]$$::jsonb),
    ('system_withdrawal_restriction_enabled', 'true'::jsonb),
    ('system_withdrawal_restriction_days', '45'::jsonb),
    ('system_withdrawal_restriction_message', $$"Please wait for 45 days to initiate withdrawal request."$$::jsonb),
    ('system_withdrawal_restricted_levels', $$[1]$$::jsonb),
    ('system_multiple_addresses_enabled', 'true'::jsonb),
    ('system_earning_model', '"dynamic"'::jsonb),
    ('system_interest_enabled', 'true'::jsonb),
    ('system_interest_model', '"flexible"'::jsonb),
    ('system_interest_fixed_term_durations', '"12h, 1d, 10d, 30d"'::jsonb),
    ('platform_levels', $$[{"level": 0, "name": "Unranked", "minAmount": 0, "rate": 0, "referrals": 0, "dailyTasks": 0, "monthlyWithdrawals": 0, "minWithdrawal": 0, "maxWithdrawal": 0, "earningPerTask": 0, "withdrawalFee": 0}, {"level": 1, "name": "Bronze", "minAmount": 100, "rate": 1.8, "referrals": 0, "dailyTasks": 15, "monthlyWithdrawals": 1, "minWithdrawal": 150, "maxWithdrawal": 150, "earningPerTask": 0.3, "withdrawalFee": 5}, {"level": 2, "name": "Silver", "minAmount": 500, "rate": 2.8, "referrals": 8, "dailyTasks": 25, "monthlyWithdrawals": 1, "minWithdrawal": 500, "maxWithdrawal": 500, "earningPerTask": 0.5, "withdrawalFee": 3}, {"level": 3, "name": "Gold", "minAmount": 2000, "rate": 3.8, "referrals": 16, "dailyTasks": 35, "monthlyWithdrawals": 1, "minWithdrawal": 1500, "maxWithdrawal": 1500, "earningPerTask": 1.1, "withdrawalFee": 1}, {"level": 4, "name": "Platinum", "minAmount": 6000, "rate": 4.8, "referrals": 36, "dailyTasks": 45, "monthlyWithdrawals": 1, "minWithdrawal": 2500, "maxWithdrawal": 2500, "earningPerTask": 2.5, "withdrawalFee": 1}, {"level": 5, "name": "Diamond", "minAmount": 20000, "rate": 5.8, "referrals": 55, "dailyTasks": 55, "monthlyWithdrawals": 2, "minWithdrawal": 3500, "maxWithdrawal": 3500, "earningPerTask": 5, "withdrawalFee": 1}]$$::jsonb)
ON CONFLICT (key) DO UPDATE SET value = excluded.value;

RAISE NOTICE 'Database schema setup and seeding complete.';

