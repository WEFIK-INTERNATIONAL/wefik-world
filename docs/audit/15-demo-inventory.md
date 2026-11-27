# 15 — Demo & Fake Product Inventory

> Full list of every demo/fake product reference in the codebase, with proposed action for each.

## Summary

| Location type | Count |
|---|---|
| Database seed SQL | 6 products, 3 categories, 2 memberships, 1 coupon |
| Fallback data (TS) | 6 products (mirrors seed) |
| Product images | 6 WebP files (2 are byte-identical duplicates) |
| Unsplash stock URLs | 11 unique URLs across 3 files |
| Blog seed posts | 5 demo blog posts with fake authors/avatars |
| SEO programmatic data | 5 inline refs to demo product names |
| Component hardcoded refs | 4 files with demo product names in labels/placeholders |
| Total files touched | 13 unique source files |

---

## A. Database Seed (`supabase/migrations/002_seed.sql`)

| Slug | Title | Type | Price | Action |
|---|---|---|---|---|
| `agencypro-theme` | AgencyPro – WordPress FSE Theme | WP theme | ₹999 | Archive → real product |
| `superfast-cache` | SuperFast Cache – WP Performance Plugin | WP plugin | ₹499 | Archive → real product |
| `saaspulse-tailwind` | SaaSPulse – Tailwind SaaS Starter | HTML template | ₹1499 | Archive → real product |
| `minimal-portfolio-starter` | Minimal Portfolio Starter | Free template | ₹0 | Archive → real product |
| `agency-complete-bundle` | Agency Growth Bundle | Bundle | ₹2999 | Archive → real product |
| `leadcraft-lead-gen` | LeadCraft – Lead Gen Plugin | WP plugin | ₹699 | Archive → real product |

Also seeded: 3 categories (`wordpress-themes`, `wordpress-plugins`, `templates-starters`), 2 membership plans, `WELCOME10` coupon.

**Action:** Write `005_archive_demo_products.sql` to set `status = 'archived'` on all 6 and optionally `DELETE` after owner confirms no live orders exist.

---

## B. Fallback Products (`src/lib/data/fallback-products.ts`)

Same 6 products as the seed. This file is used by `getProducts()` when the Supabase query returns empty (e.g. no DB connection).

**Action:** Replace contents with an empty array. The site should show "No products yet" rather than fake data.

---

## C. Product Images (`public/images/products/`)

| File | Size | Notes |
|---|---|---|
| `agencypro-theme.webp` | 68 KB | Duplicate of `devstarter-html-template.webp` (identical MD5) |
| `superfast-cache-plugin.webp` | 67 KB | |
| `saaskit-nextjs-starter.webp` | 145 KB | |
| `woo-minimal-theme.webp` | 57 KB | |
| `agency-complete-bundle.webp` | 81 KB | |
| `devstarter-html-template.webp` | 68 KB | Duplicate of `agencypro-theme.webp` |

**Action:** Delete all 6 after real product images are in place. Keep directory for real product thumbnails.

---

## D. Unsplash Stock URLs

| File | Lines | Count |
|---|---|---|
| `src/lib/data/fallback-products.ts` | 64, 65, 107, 148, 188, 232, 272 | 6 (gallery_urls) |
| `src/lib/sanity/seed-posts.ts` | 31, 35, 171, 175, 217, 221, 272, 276, 332, 336 | 10 (avatars + covers) |
| `src/components/checkout/cart-drawer.tsx` | 85 | 1 (fallback thumbnail) |
| `src/components/marketplace/live-demo-viewer.tsx` | 40 | 1 (fallback preview) |

**Action:**
- Fallback products: cleared when array is emptied.
- Seed posts: not rendered on live site (Sanity CMS is source of truth for blog). Leave as-is or delete entire file.
- Cart drawer: replace Unsplash fallback with a local generic product placeholder or remove (item should always have a thumbnail from DB).
- Live demo viewer: replace Unsplash fallback with a neutral placeholder or empty state message.

---

## E. Blog Seed Posts (`src/lib/sanity/seed-posts.ts`)

5 blog posts with fake author identities ("Priya Sharma", "Rahul Dey"), fake Unsplash avatars, and inline references to demo products (AgencyPro, SaaSPulse).

**Action:** This file appears to be a development seed only — the live blog uses Sanity CMS. Delete the file or add a `// DEV SEED ONLY — not used in production` header. Verify no runtime import path uses it.

---

## F. Component Hardcoded Demo References

| File | Line(s) | What | Action |
|---|---|---|---|
| `src/components/hero/hero-poster.tsx` | 41 | `"AgencyPro FSE"` label | Replace with dynamic product name or remove component (hero-lightweight is used instead) |
| `src/components/marketplace/before-after-slider.tsx` | 20 | `afterLabel = 'AgencyPro FSE'` default prop | Change default to `'After'` |
| `src/components/admin/product-admin-manager.tsx` | 119, 256, 310 | `"AgencyPro"` in placeholder/example text | Change to generic placeholder text |
| `src/lib/seo/programmatic-data.ts` | 1001–1005, 1162 | `"AgencyPro Child"` theme child theme example in glossary | Replace with generic `"YourTheme Child"` or reference real product |

---

## G. Programmatic SEO Data (`src/lib/seo/programmatic-data.ts`)

1253 lines. Contains category hubs, use-case pages, alternatives pages, comparisons, free hubs, collections, and glossary terms. The data itself is mostly generic/factual SEO copy about WordPress themes/plugins as a category. Demo product names appear only in the glossary child-theme example (5 lines).

**Action:** Replace the 5 demo-product references with generic examples. Leave the rest — it's category-level SEO content that doesn't depend on specific products.

---

## H. Pages That Render Demo Data

| Page | Source | Behaviour when empty |
|---|---|---|
| `/` (homepage) | `getProducts()` → hero showcase, free products, featured | Shows skeleton/empty state ✓ |
| `/marketplace` | `getProducts()` → filters, grid | Shows empty grid ✓ |
| `/bundles` | `getProducts().filter(is_bundle)` | Shows hero + empty grid — needs "No bundles yet" state |
| `/freebies` | `getProducts().filter(is_free)` | Shows hero + empty grid — needs "No freebies yet" state |
| `/products/[slug]` | Individual fetch by slug | 404 if no product — OK |

**Action:** Add empty-state messages to `/bundles` and `/freebies` pages.

---

## I. Marquee (`src/components/ui/infinite-marquee.tsx`)

Line 11: `'100% Free Production Starters'` link to `/freebies`. No demo product names, but the claim is only valid if free products exist.

**Action:** Make text data-driven or hide when no freebies exist.

---

## J. Items NOT Containing Demo References (confirmed clean)

- `src/components/layout/footer.tsx` — no demo product names
- `src/components/search/command-palette.tsx` — fetches live from DB
- Sitemap routes — all data-driven from `getProducts()`
- Edge functions (`supabase/functions/`) — no hardcoded product data
- `src/app/products/[slug]/` — fully data-driven

