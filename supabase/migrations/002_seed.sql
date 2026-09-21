-- ==============================================================================
-- wefik.world — Database Seed: 002_seed.sql
-- Seed 3 categories, 6 products (1 free, 1 bundle), 2 membership plans, WELCOME10 coupon
-- ==============================================================================

-- 1. SEED MEMBERSHIP PLANS (Prices in paise)
insert into public.membership_plans (plan, name, price_inr, interval, description, features, is_active)
values
  (
    'monthly',
    'All-Access Monthly',
    99900, -- ₹999/month
    'month',
    'Unrestricted access to all current and future themes, plugins, and templates.',
    array[
      'Access to all current digital products',
      'All new monthly releases included',
      'Unlimited personal & commercial project use',
      'Discord & priority email support',
      'Cancel anytime with one click'
    ],
    true
  ),
  (
    'lifetime',
    'Lifetime Deal',
    999900, -- ₹9,999 one-time
    'one-time',
    'Pay once, get perpetual access to everything wefik ever builds. Zero renewals.',
    array[
      'Perpetual access to all current & future products',
      'All major version upgrades included forever',
      'Unlimited site licenses for agency client work',
      'Direct founder Discord access & priority support',
      'Zero recurring bills or subscription fatigue'
    ],
    true
  )
on conflict (plan) do update set
  name = excluded.name,
  price_inr = excluded.price_inr,
  description = excluded.description,
  features = excluded.features;

-- 2. SEED CATEGORIES
insert into public.categories (id, name, slug, description)
values
  (
    'c0000000-0000-0000-0000-000000000001',
    'WordPress Themes',
    'wordpress-themes',
    'High-performance, Gutenberg-optimized block themes crafted for modern agencies and businesses.'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'WordPress Plugins',
    'wordpress-plugins',
    'Clean, bloat-free plugins designed to solve specific workflow, performance, and SEO bottlenecks.'
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'HTML Templates & Starters',
    'templates-starters',
    'Production-ready Tailwind CSS and Next.js website templates and developer code starters.'
  )
on conflict (slug) do nothing;

