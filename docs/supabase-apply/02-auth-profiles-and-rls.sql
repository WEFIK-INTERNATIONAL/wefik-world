-- ==============================================================================
-- wefik.world — 02-auth-profiles-and-rls.sql
-- ==============================================================================
-- PURPOSE:
--   1. Fixes handle_new_user() trigger (exception-safe, handles OAuth/missing
--      metadata) and backfills missing public.profiles rows.
--   2. Locks down public.profiles.role so users CANNOT self-promote to 'admin'.
--   3. Enforces least-privilege RLS across all 16 public tables, including
--      verified-purchaser-only INSERT on public.reviews.
--
-- PRECONDITIONS:
--   01-schema-alignment.sql has been applied.
--   Check: SELECT count(*) FROM information_schema.columns
--          WHERE table_schema='public' AND table_name='profiles' AND column_name='display_name';
--   -- Expected: 1
--
-- WHAT IT CHANGES:
--   - Recreates is_admin(), handle_new_user(), check_email_registered() with
--     SECURITY DEFINER and fixed search_path.
--   - Backfills missing profiles from auth.users (idempotent ON CONFLICT DO NOTHING).
--   - Adds prevent_profile_role_escalation() trigger on public.profiles.
--   - Enables RLS and recreates least-privilege policies on all public tables.
--
-- VERIFICATION QUERY:
--   SELECT
--     (SELECT count(*) FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id WHERE p.id IS NULL) AS missing_profiles,
--     (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
--      WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity) AS tables_without_rls;
--   -- Expected: missing_profiles = 0, tables_without_rls = 0.
--
-- ROLLBACK:
--   Drop trigger prevent_profile_role_escalation on public.profiles if reverting,
--   and restore prior policies from 001_schema.sql / 004_auth_system.sql.
-- ==============================================================================

BEGIN;

