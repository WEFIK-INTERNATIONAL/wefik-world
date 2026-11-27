# 12 — Gap Analysis for the Five New Products

> **Scope:** Read-only gap analysis against the current model documented in `11-product-model-current.md`.

---

## Summary Matrix

| Capability Needed | Site Checkup (WP Plugin) | Original WP Theme | Next.js Animated Code Pack | Kuracode Extension | weclip (Multimedia App) |
| --- | --- | --- | --- | --- | --- |
| **Delivery mechanism** | ZIP + License (`download`) | ZIP + License (`download`) | ZIP + License (`download`) | Store install / manual + account link (`external_install`) | Hosted app / trial / subscription (`hosted_app`) |
| **Fits current `products` + `product_versions`?** | Mostly | Mostly | Mostly | **No** | **No** |
| **Needs `product_versions.file_path` nullable?** | No | No | No | **Yes** | **Yes** |
| **Needs external URL / install URL?** | Optional (WP.org) | No | No | **Yes** (Chrome/Edge/Firefox store + manual zip/repo) | **Yes** (`app_url`) |
| **Needs free tier + paid tier on same product?** | Possibly (if freemium) | No (unless free lite) | No | **Yes** (free extension + optional paid sync/pro) | **Yes** (free trial / free tier + paid plans) |
| **Needs per-product subscription?** | No (unless annual) | No | No | Optional | **Yes** |
| **Account / OAuth-style linking?** | License key only | License key only | License key only | **Yes** (extension ↔ webapp sync) | Handled via webapp auth / SSO |
| **Compatibility metadata** | WP 6.x, PHP 8.x | WP 6.x, PHP 8.x | Next.js 16, React 19, Tailwind | Chrome/Edge/Firefox MV3 | Modern browsers / OS |

---

## Detailed Gap Analysis by Product

### 1. Site Checkup (WordPress Security Plugin — ZIP + License)
- **What works today:**
  - `delivery_type`: fits existing `download` flow (`product_versions` ZIP in `product-files`, `claim-free` or `create-order` + `razorpay-webhook`, `download-url`, `license-validate`).
- **Gaps:**
  - **Compatibility & requirements:** No structured fields for `min_wp_version`, `tested_up_to_wp`, `min_php_version` (currently buried in markdown `description` or `tech_stack` strings).
  - **Documentation & changelog:** `product_versions.changelog` exists in DB, but `ProductDetailView` does not render a dedicated version/changelog tab or external `docs_url`.
  - **Bundling:** Works cleanly in `bundle_product_ids`.

### 2. New Original WordPress Theme / Template (ZIP + License)
- **What works today:**
  - `delivery_type`: fits existing `download` flow, `Single-Site` vs `Unlimited-Site` licensing, `demo_url` (`LiveDemoViewer`), and `bundle_product_ids`.
- **Gaps:**
  - **Compatibility & requirements:** No structured WordPress / PHP / block-editor requirement fields.
  - **Product-specific screenshot gallery:** `gallery_urls` exists in schema, but seed/fallback products currently use Unsplash URLs; theme needs real desktop/mobile screenshots and `image_alt` metadata.
  - **Third-party asset provenance:** No field or checklist confirming fonts/icons/images inside the theme are 100% redistributable under the commercial license.

### 3. Animated Next.js Components Code Pack (ZIP + License)
- **What works today:**
  - `delivery_type`: fits existing `download` flow.
- **Gaps:**
  - **Category & slug:** `002_seed.sql` only has `templates-starters` (`HTML Templates & Starters`); there is no dedicated `nextjs-starters` / `code-packs` category in DB.
  - **Compatibility & requirements:** Needs `Next.js`, `React`, `TypeScript`, `Tailwind CSS`, `GSAP` / peer-dependency version fields.
  - **License semantics (`licenses.activated_domains`):** Domain activation (`license-validate`) makes sense for WordPress sites, not for a React/Next.js component code pack copied into an app repo. Displaying "0/1 domains activated" on `/account/library` is confusing for code packs.
  - **Demo & docs links:** `demo_url` exists, but `docs_url` (e.g. Storybook / component docs) is missing.

### 4. Kuracode Extension (Browser Extension Syncing with Webapp)
- **What cannot be represented today:**
  - **No ZIP purchase flow:** `product_versions.file_path` is `NOT NULL`, `download-url` expects a ZIP in `product-files`, and `ProductDetailView` / `/account/library` assume every owned product has a "Download ZIP" button.
  - **Primary action is external install + account linking:** Needs store URL(s) (Chrome Web Store, Edge/Firefox, or manual unpacked instructions) and a `"Link Account"` / `"Open Extension Setup"` action instead of `"Add to Cart"` / `"Download"`.
  - **Account linking flow:** No token/OAuth-style device/extension pairing endpoint or `extension_tokens` / `linked_clients` table exists to sync the browser extension with the user's `wefik.world` account.
  - **Free + Paid tier:** Cannot represent a free extension install alongside an optional paid Pro/Sync tier on one product page.
  - **Bundles:** `razorpay-webhook` expands `bundle_product_ids` by issuing `licenses` rows and incrementing `download_count`. Including `Kuracode Extension` in a bundle would fail/confuse users if it shows a ZIP download button in `/account/library`.

### 5. weclip (Automated Video & Multimedia Clipping Tool — Hosted App / Trial / Subscription)
- **What cannot be represented today:**
  - **Hosted app delivery:** No `app_url` or `delivery_type = 'hosted_app'` on `products`. Showing `"Download ZIP"` or `"Single-Site / Unlimited-Site Domain License"` is completely wrong for a hosted SaaS app.
  - **Per-product trial or subscription:** `memberships` and `create-subscription` are hardcoded to the single sitewide `wefik.world` All-Access `monthly` / `lifetime` plans (`RAZORPAY_MONTHLY_PLAN_ID`). There is no per-product `subscription` / `trial` plan table or `razorpay_plan_id` per product.
  - **Free tier alongside paid tier:** `products` has a single boolean `is_free` and a single integer `price_inr`. It cannot show e.g. `"Free Tier (watermark / X mins) + Pro Plan (₹Y/mo)"`.
  - **Structured data (SEO):** `products/[slug]/page.tsx` emits `@type: "Product"` with one-time `Offer` in `INR`; a hosted SaaS/extension is better represented as `@type: "SoftwareApplication"` with `applicationCategory`, `operatingSystem`, and `Offer` / `UnitPriceSpecification`.
  - **Bundles:** A hosted subscription app cannot be cleanly bundled inside `bundle_product_ids` with one-time `licenses` unless bundle entitlement explicitly grants a time-boxed or tier entitlement in `weclip`.

---

## Cross-Cutting Gaps Found Across All 5 Products

1. **No `delivery_type` discriminator** (`download` vs `external_install` vs `hosted_app`).
2. **No structured `requirements` / `compatibility` JSONB or columns** (WP version, PHP version, Node/Next version, Browser support).
3. **No `docs_url` or `changelog_url`** separate from `demo_url` and `description`.
4. **No product-level `tiers` / `subscription_plan_id`** for freemium or SaaS products.
5. **Admin UI (`ProductAdminManager`)** cannot create products or edit `delivery_type`, external links, or compatibility metadata.

