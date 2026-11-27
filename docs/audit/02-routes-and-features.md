# 02 — Routes, APIs, Edge Functions, and Database Models

Verification method used across this document: static cross-reference of `src/app/` routes, `src/proxy.ts`, `next.config.ts`, `src/components/layout/header.tsx`, `src/components/layout/footer.tsx`, `src/lib/api-edge.ts`, `supabase/functions/`, and `supabase/migrations/001_schema.sql`–`004_auth_system.sql`.

---

## 1. Next.js App Router Pages

| Route | File | Status | Verification |
|---|---|---|---|
| `/` | `src/app/page.tsx` | **USED** | Root landing page; linked in `header.tsx` & `footer.tsx` |
| `/marketplace` | `src/app/marketplace/page.tsx` | **USED** | Linked from `header.tsx`, `page.tsx`, `footer.tsx` |
| `/products/[slug]` | `src/app/products/[slug]/page.tsx` | **USED** | Linked from `product-card.tsx` |
| `/bundles` | `src/app/bundles/page.tsx` | **USED** | Linked from `header.tsx` & `proxy.ts` redirect target |
| `/freebies` | `src/app/freebies/page.tsx` | **USED** | Linked from `header.tsx` & `proxy.ts` redirect target |
| `/pricing` | `src/app/pricing/page.tsx` | **USED** | Linked from `header.tsx`, `account/page.tsx` |
| `/checkout` | `src/app/checkout/page.tsx` | **USED** | Linked from `cart-drawer.tsx` |
| `/order-success` | `src/app/order-success/page.tsx` | **USED** | Redirect target from `checkout/page.tsx` (currently broken by schema mismatch) |
| `/login` | `src/app/(auth)/login/page.tsx` | **USED** | Redirect target from `proxy.ts`, `header.tsx`, `auth.ts` |
| `/signup` | `src/app/(auth)/signup/page.tsx` | **UNUSED** | Permanently redirected to `/login` in `next.config.ts` and `src/proxy.ts` |
| `/forgot-password` | `src/app/forgot-password/page.tsx` | **USED** | Linked from login/auth recovery flows |
| `/reset-password` | `src/app/reset-password/page.tsx` | **USED** | Target of `auth-recovery-reset` email link |
| `/account` | `src/app/account/page.tsx` | **USED** | Default post-login `/auth/callback` target & `header.tsx` |
| `/account/library` | `src/app/account/library/page.tsx` | **USED** | Linked in `account/layout.tsx` |
| `/account/orders` | `src/app/account/orders/page.tsx` | **USED** | Linked in `account/layout.tsx` |
| `/account/orders/[id]` | `src/app/account/orders/[id]/page.tsx` | **USED** | Linked from `account/orders/page.tsx` |
| `/account/membership` | `src/app/account/membership/page.tsx` | **USED** | Linked in `account/layout.tsx` |
| `/account/settings` | `src/app/account/settings/page.tsx` | **USED** | Linked in `account/layout.tsx` |
| `/dashboard` | `src/app/dashboard/page.tsx` | **UNUSED** | Intercepted and 301-redirected to `/account` by `src/proxy.ts` |
| `/dashboard/downloads` | `src/app/dashboard/downloads/page.tsx` | **UNUSED** | 301-redirected to `/account/library` by `src/proxy.ts` |
| `/dashboard/licenses` | `src/app/dashboard/licenses/page.tsx` | **UNUSED** | 301-redirected to `/account/library` by `src/proxy.ts` (though `product-detail-view.tsx` still pushes here) |
| `/dashboard/purchases` | `src/app/dashboard/purchases/page.tsx` | **UNUSED** | 301-redirected to `/account/orders` by `src/proxy.ts` |
| `/dashboard/membership` | `src/app/dashboard/membership/page.tsx` | **UNUSED** | 301-redirected to `/account/membership` by `src/proxy.ts` |
| `/dashboard/settings` | `src/app/dashboard/settings/page.tsx` | **UNUSED** | 301-redirected to `/account/settings` by `src/proxy.ts` |
| `/dashboard/wishlist` | `src/app/dashboard/wishlist/page.tsx` | **UNCLEAR** | Not in `src/proxy.ts` `PERMANENT_REDIRECTS`; reachable directly if authenticated, overlaps with `/account` |
| `/admin` | `src/app/admin/page.tsx` | **USED** | Linked from `header.tsx` for admin users |
| `/admin/products` | `src/app/admin/products/page.tsx` | **USED** | Linked in `admin/layout.tsx` & `admin/page.tsx` |
| `/admin/orders` | `src/app/admin/orders/page.tsx` | **USED** | Linked in `admin/layout.tsx` |
| `/admin/coupons` | `src/app/admin/coupons/page.tsx` | **USED** | Linked in `admin/layout.tsx` |
| `/admin/reviews` | `src/app/admin/reviews/page.tsx` | **USED** | Linked in `admin/layout.tsx` |
| `/blog`, `/blog/[slug]` | `src/app/blog/page.tsx`, `[slug]/page.tsx` | **USED** | Linked from footer & sitemaps |
| `/glossary`, `/glossary/[slug]` | `src/app/glossary/page.tsx`, `[slug]/page.tsx` | **USED** | Linked in programmatic SEO & sitemaps |
| `/wordpress-themes`, `/[useCase]` | `src/app/wordpress-themes/...` | **USED** | Programmatic SEO & category landing pages |
| `/wordpress-plugins`, `/[useCase]` | `src/app/wordpress-plugins/...` | **USED** | Programmatic SEO & category landing pages |
| `/html-templates`, `/[useCase]` | `src/app/html-templates/...` | **USED** | Programmatic SEO & category landing pages |
| `/code-snippets` | `src/app/code-snippets/page.tsx` | **USED** | Category landing page |
| `/free/[category]`, `/collections/[slug]`, `/compare/[slug]`, `/alternatives/[slug]`, `/themeforest-alternative` | `src/app/...` | **USED** | Programmatic SEO pages listed in `sitemap-programmatic.xml` & `robots.ts` |
| `/about`, `/contact`, `/faqs`, `/delivery`, `/license`, `/terms`, `/privacy`, `/refunds`, `/cookies`, `/membership-terms`, `/status` | `src/app/...` | **USED** | Static info/legal/status pages |
| `/licensing` | `src/app/licensing/page.tsx` | **UNUSED** | 301-redirected to `/license` in `next.config.ts` |
| `/studio/[[...index]]` | `src/app/studio/[[...index]]/page.tsx` | **USED** | Sanity Studio mount (`sanity.config.ts`) |
| `/403` | `src/app/403/page.tsx` | **USED** | Rewrite/redirect target from `middleware.ts`, `auth.ts`, `order-success` |
| `/test-services` | `src/app/test-services/page.tsx` | **UNUSED** | Internal debug/verification page left publicly accessible |

