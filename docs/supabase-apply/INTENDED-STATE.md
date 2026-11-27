# Intended Database & Auth State (`wefik.world`)

Derived from `supabase/migrations/001..006`, `supabase/functions/*`, `src/types/database.ts`, `src/proxy.ts`, `src/lib/supabase/middleware.ts`, `src/lib/auth.ts`, and `src/app/auth/callback/route.ts`.

## 1. Extensions
- `uuid-ossp`, `pg_trgm`, `unaccent` (schema `public` or `extensions`).
- Optional for scheduled jobs: `pg_cron`, `pg_net`.

## 2. Tables & Required Columns (`public`)
| Table | Required Columns | Notes / Constraints |
|---|---|---|
| `profiles` | `id` (uuid PK -> `auth.users`), `email` (text), `full_name`, `display_name`, `avatar_url`, `recovery_email`, `recovery_email_verified_at` (timestamptz), `role` (`'customer' \| 'admin'`), `created_at`, `updated_at` | `role` must NOT be client-writable. |
| `categories` | `id` (uuid PK), `name`, `slug` (unique), `description`, `created_at` | Slugs: `wordpress-themes`, `wordpress-plugins`, `html-templates`, `nextjs-templates`, `browser-extensions`. |
| `products` | `id` (uuid PK), `title`, `slug` (unique), `tagline`, `description`, `category_id` (FK), `price_inr` (int >= 0, `% 100 = 0`), `is_free`, `is_featured`, `is_bundle`, `bundle_product_ids` (`uuid[]`), `thumbnail_url`, `gallery_urls` (`text[]`), `demo_url`, `tech_stack` (`text[]`), `rating_avg` (numeric(3,2)), `rating_count` (int), `download_count` (int), `status` (`'draft' \| 'published' \| 'archived'`), `created_at`, `updated_at` | Optional drift columns in `src/types/database.ts`: `price_usd`, `sale_price_inr`, `sale_price_usd`, `file_path`, `version`, `changelog`, `seo_title`, `seo_description`, `primary_use_case`, `image_alt`. |
| `product_versions` | `id` (uuid PK), `product_id` (FK), `version`, `changelog`, `file_path`, `is_latest` (bool), `created_at` | Private `file_path` inside `product-files` bucket. |
| `membership_plans` | `id`, `plan` (unique `'monthly' \| 'lifetime'`), `name`, `price_inr`, `interval` (`'month' \| 'one-time'`), `description`, `features` (`text[]`), `is_active`, `created_at` | |
| `memberships` | `id`, `user_id` (FK `profiles`), `plan` (FK `membership_plans.plan`), `status` (`'active' \| 'cancelled' \| 'expired'`), `razorpay_subscription_id`, `current_period_start`, `current_period_end`, `created_at`, `updated_at` | |
| `orders` | `id`, `user_id` (FK `profiles`), `razorpay_order_id` (unique), `razorpay_payment_id`, `status` (`'pending' \| 'paid' \| 'failed' \| 'refunded'`), `subtotal`, `discount_amount`, `total_amount`, `currency` (`'INR'`), `coupon_code`, `created_at` | Amounts in paise. |
| `order_items` | `id`, `order_id` (FK `orders`), `product_id` (FK `products`), `item_type` (`'product' \| 'membership_monthly' \| 'membership_lifetime'`), `price`, `license_type` (`'single' \| 'unlimited'`), `created_at` | |
| `licenses` | `id`, `license_key` (unique `WFK-...`), `user_id` (FK `profiles`), `product_id` (FK `products`), `order_id` (FK `orders`), `license_type` (`'single' \| 'unlimited'`), `status` (`'active' \| 'revoked'`), `activated_domains` (`text[]`), `max_activations` (int), `created_at` | |
| `reviews` | `id`, `user_id` (FK `profiles`), `product_id` (FK `products`), `rating` (1..5), `review_text`, `is_approved`, `created_at` | Unique `(user_id, product_id)`. |
| `wishlists` | `id`, `user_id` (FK `profiles`), `product_id` (FK `products`), `created_at` | Unique `(user_id, product_id)`. |
| `downloads` | `id`, `user_id` (FK `profiles`), `product_id` (FK `products`), `version_id` (FK `product_versions`), `ip_address`, `user_agent`, `downloaded_at` | |
| `coupons` | `id`, `code` (unique), `discount_percent` (1..100), `discount_fixed_inr`, `valid_from`, `valid_until`, `max_uses`, `used_count`, `is_active`, `created_at` | |
| `newsletter_subscribers` | `id`, `email` (unique), `subscribed_at` | |
| `push_subscriptions` | `id`, `user_id` (FK `profiles`), `token` (unique), `user_agent`, `created_at` | |
| `blocked_email_domains` | `domain` (PK), `source`, `added_at` | Disposable email blocklist. |

## 3. Views, Functions & Triggers
- **View:** `public.products_public` (`status = 'published'` joined with `categories` and latest `product_versions.version`, hiding `file_path`).
- **Functions (`SECURITY DEFINER`, fixed `search_path`):**
  - `public.is_admin()` (`SET search_path = public`)
  - `public.increment_coupon_use(coupon_id uuid)` (`SET search_path = public`)
  - `public.increment_product_downloads(p_id uuid)` (`SET search_path = public`)
  - `public.handle_new_user()` (`SET search_path = public`, exception-safe)
  - `public.handle_new_product_version()` (`SET search_path = public`)
  - `public.handle_review_rating()` (`SET search_path = public`)
  - `public.check_email_registered(p_email text)` (`SET search_path = public, auth`; `REVOKE ALL` from `public, anon, authenticated`; `GRANT EXECUTE` to `service_role`)
- **Triggers:**
  - `on_auth_user_created` (`AFTER INSERT ON auth.users`) -> `public.handle_new_user()`
  - `on_product_version_inserted` (`BEFORE INSERT ON public.product_versions`) -> `public.handle_new_product_version()`
  - `on_review_change` (`AFTER INSERT OR UPDATE OR DELETE ON public.reviews`) -> `public.handle_review_rating()`

## 4. RLS & Storage
- **RLS:** Enabled on all 16 `public` tables. Users only access their own `profiles` (cannot self-promote `role`), `orders`, `order_items`, `licenses`, `memberships`, `wishlists`, `downloads`, `push_subscriptions`. `reviews` are publicly readable when `is_approved = true` (or own/admin), and writable only by verified purchasers (active license or paid order). `products` are readable when `status = 'published'` (or admin).
- **Storage Buckets:**
  - `product-images` (`public = true`) — public read, admin write.
  - `avatars` (`public = true`, 2MB limit, `jpeg/png/webp`) — public read, user folder `<uid>/*` write.
  - `product-files` (`public = false`) — NO public read (signed URLs via `download-url` Edge Function only), admin write.

## 5. Required Indexes
`idx_products_slug`, `idx_products_status`, `idx_products_category_id`, `idx_products_title_trgm`, `idx_products_tagline_trgm`, `idx_products_search_vector`, `idx_product_versions_product_id`, `idx_orders_user_id`, `idx_orders_razorpay_order_id`, `idx_order_items_order_id`, `idx_licenses_user_id`, `idx_licenses_license_key`, `idx_licenses_product_id`, `idx_memberships_user_id`, `idx_reviews_product_id`, `idx_downloads_user_id`, `idx_coupons_code`.
