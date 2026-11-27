# 00 — Executive Audit Summary

## What This Project Really Is

`wefik.world` is a single-vendor digital product marketplace (WordPress themes, plugins, HTML templates, bundles, and code starters priced in INR) built on Next.js 16 (App Router), Supabase (Postgres, Auth, Storage, and 15 Deno Edge Functions), Razorpay, Upstash Redis, Resend, and Sanity CMS. Beneath a well-structured SEO/marketing shell and solid database RLS/migration foundations, the application suffers from severe integration drift caused by multiple overlapping development passes: critical customer and admin pages (`/order-success`, `/account`, `/account/orders`, `/admin`, `/admin/orders`, `/admin/reviews`, and product reviews) query column names that do not exist in the database schema, a legacy `/dashboard/*` implementation coexists alongside `/account/*`, and payment webhook signature verification silently bypasses checks if a secret is unset.

---

## Top 10 Problems Ranked by Impact

1. **CRITICAL — Payment Webhook Signature Bypass (`supabase/functions/razorpay-webhook/index.ts:19`)**: `if (!isValid && secret)` skips HMAC verification entirely when `RAZORPAY_WEBHOOK_SECRET` is unset, allowing forged payment/subscription webhooks.
2. **CRITICAL — Hardcoded Live Upstash Redis Credentials (`src/lib/redis.ts:6-7`)**: Production-looking Redis REST URL and token are committed as fallback defaults in source code and missed by `scripts/check-secrets.mjs`.
3. **CRITICAL — Post-Payment `/order-success` Broken by Schema Drift (`src/app/order-success/page.tsx:60,67`)**: Queries `orders.amount_inr` and `order_items.price_inr` instead of `total_amount` and `price`, causing Supabase errors that redirect paying customers to `/403`.
4. **HIGH — Account, Orders & Admin Revenue Pages Broken by Schema Drift**: `src/app/account/page.tsx`, `src/app/account/orders/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/admin/page.tsx`, and `src/app/admin/orders/page.tsx` query non-existent columns (`amount_inr`, `total_amount_inr`, `subtotal_inr`, `order_number`, `licenses.is_active`), breaking order history, revenue totals, and license revocation (`review-and-license-moderation.tsx:48`).
5. **HIGH — Reviews System Completely Broken End-to-End**: `ProductDetailView` inserts `{ title, comment }` and `admin/reviews/page.tsx` selects `title, comment`, whereas `001_schema.sql` defines `review_text`; `products/[slug]/page.tsx` never fetches `initialReviews`; and `review-reminder-email` filters by non-existent `orders.status = 'completed'`.
6. **HIGH — Unlimited License Price Mismatch (`2.5x` UI vs `2.0x` Backend)**: `ProductDetailView` (`line 80`) and `ProductCard` (`line 109`) display/cart `2.5x` price for Unlimited licenses, while `supabase/functions/create-order/index.ts` (`line 147`) charges `2.0x`.
7. **HIGH — Unauthenticated Edge Functions & Missing API Rate Limiting**: `supabase/functions/send-push` (stub) and `review-reminder-email` have no auth checks; Next.js `/api/contact`, `/api/newsletter`, and `/api/auth/check-pwned` have no rate limiting, and `/api/contact` (`lines 48–63`) interpolates unescaped user input into HTML email.
8. **MEDIUM — Silent File Upload Failure in Admin (`src/components/admin/product-admin-manager.tsx:73-75`)**: Logs a warning if uploading a product ZIP to `product-files` fails, then inserts the `product_versions` DB record anyway, leaving buyers with broken downloads.
9. **MEDIUM — Duplicate `/dashboard/*` vs `/account/*` & Stale Redirects**: Legacy `/dashboard/*` pages and components remain on disk despite `src/proxy.ts` redirecting most of them to `/account/*`, while `product-detail-view.tsx` and `membership-pricing-cards.tsx` still navigate to `/dashboard/*`.
10. **MEDIUM — Broken `npm test` Script & CI/Test Gaps**: `package.json` `test` references missing files (`tests/edge-functions.test.mjs`, `tests/sitemap-e2e.test.mjs`), `.github/workflows/ci.yml` never runs tests, and `node_modules` is absent locally so `lint`/`typecheck`/`build` could not be verified here.

---

## Solid vs. Shaky

| Area | Solid | Shaky |
|---|---|---|
| **Database Schema & RLS** | `001_schema.sql`–`004_auth_system.sql` have clean constraints, triggers, GIN/trigram indexes, and strict RLS policies | `src/types/database.ts` and UI queries have drifted from the actual SQL columns |
| **Download Security** | `download-url` Edge Function checks JWT, active license/membership, Redis rate limit, and issues 60s signed URLs | Rate-limit & idempotency helpers in `_shared/redis.ts` fail open when Redis is unconfigured |
| **Checkout & Payments** | `create-order` computes prices server-side from DB (never trusting client prices) and expands bundles | `2.5x` vs `2.0x` unlimited price mismatch; mock fallback IDs; webhook secret bypass bug |
| **SEO & Performance Shell** | Programmatic SEO routes, multi-sitemap XMLs, JSON-LD, `next/image` (`SafeImage`), dynamic imports in `layout.tsx` | `test-services` exposed publicly; `en_IE` locale; `Next.js 15` copy mismatch; unused deps in `package.json` |
| **Auth & Account Recovery** | PKCE `/auth/callback` open-redirect guard, HIBP k-anonymity check, disposable domain blocking, TOTP MFA reset | Duplicate `/dashboard` vs `/account`; `send-push` unauthenticated; `/api/contact` XSS & no rate limits |
| **Design & Styling** | Cohesive CSS variable tokens (`globals.css`) and `Space Grotesk` / `Inter` / `JetBrains Mono` setup | Mixed token systems, `bg-ink text-white` dark-mode contrast bug, 168 hex literals, low-contrast lime focus ring |

---

## Questions That Cannot Be Answered From Code Alone

1. **Production Environment Variables**: Are `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `REVALIDATION_SECRET` actually set in Vercel and Supabase Edge Function secrets, or are any endpoints running in mock/fail-open mode?
2. **Live Database State**: Have all 4 migrations (`001`–`004`) been applied to the production Supabase instance, and were any undocumented manual column renames (`amount_inr`, `total_amount_inr`, `title`/`comment` on `reviews`, `is_active` on `licenses`) ever run in Supabase Studio?
3. **Storage Bucket Contents**: Do the `product-files` (private) and `product-images` (public) buckets in Supabase Storage actually contain `.zip` files and images matching `product_versions.file_path`?
4. **Sanity CMS Usage**: Is Sanity Studio (`/studio`) actively used to publish `/blog` posts in production, or is the blog running solely off `src/lib/sanity/seed-posts.ts`?
5. **Lint, Typecheck & Build Status**: Because `node_modules` is not installed in this environment, what are the exact `eslint --max-warnings=0`, `tsc --noEmit`, and `next build` outputs?
6. **Deployment Target**: Are Supabase Edge Functions deployed manually via CLI, and is Vercel connected directly to GitHub `main` outside `.github/workflows/`?

