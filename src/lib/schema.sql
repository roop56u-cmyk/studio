
-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.levels enable row level security;
alter table public.notices enable row level security;
alter table public.settings enable row level security;

-- Create Policies for public.users
create policy "Public users are viewable by everyone."
on public.users for select
to authenticated
using ( true );

create policy "Users can insert their own user."
on public.users for insert
to authenticated
with check ( auth.uid() = id );

create policy "Users can update their own user."
on public.users for update
to authenticated
using ( auth.uid() = id );

-- Create Policies for other tables (adjust as needed)
create policy "Levels are viewable by everyone."
on public.levels for select
to authenticated
using ( true );

create policy "Notices are viewable by everyone."
on public.notices for select
to authenticated
using ( true );

create policy "Settings are viewable by everyone."
on public.settings for select
to authenticated
using ( true );


-- Create a function to handle new user creation
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, "fullName", "referralCode", "referredBy", "createdAt")
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'referral_code', new.raw_user_meta_data->>'referred_by', new.created_at);
  return new;
end;
$$;

-- Create a trigger to call the function when a new user signs up in auth
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Create Database Tables
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "fullName" TEXT,
  email TEXT UNIQUE,
  "isAdmin" BOOLEAN DEFAULT FALSE,
  "referralCode" TEXT UNIQUE NOT NULL,
  "referredBy" TEXT,
  status TEXT DEFAULT 'inactive',
  "isAccountActive" BOOLEAN DEFAULT FALSE,
  "overrideLevel" INT,
  "isBonusDisabled" BOOLEAN DEFAULT FALSE,
  "withdrawalRestrictionUntil" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "activatedAt" TIMESTAMPTZ
);

CREATE TABLE public.levels (
    id SERIAL PRIMARY KEY,
    level INT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    "minAmount" NUMERIC NOT NULL,
    rate NUMERIC NOT NULL,
    referrals INT NOT NULL,
    "dailyTasks" INT NOT NULL,
    "monthlyWithdrawals" INT NOT NULL,
    "minWithdrawal" NUMERIC NOT NULL,
    "maxWithdrawal" NUMERIC NOT NULL,
    "earningPerTask" NUMERIC NOT NULL,
    "withdrawalFee" NUMERIC NOT NULL
);

CREATE TABLE public.notices (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- Seed Admin User
-- IMPORTANT: Replace 'YOUR_ADMIN_PASSWORD' with a secure password before running!
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Insert into auth.users and get the new user's ID
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token_encrypted)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@stakinghub.com',
    crypt('YOUR_ADMIN_PASSWORD', gen_salt('bf')), -- Replace 'YOUR_ADMIN_PASSWORD'
    NOW(),
    NULL,
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"full_name": "Admin"}',
    NOW(),
    NOW(),
    NULL,
    '',
    NULL,
    NULL
  ) ON CONFLICT (email) DO NOTHING RETURNING id INTO admin_user_id;

  -- Insert the corresponding profile into public.users only if the user was newly created
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, "fullName", "isAdmin", "referralCode", "referredBy", status, "isAccountActive", "createdAt", "activatedAt")
    VALUES (
      admin_user_id,
      'admin@stakinghub.com',
      'Admin',
      true,
      'ADMIN-CODE', -- Unique referral code for the admin
      NULL,
      'active',
      true,
      NOW(),
      NOW()
    );
  END IF;
END $$;


-- Seed initial settings data
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
$$::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value) VALUES
('platform_notices', $$
  {
    "data": [
      {
        "id": "NOTICE-1698886800000",
        "title": "Welcome to the New Platform!",
        "content": "We are excited to launch our new and improved platform. Explore the features and start earning today. If you have any questions, please reach out to our support team via the Inbox.",
        "date": "2024-01-01T10:00:00.000Z",
        "imageUrl": null
      }
    ]
  }
$$::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Add other default settings as needed, for example:
INSERT INTO public.settings (key, value) VALUES ('team_commission_rates', '{"level1": 10, "level2": 5, "level3": 2}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.settings (key, value) VALUES ('team_commission_enabled', '{"level1": true, "level2": true, "level3": true}'::jsonb) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.settings (key, value) VALUES ('system_recharge_addresses', '[]'::jsonb) ON CONFLICT (key) DO NOTHING;
-- etc. for all other settings that were in localStorage.
