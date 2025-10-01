
-- Drop existing tables and functions to ensure a clean slate.
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Create the settings table to store key-value pairs
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- Create the users table to store public-facing user information
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    status TEXT DEFAULT 'inactive',
    is_account_active BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    override_level INTEGER,
    is_bonus_disabled BOOLEAN DEFAULT false,
    withdrawal_restriction_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    activated_at TIMESTAMPTZ
);

-- Function to create a public user profile when a new user signs up in Supabase auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, referral_code, referred_by, created_at)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'referral_code',
        new.raw_user_meta_data->>'referred_by',
        new.created_at
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to seed the admin user
CREATE OR REPLACE FUNCTION setup_admin_user()
RETURNS void AS $$
DECLARE
    admin_email TEXT := 'admin@stakinghub.com';
    admin_password TEXT := 'admin123'; -- Default password
    admin_uuid UUID;
BEGIN
    -- Check if admin exists in auth.users, if not, create it.
    -- This uses ON CONFLICT to avoid errors on subsequent runs.
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
        '{"full_name":"Admin User","referral_code":"ADMIN-CODE","referred_by":null}',
        NOW(),
        NOW(),
        '',
        '',
        NULL
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO admin_uuid;

    -- If admin_uuid is null, it means the user already existed. Fetch their ID.
    IF admin_uuid IS NULL THEN
        SELECT id INTO admin_uuid FROM auth.users WHERE email = admin_email;
    END IF;

    -- Insert or update the public profile for the admin user.
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
    ON CONFLICT (id) DO UPDATE 
    SET 
        full_name = EXCLUDED.full_name,
        is_admin = EXCLUDED.is_admin,
        status = EXCLUDED.status;

END;
$$ LANGUAGE plpgsql;

-- Execute the function to create the admin user
SELECT setup_admin_user();

-- Drop the function after use
DROP FUNCTION setup_admin_user();

-- Insert default platform settings
-- Using dollar-quoting ($$) to safely insert JSON strings.
INSERT INTO public.settings (key, value) VALUES
    ('platform_levels', $$
        [{"level": 0, "name": "Unranked", "minAmount": 0, "rate": 0, "referrals": 0, "dailyTasks": 0, "monthlyWithdrawals": 0, "minWithdrawal": 0, "maxWithdrawal": 0, "earningPerTask": 0, "withdrawalFee": 0}, {"level": 1, "name": "Bronze", "minAmount": 100, "rate": 1.8, "referrals": 0, "dailyTasks": 15, "monthlyWithdrawals": 1, "minWithdrawal": 150, "maxWithdrawal": 150, "earningPerTask": 0.3, "withdrawalFee": 5}, {"level": 2, "name": "Silver", "minAmount": 500, "rate": 2.8, "referrals": 8, "dailyTasks": 25, "monthlyWithdrawals": 1, "minWithdrawal": 500, "maxWithdrawal": 500, "earningPerTask": 0.5, "withdrawalFee": 3}, {"level": 3, "name": "Gold", "minAmount": 2000, "rate": 3.8, "referrals": 16, "dailyTasks": 35, "monthlyWithdrawals": 1, "minWithdrawal": 1500, "maxWithdrawal": 1500, "earningPerTask": 1.1, "withdrawalFee": 1}, {"level": 4, "name": "Platinum", "minAmount": 6000, "rate": 4.8, "referrals": 36, "dailyTasks": 45, "monthlyWithdrawals": 1, "minWithdrawal": 2500, "maxWithdrawal": 2500, "earningPerTask": 2.5, "withdrawalFee": 1}, {"level": 5, "name": "Diamond", "minAmount": 20000, "rate": 5.8, "referrals": 55, "dailyTasks": 55, "monthlyWithdrawals": 2, "minWithdrawal": 3500, "maxWithdrawal": 3500, "earningPerTask": 5, "withdrawalFee": 1}]
    $$::jsonb),
    ('system_withdrawal_restriction_enabled', 'true'::jsonb),
    ('system_withdrawal_restriction_days', '45'::jsonb),
    ('system_withdrawal_restricted_levels', $$ [1] $$::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security (RLS) for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for the users table
-- Allow users to view their own profile
CREATE POLICY "Allow individual user access to their own data" ON public.users FOR SELECT USING (auth.uid() = id);

-- Allow users to view profiles of their direct referrals
CREATE POLICY "Allow users to see their referrals" ON public.users FOR SELECT USING (
  (EXISTS ( SELECT 1
           FROM public.users users_2
          WHERE (users_2.id = auth.uid() AND users_2.referral_code = users.referred_by)))
);

-- Allow admins to access all user data
CREATE POLICY "Allow admin full access" ON public.users FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);

-- Final completion message inside a DO block
DO $$
BEGIN
    RAISE NOTICE 'Database schema setup and seeding complete.';
END $$;
