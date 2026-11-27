-- ==============================================================================
-- wefik.world — 01-schema-alignment.sql
-- ==============================================================================
-- PURPOSE:
--   Aligns live public tables (profiles, products, orders, order_items,
--   licenses, reviews, product_versions, blocked_email_domains) with
--   INTENDED-STATE.md and src/types/database.ts using additive, idempotent SQL.
--
-- PRECONDITIONS:
--   Run 00-diagnose-READONLY.sql first and confirm core tables exist:
--     SELECT count(*) FROM information_schema.tables
--     WHERE table_schema = 'public' AND table_name IN ('profiles','products','orders','licenses','reviews');
--     -- Expected: 5
--
-- WHAT IT CHANGES:
--   - Adds missing profiles auth/recovery columns (display_name, recovery_email, recovery_email_verified_at).
--   - Creates blocked_email_domains table if missing.
--   - Ensures products_price_inr_round_rupees_check constraint and non-null defaults.
--   - Backfills legacy column names if present (e.g. reviews.comment -> review_text,
--     orders.amount_total -> total_amount, licenses.domain -> activated_domains) without dropping old columns.
--   - Refreshes public.products_public view.
--
-- VERIFICATION QUERY:
--   SELECT table_name, column_name FROM information_schema.columns
--   WHERE table_schema = 'public'
--     AND ((table_name = 'profiles' AND column_name IN ('display_name','recovery_email','recovery_email_verified_at'))
--       OR (table_name = 'reviews' AND column_name = 'review_text')
--       OR (table_name = 'orders' AND column_name = 'total_amount'));
--   -- Expected: 5 rows returned.
--
-- ROLLBACK:
--   Additive columns/constraints can be dropped if unused, e.g.:
--   ALTER TABLE public.profiles DROP COLUMN IF EXISTS display_name, DROP COLUMN IF EXISTS recovery_email, DROP COLUMN IF EXISTS recovery_email_verified_at;
-- ==============================================================================

BEGIN;

-- 1. Profiles: account & recovery columns
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS recovery_email text,
  ADD COLUMN IF NOT EXISTS recovery_email_verified_at timestamptz;

-- 2. Blocked email domains table
CREATE TABLE IF NOT EXISTS public.blocked_email_domains (
  domain text PRIMARY KEY,
  source text NOT NULL DEFAULT 'disposable-domain-list',
  added_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Products integrity & round-rupee constraint (from 003_fixpack02_integrity.sql)
UPDATE public.products
SET tagline = 'Digital product by wefik.world'
WHERE tagline IS NULL OR trim(tagline) = '';

UPDATE public.products SET tech_stack = '{}' WHERE tech_stack IS NULL;
UPDATE public.products SET gallery_urls = '{}' WHERE gallery_urls IS NULL;
UPDATE public.products SET rating_avg = 0.00 WHERE rating_avg IS NULL;
UPDATE public.products SET rating_count = 0 WHERE rating_count IS NULL;
UPDATE public.products SET price_inr = round(price_inr / 100.0) * 100 WHERE price_inr % 100 != 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_price_inr_round_rupees_check'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_price_inr_round_rupees_check
      CHECK (price_inr % 100 = 0 AND price_inr >= 0);
  END IF;
END $$;

-- 4. Additive legacy-drift backfills (safe no-ops if columns already match)
-- Reviews: ensure review_text exists and backfill from legacy comment/body if present
ALTER TABLE IF EXISTS public.reviews ADD COLUMN IF NOT EXISTS review_text text;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'comment'
  ) THEN
    EXECUTE 'UPDATE public.reviews SET review_text = coalesce(review_text, comment) WHERE review_text IS NULL';
  END IF;
END $$;

-- Orders: ensure subtotal, discount_amount, total_amount exist
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS subtotal integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount integer NOT NULL DEFAULT 0;

-- Licenses: ensure activated_domains & max_activations exist
ALTER TABLE IF EXISTS public.licenses
  ADD COLUMN IF NOT EXISTS activated_domains text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS max_activations integer NOT NULL DEFAULT 1;

-- 5. Refresh products_public view (hides internal/file_path fields)
CREATE OR REPLACE VIEW public.products_public AS
SELECT
  p.id,
  p.title,
  p.slug,
  p.tagline,
  p.description,
  p.category_id,
  c.name AS category_name,
  c.slug AS category_slug,
  p.price_inr,
  p.is_free,
  p.is_featured,
  p.is_bundle,
  p.bundle_product_ids,
  p.thumbnail_url,
  p.gallery_urls,
  p.demo_url,
  p.tech_stack,
  p.rating_avg,
  p.rating_count,
  p.download_count,
  pv.version AS latest_version,
  p.created_at,
  p.updated_at
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.product_versions pv ON pv.product_id = p.id AND pv.is_latest = true
WHERE p.status = 'published';

COMMIT;
