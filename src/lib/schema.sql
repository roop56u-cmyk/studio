
-- Drop existing tables and functions if they exist to ensure a clean setup
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.levels CASCADE;
DROP TABLE IF EXISTS public.notices CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- 1. Create Tables

-- public.users table to store user profiles
CREATE TABLE public.users (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    referral_code text UNIQUE,
    referred_by text,
    status text DEFAULT 'inactive',
    is_account_active boolean DEFAULT false,
    override_level integer,
    is_bonus_disabled boolean DEFAULT false,
    withdrawal_restriction_until timestamptz,
    created_at timestamptz DEFAULT now(),
    activated_at timestamptz,
    is_admin boolean DEFAULT false
);

-- public.settings table for admin configurations
CREATE TABLE public.settings (
    key text PRIMARY KEY,
    value jsonb
);

-- public.levels table (though most level logic is now in settings, this could be for future use)
CREATE TABLE public.levels (
    level integer PRIMARY KEY,
    name text,
    min_amount numeric,
    rate numeric,
    referrals integer,
    daily_tasks integer,
    monthly_withdrawals integer,
    min_withdrawal numeric,
    max_withdrawal numeric,
    withdrawal_fee numeric
);

-- public.notices table for announcements
CREATE TABLE public.notices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text NOT NULL,
    date timestamptz DEFAULT now(),
    image_url text
);


-- 2. Define Functions

-- Function to create a user profile when a new user signs up in auth.users
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


-- 3. Set up Triggers

-- Trigger to call handle_new_user function after a new user is created in auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
-- Users can view their own profile and admin users can view all
CREATE POLICY "Allow individual, admin read access on users" ON public.users FOR SELECT USING (auth.uid() = id OR (SELECT is_admin FROM public.users WHERE id = auth.uid()));
-- Users can update their own profile
CREATE POLICY "Allow individual update access on users" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Public read access for all settings
CREATE POLICY "Allow public read access on settings" ON public.settings FOR SELECT USING (true);
-- Admin users can insert/update/delete settings
CREATE POLICY "Allow admin full access on settings" ON public.settings FOR ALL USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()));

-- All authenticated users can read levels and notices
CREATE POLICY "Allow authenticated read access on levels" ON public.levels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access on notices" ON public.notices FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can do anything with levels and notices
CREATE POLICY "Allow admin full access on levels" ON public.levels FOR ALL USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Allow admin full access on notices" ON public.notices FOR ALL USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()));

-- 6. Seed initial data

-- Seed default level data into the settings table, not the levels table.
INSERT INTO public.settings (key, value)
VALUES
    ('platform_levels', $$
        [
            {"level": 0, "name": "Unranked", "minAmount": 0, "rate": 0, "referrals": 0, "dailyTasks": 0, "monthlyWithdrawals": 0, "minWithdrawal": 0, "maxWithdrawal": 0, "earningPerTask": 0, "withdrawalFee": 0},
            {"level": 1, "name": "Bronze", "minAmount": 100, "rate": 1.8, "referrals": 0, "dailyTasks": 15, "monthlyWithdrawals": 1, "minWithdrawal": 150, "maxWithdrawal": 150, "earningPerTask": 0.30, "withdrawalFee": 5},
            {"level": 2, "name": "Silver", "minAmount": 500, "rate": 2.8, "referrals": 8, "dailyTasks": 25, "monthlyWithdrawals": 1, "minWithdrawal": 500, "maxWithdrawal": 500, "earningPerTask": 0.50, "withdrawalFee": 3},
            {"level": 3, "name": "Gold", "minAmount": 2000, "rate": 3.8, "referrals": 16, "dailyTasks": 35, "monthlyWithdrawals": 1, "minWithdrawal": 1500, "maxWithdrawal": 1500, "earningPerTask": 1.10, "withdrawalFee": 1},
            {"level": 4, "name": "Platinum", "minAmount": 6000, "rate": 4.8, "referrals": 36, "dailyTasks": 45, "monthlyWithdrawals": 1, "minWithdrawal": 2500, "maxWithdrawal": 2500, "earningPerTask": 2.50, "withdrawalFee": 1},
            {"level": 5, "name": "Diamond", "minAmount": 20000, "rate": 5.8, "referrals": 55, "dailyTasks": 55, "monthlyWithdrawals": 2, "minWithdrawal": 3500, "maxWithdrawal": 3500, "earningPerTask": 5.00, "withdrawalFee": 1}
        ]
    $$::jsonb);

-- 7. Seed Admin User
-- This creates the admin user in Supabase Auth and the corresponding profile in your public schema.
-- This user bypasses the email confirmation requirement.

-- Generate a random UUID for the admin user
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
DO $$
DECLARE
    admin_uuid uuid := gen_random_uuid();
BEGIN
    -- Insert into auth.users to create the login credentials
    INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, confirmation_sent_at, is_super_admin)
    VALUES (
        admin_uuid,
        'authenticated',
        'authenticated',
        'admin@stakinghub.com',
        crypt('admin123', gen_salt('bf')), -- Admin password is set here
        now(),
        '',
        NULL,
        NULL,
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now(),
        '',
        NULL,
        false
    );

    -- Insert into auth.identities
    INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
    VALUES (
      admin_uuid,
      admin_uuid,
      format('{"sub":"%s","email":"admin@stakinghub.com"}', admin_uuid)::jsonb,
      'email',
      NULL,
      now(),
      now(),
      admin_uuid
    );

    -- Insert into public.users to create the user profile
    INSERT INTO public.users (id, full_name, referral_code, status, is_account_active, is_admin, activated_at)
    VALUES (
        admin_uuid,
        'Admin User',
        'ADMIN-CODE', -- Admin's unique referral code
        'active',
        true,
        true,
        now()
    );
END $$;
