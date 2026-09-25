-- ==============================================================================
-- wefik.world — Database Migration: 003_fixpack02_integrity.sql
-- Fix Pack 02: P0-1 Data Integrity & P1-10 Price Rounding Enforcement
-- ==============================================================================

-- 1. Backfill any null or empty taglines with sensible defaults
UPDATE public.products
SET tagline = 'Premium digital asset for modern web creators'
WHERE tagline IS NULL OR TRIM(tagline) = '';

-- 2. Backfill any null tech_stacks with empty arrays
UPDATE public.products
SET tech_stack = '{}'
WHERE tech_stack IS NULL;

-- 3. Backfill any null thumbnail_urls
UPDATE public.products
SET thumbnail_url = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80'
WHERE thumbnail_url IS NULL OR TRIM(thumbnail_url) = '';

-- 4. Backfill any null gallery_urls
UPDATE public.products
SET gallery_urls = '{}'
WHERE gallery_urls IS NULL;

-- 5. Backfill rating defaults
UPDATE public.products
SET rating_avg = 0.00
WHERE rating_avg IS NULL;

UPDATE public.products
SET rating_count = 0
WHERE rating_count IS NULL;

-- 6. Backfill prices to ensure whole rupees (paise must end in 00)
UPDATE public.products
SET price_inr = ROUND(price_inr / 100.0) * 100
WHERE price_inr % 100 != 0;

-- 7. Alter columns to enforce NOT NULL
ALTER TABLE public.products
  ALTER COLUMN tagline SET NOT NULL,
  ALTER COLUMN tech_stack SET NOT NULL,
  ALTER COLUMN thumbnail_url SET NOT NULL,
  ALTER COLUMN gallery_urls SET NOT NULL,
  ALTER COLUMN rating_avg SET NOT NULL,
  ALTER COLUMN rating_count SET NOT NULL,
  ALTER COLUMN price_inr SET NOT NULL;

-- 8. Add constraint for round rupees (paise divisible by 100) and non-negative
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
