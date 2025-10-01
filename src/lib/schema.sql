-- Drop existing tables and functions to ensure a clean slate
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP FUNCTION IF EXISTS public.create_admin_user;

-- Create a table for public user profiles
CREATE TABLE public.users (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'disabled')),
    is_account_active BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    override_level INT,
    is_bonus_disabled BOOLEAN DEFAULT false,
    withdrawal_restriction_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    activated_at TIMESTAMPTZ
);

-- Create a table for global platform settings
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB
);


-- Function to insert a new user profile when a user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, referral_code, referred_by)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'referral_code',
        new.raw_user_meta_data->>'referred_by'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Function to create the initial admin user.
-- This makes setup easier and bypasses public sign-up for the admin.
CREATE OR REPLACE FUNCTION public.create_admin_user(
    admin_email TEXT,
    admin_password TEXT
)
RETURNS void AS $$
DECLARE
    admin_uuid UUID;
BEGIN
    -- Insert into auth.users and handle conflicts if the user already exists
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_sent_at)
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        admin_email,
        crypt(admin_password, gen_salt('bf')), -- Securely hash the password
        NOW(), -- Automatically confirm the admin's email
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

    -- If admin_uuid is NULL, the user already existed. Fetch their UUID.
    IF admin_uuid IS NULL THEN
        SELECT id INTO admin_uuid FROM auth.users WHERE email = admin_email;
    END IF;

    -- Insert or update the public user profile for the admin
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
END;
$$ LANGUAGE plpgsql;

-- Immediately execute the function to create the admin user
SELECT public.create_admin_user('admin@stakinghub.com', 'admin123');

--
-- Default global settings
--
INSERT INTO public.settings (key, value)
VALUES
    ('platform_levels', $$
      [
        {"level": 0, "name": "Unranked", "minAmount": 0, "rate": 0, "referrals": 0, "dailyTasks": 0, "monthlyWithdrawals": 0, "minWithdrawal": 0, "maxWithdrawal": 0, "earningPerTask": 0, "withdrawalFee": 0},
        {"level": 1, "name": "Bronze", "minAmount": 100, "rate": 1.8, "referrals": 0, "dailyTasks": 15, "monthlyWithdrawals": 1, "minWithdrawal": 150, "maxWithdrawal": 150, "earningPerTask": 0.3, "withdrawalFee": 5},
        {"level": 2, "name": "Silver", "minAmount": 500, "rate": 2.8, "referrals": 8, "dailyTasks": 25, "monthlyWithdrawals": 1, "minWithdrawal": 500, "maxWithdrawal": 500, "earningPerTask": 0.5, "withdrawalFee": 3},
        {"level": 3, "name": "Gold", "minAmount": 2000, "rate": 3.8, "referrals": 16, "dailyTasks": 35, "monthlyWithdrawals": 1, "minWithdrawal": 1500, "maxWithdrawal": 1500, "earningPerTask": 1.1, "withdrawalFee": 1},
        {"level": 4, "name": "Platinum", "minAmount": 6000, "rate": 4.8, "referrals": 36, "dailyTasks": 45, "monthlyWithdrawals": 1, "minWithdrawal": 2500, "maxWithdrawal": 2500, "earningPerTask": 2.5, "withdrawalFee": 1},
        {"level": 5, "name": "Diamond", "minAmount": 20000, "rate": 5.8, "referrals": 55, "dailyTasks": 55, "monthlyWithdrawals": 2, "minWithdrawal": 3500, "maxWithdrawal": 3500, "earningPerTask": 5, "withdrawalFee": 1}
      ]
    $$::jsonb),
    ('system_withdrawal_restriction_message', $$"Please wait for 45 days to initiate withdrawal request."$$::jsonb),
    ('system_withdrawal_restricted_levels', $$[1]$$::jsonb)
ON CONFLICT (key) DO NOTHING;
