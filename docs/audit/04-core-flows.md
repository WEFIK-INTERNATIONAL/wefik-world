# 04 — Marketplace Core Flows (End-to-End Trace)

Every core marketplace flow was traced from UI component → client/server data layer → Edge Function / API → Postgres schema (`001_schema.sql`).

| Flow | Status | Summary |
|---|---|---|
| 1. Browsing & Search | **REAL** | Works via `getProducts()` + client-side filtering & `Cmd+K` palette; falls back silently to `FALLBACK_PRODUCTS` if DB unavailable |
| 2. Product Detail Page | **PARTIALLY BROKEN** | Renders product, gallery, pricing; **Unlimited license price (2.5x) mismatches backend (2.0x)** and **initial reviews are never fetched** |
| 3. Categories | **REAL** | Category filtering via URL `?category=` + dedicated programmatic category landing pages |
| 4. Cart & Checkout | **REAL (WITH BUGS)** | Client `localStorage` cart + coupon lookup + `create-order` Edge Function; **redirects to broken `/order-success`** |
| 5. Payment & Webhooks | **REAL (RISKY)** | Razorpay Orders/Subscriptions + `razorpay-webhook`; **mock fallback when keys missing, and webhook bypasses signature check if secret unset** |
| 6. License & Download Delivery | **REAL (WITH SCHEMA BUGS)** | `download-url` Edge Function generates 60s signed URLs from `product-files`; **account overview & admin revoke query non-existent `is_active` column** |
| 7. User Accounts | **PARTIALLY BROKEN** | Auth/OAuth/MFA work; **`/account` overview and `/account/orders` query non-existent `orders` & `licenses` columns** |
| 8. Seller / Admin Management | **PARTIALLY BROKEN** | Auth-gated by `isAdmin()`; **`/admin` & `/admin/orders` query non-existent `orders.amount_inr`**, version upload swallows storage errors |
| 9. Reviews | **BROKEN** | Insert fails due to schema mismatch (`title`/`comment` vs `review_text`); moderation & reminder cron also broken |

---

## Detailed Flow Traces

1. **Browsing & Search**: `src/app/marketplace/page.tsx` calls `getProducts()` (`src/lib/data/products.ts`, `unstable_cache` 1h TTL, 2.5s timeout fallback to `FALLBACK_PRODUCTS`). `MarketplaceClientView` filters/sorts client-side via URL search params (`q`, `category`, `type`, `tech`, `price`, `rating`, `sort`, `page`) with basic word-level fuzzy fallback.
2. **Product Detail Page**: `src/app/products/[slug]/page.tsx` fetches `getProductBySlug(slug)` and renders `ProductDetailView`.
   - **Bug**: `ProductDetailView` (`line 80`) and `ProductCard` (`line 109`) compute Unlimited license as `Math.round((price_inr * 2.5) / 100) * 100` (2.5×), whereas `supabase/functions/create-order/index.ts` (`line 147`) computes `Math.round(prod.price_inr * 2)` (2.0×).
   - **Bug**: `products/[slug]/page.tsx` never queries `reviews` or passes `initialReviews` to `ProductDetailView`.
   - **Copy mismatch**: `src/app/page.tsx` (`line 120`) advertises *"Start free. No account needed."*, but `ProductDetailView.handleClaimFree` (`line 109`) and `supabase/functions/claim-free/index.ts` (`line 16`) require sign-in.
3. **Categories**: Categories are stored in `public.categories` and linked via `products.category_id`. Dedicated category/use-case routes (`/wordpress-themes`, `/wordpress-plugins`, `/html-templates`, `/code-snippets`) render curated views.
4. **Cart & Checkout**: `CartProvider` (`src/lib/cart-context.tsx`) persists items in `localStorage` (`wefik_cart_v1`). `src/app/checkout/page.tsx` validates coupons directly against `coupons` table, calls `POST /functions/v1/create-order`, opens Razorpay Checkout modal, and on handler success redirects to `/order-success?order_id=...`.
   - **Bug**: `src/app/order-success/page.tsx` (`lines 60, 67`) queries `orders.amount_inr` and `order_items.price_inr` (actual columns: `total_amount` and `price`), causing the query to error and redirect the paying customer to `/403`.
5. **Payment & Webhooks**: `create-order` and `create-subscription` create Razorpay entities (or `order_mock_*` / `sub_mock_*` if Razorpay env vars are missing). `razorpay-webhook` handles `payment.captured`, `payment.failed`, `refund.processed`/`created`, `subscription.charged`, and `subscription.cancelled`/`completed`, issuing `WFK-XXXX-XXXX-XXXX` keys and sending Resend receipts.
   - **Critical Risk**: `razorpay-webhook/index.ts` (`line 19`) checks `if (!isValid && secret)` — if `RAZORPAY_WEBHOOK_SECRET` is empty/unset, signature verification is skipped.
6. **License & Download Delivery**: `LibraryView` (`src/components/account/library-view.tsx`) and `OrderSuccessView` call `POST /functions/v1/download-url` with `product_id` and JWT. `download-url` checks `licenses` (`status = 'active'`) or active `memberships` (`lifetime` or unexpired `monthly`), enforces 20/hr Upstash rate limit, generates a 60s signed URL from private bucket `product-files`, and logs to `downloads`.
7. **User Accounts**: `/auth/callback` exchanges PKCE code and redirects to `/account`.
   - **Broken queries**: `src/app/account/page.tsx` (`lines 46, 55`) queries `licenses.is_active` (actual: `status`), `orders.order_number` (doesn't exist), and `orders.total_amount_inr` (actual: `total_amount`). `src/app/account/orders/page.tsx` (`lines 39–46`) queries `order_number`, `total_amount_inr`, `subtotal_inr`, `order_items.price_inr`.
8. **Seller / Admin Management**: Protected by `src/proxy.ts` + `requireAdmin()`.
   - **Broken queries**: `src/app/admin/page.tsx` (`line 33`) and `src/app/admin/orders/page.tsx` (`line 29`) query `orders.amount_inr` instead of `total_amount`.
   - **Broken upload**: `src/components/admin/product-admin-manager.tsx` (`lines 73–75`) logs a warning if `supabase.storage.from('product-files').upload(...)` fails and still inserts the `product_versions` DB row.
   - **Broken revocation**: `src/components/admin/review-and-license-moderation.tsx` (`line 48`) updates `{ status: 'revoked', is_active: false }` on `licenses`, failing because `is_active` does not exist.
9. **Reviews**:
   - **Broken submit**: `ProductDetailView` (`lines 163–169`) inserts `{ title, comment }` into `reviews`, but `001_schema.sql` (`line 144`) only has `review_text`.
   - **Broken admin**: `src/app/admin/reviews/page.tsx` (`lines 30–31`) selects `title, comment`.
   - **Broken cron**: `supabase/functions/review-reminder-email/index.ts` (`line 44`) filters `orders` by `status = 'completed'`, which is not a valid `orders.status` (`'pending' | 'paid' | 'failed' | 'refunded'`).

