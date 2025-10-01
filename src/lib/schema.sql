
-- Enable Row Level Security
alter table "public"."users" enable row level security;
-- other tables...

-- Create policies
create policy "Users can view their own data." on users for select using (auth.uid() = id);
create policy "Users can update their own data." on users for update using (auth.uid() = id);

-- You would need to create tables and policies for all your data:
-- wallets, settings, notices, messages, requests, etc.
-- This is a starting point.

-- Example for a user profile table that extends Supabase Auth users
create table public.users (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  referral_code text unique,
  referred_by text,
  status text default 'inactive',
  is_account_active boolean default false,
  override_level int,
  is_bonus_disabled boolean default false,
  withdrawal_restriction_until timestamptz,
  activated_at timestamptz,
  is_admin boolean default false,

  primary key (id)
);

-- Wallets Table
CREATE TABLE public.wallets (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    main_balance NUMERIC(15, 4) DEFAULT 0,
    task_rewards_balance NUMERIC(15, 4) DEFAULT 0,
    interest_earnings_balance NUMERIC(15, 4) DEFAULT 0,
    token_balance NUMERIC(15, 4) DEFAULT 0
);

-- Settings Tables
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB
);
