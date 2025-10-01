
-- Drop existing tables and functions if they exist, in reverse order of creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP TABLE IF EXISTS public.requests;
DROP TABLE IF EXISTS public.notices;
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.user_wallets;
DROP TABLE IF EXISTS public.user_profiles;
DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.levels;


-- Create Levels Table
CREATE TABLE public.levels (
    level integer PRIMARY KEY,
    name text NOT NULL,
    min_amount numeric NOT NULL DEFAULT 0,
    rate numeric NOT NULL DEFAULT 0,
    referrals integer NOT NULL DEFAULT 0,
    daily_tasks integer NOT NULL DEFAULT 0,
    monthly_withdrawals integer NOT NULL DEFAULT 0,
    min_withdrawal numeric NOT NULL DEFAULT 0,
    max_withdrawal numeric NOT NULL DEFAULT 0,
    earning_per_task numeric,
    withdrawal_fee numeric NOT NULL DEFAULT 0
);

-- Create Users Table
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    full_name text,
    referral_code text UNIQUE NOT NULL,
    referred_by text,
    override_level integer REFERENCES public.levels(level),
    is_bonus_disabled boolean DEFAULT false,
    withdrawal_restriction_until timestamptz,
    created_at timestamptz DEFAULT now(),
    activated_at timestamptz
);

-- Create User Wallets Table
CREATE TABLE public.user_wallets (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    main_balance numeric NOT NULL DEFAULT 0,
    task_rewards_balance numeric NOT NULL DEFAULT 0,
    interest_earnings_balance numeric NOT NULL DEFAULT 0,
    token_balance numeric NOT NULL DEFAULT 0,
    total_deposits numeric NOT NULL DEFAULT 0,
    total_withdrawals numeric NOT NULL DEFAULT 0,
    purchased_referrals integer NOT NULL DEFAULT 0,
    last_withdrawal_month integer,
    first_deposit_date timestamptz,
    has_claimed_signup_bonus boolean DEFAULT false,
    claimed_referral_ids jsonb DEFAULT '[]'::jsonb
);


-- Create Requests Table
CREATE TABLE public.requests (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    amount numeric NOT NULL,
    address text,
    status text NOT NULL DEFAULT 'Pending',
    created_at timestamptz DEFAULT now(),
    image_url text
);

-- Create Notices Table
CREATE TABLE public.notices (
    id bigserial PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    date timestamptz DEFAULT now(),
    image_url text
);

-- Create Messages Table
CREATE TABLE public.messages (
    id bigserial PRIMARY KEY,
    sender_id uuid REFERENCES public.users(id),
    recipient_id uuid REFERENCES public.users(id),
    content text NOT NULL,
    created_at timestamptz DEFAULT now(),
    read boolean DEFAULT false,
    image_url text
);

