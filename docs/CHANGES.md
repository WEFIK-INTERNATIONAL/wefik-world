# Release Changelog (`release/wefik-cleanup-polish`)

This release consolidates critical security, schema, motion, fake-content, and UI/UX fixes across `fix/critical-integrity`, `fix/ux-integrity-motion`, and `design/header-hero`.

## Summary of Changes

### 1. Security
- **Razorpay webhook (`supabase/functions/razorpay-webhook/index.ts`, `supabase/functions/_shared/razorpay.ts`):** Fail closed (`401`) if `RAZORPAY_WEBHOOK_SECRET` is unset or signature verification fails; replaced `===` with constant-time HMAC comparison; required `event_id` and failed closed (`503`) on Redis idempotency unavailability.
- **Redis (`src/lib/redis.ts`, `supabase/functions/_shared/redis.ts`, `src/app/api/health/route.ts`):** Removed hardcoded Upstash URL/token fallbacks; `checkRateLimit` and `acquireIdempotency` now fail closed when Redis is unconfigured or unreachable. Updated `scripts/check-secrets.mjs` to catch `gQ` tokens and Upstash URLs.
- **API hardening (`src/app/api/contact/route.ts`, `src/app/api/newsletter/route.ts`, `src/app/api/auth/check-pwned/route.ts`, `src/lib/sanitize.ts`):** Added IP rate limiting (`checkRateLimit`), request body validation, and HTML escaping (`escapeHtml`) for contact email templates.
- **Edge Function auth (`supabase/functions/review-reminder-email/index.ts`, `supabase/functions/send-push/index.ts`):** Added `CRON_SECRET` / `SUPABASE_SERVICE_ROLE_KEY` bearer authentication.

### 2. Data & Schema Fixes
- Aligned TypeScript database types (`src/types/database.ts`) and all queries/UI components with live Supabase columns (`total_amount`, `subtotal`, `discount_amount`, `price`, `status`, `activated_domains`, `max_activations`, `review_text`, `used_count`) across `/order-success`, `/account/**`, `/dashboard/**`, `/admin/**`, `coupon-admin-manager.tsx`, `review-and-license-moderation.tsx`, and `license-list.tsx`.
- **Admin ZIP upload (`src/components/admin/product-admin-manager.tsx`):** Aborts and throws if storage upload fails instead of inserting a broken `product_versions` row.

### 3. Reviews
- **Product detail (`src/app/products/[slug]/page.tsx`, `src/components/marketplace/product-detail-view.tsx`):** Fetches approved `reviews` (`review_text`) server-side as `initialReviews` and submits using `review_text`.
- **Reminder cron (`supabase/functions/review-reminder-email/index.ts`):** Fixed order status filter from `completed` to `paid`.

### 4. Checkout & Pricing
- **Shared multiplier (`src/lib/pricing.ts`, `product-card.tsx`, `product-detail-view.tsx`, `supabase/functions/create-order/index.ts`):** Unified UI and server under `UNLIMITED_LICENSE_MULTIPLIER = 2.0` (awaiting owner decision between `2.0x` and `2.5x`).
- **Fail-closed order creation (`supabase/functions/create-order/index.ts`):** Removed `order_mock_*` fallback when Razorpay is unconfigured; now returns `503`.

### 5. Preloader, Hydration & Motion
- **Hydration & script warning (`src/app/layout.tsx`, `src/app/globals.css`, `src/components/preloader/unboxing-preloader.tsx`):** Replaced inline `<script dangerouslySetInnerHTML>` with `next/script` (`strategy="beforeInteractive"`), added pre-paint `data-preloader="skip"` flag, and removed `window`/`sessionStorage` branching from `UnboxingPreloader` initial render.
- **3D Preloader (`src/components/preloader/unboxing-preloader.tsx`):** Rebuilt with GSAP using `perspective: 900px`, `preserve-3d`, back-top-edge `rotationX` hinge, `backfaceVisibility: 'hidden'`, responsive ground shadow, `~1.55s` duration, `prefers-reduced-motion` fade, and click/keyboard skip.
- **Shared motion tokens (`src/lib/motion.ts`, `docs/audit/08-motion-audit.md`):** Centralized `MOTION_DURATION` and `MOTION_EASE` across GSAP components and cached pointer bounds in `MagneticButton`.

### 6. Fake or Demo Content Removal (`docs/audit/09-fake-and-demo.md`)
- Wired `admin/page.tsx` (`productCount ?? 0`), `product-detail-view.tsx` (`product.updated_at`), and `command-palette.tsx` (live Supabase `products` query).
- Gated `/test-services` with `notFound()` in production unless `NEXT_PUBLIC_ENABLE_TEST_SERVICES === 'true'`.
- Removed `existing`/`demo` email simulation in `src/lib/api-edge.ts` and `Math.random()` error IDs in `error.tsx` / `marketplace/error.tsx`.

