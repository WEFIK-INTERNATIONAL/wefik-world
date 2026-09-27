-- ==============================================================================
-- wefik.world — Fix: Database error saving new user (Auth Trigger & Schema Fix)
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Ensure all required columns exist on public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS recovery_email text,
  ADD COLUMN IF NOT EXISTS recovery_email_verified_at timestamptz;

-- 2. Ensure RLS policies on public.profiles allow proper profile creation & management
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Enable insert for service_role and triggers" ON public.profiles;
CREATE POLICY "Enable insert for service_role and triggers" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 3. Replace handle_new_user() with bulletproof fallback exception handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_display_name text;
BEGIN
  -- Extract metadata safely (Google, GitHub, email OTP)
  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    null
  );

  v_display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'user_name',
    v_full_name,
    split_part(coalesce(new.email, 'user'), '@', 1)
  );

  -- Insert profile, or update if already existing
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    display_name,
    avatar_url,
    role,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    coalesce(new.email, ''),
    v_full_name,
    v_display_name,
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    'customer',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Never block auth user creation if an edge-case profile issue occurs
    RAISE WARNING 'handle_new_user warning for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- 4. Re-bind the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Grant permissions to service_role and authenticated users
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
