-- ==============================================================================
-- wefik.world — 00-diagnose-READONLY.sql
-- ==============================================================================
-- PURPOSE:
--   Read-only diagnostic script to inspect the live Supabase database against
--   docs/supabase-apply/INTENDED-STATE.md.
--
-- SAFETY:
--   - Contains ONLY SELECT statements. Modifies NOTHING.
--   - Returns NO personal data (no emails, tokens, keys, or auth.users rows).
--   - Safe even if migrations or some app tables have not been created yet.
--
-- HOW TO RUN & SHARE RESULTS:
--   1. Open Supabase Dashboard -> SQL Editor -> New Query.
--   2. Paste this entire file and click "Run".
--   3. Copy each result grid (or Export as CSV) and paste them back in order.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXISTING PUBLIC TABLES & INSTALLED EXTENSIONS
-- ------------------------------------------------------------------------------
WITH expected_tables(table_name) AS (
  VALUES
    ('profiles'),('categories'),('products'),('product_versions'),
    ('membership_plans'),('memberships'),('orders'),('order_items'),
    ('licenses'),('reviews'),('wishlists'),('downloads'),
    ('coupons'),('newsletter_subscribers'),('push_subscriptions'),('blocked_email_domains')
)
SELECT '1a_table_inventory' AS section,
       coalesce(e.table_name, t.tablename) AS table_name,
       CASE
         WHEN t.tablename IS NULL THEN 'MISSING_IN_DB'
         WHEN e.table_name IS NULL THEN 'EXTRA_TABLE_IN_DB'
         ELSE 'EXISTS'
       END AS table_status
FROM expected_tables e
FULL OUTER JOIN pg_tables t
  ON t.schemaname = 'public' AND t.tablename = e.table_name
ORDER BY table_status, table_name;

SELECT '1b_installed_extensions' AS section,
       extname AS extension_name,
       extversion AS version,
       extnamespace::regnamespace::text AS schema_name
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pg_trgm', 'unaccent', 'pg_cron', 'pg_net', 'pgcrypto')
ORDER BY extname;

SELECT '1c_supabase_migrations_tables' AS section,
       schemaname,
       tablename
FROM pg_tables
WHERE schemaname = 'supabase_migrations'
ORDER BY tablename;

