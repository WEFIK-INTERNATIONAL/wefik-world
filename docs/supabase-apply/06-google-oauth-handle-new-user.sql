-- ==============================================================================
-- wefik.world — 06-google-oauth-handle-new-user.sql
-- ==============================================================================
-- PURPOSE:
--   Minimal, idempotent fix for public.handle_new_user() so Google OAuth
--   signups (which may use 'picture' instead of 'avatar_url', or have no
--   password/metadata) never fail with "Database error saving new user".
--
-- PRECONDITIONS:
--   public.profiles exists with columns (id, email, full_name, display_name, avatar_url, role).
--
-- VERIFICATION QUERY:
--   SELECT p.proname, p.prosecdef, p.proconfig
--   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE n.nspname = 'public' AND p.proname = 'handle_new_user';
--   -- Expected: 1 row, prosecdef = true, proconfig includes search_path=public.
--
-- ROLLBACK:
--   Restore the previous handle_new_user() definition from supabase/migrations/004_auth_system.sql.
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_full_name text;
  v_display_name text;
BEGIN
  v_email := coalesce(new.email, new.raw_user_meta_data->>'email', new.id::text || '@no-email.local');
  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    NULL
  );
  v_display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'user_name',
    v_full_name,
    split_part(v_email, '@', 1)
  );

  INSERT INTO public.profiles (id, email, full_name, display_name, avatar_url, role)
  VALUES (
    new.id,
    v_email,
    v_full_name,
    v_display_name,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', NULL),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
