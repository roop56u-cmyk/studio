
-- Drop tables in reverse order of creation to handle dependencies
DROP TABLE IF EXISTS "public"."user_wallets" CASCADE;
DROP TABLE IF EXISTS "public"."settings" CASCADE;
DROP TABLE IF EXISTS "public"."notices" CASCADE;
DROP TABLE IF EXISTS "public"."levels" CASCADE;
DROP TABLE IF EXISTS "public"."users" CASCADE;

-- Drop functions and triggers if they exist
DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
DROP FUNCTION IF EXISTS "public"."handle_new_user"();


-- 1. USERS TABLE
-- This table will store public-facing user information.
CREATE TABLE "public"."users" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "referral_code" "text" NOT NULL,
    "referred_by" "text",
    "status" "text" DEFAULT 'inactive'::text NOT NULL,
    "is_account_active" boolean DEFAULT false NOT NULL,
    "override_level" integer,
    "is_bonus_disabled" boolean DEFAULT false,
    "withdrawal_restriction_until" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "activated_at" timestamp with time zone,
    "is_admin" boolean DEFAULT false NOT NULL
);
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);
CREATE UNIQUE INDEX users_referral_code_key ON public.users USING btree (referral_code);
ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY USING INDEX "users_pkey";
ALTER TABLE "public"."users" ADD CONSTRAINT "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. LEVELS TABLE
-- Stores configuration for different user investment levels.
CREATE TABLE "public"."levels" (
    "level" integer NOT NULL,
    "name" "text" NOT NULL,
    "min_amount" real DEFAULT '0'::real NOT NULL,
    "rate" real DEFAULT '0'::real NOT NULL,
    "referrals" integer DEFAULT 0 NOT NULL,
    "daily_tasks" integer DEFAULT 1 NOT NULL,
    "monthly_withdrawals" integer DEFAULT 1 NOT NULL,
    "min_withdrawal" real DEFAULT '0'::real NOT NULL,
    "max_withdrawal" real DEFAULT '150'::real NOT NULL,
    "earning_per_task" real DEFAULT '0'::real NOT NULL,
    "withdrawal_fee" real DEFAULT '0'::real NOT NULL
);
ALTER TABLE "public"."levels" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX levels_pkey ON public.levels USING btree (level);
ALTER TABLE "public"."levels" ADD CONSTRAINT "levels_pkey" PRIMARY KEY USING INDEX "levels_pkey";

-- 3. NOTICES TABLE
-- For admin-published announcements.
CREATE TABLE "public"."notices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "date" "date" NOT NULL,
    "image_url" "text"
);
ALTER TABLE "public"."notices" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX notices_pkey ON public.notices USING btree (id);
ALTER TABLE "public"."notices" ADD CONSTRAINT "notices_pkey" PRIMARY KEY USING INDEX "notices_pkey";

-- 4. SETTINGS TABLE
-- For storing global platform settings.
CREATE TABLE "public"."settings" (
    "key" "text" NOT NULL,
    "value" "jsonb"
);
ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX settings_pkey ON public.settings USING btree (key);
ALTER TABLE "public"."settings" ADD CONSTRAINT "settings_pkey" PRIMARY KEY USING INDEX "settings_pkey";

