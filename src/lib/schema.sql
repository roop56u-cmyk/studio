-- Drop existing objects in reverse order of dependency, using CASCADE to handle dependencies automatically.
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.requests CASCADE;
DROP TABLE IF EXISTS public.user_wallets CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- Drop the trigger and function separately to ensure clean recreation.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Now drop the users table.
DROP TABLE IF EXISTS public.users CASCADE;

-- Create public.users table
-- This table will hold public user data.
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    status TEXT DEFAULT 'inactive',
    is_account_active BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    override_level INT,
    is_bonus_disabled BOOLEAN DEFAULT false,
    withdrawal_restriction_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    activated_at TIMESTAMPTZ
);
COMMENT ON TABLE public.users IS 'Public user profile information.';

-- Create public.user_wallets table
CREATE TABLE public.user_wallets (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    main_balance NUMERIC(15, 4) DEFAULT 0.00,
    task_rewards_balance NUMERIC(15, 4) DEFAULT 0.00,
    interest_earnings_balance NUMERIC(15, 4) DEFAULT 0.00,
    total_deposits NUMERIC(15, 4) DEFAULT 0.00
);
COMMENT ON TABLE public.user_wallets IS 'Stores wallet balances for each user.';

-- Create public.requests table
CREATE TABLE public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount NUMERIC(15, 4) NOT NULL,
    address TEXT,
    status TEXT DEFAULT 'Pending',
    date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    image_url TEXT
);
COMMENT ON TABLE public.requests IS 'Stores user requests for recharge, withdrawal, etc.';

-- Create public.messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    read BOOLEAN DEFAULT false
);
COMMENT ON TABLE public.messages IS 'Stores messages between users and admins.';

-- Create public.settings table
-- This table will store key-value pairs for global application settings.
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB
);
COMMENT ON TABLE public.settings IS 'Stores global application settings.';

-- Set row-level security policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow individual read access to own user data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow individual read access to own wallet" ON public.user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual access to own requests" ON public.requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow individual access to own messages" ON public.messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Function to handle new user signup
-- This function will be triggered when a new user is created in the auth.users table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, referral_code, referred_by, created_at)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'referral_code',
    new.raw_user_meta_data->>'referred_by',
    new.created_at
  );
  
  INSERT INTO public.user_wallets (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- Trigger to execute the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed initial settings into the settings table
INSERT INTO public.settings (key, value) VALUES
    ('system_withdrawal_restriction_enabled', 'true'),
    ('system_withdrawal_restriction_days', '45'),
    ('system_withdrawal_restriction_message', '"Please wait for 45 days to initiate withdrawal request."'),
    ('system_withdrawal_restricted_levels', '[1]'),
    ('platform_levels', $$[
        {"level": 1, "name": "Bronze", "minAmount": 100, "rate": 1.8, "referrals": 0, "dailyTasks": 15, "monthlyWithdrawals": 1, "minWithdrawal": 150, "maxWithdrawal": 150, "earningPerTask": 0.3, "withdrawalFee": 5},
        {"level": 2, "name": "Silver", "minAmount": 500, "rate": 2.8, "referrals": 8, "dailyTasks": 25, "monthlyWithdrawals": 1, "minWithdrawal": 500, "maxWithdrawal": 500, "earningPerTask": 0.5, "withdrawalFee": 3},
        {"level": 3, "name": "Gold", "minAmount": 2000, "rate": 3.8, "referrals": 16, "dailyTasks": 35, "monthlyWithdrawals": 1, "minWithdrawal": 1500, "maxWithdrawal": 1500, "earningPerTask": 1.1, "withdrawalFee": 1},
        {"level": 4, "name": "Platinum", "minAmount": 6000, "rate": 4.8, "referrals": 36, "dailyTasks": 45, "monthlyWithdrawals": 1, "minWithdrawal": 2500, "maxWithdrawal": 2500, "earningPerTask": 2.5, "withdrawalFee": 1},
        {"level": 5, "name": "Diamond", "minAmount": 20000, "rate": 5.8, "referrals": 55, "dailyTasks": 55, "monthlyWithdrawals": 2, "minWithdrawal": 3500, "maxWithdrawal": 3500, "earningPerTask": 5.0, "withdrawalFee": 1}
    ]$$::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Function to create the admin user if they don't exist
CREATE OR REPLACE FUNCTION setup_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_email TEXT := 'admin@stakinghub.com';
    admin_password TEXT := 'admin123'; -- !! SET ADMIN PASSWORD HERE !!
    admin_uuid UUID;
    user_count INT;
BEGIN
    -- Check if the admin user already exists in auth.users
    SELECT count(*) INTO user_count FROM auth.users WHERE email = admin_email;

    -- If the user does not exist, create them
    IF user_count = 0 THEN
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
            '{"full_name":"Admin User","referral_code":"ADMIN-CODE","referred_by":null}',
            NOW(),
            NOW(),
            '',
            '',
            NULL
        )
        RETURNING id INTO admin_uuid;

        -- Insert corresponding profile into public.users
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
        
        -- Insert wallet for admin user
        INSERT INTO public.user_wallets (user_id)
        VALUES (admin_uuid);

        RAISE NOTICE 'Admin user created successfully.';
    ELSE
        RAISE NOTICE 'Admin user already exists, skipping creation.';
    END IF;
END;
$$;

-- Execute the function to set up the admin user
SELECT setup_admin_user();

-- Final confirmation message
DO $$
BEGIN
    RAISE NOTICE 'Database schema setup and seeding complete.';
END $$;
