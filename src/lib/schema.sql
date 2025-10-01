-- Create a table for public profiles
create table users (
  id uuid references auth.users not null primary key,
  full_name text,
  referral_code text unique,
  referred_by text,
  status text default 'inactive',
  is_admin boolean default false,
  is_account_active boolean default false,
  override_level integer,
  is_bonus_disabled boolean default false,
  withdrawal_restriction_until timestamptz,
  created_at timestamptz default now(),
  activated_at timestamptz
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table users
  enable row level security;

create policy "Public profiles are viewable by everyone." on users
  for select using (true);

create policy "Users can insert their own profile." on users
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on users
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile for new users.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, full_name, referral_code, referred_by)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'referral_code',
    new.raw_user_meta_data->>'referred_by'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to create admin user
-- IMPORTANT: Replace 'YOUR_ADMIN_PASSWORD' with a secure password before running this script.
-- This function will only run once when you set up the database.
do $$
declare
  admin_email text := 'admin@stakinghub.com';
  admin_password text := 'YOUR_ADMIN_PASSWORD'; -- <-- IMPORTANT: SET YOUR ADMIN PASSWORD HERE
  admin_user_id uuid;
begin
  -- Check if the admin user already exists in auth.users
  if not exists (select 1 from auth.users where email = admin_email) then
    -- Create the user in auth.users
    admin_user_id := auth.uid() from (
        select auth.uid() as uid
        from auth.users as u
        where u.id = (
            select id from auth.users where email = admin_email
        )
    );
    
    if admin_user_id is null then
        admin_user_id := extensions.uuid_generate_v4();
        insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, confirmation_sent_at, is_super_admin)
        values (
          '00000000-0000-0000-0000-000000000000',
          admin_user_id,
          'authenticated',
          'authenticated',
          admin_email,
          extensions.crypt(admin_password, extensions.gen_salt('bf')),
          now(),
          '',
          null,
          null,
          '{"provider":"email","providers":["email"]}',
          '{}',
          now(),
          now(),
          '',
          null,
          false
        );

        -- Create the corresponding user in public.users
        insert into public.users (id, full_name, referral_code, is_admin, status, is_account_active, created_at, activated_at)
        values (
            admin_user_id,
            'Administrator',
            'ADMIN' || upper(substring(extensions.uuid_generate_v4()::text from 1 for 8)),
            true,
            'active',
            true,
            now(),
            now()
        );
    end if;

  end if;
end $$;

-- Table for system-wide settings
create table settings (
  key text primary key,
  value jsonb
);
alter table settings enable row level security;
create policy "Settings are publicly viewable." on settings for select using (true);
create policy "Admins can update settings." on settings for update using (
  (select is_admin from public.users where id = auth.uid()) = true
);

-- Insert default settings
insert into settings (key, value) values
('platform_levels', $$
  {
    "data": [
      {"level":0,"name":"Unranked","minAmount":0,"rate":0,"referrals":0,"dailyTasks":0,"monthlyWithdrawals":0,"minWithdrawal":0,"maxWithdrawal":0,"earningPerTask":0,"withdrawalFee":0},
      {"level":1,"name":"Bronze","minAmount":100,"rate":1.8,"referrals":0,"dailyTasks":15,"monthlyWithdrawals":1,"minWithdrawal":150,"maxWithdrawal":150,"earningPerTask":0.30,"withdrawalFee":5},
      {"level":2,"name":"Silver","minAmount":500,"rate":2.8,"referrals":8,"dailyTasks":25,"monthlyWithdrawals":1,"minWithdrawal":500,"maxWithdrawal":500,"earningPerTask":0.50,"withdrawalFee":3},
      {"level":3,"name":"Gold","minAmount":2000,"rate":3.8,"referrals":16,"dailyTasks":35,"monthlyWithdrawals":1,"minWithdrawal":1500,"maxWithdrawal":1500,"earningPerTask":1.10,"withdrawalFee":1},
      {"level":4,"name":"Platinum","minAmount":6000,"rate":4.8,"referrals":36,"dailyTasks":45,"monthlyWithdrawals":1,"minWithdrawal":2500,"maxWithdrawal":2500,"earningPerTask":2.50,"withdrawalFee":1},
      {"level":5,"name":"Diamond","minAmount":20000,"rate":5.8,"referrals":55,"dailyTasks":55,"monthlyWithdrawals":2,"minWithdrawal":3500,"maxWithdrawal":3500,"earningPerTask":5.00,"withdrawalFee":1}
    ]
  }
$$::jsonb)
on conflict (key) do nothing;