-- Create Settings Table (for admin settings)
CREATE TABLE public.settings (
    key text PRIMARY KEY,
    value jsonb
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a user profile
    INSERT INTO public.users (id, full_name, referral_code)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', 'REF' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

    -- Create a user wallet
    INSERT INTO public.user_wallets (user_id)
    VALUES (new.id);

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up in auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Insert default levels data
INSERT INTO public.levels (level, name, min_amount, rate, referrals, daily_tasks, monthly_withdrawals, min_withdrawal, max_withdrawal, earning_per_task, withdrawal_fee) VALUES
(0, 'Unranked', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(1, 'Bronze', 100, 1.8, 0, 15, 1, 150, 150, 0.30, 5),
(2, 'Silver', 500, 2.8, 8, 25, 1, 500, 500, 0.50, 3),
(3, 'Gold', 2000, 3.8, 16, 35, 1, 1500, 1500, 1.10, 1),
(4, 'Platinum', 6000, 4.8, 36, 45, 1, 2500, 2500, 2.50, 1),
(5, 'Diamond', 20000, 5.8, 55, 55, 2, 3500, 3500, 5.00, 1)
ON CONFLICT (level) DO NOTHING;


-- Insert default admin settings using dollar-quoting for JSON
INSERT INTO public.settings (key, value) VALUES
('platform_levels', $$
    {
        "data": [
            {"level": 0, "name": "Unranked", "minAmount": 0, "rate": 0, "referrals": 0, "dailyTasks": 0, "monthlyWithdrawals": 0, "minWithdrawal": 0, "maxWithdrawal": 0, "earningPerTask": 0, "withdrawalFee": 0},
            {"level": 1, "name": "Bronze", "minAmount": 100, "rate": 1.8, "referrals": 0, "dailyTasks": 15, "monthlyWithdrawals": 1, "minWithdrawal": 150, "maxWithdrawal": 150, "earningPerTask": 0.3, "withdrawalFee": 5},
            {"level": 2, "name": "Silver", "minAmount": 500, "rate": 2.8, "referrals": 8, "dailyTasks": 25, "monthlyWithdrawals": 1, "minWithdrawal": 500, "maxWithdrawal": 500, "earningPerTask": 0.5, "withdrawalFee": 3},
            {"level": 3, "name": "Gold", "minAmount": 2000, "rate": 3.8, "referrals": 16, "dailyTasks": 35, "monthlyWithdrawals": 1, "minWithdrawal": 1500, "maxWithdrawal": 1500, "earningPerTask": 1.1, "withdrawalFee": 1},
            {"level": 4, "name": "Platinum", "minAmount": 6000, "rate": 4.8, "referrals": 36, "dailyTasks": 45, "monthlyWithdrawals": 1, "minWithdrawal": 2500, "maxWithdrawal": 2500, "earningPerTask": 2.5, "withdrawalFee": 1},
            {"level": 5, "name": "Diamond", "minAmount": 20000, "rate": 5.8, "referrals": 55, "dailyTasks": 55, "monthlyWithdrawals": 2, "minWithdrawal": 3500, "maxWithdrawal": 3500, "earningPerTask": 5, "withdrawalFee": 1}
        ]
    }
$$::jsonb),
('team_commission_rates', $$
    {"level1": 10, "level2": 5, "level3": 2}
$$::jsonb),
('team_commission_enabled', $$
    {"level1": true, "level2": true, "level3": true}
$$::jsonb),
('system_withdrawal_restriction_enabled', 'true'::jsonb),
('system_withdrawal_restriction_days', '45'::jsonb),
('system_earning_model', '"dynamic"'::jsonb),
('system_multiple_addresses_enabled', 'true'::jsonb),
('system_signup_bonuses', $$[{"id": "default-signup", "minDeposit": 100, "bonusAmount": 8}]$$::jsonb),
('system_referral_bonuses', $$[{"id": "default-referral", "minDeposit": 100, "bonusAmount": 5}]$$::jsonb),
('system_signup_bonus_approval_required', 'false'::jsonb),
('system_referral_bonus_approval_required', 'false'::jsonb),
('system_interest_enabled', 'true'::jsonb),
('system_interest_model', '"flexible"'::jsonb),
('system_interest_fixed_term_durations', '"12h, 1d, 10d, 30d"'::jsonb),
('nft_market_settings', $$
    {
        "isNftEnabled": false, "mintingFee": 10, "platformCommission": 2.5, 
        "marketSuccessRate": 80, "failedAttemptCooldown": 60, 
        "successfulSaleCooldown": 1440, "mintableAchievementIds": []
    }
$$::jsonb)
ON CONFLICT (key) DO UPDATE SET value = excluded.value;


-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to levels" ON public.levels FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to settings" ON public.settings FOR SELECT USING (true);

-- Users can only see their own profile
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- Users can only see their own wallet
CREATE POLICY "Users can view their own wallet" ON public.user_wallets FOR SELECT USING (auth.uid() = user_id);

-- Users can create requests for themselves
CREATE POLICY "Users can create requests for themselves" ON public.requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can see their own requests
CREATE POLICY "Users can view their own requests" ON public.requests FOR SELECT USING (auth.uid() = user_id);

-- Admin access (assuming you have a way to identify admins, e.g., a custom claim)
-- For now, this is a placeholder. You would need to set up admin roles properly.
-- CREATE POLICY "Admins have full access" ON public.users USING (is_admin(auth.uid()));
-- etc. for all tables
