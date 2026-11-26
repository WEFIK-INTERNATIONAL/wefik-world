# 10 — Content & Data Issues Audit (Report Only)

> **Scope:** Diagnostic report for owner review. No database records, seed files, or migrations were modified.

---

## 1. Product Images (Generic Stock Photos or Mismatched / Duplicate Previews)

| Product Slug | Current Image Path(s) | Issue | Suggested Action |
| --- | --- | --- | --- |
| `leadcraft-landing-page` | `thumbnail_url`: `/images/products/devstarter-html-template.webp` | Byte-for-byte duplicate of `agencypro-theme.webp` (MD5 `c2d4b3da5c01324a2e83cada9c8c9876`, 68,118 bytes). Also `gallery_urls` points to Unsplash stock photo (`photo-1460925895917-afdab827c52f`). | Replace with a real screenshot of LeadCraft; remove Unsplash gallery URL. |
| `minimal-portfolio-free` | `thumbnail_url`: `/images/products/woo-minimal-theme.webp` | Product is a free HTML & Tailwind portfolio template, but its thumbnail is a WooCommerce theme image (`woo-minimal-theme.webp`). `gallery_urls` uses Unsplash (`photo-1481487196290-c152efe083f5`). | Replace with a real screenshot of Minimal Portfolio; remove Unsplash gallery URL. |
| `saaspulse-nextjs-template` | `thumbnail_url`: `/images/products/saaskit-nextjs-starter.webp` | Filename says `saaskit-nextjs-starter.webp` while product is `SaaSPulse`. `gallery_urls` uses Unsplash (`photo-1507238691740-187a5b1d37b8`). | Confirm screenshot matches SaaSPulse; remove Unsplash gallery URL. |
| `agencypro-theme` | `gallery_urls`: `images.unsplash.com/photo-1460925895917-...`, `photo-1507238691740-...` | Gallery uses generic Unsplash laptop/desk stock photos instead of real theme screenshots. | Replace `gallery_urls` with real screenshots of AgencyPro. |
| `superfast-cache-plugin` | `gallery_urls`: `images.unsplash.com/photo-1551288049-...` | Gallery uses generic Unsplash analytics stock photo instead of real plugin UI screenshots. | Replace `gallery_urls` with real plugin screenshots. |
| `agency-growth-bundle` | `gallery_urls`: `images.unsplash.com/photo-1522071820081-...` | Gallery uses generic Unsplash team-at-laptop stock photo. | Replace `gallery_urls` with bundle preview assets. |

*(Note: `ProductCard` has been updated in code to ignore Unsplash/placeholder URLs and render a typographic category tile when no real image is present, without modifying the underlying data.)*

---

## 2. Descriptions & Taglines

| Product Slug | Current State | Issue | Suggested Action |
| --- | --- | --- | --- |
| All 6 seed products (`fallback-products.ts`) | `tagline` is 11–16 words; `description` is full markdown. | No missing descriptions in fallback data, though live Supabase rows may have `null` or empty `tagline`/`description` (normalized to `""` in `src/lib/data/products.ts`). | Audit live Supabase `products` rows for empty `tagline` or `description` and backfill where short/missing. |

---

## 3. Category / Content Conflicts

| Product Slug | Current Category (`name` / `slug`) | Product Title / Content | Suggested Correct Category |
| --- | --- | --- | --- |
| `saaspulse-nextjs-template` | `HTML Templates` (`templates-starters`) | `SaaSPulse — Modern Next.js 16 SaaS Starter` (`Next.js 16`, `TypeScript`, `shadcn/ui`) | Create a dedicated `Next.js Starters` (`nextjs-templates` or `nextjs-starters`) category in `categories` and assign `saaspulse-nextjs-template` to it. |
| `agency-growth-bundle` | `Bundles` (`bundles`) in `fallback-products.ts`; `c0000000-...-0001` (`wordpress-themes`) in `002_seed.sql` | Multi-product bundle (`AgencyPro` + `SuperFast Cache` + `SaaSPulse`) | Confirm `Bundles` category exists in live DB or ensure bundle filtering relies on `is_bundle = true`. |

---

## 4. Outdated Framework Versions in Copy / Seed Data

| Location | Current Copy | Actual Stack (`package.json`) | Suggested Action |
| --- | --- | --- | --- |
| `supabase/migrations/002_seed.sql` (lines 168, 171, 176, 192, 245, 308) | `SaaSPulse — Modern Next.js 15 SaaS Starter`, `Next.js 15 App Router`, `array['Next.js 15', ...]` | `Next.js 16.3.5` | Update live Supabase `products` and `product_versions` rows for `saaspulse-nextjs-template` and `agency-growth-bundle` from `Next.js 15` to `Next.js 16`. |

---

## 5. Inconsistent Category Naming & Slugs Across Code and Data

| Location | Label(s) Used | Slug(s) / Route(s) Used | Notes |
| --- | --- | --- | --- |
| `supabase/migrations/002_seed.sql` (lines 48–65) | `WordPress Themes`, `WordPress Plugins`, `HTML Templates & Starters` | `wordpress-themes`, `wordpress-plugins`, `templates-starters` | Only 3 categories seeded; no `Next.js Starters` category. |
| `src/lib/data/fallback-products.ts` | `WordPress Themes`, `WordPress Plugins`, `HTML Templates`, `Bundles` | `wordpress-themes`, `wordpress-plugins`, `templates-starters`, `bundles` | Calls `templates-starters` `"HTML Templates"` instead of `"HTML Templates & Starters"`. |
| `src/components/marketplace/marketplace-client-view.tsx` (lines 130–135) | `WordPress Themes`, `WordPress Plugins`, `HTML & Tailwind` | `wordpress-themes`, `wordpress-plugins`, `templates-starters` | Calls `templates-starters` `"HTML & Tailwind"`. |
| `src/lib/constants.ts` (lines 50–52) | `WordPress Themes`, `HTML Templates`, `WordPress Plugins` | `theme`, `template`, `plugin` | Uses singular `value` keys instead of category slugs. |
| `src/app/` routes & `header.tsx` | Routes `/wordpress-themes`, `/wordpress-plugins`, `/html-templates` | `header.tsx` also checks `/nextjs-templates` | `/nextjs-templates` route does not exist in `src/app/`. |

---

## 6. Claims Needing Owner Confirmation

1. **Bundles `"Save 60%"` / `"Save 40% to 60%"`** on `/bundles` and footer `"Curated Bundles (-60%)"` — could not be verified against live bundle pricing (`agency-growth-bundle` is ₹3,999 vs ₹5,997 individual = ~33% savings, though its description says `"Save 40%"`).
2. **Sanity `/blog`** — `NEXT_PUBLIC_SANITY_PROJECT_ID` defaults to placeholder; `/blog` falls back to `SEED_POSTS`.
3. **Unlimited license multiplier** — `2.0x` vs `2.5x` decision (`src/lib/pricing.ts`).