---

## 2. Next.js API Routes & Route Handlers

*(No Next.js `"use server"` Server Actions were found in `src/`.)*

| Endpoint | File | Status | Verification |
|---|---|---|---|
| `POST /api/auth/check-pwned` | `src/app/api/auth/check-pwned/route.ts` | **USED** | Called by password strength / auth UI via `hibp.ts` |
| `POST /api/contact` | `src/app/api/contact/route.ts` | **USED** | Called by `src/components/contact/contact-form.tsx` |
| `GET /api/health` | `src/app/api/health/route.ts` | **USED** | Called by `test-services/page.tsx` and health checks |
| `POST /api/newsletter` | `src/app/api/newsletter/route.ts` | **USED** | Called by `src/components/layout/footer.tsx` |
| `POST /api/revalidate` | `src/app/api/revalidate/route.ts` | **UNCLEAR** | Protected by `REVALIDATION_SECRET`; intended for Sanity/admin webhooks (no in-repo caller) |
| `GET /auth/callback` | `src/app/auth/callback/route.ts` | **USED** | OAuth PKCE code exchange handler |
| `GET /sitemap.xml` (+ 4 sub-sitemaps), `/robots.txt` | `src/app/sitemap*.xml/route.ts`, `robots.ts` | **USED** | SEO metadata routes |

---

## 3. Supabase Edge Functions (`supabase/functions/`)

