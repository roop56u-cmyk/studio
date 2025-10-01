-- Drop existing tables and functions to ensure a clean slate.
-- This allows the script to be run multiple times without errors.
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.setup_admin_user();
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.settings;

--
-- Create the `users` table to store public-facing user data.
-- This table is linked to the `auth.users` table via the `id` column.
--
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    status TEXT DEFAULT 'inactive'::text NOT NULL,
    is_account_active BOOLEAN DEFAULT false NOT NULL,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    override_level INTEGER,
    is_bonus_disabled BOOLEAN DEFAULT false,
    withdrawal_restriction_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    activated_at TIMESTAMPTZ
);

-- Add comments to columns for clarity.
COMMENT ON COLUMN public.users.id IS 'Links to auth.users.id';
COMMENT ON COLUMN public.users.status IS 'Can be active, inactive, or disabled';
COMMENT ON COLUMN public.users.is_account_active IS 'True if the user has made a qualifying first deposit';
COMMENT ON COLUMN public.users.override_level IS 'Allows an admin to manually set a user''s level';
COMMENT ON COLUMN public.users.withdrawal_restriction_until IS 'A timestamp until which the user cannot make withdrawals';
COMMENT ON COLUMN public.users.activated_at IS 'Timestamp for when the user''s account became active';

--
-- Create a table for system-wide settings.
-- This table stores key-value pairs for various platform configurations.
--
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    description TEXT
);

--
-- Define a function to automatically create a public user profile
-- when a new user signs up in the `auth.users` table.
--
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users (id, full_name, referral_code, referred_by)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'referral_code',
        new.raw_user_meta_data->>'referred_by'
    );
    RETURN new;
END;
$$;

-- Create a trigger to call the `handle_new_user` function after a new user is created.
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--
-- Define a function to securely create the admin user if it doesn't exist.
--
CREATE OR REPLACE FUNCTION public.setup_admin_user()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    admin_email TEXT := 'admin@stakinghub.com';
    admin_password TEXT := 'admin123';
    admin_uuid UUID;
    user_count INT;
BEGIN
    -- Check if the admin user already exists in the authentication system.
    SELECT count(*) INTO user_count FROM auth.users WHERE email = admin_email;

    -- If the user does not exist, create them.
    IF user_count = 0 THEN
        RAISE NOTICE 'Admin user does not exist, creating...';
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

        -- Manually create the public profile for the admin user.
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
    ELSE
        RAISE NOTICE 'Admin user already exists, skipping creation.';
    END IF;
END;
$$;

-- Execute the function to create the admin user.
SELECT public.setup_admin_user();

--
-- Insert default system settings into the `settings` table.
-- Using ON CONFLICT to prevent errors if the script is run multiple times.
-- Dollar-quoting ($$) is used for JSON values to handle special characters safely.
--
INSERT INTO public.settings (key, value, description) VALUES
('system_withdrawal_restricted_levels', $$[1]$$, 'Levels subject to the initial withdrawal time restriction.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Display a success message in the database logs.
DO $$
BEGIN
    RAISE NOTICE 'Database schema setup and seeding complete.';
END $$;