-- 3. SEED PRODUCTS (Prices in paise)
insert into public.products (
  id,
  title,
  slug,
  tagline,
  description,
  category_id,
  price_inr,
  is_free,
  is_featured,
  is_bundle,
  bundle_product_ids,
  thumbnail_url,
  gallery_urls,
  demo_url,
  tech_stack,
  rating_avg,
  rating_count,
  download_count,
  status
)
values
  -- Product 1: AgencyPro Theme (Featured)
  (
    'p0000000-0000-0000-0000-000000000001',
    'AgencyPro — Modern Agency WordPress Theme',
    'agencypro-theme',
    'Ultra-fast full-site editing theme with 20+ pre-designed block patterns for creative agencies.',
    '# AgencyPro WordPress Theme

AgencyPro is a state-of-the-art WordPress theme engineered specifically for digital agencies, design studios, and freelancers who demand speed and flexibility without bulky page builders.

### Key Highlights
- **100/100 Google PageSpeed score** out of the box with zero external dependencies.
- **Full Site Editing (FSE)** support with 20+ Gutenberg block patterns.
- **Dynamic Case Studies & Portfolio** custom post types with interactive filtering.
- **One-click demo importer** with automated content setup in 60 seconds.
- **Clean, accessible code** adhering to modern WordPress coding standards.

### What is Included
- Theme ZIP file + Child Theme
- Sample demo XML data
- Figma design source files
- Comprehensive setup documentation and lifetime updates',
    'c0000000-0000-0000-0000-000000000001',
    249900, -- ₹2,499
    false,
    true,
    false,
    '{}',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80'
    ],
    'https://demo.wefik.in/agencypro',
    array['WordPress', 'Gutenberg', 'FSE', 'Tailwind CSS', 'PHP 8.2'],
    4.95,
    28,
    342,
    'published'
  ),

  -- Product 2: SuperFast Cache & Minify Plugin
  (
    'p0000000-0000-0000-0000-000000000002',
    'SuperFast Cache & WebP Optimizer',
    'superfast-cache-plugin',
    'Lightweight WordPress caching, CSS/JS minification, and automatic WebP image conversion.',
    '# SuperFast Cache & Optimizer

A lightweight, zero-configuration WordPress performance plugin that eliminates bloat and makes your pages load in under 500 milliseconds.

### Features
- **Static Page Caching**: Instant static HTML page generation for lightning-quick TTFB.
- **Automated WebP Conversion**: Automatically converts JPG and PNG uploads to optimized WebP images.
- **Asset Minification**: Strips whitespace, combines stylesheets, and defers non-critical JavaScript.
- **Database Cleaner**: Cleans orphaned post revisions, spam comments, and expired transients.',
    'c0000000-0000-0000-0000-000000000002',
    149900, -- ₹1,499
    false,
    true,
    false,
    '{}',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80'
    ],
    'https://demo.wefik.in/superfast-cache',
    array['WordPress Plugin', 'PHP 8.2', 'Redis Cache', 'WebP'],
    4.88,
    19,
    512,
    'published'
  ),

  -- Product 3: SaasPulse Next.js Template
  (
    'p0000000-0000-0000-0000-000000000003',
    'SaaSPulse — Modern Next.js 15 SaaS Starter',
    'saaspulse-nextjs-template',
    'Complete SaaS marketing template with pricing tables, feature grids, and dashboard mockups.',
    '# SaaSPulse Next.js 15 SaaS Template

The ultimate landing page and dashboard template for indie hackers and developers launching their next software product.

### Features
- Built with **Next.js 15 App Router** and **React 19**.
- Styled with **Tailwind CSS** and **shadcn/ui**.
- Dark/Light mode switcher with persistent system preference.
- 12 pre-built marketing sections + authentication modals + dashboard shell.
- 100% responsive and accessible markup.',
    'c0000000-0000-0000-0000-000000000003',
    199900, -- ₹1,999
    false,
    false,
    false,
    '{}',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80'
    ],
    'https://demo.wefik.in/saaspulse',
    array['Next.js 15', 'TypeScript', 'Tailwind CSS', 'shadcn/ui'],
    5.00,
    14,
    215,
    'published'
  ),

  -- Product 4: Minimalist Portfolio (Freebie / Lead Magnet)
  (
    'p0000000-0000-0000-0000-000000000004',
    'Minimal Portfolio — Free HTML & Tailwind Template',
    'minimal-portfolio-free',
    'Clean, distraction-free one-page portfolio template for designers, developers, and photographers.',
    '# Minimal Portfolio (Free Edition)

A free, elegant one-page portfolio template built with clean HTML5 and Tailwind CSS. Perfect for showing off selected works and collecting client inquiries without unnecessary clutter.

### Features
- Completely **100% Free** for commercial and personal projects.
- One-click free claim — instant download.
- Fully responsive across mobile, tablet, and widescreen monitors.
- Integrated contact form layout and social links.',
    'c0000000-0000-0000-0000-000000000003',
    0, -- Free
    true, -- is_free = true
    false,
    false,
    '{}',
    'https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=1200&auto=format&fit=crop&q=80'
    ],
    'https://demo.wefik.in/minimal-portfolio',
    array['HTML5', 'Tailwind CSS', 'Vanilla JS'],
    4.91,
    45,
    1240,
    'published'
  ),

  -- Product 5: Agency Starter Bundle
  (
    'p0000000-0000-0000-0000-000000000005',
    'The Complete Agency Growth Bundle',
    'agency-growth-bundle',
    'Save 40%: AgencyPro Theme + SuperFast Cache Plugin + SaaSPulse Next.js Starter in one package.',
    '# The Complete Agency Growth Bundle

Everything you need to build, optimize, and market client websites at scale. Includes our flagship theme, performance optimizer, and SaaS starter kit at an exclusive bundled discount.

### Bundle Contents
1. **AgencyPro WordPress Theme** (Value: ₹2,499)
2. **SuperFast Cache & WebP Optimizer** (Value: ₹1,499)
3. **SaaSPulse Next.js 15 Starter** (Value: ₹1,999)

*Total individual value: ₹5,997. Bundle price: ₹3,999 (Save ₹1,998).*',
    'c0000000-0000-0000-0000-000000000001',
    399900, -- ₹3,999
    false,
    true,
    true, -- is_bundle = true
    array[
      'p0000000-0000-0000-0000-000000000001'::uuid,
      'p0000000-0000-0000-0000-000000000002'::uuid,
      'p0000000-0000-0000-0000-000000000003'::uuid
    ],
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80'
    ],
    'https://demo.wefik.in/bundle',
    array['WordPress', 'Plugins', 'Next.js', 'Bundle'],
    4.98,
    32,
    188,
    'published'
  ),

  -- Product 6: Secure Auth & Licensing Snippet Starter
  (
    'p0000000-0000-0000-0000-000000000006',
    'WordPress Software Licensing API & Client SDK',
    'wp-licensing-sdk-snippet',
    'Drop-in PHP snippet and REST API endpoint to add remote license validation and auto-updates to any plugin.',
    '# WordPress Software Licensing SDK & Snippet

A lightweight, secure drop-in module for WordPress plugin and theme creators who want to protect their intellectual property and deliver automatic updates.

### Features
- Cryptographic license key verification with domain whitelisting.
- Automatic update checker connected to your remote private S3/Supabase storage.
- Rate-limited verification endpoints preventing brute-force attacks.',
    'c0000000-0000-0000-0000-000000000002',
    99900, -- ₹999
    false,
    false,
    false,
    '{}',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    array[
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80'
    ],
    'https://github.com/wefikinternational',
    array['PHP', 'WordPress REST API', 'Security', 'Licensing'],
    4.85,
    11,
    95,
    'published'
  )
