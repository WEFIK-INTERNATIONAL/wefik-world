-- ==============================================================================
-- wefik.world — Migration: 006_seed_real_products.sql
-- Purpose: Draft seed for real products (Site Checkup, KuraCode Extension).
--
-- IMPORTANT:
--   - All rows are inserted with status = 'draft' so they do NOT go live
--     until the owner confirms pricing, versions, and uploads real screenshots.
--   - weclip is OMITTED because no public source or shipped artifact was found
--     (see docs/audit/17-real-products.md).
--   - KuraCode Extension uses external store delivery; see docs/audit/12-gap-analysis.md
--     and 13-new-products-plan.md for delivery_type schema additions if needed.
-- ==============================================================================

begin;

-- Ensure browser-extensions category exists for KuraCode
insert into public.categories (name, slug, description)
values (
  'Browser Extensions',
  'browser-extensions',
  'Developer-focused browser extensions and companion tools.'
)
on conflict (slug) do nothing;

-- 1. Site Checkup (WordPress Security Plugin) — DRAFT
insert into public.products (
  title,
  slug,
  tagline,
  description,
  category_id,
  price_inr,
  is_free,
  is_featured,
  is_bundle,
  thumbnail_url,
  gallery_urls,
  tech_stack,
  status
)
select
  'Site Checkup',
  'site-checkup',
  'WordPress security hardening checklist, vulnerability auditor, and agency SOP dashboard.',
  'Site Checkup is a WordPress security hardening checklist and diagnostic plugin by SK Sahinur Islam (GeniousSonu). Includes configuration checks, reversible 1-click hardening fixes with diff previews, and print-ready client audit reports.',
  c.id,
  0,          -- TODO: Owner to confirm pricing (free vs pro tier)
  true,       -- TODO: Owner to confirm is_free
  false,
  false,
  '/products/site-checkup/site-checkup-thumb.webp',
  array[]::text[],
  array['WordPress', 'PHP'],
  'draft'
from public.categories c
where c.slug = 'wordpress-plugins'
on conflict (slug) do nothing;

-- 2. KuraCode Extension (Browser Extension) — DRAFT
insert into public.products (
  title,
  slug,
  tagline,
  description,
  category_id,
  price_inr,
  is_free,
  is_featured,
  is_bundle,
  thumbnail_url,
  gallery_urls,
  tech_stack,
  status
)
select
  'KuraCode Extension',
  'kuracode-extension',
  'Local-first browser extension to capture, clean, organize, and search code snippets from any webpage.',
  'KuraCode is a local-first browser extension by SK Sahinur Islam (GeniousSonu). Capture code snippets via shortcuts, context menus, or inline buttons with automatic code cleaning, language detection, provenance tracking, IndexedDB offline storage, and optional cloud sync.',
  c.id,
  0,          -- TODO: Owner to confirm pricing (free / freemium / paid)
  true,       -- TODO: Owner to confirm is_free
  false,
  false,
  '/products/kuracode-extension/kuracode-thumb.webp',
  array[]::text[],
  array['Browser Extension', 'TypeScript', 'IndexedDB'],
  'draft'
from public.categories c
where c.slug = 'browser-extensions'
on conflict (slug) do nothing;

commit;