-- 5. USER WALLETS TABLE
-- Stores various wallet balances for each user.
CREATE TABLE "public"."user_wallets" (
    "user_id" "uuid" NOT NULL,
    "main_balance" real DEFAULT '0'::real NOT NULL,
    "task_rewards_balance" real DEFAULT '0'::real NOT NULL,
    "interest_earnings_balance" real DEFAULT '0'::real NOT NULL,
    "token_balance" real DEFAULT '0'::real NOT NULL,
    "deposits" integer DEFAULT 0 NOT NULL,
    "withdrawals" integer DEFAULT 0 NOT NULL,
    "total_deposits" real DEFAULT '0'::real NOT NULL
);
ALTER TABLE "public"."user_wallets" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX user_wallets_pkey ON public.user_wallets USING btree (user_id);
ALTER TABLE "public"."user_wallets" ADD CONSTRAINT "user_wallets_pkey" PRIMARY KEY USING INDEX "user_wallets_pkey";
ALTER TABLE "public"."user_wallets" ADD CONSTRAINT "user_wallets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- FUNCTION to handle new user creation
CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
RETURNS "trigger"
LANGUAGE "plpgsql"
SECURITY DEFINER AS $$
BEGIN
  -- Create a public profile
  INSERT INTO public.users (id, full_name, referral_code, referred_by)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'referral_code',
    new.raw_user_meta_data->>'referred_by'
  );
  -- Create a wallet for the new user
  INSERT INTO public.user_wallets (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- TRIGGER to call the function when a new user signs up in Supabase Auth
CREATE TRIGGER "on_auth_user_created"
AFTER INSERT ON "auth"."users"
FOR EACH ROW EXECUTE PROCEDURE "public"."handle_new_user"();


-- SEED DATA for initial setup

-- Insert default levels configuration
INSERT INTO "public"."levels" ("level", "name", "min_amount", "rate", "referrals", "daily_tasks", "monthly_withdrawals", "min_withdrawal", "max_withdrawal", "earning_per_task", "withdrawal_fee") VALUES
(0, 'Unranked', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(1, 'Bronze', 100, 1.8, 0, 15, 1, 150, 150, 0.3, 5),
(2, 'Silver', 500, 2.8, 8, 25, 1, 500, 500, 0.5, 3),
(3, 'Gold', 2000, 3.8, 16, 35, 1, 1500, 1500, 1.1, 1),
(4, 'Platinum', 6000, 4.8, 36, 45, 1, 2500, 2500, 2.5, 1),
(5, 'Diamond', 20000, 5.8, 55, 55, 2, 3500, 3500, 5, 1);


-- Insert default settings as JSON
-- Using dollar-quoting $$...$$ to avoid issues with special characters.
INSERT INTO "public"."settings" ("key", "value") VALUES
('platform_levels', $$
  [
    {"level": 0, "name": "Unranked", "minAmount": 0, "rate": 0, "referrals": 0, "dailyTasks": 0, "monthlyWithdrawals": 0, "minWithdrawal": 0, "maxWithdrawal": 0, "earningPerTask": 0, "withdrawalFee": 0},
    {"level": 1, "name": "Bronze", "minAmount": 100, "rate": 1.8, "referrals": 0, "dailyTasks": 15, "monthlyWithdrawals": 1, "minWithdrawal": 150, "maxWithdrawal": 150, "earningPerTask": 0.3, "withdrawalFee": 5},
    {"level": 2, "name": "Silver", "minAmount": 500, "rate": 2.8, "referrals": 8, "dailyTasks": 25, "monthlyWithdrawals": 1, "minWithdrawal": 500, "maxWithdrawal": 500, "earningPerTask": 0.5, "withdrawalFee": 3},
    {"level": 3, "name": "Gold", "minAmount": 2000, "rate": 3.8, "referrals": 16, "dailyTasks": 35, "monthlyWithdrawals": 1, "minWithdrawal": 1500, "maxWithdrawal": 1500, "earningPerTask": 1.1, "withdrawalFee": 1},
    {"level": 4, "name": "Platinum", "minAmount": 6000, "rate": 4.8, "referrals": 36, "dailyTasks": 45, "monthlyWithdrawals": 1, "minWithdrawal": 2500, "maxWithdrawal": 2500, "earningPerTask": 2.5, "withdrawalFee": 1},
    {"level": 5, "name": "Diamond", "minAmount": 20000, "rate": 5.8, "referrals": 55, "dailyTasks": 55, "monthlyWithdrawals": 2, "minWithdrawal": 3500, "maxWithdrawal": 3500, "earningPerTask": 5, "withdrawalFee": 1}
  ]
$$::jsonb);

-- CREATE ADMIN USER
-- This section inserts the admin user directly into the authentication and public users table.
-- It bypasses the need for email verification for the admin account.
DO $$
DECLARE
    admin_email TEXT := 'admin@stakinghub.com';
    admin_password TEXT := 'admin123'; -- Your desired admin password
    admin_uuid UUID;
BEGIN
    -- Check if the user already exists in auth.users
    SELECT id INTO admin_uuid FROM auth.users WHERE email = admin_email;

    -- If user does not exist, create it in auth.users
    IF admin_uuid IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_sent_at, confirmed_at)
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
            NULL,
            NOW()
        ) RETURNING id INTO admin_uuid;
    END IF;

    -- Check if the profile exists in public.users, if not, create it.
    -- This handles cases where the script is re-run.
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = admin_uuid) THEN
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
    END IF;

    -- Check if the wallet exists in public.user_wallets, if not, create it.
    IF NOT EXISTS (SELECT 1 FROM public.user_wallets WHERE user_id = admin_uuid) THEN
        INSERT INTO public.user_wallets (user_id)
        VALUES (admin_uuid);
    END IF;

END $$;
