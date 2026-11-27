-- ==============================================================================
-- wefik.world — 05-extras-indexes-and-cron.sql
-- ==============================================================================
-- PURPOSE:
--   Ensures all required extensions, helper functions (with fixed search_path),
--   triggers, and performance/search indexes exist, plus an optional pg_cron
--   schedule for review-reminder-email.
--
-- PRECONDITIONS:
--   01-schema-alignment.sql through 04-cleanup-and-seed-products.sql applied.
--
-- WHAT IT CHANGES:
--   - Ensures extensions uuid-ossp, pg_trgm, unaccent exist.
--   - Recreates increment_coupon_use, increment_product_downloads,
--     handle_new_product_version, and handle_review_rating with fixed search_path.
--   - Creates all 17 expected indexes with IF NOT EXISTS.
--   - Documents (commented-out) pg_cron + pg_net job for review-reminder-email
--     using placeholders (<PROJECT_REF>, <CRON_SECRET>).
--
-- VERIFICATION QUERY:
--   SELECT count(*) AS present_indexes FROM pg_indexes
--   WHERE schemaname = 'public' AND indexname IN (
--     'idx_products_slug','idx_products_status','idx_products_category_id',
--     'idx_products_title_trgm','idx_products_tagline_trgm','idx_products_search_vector',
--     'idx_product_versions_product_id','idx_orders_user_id','idx_orders_razorpay_order_id',
--     'idx_order_items_order_id','idx_licenses_user_id','idx_licenses_license_key',
--     'idx_licenses_product_id','idx_memberships_user_id','idx_reviews_product_id',
--     'idx_downloads_user_id','idx_coupons_code'
--   );
--   -- Expected: 17
--
-- ROLLBACK:
--   Indexes can be dropped with DROP INDEX IF EXISTS public.<index_name>;
--   Functions can be restored from 001_schema.sql.
-- ==============================================================================

BEGIN;

-- 1. Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. Helper functions with fixed search_path
CREATE OR REPLACE FUNCTION public.increment_coupon_use(coupon_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = coupon_id;
$$;

REVOKE ALL ON FUNCTION public.increment_coupon_use(uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_use(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.increment_product_downloads(p_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.products
  SET download_count = download_count + 1
  WHERE id = p_id;
$$;

REVOKE ALL ON FUNCTION public.increment_product_downloads(uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_product_downloads(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.handle_new_product_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new.is_latest = true THEN
    UPDATE public.product_versions
    SET is_latest = false
    WHERE product_id = new.product_id AND id <> new.id;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_product_version_inserted ON public.product_versions;
CREATE TRIGGER on_product_version_inserted
  BEFORE INSERT ON public.product_versions
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_product_version();

CREATE OR REPLACE FUNCTION public.handle_review_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_product_id uuid;
BEGIN
  target_product_id := coalesce(new.product_id, old.product_id);

  UPDATE public.products
  SET
    rating_avg = coalesce((
      SELECT round(avg(rating)::numeric, 2)
      FROM public.reviews
      WHERE product_id = target_product_id AND is_approved = true
    ), 0.00),
    rating_count = coalesce((
      SELECT count(*)
      FROM public.reviews
      WHERE product_id = target_product_id AND is_approved = true
    ), 0)
  WHERE id = target_product_id;

  RETURN coalesce(new, old);
END;
$$;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_review_rating();

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_versions_product_id ON public.product_versions(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON public.licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON public.licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_product_id ON public.licenses(product_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON public.downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON public.products USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_tagline_trgm ON public.products USING gin (tagline gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON public.products USING gin (
  to_tsvector('english', title || ' ' || tagline || ' ' || description)
);

COMMIT;

-- ==============================================================================
-- 4. OPTIONAL SCHEDULED JOB: review-reminder-email (run manually if pg_cron + pg_net enabled)
-- ==============================================================================
-- Replace <PROJECT_REF> and <CRON_SECRET> before running, or schedule via GitHub Actions / Vercel Cron.
--
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;
-- SELECT cron.schedule(
--   'daily-review-reminder-email',
--   '0 9 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/review-reminder-email',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer <CRON_SECRET>'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
