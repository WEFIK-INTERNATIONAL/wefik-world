# 11 — Current Product Model (`wefik.world`)

> **Scope:** Read-only architecture audit on branch `release/wefik-cleanup-polish`. All paths and column names reflect files directly inspected in the repository.

---

## 1. Database Schema (`supabase/migrations/001_schema.sql` & `src/types/database.ts`)

| Table | Key Columns | Constraints / Relationships |
| --- | --- | --- |
| `public.categories` | `id`, `name`, `slug` (unique), `description`, `created_at` | Referenced by `products.category_id` (`on delete set null`). Seeded with 3 categories in `supabase/migrations/002_seed.sql`: `wordpress-themes`, `wordpress-plugins`, `templates-starters`. |
| `public.products` | `id`, `title`, `slug` (unique), `tagline`, `description` (Markdown), `category_id`, `price_inr` (integer paise), `is_free`, `is_featured`, `is_bundle`, `bundle_product_ids` (`uuid[]`), `thumbnail_url`, `gallery_urls` (`text[]`), `demo_url`, `tech_stack` (`text[]`), `rating_avg`, `rating_count`, `download_count`, `status` (`draft \| published \| archived`), `created_at`, `updated_at` | Single pricing model (one `price_inr` for Single-Site; Unlimited-Site derived in code). Assumes every product is either free (`is_free`) or one-time purchase, and is deliverable via `product_versions`. No `delivery_type`, external install URL, app URL, compatibility columns, docs URL, or subscription plan link. |
| `public.product_versions` | `id`, `product_id` (FK `products`), `version`, `changelog`, `file_path` (`NOT NULL`), `is_latest`, `created_at` | Every version requires a non-null `file_path` inside the private `product-files` Supabase Storage bucket. |
| `public.licenses` | `id`, `license_key` (unique, `WFK-XXXX-XXXX-XXXX`), `user_id`, `product_id`, `order_id`, `license_type` (`single \| unlimited`), `status` (`active \| revoked`), `activated_domains` (`text[]`), `max_activations` (`1` or `9999`), `created_at` | Domain-centric activation model (`activated_domains`). |
| `public.orders` & `public.order_items` | `orders`: `total_amount`, `subtotal`, `discount_amount`, `currency` (`INR`), `status` (`pending \| paid \| failed \| refunded`). `order_items`: `order_id`, `product_id`, `item_type` (`product \| membership_monthly \| membership_lifetime`), `price`, `license_type` (`single \| unlimited`) | `order_items` only distinguishes one-time `product` vs sitewide `membership_monthly` / `membership_lifetime`. |
| `public.reviews` | `id`, `user_id`, `product_id`, `rating` (`1..5`), `review_text`, `is_approved`, `created_at` | Unique `(user_id, product_id)`. |
| `public.downloads` | `id`, `user_id`, `product_id`, `version_id`, `ip_address`, `user_agent`, `created_at` | Audit log written by `download-url` Edge Function. |
| `public.membership_plans` & `public.memberships` | `plan` (`monthly \| lifetime`), `price_inr`, `interval` (`month \| one-time`), `razorpay_subscription_id`, `current_period_start`, `current_period_end` | Site-wide All-Access subscription model; not linked per-product. |

---

## 2. Data Fetching & Normalization (`src/lib/data/products.ts` & `src/lib/data/fallback-products.ts`)

- `getProducts()` and `getProductBySlug()` query `products` joined with `categories` and `product_versions`, passing rows through `normalizeProduct()` to guarantee non-null defaults.
- When `NEXT_PUBLIC_SUPABASE_URL` is a placeholder, queries fall back to `FALLBACK_PRODUCTS` (`src/lib/data/fallback-products.ts`).
- `ProductData` interface (`src/lib/data/fallback-products.ts`) mirrors the `products` table plus optional `seo_title`, `seo_description`, and `primary_use_case`.

---

## 3. Product Page (`src/app/products/[slug]/page.tsx` & `src/components/marketplace/product-detail-view.tsx`)

- **Server (`src/app/products/[slug]/page.tsx`):**
  - Pre-renders slugs via `generateStaticParams()`.
  - Builds `<Metadata>` and JSON-LD (`@type: "Product"` with `Offer` in `INR` + `BreadcrumbList`).
  - Fetches up to 3 related products (same category or fallback) and up to 20 approved `reviews` (`review_text`).
- **Client (`src/components/marketplace/product-detail-view.tsx`):**
  - Displays gallery (`[thumbnail_url, ...gallery_urls]`), `LiveDemoViewer` (`demo_url`), `ProductMarkdownDocs`, `BeforeAfterSlider`, and reviews form.
  - Pricing/CTA box assumes **Single-Site vs Unlimited-Site** (`UNLIMITED_LICENSE_MULTIPLIER = 2.0` from `src/lib/pricing.ts`) for paid products, or `handleClaimFree()` (`claim-free` Edge Function) for `is_free` products.
  - Always shows `"Add to Cart"` (paid) or `"Claim Free License"` (free) — no branching for external install links or hosted SaaS apps.

---

## 4. Card & Filters (`src/components/marketplace/product-card.tsx` & `src/components/marketplace/marketplace-client-view.tsx`)

