
-- Drop existing objects to ensure a clean setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.setup_admin_user();
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.settings;

-- Create the public.users table to store user profiles
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
COMMENT ON TABLE public.users IS 'Public user profiles, extending auth.users.';

-- Create the settings table for system-wide configurations
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.settings IS 'Key-value store for global application settings.';

-- Enable Row Level Security (RLS) for the tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public.users
-- Allow users to read their own profile
CREATE POLICY "Allow individual user read access" ON public.users FOR SELECT USING (auth.uid() = id);
-- Allow users to read all profiles (e.g., for finding referrer info)
CREATE POLICY "Allow all users read access" ON public.users FOR SELECT USING (true);
-- Allow users to update their own profile
CREATE POLICY "Allow individual user update access" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for public.settings
-- Allow all users to read settings
CREATE POLICY "Allow all users read access to settings" ON public.settings FOR SELECT USING (true);
-- Allow only service_role (admins from server-side) to modify settings
CREATE POLICY "Allow service_role to modify settings" ON public.settings FOR ALL USING (auth.role() = 'service_role');


-- Function to handle new user creation and insert into public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  referral_code_new TEXT;
BEGIN
  -- Generate a unique referral code
  LOOP
    referral_code_new := 'TRH-' || upper(substr(md5(random()::text), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = referral_code_new);
  END LOOP;

  INSERT INTO public.users (id, full_name, referral_code, referred_by, created_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    referral_code_new,
    NEW.raw_user_meta_data->>'referred_by',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Function to create the admin user if it doesn't exist
CREATE OR REPLACE FUNCTION public.setup_admin_user()
RETURNS void AS $$
DECLARE
  admin_email TEXT := 'admin@stakinghub.com';
  admin_password TEXT := 'admin123';
  admin_count INT;
  admin_uuid UUID;
BEGIN
    -- Check if the admin user already exists in auth.users
    SELECT count(*) INTO admin_count FROM auth.users WHERE email = admin_email;

    -- If admin does not exist, create it
    IF admin_count = 0 THEN
        RAISE NOTICE 'Admin user not found, creating it...';
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
        ) RETURNING id INTO admin_uuid;

        -- Insert profile into public.users
        -- The trigger is temporarily disabled for this session to avoid double insertion
        SET session_replication_role = 'replica';
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
        -- Re-enable the trigger for normal operations
        SET session_replication_role = 'origin';

        RAISE NOTICE 'Admin user created successfully.';
    ELSE
        RAISE NOTICE 'Admin user already exists, skipping creation.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to seed initial settings
CREATE OR REPLACE FUNCTION public.seed_initial_settings()
RETURNS void AS $$
BEGIN
    RAISE NOTICE 'Seeding initial application settings...';

    INSERT INTO public.settings (key, value, description) VALUES
    ('system_withdrawal_restriction_enabled', 'true'::jsonb, 'Enable or disable the basic withdrawal time restriction for new users.'),
    ('system_withdrawal_restriction_days', '45'::jsonb, 'Number of days a new user must wait before being able to withdraw.'),
    ('system_withdrawal_restricted_levels', '[1]'::jsonb, 'Array of user levels to which the basic withdrawal restriction applies.'),
    ('platform_task_reset_time', '"09:30"'::jsonb, 'The time of day (IST) when user tasks are reset.')
    ON CONFLICT (key) DO NOTHING;

    RAISE NOTICE 'Settings seeding complete.';
END;
$$ LANGUAGE plpgsql;

-- Execute the setup functions
DO $$
BEGIN
    PERFORM public.setup_admin_user();
    PERFORM public.seed_initial_settings();
    RAISE NOTICE 'Database schema setup and seeding complete.';
END $$;