-- ------------------------------------------------------------------------------
-- 2. SCHEMA DRIFT: MISSING & UNEXPECTED COLUMNS vs INTENDED-STATE.md
-- ------------------------------------------------------------------------------
WITH expected(table_name, column_name) AS (
  VALUES
    -- profiles
    ('profiles','id'),('profiles','email'),('profiles','full_name'),('profiles','display_name'),
    ('profiles','avatar_url'),('profiles','recovery_email'),('profiles','recovery_email_verified_at'),
    ('profiles','role'),('profiles','created_at'),('profiles','updated_at'),
    -- categories
    ('categories','id'),('categories','name'),('categories','slug'),('categories','description'),('categories','created_at'),
    -- products
    ('products','id'),('products','title'),('products','slug'),('products','tagline'),('products','description'),
    ('products','category_id'),('products','price_inr'),('products','is_free'),('products','is_featured'),
    ('products','is_bundle'),('products','bundle_product_ids'),('products','thumbnail_url'),('products','gallery_urls'),
    ('products','demo_url'),('products','tech_stack'),('products','rating_avg'),('products','rating_count'),
    ('products','download_count'),('products','status'),('products','created_at'),('products','updated_at'),
    -- product_versions
    ('product_versions','id'),('product_versions','product_id'),('product_versions','version'),
    ('product_versions','changelog'),('product_versions','file_path'),('product_versions','is_latest'),('product_versions','created_at'),
    -- membership_plans
    ('membership_plans','id'),('membership_plans','plan'),('membership_plans','name'),('membership_plans','price_inr'),
    ('membership_plans','interval'),('membership_plans','description'),('membership_plans','features'),
    ('membership_plans','is_active'),('membership_plans','created_at'),
    -- memberships
    ('memberships','id'),('memberships','user_id'),('memberships','plan'),('memberships','status'),
    ('memberships','razorpay_subscription_id'),('memberships','current_period_start'),('memberships','current_period_end'),
    ('memberships','created_at'),('memberships','updated_at'),
    -- orders
    ('orders','id'),('orders','user_id'),('orders','razorpay_order_id'),('orders','razorpay_payment_id'),
    ('orders','status'),('orders','subtotal'),('orders','discount_amount'),('orders','total_amount'),
    ('orders','currency'),('orders','coupon_code'),('orders','created_at'),
    -- order_items
    ('order_items','id'),('order_items','order_id'),('order_items','product_id'),('order_items','item_type'),
    ('order_items','price'),('order_items','license_type'),('order_items','created_at'),
    -- licenses
    ('licenses','id'),('licenses','license_key'),('licenses','user_id'),('licenses','product_id'),
    ('licenses','order_id'),('licenses','license_type'),('licenses','status'),('licenses','activated_domains'),
    ('licenses','max_activations'),('licenses','created_at'),
    -- reviews
    ('reviews','id'),('reviews','user_id'),('reviews','product_id'),('reviews','rating'),
    ('reviews','review_text'),('reviews','is_approved'),('reviews','created_at'),
    -- wishlists
    ('wishlists','id'),('wishlists','user_id'),('wishlists','product_id'),('wishlists','created_at'),
    -- downloads
    ('downloads','id'),('downloads','user_id'),('downloads','product_id'),('downloads','version_id'),
    ('downloads','ip_address'),('downloads','user_agent'),('downloads','downloaded_at'),
    -- coupons
    ('coupons','id'),('coupons','code'),('coupons','discount_percent'),('coupons','discount_fixed_inr'),
    ('coupons','valid_from'),('coupons','valid_until'),('coupons','max_uses'),('coupons','used_count'),
    ('coupons','is_active'),('coupons','created_at'),
    -- newsletter_subscribers
    ('newsletter_subscribers','id'),('newsletter_subscribers','email'),('newsletter_subscribers','subscribed_at'),
    -- push_subscriptions
    ('push_subscriptions','id'),('push_subscriptions','user_id'),('push_subscriptions','token'),
    ('push_subscriptions','user_agent'),('push_subscriptions','created_at'),
    -- blocked_email_domains
    ('blocked_email_domains','domain'),('blocked_email_domains','source'),('blocked_email_domains','added_at')
),
actual AS (
  SELECT table_name, column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name IN (SELECT DISTINCT table_name FROM expected)
)
SELECT '2_schema_drift' AS section,
       coalesce(e.table_name, a.table_name) AS table_name,
       coalesce(e.column_name, a.column_name) AS column_name,
       CASE
         WHEN a.column_name IS NULL THEN 'MISSING_IN_DB'
         WHEN e.column_name IS NULL THEN 'UNEXPECTED_OR_LEGACY_IN_DB'
       END AS drift_status,
       a.data_type AS db_type
FROM expected e
FULL OUTER JOIN actual a
  ON e.table_name = a.table_name AND e.column_name = a.column_name
WHERE a.column_name IS NULL OR e.column_name IS NULL
ORDER BY table_name, drift_status, column_name;

-- ------------------------------------------------------------------------------
-- 3. RLS STATUS ON ALL PUBLIC TABLES
-- ------------------------------------------------------------------------------
SELECT '3_rls_status' AS section,
       c.relname AS table_name,
       CASE WHEN c.relrowsecurity THEN 'YES' ELSE 'NO' END AS rls_enabled,
       count(p.policyname) AS policy_count,
       CASE
         WHEN NOT c.relrowsecurity THEN 'CRITICAL: RLS DISABLED'
         WHEN count(p.policyname) = 0 THEN 'WARNING: RLS ENABLED WITH ZERO POLICIES'
         ELSE 'OK'
       END AS status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p ON p.schemaname = n.nspname AND p.tablename = c.relname
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
GROUP BY c.relname, c.relrowsecurity
ORDER BY c.relrowsecurity ASC, policy_count ASC, c.relname;

-- ------------------------------------------------------------------------------
-- 4. ALL RLS POLICIES ON PUBLIC TABLES (FLAGGING OVER-PERMISSIVE RULES)
-- ------------------------------------------------------------------------------
SELECT '4_rls_policies' AS section,
       tablename AS table_name,
       policyname,
       cmd AS command,
       roles,
       qual AS using_expr,
       with_check AS check_expr,
       CASE
         WHEN (coalesce(qual, '') ~* '^\s*\(?\s*true\s*\)?\s*$'
               OR coalesce(with_check, '') ~* '^\s*\(?\s*true\s*\)?\s*$')
              AND tablename NOT IN ('categories', 'newsletter_subscribers')
           THEN 'WARNING: EFFECTIVELY TRUE'
         ELSE 'OK'
       END AS review_flag
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ------------------------------------------------------------------------------
-- 5. AUTH TRIGGERS & ORPHANED auth.users COUNT (NO PERSONAL DATA)
-- ------------------------------------------------------------------------------
SELECT '5a_auth_triggers' AS section,
       t.tgname AS trigger_name,
       p.proname AS function_name,
       p.prosecdef AS is_security_definer,
       p.proconfig AS function_config
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND NOT t.tgisinternal;