on conflict (slug) do nothing;

-- 4. SEED PRODUCT VERSIONS (Version 1.0.0 for all products)
insert into public.product_versions (product_id, version, changelog, file_path, is_latest)
values
  ('p0000000-0000-0000-0000-000000000001', '1.0.0', 'Initial commercial release with full site editing support.', 'agencypro-theme/agencypro-v1.0.0.zip', true),
  ('p0000000-0000-0000-0000-000000000002', '1.0.0', 'Initial release featuring static page caching and WebP optimization.', 'superfast-cache-plugin/superfast-cache-v1.0.0.zip', true),
  ('p0000000-0000-0000-0000-000000000003', '1.0.0', 'Initial release with Next.js 15, Tailwind CSS, and shadcn/ui.', 'saaspulse-nextjs-template/saaspulse-v1.0.0.zip', true),
  ('p0000000-0000-0000-0000-000000000004', '1.0.0', 'Free public release with responsive layout and clean HTML markup.', 'minimal-portfolio-free/minimal-portfolio-v1.0.0.zip', true),
  ('p0000000-0000-0000-0000-000000000005', '1.0.0', 'Bundle release containing AgencyPro Theme, SuperFast Cache, and SaaSPulse.', 'agency-growth-bundle/agency-growth-bundle-v1.0.0.zip', true),
  ('p0000000-0000-0000-0000-000000000006', '1.0.0', 'Initial release with secure remote updater and activation tracker.', 'wp-licensing-sdk-snippet/wp-licensing-sdk-v1.0.0.zip', true)
on conflict do nothing;

-- 5. SEED COUPON: WELCOME10 (10% discount)
insert into public.coupons (code, discount_percent, discount_fixed_inr, valid_from, valid_until, max_uses, used_count, is_active)
values
  ('WELCOME10', 10, null, now(), now() + interval '5 years', 1000, 0, true)
on conflict (code) do update set
  discount_percent = excluded.discount_percent,
  is_active = true;
