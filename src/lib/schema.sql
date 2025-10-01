-- Wipe all tables and functions for a clean slate
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    FOR r IN (SELECT routine_name FROM information_schema.routines WHERE specific_schema = 'public' AND routine_type = 'FUNCTION') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.routine_name) || ' CASCADE';
    END LOOP;
END $$;

-- 1. Create public.users table
CREATE TABLE public.users (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    referral_code text UNIQUE,
    referred_by text,
    status text DEFAULT 'inactive',
    is_account_active boolean DEFAULT false,
    is_admin boolean DEFAULT false,
    override_level integer,
    is_bonus_disabled boolean DEFAULT false,
    withdrawal_restriction_until timestamptz,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    activated_at timestamptz
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow user to manage their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. Create settings table
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow admin to manage settings" ON public.settings FOR ALL USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
);

-- 3. Function to handle new user setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users (id, full_name, referral_code, referred_by, created_at)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        'TRH-' || substr(md5(random()::text), 0, 9),
        new.raw_user_meta_data->>'referred_by',
        new.created_at
    );
    RETURN new;
END;
$$;

-- 4. Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- 5. Seed initial data into the settings table
-- Using dollar-quoting ($$) to avoid issues with JSON strings
INSERT INTO public.settings (key, value) VALUES
    ('platform_levels', $$
        [
            {"level": 0, "name": "Unranked", "minAmount": 0, "rate": 0, "referrals": 0, "dailyTasks": 0, "monthlyWithdrawals": 0, "minWithdrawal": 0, "maxWithdrawal": 0, "earningPerTask": 0, "withdrawalFee": 0},
            {"level": 1, "name": "Bronze", "minAmount": 100, "rate": 1.8, "referrals": 0, "dailyTasks": 15, "monthlyWithdrawals": 1, "minWithdrawal": 150, "maxWithdrawal": 150, "earningPerTask": 0.30, "withdrawalFee": 5},
            {"level": 2, "name": "Silver", "minAmount": 500, "rate": 2.8, "referrals": 8, "dailyTasks": 25, "monthlyWithdrawals": 1, "minWithdrawal": 500, "maxWithdrawal": 500, "earningPerTask": 0.50, "withdrawalFee": 3},
            {"level": 3, "name": "Gold", "minAmount": 2000, "rate": 3.8, "referrals": 16, "dailyTasks": 35, "monthlyWithdrawals": 1, "minWithdrawal": 1500, "maxWithdrawal": 1500, "earningPerTask": 1.10, "withdrawalFee": 1},
            {"level": 4, "name": "Platinum", "minAmount": 6000, "rate": 4.8, "referrals": 36, "dailyTasks": 45, "monthlyWithdrawals": 1, "minWithdrawal": 2500, "maxWithdrawal": 2500, "earningPerTask": 2.50, "withdrawalFee": 1},
            {"level": 5, "name": "Diamond", "minAmount": 20000, "rate": 5.8, "referrals": 55, "dailyTasks": 55, "monthlyWithdrawals": 2, "minWithdrawal": 3500, "maxWithdrawal": 3500, "earningPerTask": 5.00, "withdrawalFee": 1}
        ]
    $$::jsonb),
    ('system_withdrawal_restricted_levels', $$[1]$$::jsonb);

-- 6. Function to create the admin user
CREATE OR REPLACE FUNCTION public.setup_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_email TEXT := 'admin@stakinghub.com';
    admin_password TEXT := 'admin123';
    admin_uuid uuid;
BEGIN
    -- Insert into auth.users and get the new user's ID
    -- Use ON CONFLICT to avoid errors if the user already exists
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
    ON CONFLICT (instance_id, email) DO NOTHING
    RETURNING id INTO admin_uuid;

    -- If admin_uuid is NULL, the user already existed. We need to fetch their ID.
    IF admin_uuid IS NULL THEN
        SELECT id INTO admin_uuid FROM auth.users WHERE email = admin_email;
    END IF;

    -- Now, insert or update the public.users profile
    -- This ensures that even if the auth user exists, their profile is correct
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
    ON CONFLICT (id) DO UPDATE SET
        full_name = 'Admin User',
        referral_code = 'ADMIN-CODE',
        status = 'active',
        is_account_active = true,
        is_admin = true;

END;
$$;

-- 7. Execute the function to set up the admin user
SELECT public.setup_admin_user();

-- 8. Final confirmation notice
DO $$
BEGIN
    RAISE NOTICE 'Database schema setup and seeding complete.';
END $$;