insert into settings (key, value) values
('platform_messages', $$
{
    "auth": {
        "noAccountFound": {"label":"No Account Found","description":"Error when a user tries to log in with an unregistered email.","defaultValue":"No account found with this email."},
        "incorrectPassword": {"label":"Incorrect Password","description":"Error for an incorrect password during login.","defaultValue":"Incorrect password. Please try again."},
        "accountDisabled": {"label":"Account Disabled","description":"Error when a disabled user tries to log in.","defaultValue":"Your account has been disabled. Please contact support."},
        "invalidReferralCode": {"label":"Invalid Invitation Code","description":"Error during sign-up if the invitation code is invalid.","defaultValue":"Invalid invitation code."},
        "emailExists": {"label":"Email Already Exists","description":"Error during sign-up if the email is already registered.","defaultValue":"An account with this email already exists."}
    },
    "withdrawal": {
        "restrictionPopup": {"label":"Time Restriction Popup","description":"Shown when a user tries to withdraw before their waiting period is over. This is also editable in System Settings.","defaultValue":"Please wait for 45 days to initiate withdrawal request."},
        "pendingRequestTitle": {"label":"Pending Request Title","description":"Title of the alert when a user has an existing pending withdrawal.","defaultValue":"Pending Request"},
        "pendingRequestDescription": {"label":"Pending Request Description","description":"Body text of the alert when a user has an existing pending withdrawal.","defaultValue":"You already have a withdrawal request pending. Please wait for it to be processed before submitting a new one."},
        "limitReachedTitle": {"label":"Monthly Limit Reached Title","description":"Title of the alert when a user exceeds their monthly withdrawal limit.","defaultValue":"Monthly Limit Reached"},
        "limitReachedDescription": {"label":"Monthly Limit Reached Description","description":"Body text for the monthly limit alert. Use [X] for count and [Y] for level.","defaultValue":"You have reached your monthly withdrawal limit of [X] for Level [Y]. Please try again next month."},
        "minAmountTitle": {"label":"Minimum Amount Title","description":"Title of the alert when the user's withdrawal amount is too low.","defaultValue":"Minimum Withdrawal Amount"},
        "minAmountDescription": {"label":"Minimum Amount Description","description":"Body text for the minimum amount alert. Use [Y] for level and [Amount] for the minimum amount.","defaultValue":"The minimum withdrawal amount for Level [Y] is $[Amount]. Please enter a higher amount."},
        "maxAmountTitle": {"label":"Maximum Amount Title","description":"Title of the alert when the user's withdrawal amount is too high.","defaultValue":"Maximum Withdrawal Limit"},
        "maxAmountDescription": {"label":"Maximum Amount Description","description":"Body text for the maximum amount alert. Use [Y] for level and [Amount] for the maximum amount.","defaultValue":"The maximum withdrawal for Level [Y] is $[Amount]. Please enter a lower amount."}
    },
    "recharge": {
        "addressRequiredTitle": {"label":"Withdrawal Address Required Title","description":"Title for the alert when a user must set a withdrawal address before recharging.","defaultValue":"Withdrawal Address Required"},
        "addressRequiredDescription": {"label":"Withdrawal Address Required Description","description":"Body text for the alert when a user must set a withdrawal address before recharging.","defaultValue":"For security, you must set up at least one withdrawal address before you can make a recharge request. Please go to the Withdrawal panel to add an address."},
        "confirmDepositTitle": {"label":"Confirm Deposit Title","description":"Title for the final confirmation dialog before submitting a recharge request.","defaultValue":"Confirm Deposit"},
        "confirmDepositDescription": {"label":"Confirm Deposit Description","description":"Body text for the final confirmation dialog. Use [Amount] for the recharge amount.","defaultValue":"Please ensure you have already sent [Amount] to the selected address. Submitting a request without sending funds may result in account restrictions."}
    },
    "boosters": {
        "confirmPurchaseTitle": {"label":"Confirm Purchase Title","description":"Title for the booster purchase confirmation dialog.","defaultValue":"Confirm Purchase"},
        "confirmPurchaseDescription": {"label":"Confirm Purchase Description","description":"Body text for the confirmation dialog. Use [BoosterName] and [BoosterPrice].","defaultValue":"Are you sure you want to buy the \"[BoosterName]\" booster for $[BoosterPrice]? This amount will be deducted from your main wallet balance."},
        "insufficientFundsTitle": {"label":"Insufficient Funds Title","description":"Title for the alert when a user has insufficient funds.","defaultValue":"Insufficient Funds"},
        "insufficientFundsDescription": {"label":"Insufficient Funds Description","description":"Body text for the insufficient funds alert.","defaultValue":"You have insufficient funds in your main wallet."}
    }
}
$$::jsonb)
on conflict (key) do nothing;