### 7. Header & Hero Redesign + Design Consistency
- **Header (`src/components/layout/header.tsx`, `fullscreen-menu.tsx`, `logo.tsx`, `theme-toggle.tsx`):** Single logo lockup, 3-group layout, `aria-current="page"` with `2px` brand underline, removed unverified `"Save 60%"` nav badge, `min-w-[280px]` search with platform-neutral initial shortcut label, prominent Cart vs Wishlist, accessible mobile menu with focus trap.
- **Hero (`src/components/hero/hero-lightweight.tsx`, `src/app/page.tsx`):** Two-column layout with real featured product showcase (falling back to a 4-category grid with no placeholder images), verified license/support summary from `/license`, and fluid typography.
- **Design consistency:** Fixed `bg-ink text-white` dark-mode contrast bug across 27 files, updated focus rings to WCAG AA `var(--brand)`, updated `en_IE` → `en_IN` and `Next.js 15` → `Next.js 16`, and added `loading.tsx`/`error.tsx` for `/products/[slug]`, `/account`, and `/dashboard`.

### 8. Tooling & CI
- Fixed `npm test` in `package.json` to run all 5 local test suites reliably and added `Unit Tests` to `.github/workflows/ci.yml`.

---

## Needs Owner Action
1. **Secrets to rotate:** Rotate Upstash Redis REST credentials (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) since the old fallback credentials existed in git history prior to this PR.
2. **Environment variables to confirm in Vercel & Supabase:**
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (required in both Next.js/Vercel and Supabase Edge Functions — rate limiting and webhook idempotency now fail closed if unset).
   - `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (webhook and `create-order` now fail closed if unset).
   - `CRON_SECRET` (for `review-reminder-email` and `send-push` Edge Functions).
3. **Pending migrations:** None added or applied in this PR (`supabase/migrations` is unchanged).
4. **Business rule decision — Unlimited license multiplier:** UI previously used `2.5x` while `create-order` used `2.0x`. Both now use `2.0x` (`src/lib/pricing.ts`). Confirm whether to keep `2.0x` or change both to `2.5x`.
5. **Class C decisions (`docs/audit/09-fake-and-demo.md`):**
   - `/blog` and sitemaps still read `SEED_POSTS` (`src/lib/sanity/seed-posts.ts`) while `NEXT_PUBLIC_SANITY_PROJECT_ID` defaults to `'placeholder-sanity-id'`. Decide whether to populate Sanity or hide `/blog`.
   - `FALLBACK_PRODUCTS` (`src/lib/data/fallback-products.ts`) is still used when `NEXT_PUBLIC_SUPABASE_URL` is a placeholder (e.g., CI builds).
6. **Claims needing owner confirmation:**
   - Bundles `"Save 60%"` / `"Save 40% to 60%"` marketing claim on `/bundles` could not be verified against live bundle pricing.
   - Confirm live Supabase `categories` table slugs match `wordpress-themes`, `wordpress-plugins`, `html-templates`, and `nextjs-templates`.


### 9. Markdown Hydration Fix
- **Product docs renderer (`src/components/marketplace/product-markdown-docs.tsx`):** Moved `CodeBlock` rendering from `code` to `pre` override (since `react-markdown@10` has no `inline` prop), keeping inline `code` as a bare `<code>` element and eliminating `<div>`/`<pre>` inside `<p>` hydration errors.

### 10. Demo Content Removal & Real Product Preparation
- **Audit & checklists (`docs/audit/15-demo-inventory.md`, `16-owner-questions.md`, `17-real-products.md`, `18-apply-checklist.md`):** Inventoried all demo references, documented verified public sources for **Site Checkup** and **KuraCode Extension** (noting **weclip** is blocked pending owner source), and listed blocking owner questions.
- **Unapplied migrations (`supabase/migrations/005_remove_demo_products.sql`, `006_seed_real_products.sql`):** Added idempotent demo archive/cleanup migration and draft (`status = 'draft'`) real-product seed for owner review.
- **Code cleanup (`fallback-products.ts`, `page.tsx`, `bundles/page.tsx`, `cart-drawer.tsx`, `live-demo-viewer.tsx`, `programmatic-data.ts`, `product-admin-manager.tsx`, `before-after-slider.tsx`):** Emptied `FALLBACK_PRODUCTS`, added empty states, and removed Unsplash/demo product fallbacks.

### 11. Marketplace Page Redesign
- **Header & page sync (`src/components/layout/header.tsx`, `src/components/search/command-palette.tsx`, `src/components/marketplace/marketplace-client-view.tsx`):**
  - Tightened top spacing to `calc(var(--header-height) + 1.5rem)`, simplified H1 to `"Marketplace"`, and added factual product count + `"Licence details"` link to `/license`.
  - Bound page search (`#marketplace-search`) and header search to URL `?q=` as single source of truth; collapsed header search on `/marketplace` to an icon focusing the page input.
  - Built categories and platforms strictly from real product data, gated advanced filters behind `ADVANCED_FILTER_THRESHOLD = 8`, added `"Filters"` mobile drawer with focus trap and Escape handling, removable active filter chips, and clean empty results state.