-- 1. Security-definer helper: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT coalesce(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- 2. Auth trigger function: handle_new_user() (exception-safe, OAuth-friendly)
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
    -- Never fail auth signup because of a profile sync error
    RAISE WARNING 'handle_new_user failed for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. One-time idempotent backfill for existing auth.users without a profile
INSERT INTO public.profiles (id, email, full_name, display_name, avatar_url, role)
SELECT
  u.id,
  coalesce(u.email, u.raw_user_meta_data->>'email', u.id::text || '@no-email.local'),
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', NULL),
  coalesce(
    u.raw_user_meta_data->>'display_name',
    u.raw_user_meta_data->>'user_name',
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(coalesce(u.email, u.id::text), '@', 1)
  ),
  coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture', NULL),
  'customer'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. Prevent client-side role self-escalation on public.profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow service_role (current_setting('role') = 'service_role' or auth.uid() IS NULL in SQL editor)
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Only administrators can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 5. Lock down check_email_registered RPC (service_role only)
CREATE OR REPLACE FUNCTION public.check_email_registered(p_email text)
RETURNS TABLE (
  registered boolean,
  confirmed boolean,
  has_password boolean,
  oauth_providers text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_confirmed_at timestamptz;
  v_encrypted_pw text;
  v_providers text[];
BEGIN
  SELECT u.id, u.email_confirmed_at, u.encrypted_password
  INTO v_user_id, v_confirmed_at, v_encrypted_pw
  FROM auth.users u
  WHERE lower(u.email) = lower(trim(p_email))
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, false, false, array[]::text[];
    RETURN;
  END IF;

  SELECT coalesce(array_agg(DISTINCT i.provider) FILTER (WHERE i.provider IS NOT NULL AND i.provider <> 'email'), array[]::text[])
  INTO v_providers
  FROM auth.identities i
  WHERE i.user_id = v_user_id;

  RETURN QUERY SELECT
    true,
    (v_confirmed_at IS NOT NULL),
    (v_encrypted_pw IS NOT NULL AND length(v_encrypted_pw) > 0),
    coalesce(v_providers, array[]::text[]);
END;
$$;

REVOKE ALL ON FUNCTION public.check_email_registered(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_email_registered(text) TO service_role;

-- 6. Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_email_domains ENABLE ROW LEVEL SECURITY;

-- 7. Least-privilege RLS policies (idempotent DROP + CREATE)
-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- CATEGORIES
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PRODUCTS
DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
CREATE POLICY "Anyone can view published products" ON public.products
  FOR SELECT USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PRODUCT VERSIONS
DROP POLICY IF EXISTS "Anyone can view versions for published products" ON public.product_versions;
CREATE POLICY "Anyone can view versions for published products" ON public.product_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_versions.product_id AND (status = 'published' OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins can manage product versions" ON public.product_versions;
CREATE POLICY "Admins can manage product versions" ON public.product_versions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- MEMBERSHIP PLANS
DROP POLICY IF EXISTS "Anyone can view active membership plans" ON public.membership_plans;
CREATE POLICY "Anyone can view active membership plans" ON public.membership_plans
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage membership plans" ON public.membership_plans;
CREATE POLICY "Admins can manage membership plans" ON public.membership_plans
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- MEMBERSHIPS
DROP POLICY IF EXISTS "Users can view own memberships" ON public.memberships;
CREATE POLICY "Users can view own memberships" ON public.memberships
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage memberships" ON public.memberships;
CREATE POLICY "Admins can manage memberships" ON public.memberships
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ORDERS
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ORDER ITEMS
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id AND (user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- LICENSES
DROP POLICY IF EXISTS "Users can view own licenses" ON public.licenses;
CREATE POLICY "Users can view own licenses" ON public.licenses
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage licenses" ON public.licenses;
CREATE POLICY "Admins can manage licenses" ON public.licenses
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- REVIEWS (public read for approved; insert ONLY by verified purchaser)
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
CREATE POLICY "Anyone can view approved reviews" ON public.reviews
  FOR SELECT USING (is_approved = true OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can submit reviews" ON public.reviews;
DROP POLICY IF EXISTS "Verified purchasers can submit reviews" ON public.reviews;
CREATE POLICY "Verified purchasers can submit reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (
        SELECT 1 FROM public.licenses l
        WHERE l.user_id = auth.uid() AND l.product_id = reviews.product_id AND l.status = 'active'
      )
      OR EXISTS (
        SELECT 1 FROM public.orders o
        JOIN public.order_items oi ON oi.order_id = o.id
        WHERE o.user_id = auth.uid() AND o.status = 'paid' AND oi.product_id = reviews.product_id
      )
      OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
CREATE POLICY "Admins can delete reviews" ON public.reviews
  FOR DELETE USING (public.is_admin());

-- WISHLISTS
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlists;
CREATE POLICY "Users can view own wishlist" ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to own wishlist" ON public.wishlists;
CREATE POLICY "Users can add to own wishlist" ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove from own wishlist" ON public.wishlists;
CREATE POLICY "Users can remove from own wishlist" ON public.wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- DOWNLOADS
DROP POLICY IF EXISTS "Users can view own downloads" ON public.downloads;
CREATE POLICY "Users can view own downloads" ON public.downloads
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can record own downloads" ON public.downloads;
CREATE POLICY "Users can record own downloads" ON public.downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- COUPONS
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- NEWSLETTER SUBSCRIBERS
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view newsletter subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (public.is_admin());

-- PUSH SUBSCRIPTIONS
DROP POLICY IF EXISTS "Users can manage own push subscription" ON public.push_subscriptions;
CREATE POLICY "Users can manage own push subscription" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- BLOCKED EMAIL DOMAINS
DROP POLICY IF EXISTS "Admins can view blocked domains" ON public.blocked_email_domains;
CREATE POLICY "Admins can view blocked domains" ON public.blocked_email_domains
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage blocked domains" ON public.blocked_email_domains;
CREATE POLICY "Admins can manage blocked domains" ON public.blocked_email_domains
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

COMMIT;