| Function | Status | Verification |
|---|---|---|
| `create-order` | **USED** | Called by `src/app/checkout/page.tsx` & `membership-pricing-cards.tsx` |
| `create-subscription` | **USED** | Called by `src/components/pricing/membership-pricing-cards.tsx` |
| `razorpay-webhook` | **USED** | External Razorpay webhook endpoint for payment & subscription fulfillment |
| `download-url` | **USED** | Called by `library-view.tsx`, `download-list.tsx`, `order-success-view.tsx` |
| `claim-free` | **USED** | Called by `product-detail-view.tsx` & `freebie-claim-card.tsx` |
| `license-validate` | **UNCLEAR** | External WordPress plugin license check endpoint; no in-repo caller |
| `auth-check-email` | **USED** | Called by `src/lib/api-edge.ts` (`checkEmailRegistered`) |
| `auth-validate-email` | **USED** | Called by `src/lib/api-edge.ts` (`validateEmailDomain`) |
| `auth-recovery-reset` | **USED** | Called by `src/lib/api-edge.ts` (`requestRecoveryReset`) |
| `auth-mfa-reset-request` | **USED** | Called by `src/lib/api-edge.ts` (`requestMfaReset`) |
| `auth-mfa-reset-confirm` | **USED** | Called by `src/lib/api-edge.ts` (`confirmMfaReset`) |
| `auth-recovery-email-otp` | **USED** | Called by `src/lib/api-edge.ts` (`requestRecoveryEmailOtp`, `verifyRecoveryEmailOtp`) |
| `auth-delete-account` | **USED** | Called by `src/lib/api-edge.ts` (account settings deletion) |
| `review-reminder-email` | **UNUSED / BROKEN** | Intended for cron; queries `orders.status = 'completed'` which does not exist in schema |
| `send-push` | **UNUSED / STUB** | No caller in `src/`; returns mock `dispatched_count` without sending FCM push |

---

## 4. Database Tables & Views (`supabase/migrations/`)

| Table / View | Migration | Status | Notes |
|---|---|---|---|
| `profiles` | `001_schema.sql`, `004_auth_system.sql` | **USED** | Extended in `004` with `display_name`, `recovery_email`, `recovery_email_verified_at` |
| `categories` | `001_schema.sql` | **USED** | Joined in `products.ts` |
| `products` | `001_schema.sql`, `003_fixpack02_integrity.sql` | **USED** | Core catalog table |
| `product_versions` | `001_schema.sql` | **USED** | Stores versioned ZIP paths in `product-files` bucket |
| `membership_plans` | `001_schema.sql` | **USED** | Read by `create-order` & `/pricing` |
| `memberships` | `001_schema.sql` | **USED** | Read by `download-url`, `/account`, `/dashboard` |
| `orders` | `001_schema.sql` | **USED** | Written by `create-order` & `razorpay-webhook`; **UI queries wrong column names** (`amount_inr`, `total_amount_inr`, `order_number` instead of `total_amount`) |
| `order_items` | `001_schema.sql` | **USED** | Written by `create-order`; **UI queries wrong column name** (`price_inr` instead of `price`) |
| `licenses` | `001_schema.sql` | **USED** | Written by `razorpay-webhook` & `claim-free`; **UI queries/updates non-existent `is_active` column** |
| `reviews` | `001_schema.sql` | **USED (BROKEN)** | Schema has `review_text`; UI & admin query/insert `title` & `comment` |
| `wishlists` | `001_schema.sql` | **USED** | Used by `src/lib/wishlist-context.tsx` |
| `downloads` | `001_schema.sql` | **USED** | Written by `download-url` Edge Function |
| `coupons` | `001_schema.sql` | **USED** | Used by `checkout/page.tsx`, `create-order`, `admin/coupons` |
| `newsletter_subscribers` | `001_schema.sql` | **USED** | Written by `/api/newsletter` |
| `push_subscriptions` | `001_schema.sql` | **UNCLEAR** | Queried by stub `send-push`; no active UI subscription writer verified |
| `blocked_email_domains` | `004_auth_system.sql` | **USED** | Used by `auth-validate-email` |
| `products_public` (view) | `001_schema.sql` | **UNCLEAR** | Defined in schema, but `src/lib/data/products.ts` queries `products` directly |