SELECT '5b_missing_profiles_count' AS section,
       count(*) AS auth_users_without_profile
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- ------------------------------------------------------------------------------
-- 6. SECURITY DEFINER FUNCTIONS WITHOUT FIXED search_path
-- ------------------------------------------------------------------------------
SELECT '6_secdef_search_path' AS section,
       n.nspname AS schema_name,
       p.proname AS function_name,
       p.proconfig AS config
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND NOT EXISTS (
    SELECT 1 FROM unnest(coalesce(p.proconfig, array[]::text[])) cfg
    WHERE cfg LIKE 'search_path=%'
  )
ORDER BY p.proname;

-- ------------------------------------------------------------------------------
-- 7. STORAGE BUCKETS & storage.objects POLICIES
-- ------------------------------------------------------------------------------
SELECT '7a_storage_buckets' AS section,
       id AS bucket_id,
       name,
       public AS is_public,
       file_size_limit,
       allowed_mime_types
FROM storage.buckets
ORDER BY id;

SELECT '7b_storage_policies' AS section,
       policyname,
       cmd AS command,
       roles,
       qual AS using_expr,
       with_check AS check_expr
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- ------------------------------------------------------------------------------
-- 8. APPROXIMATE ROW COUNTS PER PUBLIC TABLE (SAFE EVEN IF TABLES MISSING)
-- ------------------------------------------------------------------------------
SELECT '8_table_row_counts' AS section,
       relname AS table_name,
       n_live_tup AS approx_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;

-- ------------------------------------------------------------------------------
-- 9. INDEX CHECK (MISSING OR DUPLICATE INDEXES)
-- ------------------------------------------------------------------------------
WITH expected_idx(indexname) AS (
  VALUES
    ('idx_products_slug'),('idx_products_status'),('idx_products_category_id'),
    ('idx_products_title_trgm'),('idx_products_tagline_trgm'),('idx_products_search_vector'),
    ('idx_product_versions_product_id'),('idx_orders_user_id'),('idx_orders_razorpay_order_id'),
    ('idx_order_items_order_id'),('idx_licenses_user_id'),('idx_licenses_license_key'),
    ('idx_licenses_product_id'),('idx_memberships_user_id'),('idx_reviews_product_id'),
    ('idx_downloads_user_id'),('idx_coupons_code')
)
SELECT '9a_missing_indexes' AS section,
       e.indexname AS missing_index
FROM expected_idx e
LEFT JOIN pg_indexes i ON i.schemaname = 'public' AND i.indexname = e.indexname
WHERE i.indexname IS NULL
ORDER BY e.indexname;

SELECT '9b_duplicate_indexes' AS section,
       tablename,
       indexdef,
       count(*) AS copies
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename, indexdef
HAVING count(*) > 1;

-- ------------------------------------------------------------------------------
-- 10. SUMMARY
-- ------------------------------------------------------------------------------
SELECT 'SUMMARY' AS section, finding, severity FROM (
  SELECT 'Tables with RLS disabled: ' || count(*)::text AS finding,
         CASE WHEN count(*) > 0 THEN 'CRITICAL' ELSE 'OK' END AS severity
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
  UNION ALL
  SELECT 'auth.users without profile: ' || count(*)::text,
         CASE WHEN count(*) > 0 THEN 'HIGH' ELSE 'OK' END
  FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id WHERE p.id IS NULL
  UNION ALL
  SELECT 'SECURITY DEFINER functions missing search_path: ' || count(*)::text,
         CASE WHEN count(*) > 0 THEN 'HIGH' ELSE 'OK' END
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.prosecdef
    AND NOT EXISTS (SELECT 1 FROM unnest(coalesce(p.proconfig, array[]::text[])) c WHERE c LIKE 'search_path=%')
  UNION ALL
  SELECT 'Missing required storage buckets (expected 3): ' || (3 - count(*))::text,
         CASE WHEN count(*) < 3 THEN 'HIGH' ELSE 'OK' END
  FROM storage.buckets WHERE id IN ('product-images', 'avatars', 'product-files')
) s;
