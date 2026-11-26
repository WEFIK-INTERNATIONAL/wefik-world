-- ==============================================================================
-- wefik.world — Migration: 005_remove_demo_products.sql
-- Purpose: Safely archive or remove the 6 demo products from 002_seed.sql.
-- NOTE: Do NOT apply automatically. Review in Supabase SQL Editor first.
-- Safe to re-run (idempotent).
-- ==============================================================================

begin;

-- 1. Archive all demo products first so they disappear from public listings
--    even if they have existing order_items, downloads, or licenses.
update public.products
set
  status = 'archived',
  is_featured = false,
  updated_at = now()
where slug in (
  'agencypro-theme',
  'superfast-cache-plugin',
  'saaspulse-nextjs-template',
  'minimal-portfolio-free',
  'agency-growth-bundle',
  'wp-licensing-sdk-snippet'
);

-- 2. Delete demo products that have NO dependent orders, licenses, or reviews.
--    Any demo product referenced by live orders/licenses remains archived above.
delete from public.products p
where p.slug in (
  'agencypro-theme',
  'superfast-cache-plugin',
  'saaspulse-nextjs-template',
  'minimal-portfolio-free',
  'agency-growth-bundle',
  'wp-licensing-sdk-snippet'
)
and not exists (
  select 1 from public.order_items oi where oi.product_id = p.id
)
and not exists (
  select 1 from public.licenses l where l.product_id = p.id
)
and not exists (
  select 1 from public.reviews r where r.product_id = p.id
);

commit;

