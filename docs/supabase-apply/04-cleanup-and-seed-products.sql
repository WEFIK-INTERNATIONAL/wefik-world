-- ==============================================================================
-- wefik.world — 04-cleanup-and-seed-products.sql
-- ==============================================================================
-- PURPOSE:
--   Consolidates 005_remove_demo_products.sql and 006_seed_real_products.sql:
--   safely archives demo products (deleting only those with zero dependants)
--   and seeds real products (Site Checkup, KuraCode Extension) as 'draft'.
-- ==============================================================================

BEGIN;

-- 0. Relax NOT NULL on legacy 'type' column if present on live products table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products'
      AND column_name = 'type' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.products ALTER COLUMN type DROP NOT NULL;
  END IF;
END $$;

-- 1. Archive all 6 demo products first (safe even with active customers)
UPDATE public.products
SET
  status = 'archived',
  is_featured = false,
  updated_at = now()
WHERE slug IN (
  'agencypro-theme',
  'superfast-cache-plugin',
  'saaspulse-nextjs-template',
  'minimal-portfolio-free',
  'agency-growth-bundle',
  'wp-licensing-sdk-snippet'
);

-- 2. Delete demo products ONLY when they have ZERO dependants anywhere
DELETE FROM public.products p
WHERE p.slug IN (
  'agencypro-theme',
  'superfast-cache-plugin',
  'saaspulse-nextjs-template',
  'minimal-portfolio-free',
  'agency-growth-bundle',
  'wp-licensing-sdk-snippet'
)
AND NOT EXISTS (SELECT 1 FROM public.order_items oi WHERE oi.product_id = p.id)
AND NOT EXISTS (SELECT 1 FROM public.licenses l WHERE l.product_id = p.id)
AND NOT EXISTS (SELECT 1 FROM public.reviews r WHERE r.product_id = p.id)
AND NOT EXISTS (SELECT 1 FROM public.wishlists w WHERE w.product_id = p.id)
AND NOT EXISTS (SELECT 1 FROM public.downloads d WHERE d.product_id = p.id);

-- 3. Ensure required categories exist
INSERT INTO public.categories (name, slug, description)
VALUES
  ('WordPress Themes', 'wordpress-themes', 'Performance-first WordPress themes.'),
  ('WordPress Plugins', 'wordpress-plugins', 'Production WordPress plugins and security tools.'),
  ('HTML Templates', 'html-templates', 'Clean, responsive HTML/CSS templates.'),
  ('Next.js Templates', 'nextjs-templates', 'Full-stack Next.js App Router starter kits.'),
  ('Browser Extensions', 'browser-extensions', 'Developer-focused browser extensions and companion tools.')
ON CONFLICT (slug) DO NOTHING;

-- 4. Seed real products as DRAFT (owner reviews pricing & uploads assets before publishing)
INSERT INTO public.products (
  title, slug, tagline, description, category_id,
  price_inr, is_free, is_featured, is_bundle,
  thumbnail_url, gallery_urls, tech_stack, status
)
SELECT
  'Site Checkup',
  'site-checkup',
  'WordPress security hardening checklist, vulnerability auditor, and agency SOP dashboard.',
  'Site Checkup is a WordPress security hardening checklist and diagnostic plugin by SK Sahinur Islam (GeniousSonu). Includes configuration checks, reversible 1-click hardening fixes with diff previews, and print-ready client audit reports.',
  c.id,
  0,
  true,
  false,
  false,
  '/products/site-checkup/site-checkup-thumb.webp',
  ARRAY[]::text[],
  ARRAY['WordPress', 'PHP'],
  'draft'
FROM public.categories c
WHERE c.slug = 'wordpress-plugins'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (
  title, slug, tagline, description, category_id,
  price_inr, is_free, is_featured, is_bundle,
  thumbnail_url, gallery_urls, tech_stack, status
)
SELECT
  'KuraCode Extension',
  'kuracode-extension',
  'Local-first browser extension to capture, clean, organize, and search code snippets from any webpage.',
  'KuraCode is a local-first browser extension by SK Sahinur Islam (GeniousSonu). Capture code snippets via shortcuts, context menus, or inline buttons with automatic code cleaning, language detection, provenance tracking, IndexedDB offline storage, and optional cloud sync.',
  c.id,
  0,
  true,
  false,
  false,
  '/products/kuracode-extension/kuracode-thumb.webp',
  ARRAY[]::text[],
  ARRAY['Browser Extension', 'TypeScript', 'IndexedDB'],
  'draft'
FROM public.categories c
WHERE c.slug = 'browser-extensions'
ON CONFLICT (slug) DO NOTHING;

COMMIT;
