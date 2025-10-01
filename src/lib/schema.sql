
-- Drop existing tables and functions to ensure a clean slate.
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the settings table to store key-value pairs for the application.
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- Create the users table to store public-facing user information.
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    status TEXT DEFAULT 'inactive',
    is_account_active BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    override_level INTEGER,
    is_bonus_disabled BOOLEAN DEFAULT FALSE,
    withdrawal_restriction_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ
);

-- Function to create a public user profile when a new auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_user_id UUID := NEW.id;
    new_user_email TEXT := NEW.email;
    new_user_full_name TEXT := NEW.raw_user_meta_data->>'full_name';
    new_user_referral_code TEXT := NEW.raw_user_meta_data->>'referral_code';
    new_user_referred_by TEXT := NEW.raw_user_meta_data->>'referred_by';
BEGIN
    INSERT INTO public.users (id, full_name, email, referral_code, referred_by)
    VALUES (
        new_user_id,
        new_user_full_name,
        new_user_email,
        new_user_referral_code,
        new_user_referred_by
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the handle_new_user function after a new user signs up.
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Seed the admin user and default settings.
-- This block ensures the admin user is created without needing email verification.
DO $$
DECLARE
    admin_email TEXT := 'admin@stakinghub.com';
    admin_password TEXT := 'admin123'; -- Your desired admin password.
    admin_uuid UUID;
BEGIN
    -- Check if the admin user already exists in auth.users
    SELECT id INTO admin_uuid FROM auth.users WHERE email = admin_email;

    -- If the admin user does not exist, create it.
    IF admin_uuid IS NULL THEN
        -- Insert into auth.users and get the new user's ID
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_sent_at)
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            admin_email,
            crypt(admin_password, gen_salt('bf')),
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
        ) RETURNING id INTO admin_uuid;

        RAISE NOTICE 'Admin user created with email: %', admin_email;
    ELSE
        RAISE NOTICE 'Admin user with email % already exists. Skipping creation.', admin_email;
    END IF;

    -- Insert or update the public profile for the admin user.
    INSERT INTO public.users (id, full_name, email, referral_code, status, is_account_active, is_admin, activated_at)
    VALUES (
        admin_uuid,
        'Admin User',
        admin_email,
        'ADMIN-CODE', -- Admin's unique referral code
        'active',
        true,
        true,
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        is_admin = EXCLUDED.is_admin,
        status = EXCLUDED.status,
        is_account_active = EXCLUDED.is_account_active,
        referral_code = EXCLUDED.referral_code;

    -- Insert default level settings
    INSERT INTO public.settings (key, value)
    VALUES
        ('platform_levels', $$
            [
                { "level": 0, "name": "Unranked", "minAmount": 0, "rate": 0, "referrals": 0, "dailyTasks": 0, "monthlyWithdrawals": 0, "minWithdrawal": 0, "maxWithdrawal": 0, "earningPerTask": 0, "withdrawalFee": 0 },
                { "level": 1, "name": "Bronze", "minAmount": 100, "rate": 1.8, "referrals": 0, "dailyTasks": 15, "monthlyWithdrawals": 1, "minWithdrawal": 150, "maxWithdrawal": 150, "earningPerTask": 0.30, "withdrawalFee": 5 },
                { "level": 2, "name": "Silver", "minAmount": 500, "rate": 2.8, "referrals": 8, "dailyTasks": 25, "monthlyWithdrawals": 1, "minWithdrawal": 500, "maxWithdrawal": 500, "earningPerTask": 0.50, "withdrawalFee": 3 },
                { "level": 3, "name": "Gold", "minAmount": 2000, "rate": 3.8, "referrals": 16, "dailyTasks": 35, "monthlyWithdrawals": 1, "minWithdrawal": 1500, "maxWithdrawal": 1500, "earningPerTask": 1.10, "withdrawalFee": 1 },
                { "level": 4, "name": "Platinum", "minAmount": 6000, "rate": 4.8, "referrals": 36, "dailyTasks": 45, "monthlyWithdrawals": 1, "minWithdrawal": 2500, "maxWithdrawal": 2500, "earningPerTask": 2.50, "withdrawalFee": 1 },
                { "level": 5, "name": "Diamond", "minAmount": 20000, "rate": 5.8, "referrals": 55, "dailyTasks": 55, "monthlyWithdrawals": 2, "minWithdrawal": 3500, "maxWithdrawal": 3500, "earningPerTask": 5.00, "withdrawalFee": 1 }
            ]
        $$)
    ON CONFLICT (key) DO NOTHING;

    -- Insert other default settings
    INSERT INTO public.settings (key, value)
    VALUES
        ('system_earning_model', '"dynamic"'),
        ('system_interest_enabled', 'true'),
        ('system_interest_model', '"flexible"'),
        ('system_interest_fixed_term_durations', '"30m, 12h, 1d, 10d, 30d"'),
        ('system_withdrawal_restriction_enabled', 'true'),
        ('system_withdrawal_restriction_days', '45'),
        ('system_withdrawal_restriction_message', '"Please wait for 45 days to initiate withdrawal request."'),
        ('system_withdrawal_restricted_levels', '[1]'),
        ('system_multiple_addresses_enabled', 'true'),
        ('team_commission_rates', '{"level1": 10, "level2": 5, "level3": 2}'),
        ('team_commission_enabled', '{"level1": true, "level2": true, "level3": true}')
    ON CONFLICT (key) DO NOTHING;
END $$;