- **`ProductCard` (`src/components/marketplace/product-card.tsx`):**
  - Unified layout: `16:10` image (or typographic category tile if missing/placeholder/Unsplash) → category label → title (`line-clamp-2`) → 1-line tagline (`line-clamp-1`) → price (`Free` or `₹X,XXX`).
  - Supports `layout="vertical" | "horizontal"`.
- **`MarketplaceClientView` (`src/components/marketplace/marketplace-client-view.tsx`):**
  - Filters via URL query params: `q` (with fuzzy fallback), `category` (`all`, `wordpress-themes`, `wordpress-plugins`, `templates-starters`), `type` (`all`, `free`, `paid`, `bundle`), `tech` (`Gutenberg`, `Tailwind`, `Next.js`, `React`, `PHP`, `TypeScript`), `price`, `rating`, `sort`, `page`.

---

## 5. SEO & Sitemap Routes

- **Sitemaps:**
  - `src/app/sitemap.xml/route.ts` (index)
  - `src/app/sitemap-products.xml/route.ts` — lists `/products/${p.slug}` with `<image:image>` tags for external HTTP `thumbnail_url` / `gallery_urls`.
  - `src/app/sitemap-programmatic.xml/route.ts` — lists `/themeforest-alternative`, `/html-templates/[useCase]`, `/wordpress-plugins/[useCase]`, `/wordpress-themes/[useCase]`, plus alternatives, comparisons, free hubs, and collections from `src/lib/seo/programmatic-data.ts`.
  - `src/app/sitemap-static.xml/route.ts` and `src/app/sitemap-content.xml/route.ts`.
- **Category landing pages:** `src/app/wordpress-themes/`, `src/app/wordpress-plugins/`, `src/app/html-templates/`.

---

## 6. Cart, Order Creation & Fulfillment

- **Cart (`src/lib/cart-context.tsx`):** Stores `CartItem[]` in `localStorage` (`wefik_cart_v1`). Each item carries `productId`, `licenseType` (`'single' | 'unlimited'`), `singlePricePaise`, `unlimitedPricePaise`, and `isFree`.
- **Order creation (`supabase/functions/create-order/index.ts`):**
  - Authenticated user sends `{ kind: "products", items: [{ product_id, license_type }], coupon_code? }` or `{ kind: "membership", plan: "lifetime" }`.
  - Rejects duplicate purchase if an `active` license already exists for `product_id`.
  - Computes `price` (`price_inr` or `price_inr * 2` for `unlimited`), applies coupon, inserts `orders` + `order_items`, and creates a Razorpay Order (fails closed `503` if Razorpay is unconfigured).
- **Subscriptions (`supabase/functions/create-subscription/index.ts`):** Only handles the sitewide `monthly` All-Access membership (`RAZORPAY_MONTHLY_PLAN_ID`).
- **Fulfillment (`supabase/functions/razorpay-webhook/index.ts`):**
  - On `payment.captured`: marks order `paid`, expands `bundle_product_ids` if `product.is_bundle`, inserts `licenses` rows (`WFK-XXXX-XXXX-XXXX`), increments `download_count`, and sends receipt email.

---

## 7. License & Download Flow

- **Free claim (`supabase/functions/claim-free/index.ts`):** Requires auth; verifies `is_free = true` and `status = 'published'`; inserts `single` license (`max_activations: 1`, `order_id: null`).
- **Signed URL download (`supabase/functions/download-url/index.ts`):**
  - Requires auth; rate-limited (`20/hour/user` via Redis).
  - Authorizes via active `licenses` row OR active `memberships` (`lifetime` or non-expired `monthly`).
  - Queries `product_versions` (`is_latest = true` or `version_id`), generates a **60-second signed URL** from private `product-files` bucket, and logs to `public.downloads`.
- **License validation (`supabase/functions/license-validate/index.ts`):** Public endpoint (100/hr/IP) checking `license_key` and optional `domain` against `activated_domains` / `max_activations`.

---

## 8. Admin Product Manager (`src/components/admin/product-admin-manager.tsx`)

- Lists products and provides two actions per item:
  1. **Publish New Version:** Uploads a `.zip` file to `product-files/${slug}/${version}.zip`, sets old `product_versions.is_latest = false`, and inserts a new `product_versions` row.
  2. **SEO Metadata Modal:** Edits `seo_title`, `seo_description`, `primary_use_case`, and `image_alt` on `products`.
- Currently has **no** UI for creating new products, setting `delivery_type`, managing external install/app URLs, or editing compatibility/requirements metadata.

---

## 9. Sanity & Blog Links (`src/lib/sanity/` & `src/app/blog/`)

- `src/lib/sanity/queries.ts` defines GROQ queries for `post`, `faq`, and `testimonial` documents (`src/lib/sanity/client.ts`).
- When `NEXT_PUBLIC_SANITY_PROJECT_ID` is unset/placeholder, `src/app/blog/page.tsx` and `src/app/blog/[slug]/page.tsx` fall back to `src/lib/sanity/seed-posts.ts`.
- Blog posts are independent of `products` (no foreign key or automatic product-to-post linking in `products`).

