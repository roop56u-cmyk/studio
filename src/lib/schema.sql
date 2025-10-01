-- Drop existing tables and functions to ensure a clean slate.
-- The CASCADE option will also remove dependent objects like triggers.
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE,
    full_name text,
    referral_code text UNIQUE,
    referred_by text,
    is_admin boolean DEFAULT false,
    status text DEFAULT 'inactive'::text,
    is_account_active boolean DEFAULT false,
    override_level integer,
    is_bonus_disabled boolean DEFAULT false,
    withdrawal_restriction_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    activated_at timestamp with time zone
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public users are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own user." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own user." ON public.users FOR UPDATE USING (auth.uid() = id);


-- Create settings table
CREATE TABLE public.settings (
    key text PRIMARY KEY,
    value jsonb
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are viewable by everyone." ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings." ON public.settings FOR ALL USING (
  (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, referral_code, referred_by, is_admin, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'referral_code',
    NEW.raw_user_meta_data->>'referred_by',
    (CASE WHEN NEW.email = 'admin@stakinghub.com' THEN true ELSE false END),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on new auth.users signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Insert default settings
-- Using dollar-quoting ($$) to avoid issues with JSON syntax
INSERT INTO public.settings (key, value) VALUES
('platform_levels', $$
  [
    {"level": 0, "name": "Unranked", "minAmount": 0, "rate": 0, "referrals": 0, "dailyTasks": 0, "monthlyWithdrawals": 0, "minWithdrawal": 0, "maxWithdrawal": 0, "earningPerTask": 0, "withdrawalFee": 0},
    {"level": 1, "name": "Bronze", "minAmount": 100, "rate": 1.8, "referrals": 0, "dailyTasks": 15, "monthlyWithdrawals": 1, "minWithdrawal": 150, "maxWithdrawal": 150, "earningPerTask": 0.3, "withdrawalFee": 5},
    {"level": 2, "name": "Silver", "minAmount": 500, "rate": 2.8, "referrals": 8, "dailyTasks": 25, "monthlyWithdrawals": 1, "minWithdrawal": 500, "maxWithdrawal": 500, "earningPerTask": 0.5, "withdrawalFee": 3},
    {"level": 3, "name": "Gold", "minAmount": 2000, "rate": 3.8, "referrals": 16, "dailyTasks": 35, "monthlyWithdrawals": 1, "minWithdrawal": 1500, "maxWithdrawal": 1500, "earningPerTask": 1.1, "withdrawalFee": 1},
    {"level": 4, "name": "Platinum", "minAmount": 6000, "rate": 4.8, "referrals": 36, "dailyTasks": 45, "monthlyWithdrawals": 1, "minWithdrawal": 2500, "maxWithdrawal": 2500, "earningPerTask": 2.5, "withdrawalFee": 1},
    {"level": 5, "name": "Diamond", "minAmount": 20000, "rate": 5.8, "referrals": 55, "dailyTasks": 55, "monthlyWithdrawals": 2, "minWithdrawal": 3500, "maxWithdrawal": 3500, "earningPerTask": 5.0, "withdrawalFee": 1}
  ]
$$::jsonb);

-- SEED ADMIN USER
-- IMPORTANT: Replace 'YOUR_ADMIN_PASSWORD' with a strong password before running this script.
DO $$
DECLARE
    admin_id uuid;
BEGIN
    -- Check if the admin user already exists in auth.users
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@stakinghub.com';

    -- If the admin user does not exist, create it
    IF admin_id IS NULL THEN
        -- Insert into auth.users to create the authentication entry
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token_iv)
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@stakinghub.com',
            crypt('YOUR_ADMIN_PASSWORD', gen_salt('bf')), -- !! REPLACE PASSWORD HERE !!
            now(),
            '',
            NULL,
            NULL,
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Admin","referral_code":"ADMIN-CODE"}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );

        -- Get the newly created admin user's ID
        SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@stakinghub.com';

        -- Insert the corresponding profile into public.users
        -- This will now be handled by the trigger, but we can update to set is_admin
        UPDATE public.users
        SET 
          is_admin = true,
          status = 'active',
          is_account_active = true,
          activated_at = now()
        WHERE email = 'admin@stakinghub.com';
    ELSE
        -- If user exists, just ensure they are admin in the public table
        UPDATE public.users
        SET 
          is_admin = true,
          status = 'active',
          is_account_active = true
        WHERE email = 'admin@stakinghub.com';
    END IF;
END $$;
