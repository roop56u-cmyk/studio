
-- Drop existing tables and functions if they exist, to ensure a clean slate.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP TABLE IF EXISTS public.requests;
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.user_wallets;
DROP TABLE IF EXISTS public.notices;
DROP TABLE IF EXISTS public.admin_settings;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.levels;

-- 1. Create Tables
-- Create the levels table first as it's referenced by users
CREATE TABLE public.levels (
    level integer PRIMARY KEY,
    name text NOT NULL,
    min_amount numeric NOT NULL,
    rate numeric NOT NULL,
    referrals integer NOT NULL,
    daily_tasks integer NOT NULL,
    monthly_withdrawals integer NOT NULL,
    min_withdrawal numeric NOT NULL,
    max_withdrawal numeric NOT NULL,
    earning_per_task numeric NOT NULL,
    withdrawal_fee numeric NOT NULL
);

-- Create a table for public user profiles
CREATE TABLE public.users (
  id uuid NOT NULL PRIMARY KEY,
  full_name text,
  referral_code text UNIQUE,
  referred_by text,
  status text DEFAULT 'inactive',
  is_account_active boolean DEFAULT false,
  override_level integer REFERENCES public.levels(level),
  is_bonus_disabled boolean DEFAULT false,
  withdrawal_restriction_until timestamptz,
  created_at timestamptz DEFAULT now(),
  activated_at timestamptz
);

-- Wallets table to store all user balances
CREATE TABLE public.user_wallets (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    main_balance numeric DEFAULT 0,
    task_rewards_balance numeric DEFAULT 0,
    interest_earnings_balance numeric DEFAULT 0,
    token_balance numeric DEFAULT 0,
    deposits integer DEFAULT 0,
    withdrawals integer DEFAULT 0,
    total_deposits numeric DEFAULT 0,
    last_withdrawal_month integer,
    has_claimed_signup_bonus boolean DEFAULT false
);

-- Requests table for withdrawals, recharges etc.
CREATE TABLE public.requests (
    id bigserial PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    amount numeric NOT NULL,
    address text,
    status text DEFAULT 'Pending',
    created_at timestamptz DEFAULT now(),
    image_url text
);

-- Messages table for inbox
CREATE TABLE public.messages (
    id bigserial PRIMARY KEY,
    sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    content text,
    created_at timestamptz DEFAULT now(),
    read boolean DEFAULT false,
    image_url text
);

-- Notices table for admin announcements
CREATE TABLE public.notices (
    id bigserial PRIMARY KEY,
    title text NOT NULL,
    content text,
    date timestamptz DEFAULT now(),
    image_url text
);

-- Admin settings table (key-value store)
CREATE TABLE public.admin_settings (
    key text PRIMARY KEY,
    value jsonb
);

-- 2. Create Functions

-- This function is triggered when a new user signs up in Supabase's auth system.
-- It creates a corresponding profile for them in our public.users table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  -- Generate a unique referral code
  new_referral_code := 'TRH-' || substr(md5(random()::text), 0, 9);
  -- Insert a new row into the public.users table
  INSERT INTO public.users (id, full_name, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    new_referral_code,
    NEW.raw_user_meta_data->>'referral_code'
  );
  -- Insert a corresponding wallet entry
  INSERT INTO public.user_wallets (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Create Triggers

-- This trigger calls the handle_new_user function whenever a new user is added to the auth.users table.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Insert default admin user if it doesn't exist
INSERT INTO public.users (id, full_name, referral_code, status, is_account_active)
SELECT '00000000-0000-0000-0000-000000000000', 'Platform Admin', 'ADMINREF001', 'active', true
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO public.user_wallets (user_id)
SELECT '00000000-0000-0000-0000-000000000000'
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_wallets WHERE user_id = '00000000-0000-0000-0000-000000000000'
);

-- Insert default level data
INSERT INTO public.levels (level, name, min_amount, rate, referrals, daily_tasks, monthly_withdrawals, min_withdrawal, max_withdrawal, earning_per_task, withdrawal_fee) VALUES
(0, 'Unranked', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(1, 'Bronze', 100, 1.8, 0, 15, 1, 150, 150, 0.3, 5),
(2, 'Silver', 500, 2.8, 8, 25, 1, 500, 500, 0.5, 3),
(3, 'Gold', 2000, 3.8, 16, 35, 1, 1500, 1500, 1.1, 1),
(4, 'Platinum', 6000, 4.8, 36, 45, 1, 2500, 2500, 2.5, 1),
(5, 'Diamond', 20000, 5.8, 55, 55, 2, 3500, 3500, 5, 1)
ON CONFLICT (level) DO NOTHING;

-- Insert default admin settings
INSERT INTO public.admin_settings (key, value) VALUES
('platform_levels', '{"data": [{"level": 0, "name": "Unranked", ...}]}'::jsonb),
('team_commission_rates', '{"level1": 10, "level2": 5, "level3": 2}'::jsonb),
('system_signup_bonuses', '[{"id": "default-signup", "minDeposit": 100, "bonusAmount": 8}]'::jsonb)
ON CONFLICT (key) DO NOTHING;
