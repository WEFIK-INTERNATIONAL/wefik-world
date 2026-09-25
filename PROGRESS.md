# wefik.world build progress
- [x] 0.1 PROGRESS.md created from this checklist
- [x] 0.2 BUILD_LOG.md created
- [x] 1.1 Next.js scaffolded (TS, Tailwind, ESLint, App Router, src/, @/*)
- [x] 1.2 tsconfig strict (no noUncheckedIndexedAccess)
- [x] 1.3 Tailwind design tokens applied
- [x] 1.4 shadcn initialized + all components (sonner, not toast)
- [x] 1.5 Supabase clients (server/client/middleware) + src/middleware.ts
- [x] 1.6 Sanity client + config wired
- [x] 1.7 Sentry + PostHog initialized, test events verified
- [x] 1.8 .env.example complete (Section 5)
- [x] 1.9 `npm run build` passes
- [x] 2.1 001_schema.sql written (all tables, RLS, indexes, triggers, buckets)
- [x] 2.2 is_admin() is SECURITY DEFINER
- [x] 2.3 002_seed.sql written (categories, products, coupon, plans)
- [x] 2.4 SQL reviewed for syntax/RLS correctness
- [x] 3.1 _shared helpers (supabase/razorpay/resend/redis/keygen)
- [x] 3.2 create-order (union input, price math, coupon, dup-check)
- [x] 3.3 create-subscription (Razorpay subscriptions)
- [x] 3.4 claim-free
- [x] 3.5 razorpay-webhook (fulfill idempotent, failed/refund, subscription events, email)
- [x] 3.6 download-url (authz, signed URL, audit, rate limit)
- [x] 3.7 license-validate (rate limit, activations)
- [x] 3.8 Functions pass `deno check`; webhook unit-tested
- [x] 4.1 login/signup/callback pages
- [x] 4.2 lib/auth.ts helpers
- [x] 4.3 middleware gates verified (redirect + 403)
- [x] 5.1 layout.tsx (metadata, Organization JSON-LD)
- [x] 5.2 header (nav, search, auth, cart icon)
- [x] 5.3 cart-drawer.tsx
- [x] 5.4 footer (newsletter → table)
- [x] 5.5 home page (all sections, no fake testimonials)
- [x] 5.6 product-card.tsx
- [x] 6.1 /marketplace (search, filters, sort, pagination, URL state)
- [x] 6.2 /products/[slug] (ISR, metadata, gallery, licenses, reviews, JSON-LD)
- [x] 6.3 /bundles, /freebies (claim-free wired)
- [x] 7.1 /checkout (coupon, paise math, Razorpay modal)
- [x] 7.2 /order-success (ownership check)
- [x] 7.3 /pricing (plans from DB, monthly→subscription, lifetime→order)
- [x] 7.4 test-mode purchase E2E verified
- [x] 8.1 dashboard (overview, purchases, downloads, licenses, membership, wishlist, settings)
- [x] 8.2 admin (stats, products+versions, orders, coupons, reviews, revoke)
- [x] 8.3 authz matrix verified (403s, expired vs lifetime)
- [x] 9.1 Sanity schemas + 3 real seed posts
- [x] 9.2 /blog + /blog/[slug] via GROQ
- [x] 9.3 /studio embedded
- [x] 9.4 Sanity webhook → revalidate verified
- [x] 9.5 sitemap.ts, robots.ts, JSON-LD, opengraph-image.tsx
- [x] 9.6 FCM: push_subscriptions, opt-in, service worker, send-push
- [x] 9.7 docs/DNS_SETUP.md, docs/TESTING.md
- [x] 9.8 Final: `npm run build` clean, acceptance checklist (Section 8) all pass

## Fix Pack 03 — Dark Mode Repair, UX Quality & Motion Master Checklist

### Located Repository Paths
- Global CSS & Theme Tokens: `src/app/globals.css`
- Nav Component: `src/components/layout/header.tsx`
- Mobile Fullscreen Menu: `src/components/layout/fullscreen-menu.tsx`
- Button Component: `src/components/ui/button.tsx`
- Hero Component: `src/components/hero/hero-lightweight.tsx`
- Product Card: `src/components/marketplace/product-card.tsx`
- Pricing Cards: `src/components/pricing/membership-pricing-cards.tsx`
- Footer: `src/components/layout/footer.tsx`
- Product Docs Renderer: `src/components/marketplace/product-detail-view.tsx` & `src/components/marketplace/product-markdown-docs.tsx`

### Part A: P0 Critical Defects
- [x] A1. Dark-mode color inversion: tokens repaired in globals.css, button component contrast guaranteed, all 10 broken inventory items readable in dark mode [VERIFIED 2026-09-25]
- [x] A2. /marketplace hard error: retry button invalidates/reloads properly, schema-validated defensive parsing, zero console errors [VERIFIED 2026-09-25]
- [x] A3. Nav bar rebuild: position: sticky with top: 0, scroll shadow, responsive collapse (desktop links ≥1024px, hamburger ONLY <1024px), Save 60% and by Wefik badges on single line [VERIFIED 2026-09-25]
- [x] A4. Mobile full-screen menu: native app feel (100dvh, safe area insets), dark mode inversion fixed, body scroll-lock, GSAP staggered entrance, Esc & focus trap [VERIFIED 2026-09-25]
- [x] A5. Button system: contrast table (variant × theme) all ≥ 4.5:1, lime accent buttons with near-black text (#0a0f0a) only, focus-visible rings present [VERIFIED 2026-09-25]

### Part B: P1 Typography & Hero
- [x] B1. Product card titles clamp to 2 lines with word-aware breaking, no mid-word cuts [VERIFIED 2026-09-25]
- [x] B2. Product documentation renders styled HTML via markdown parser with syntax-styled code blocks and copy button [VERIFIED 2026-09-25]
- [x] B3. Breadcrumbs truncate gracefully at container edge with title attribute [VERIFIED 2026-09-25]
- [x] B4. Hero repair: card strip fits within viewport 360–2560px without horizontal clipping, no text collisions, zero unverified reviews [VERIFIED 2026-09-25]

### Part C: Responsive Quality Consistency
- [x] C1. Breakpoint QA matrix: 360, 390, 768, 1024, 1366, 1440, 1920, 2560 verified [VERIFIED 2026-09-25]
- [x] C2. Mobile thumb-zone & touch targets (≥44×44px) [VERIFIED 2026-09-25]
- [x] C3. 1366×768 budget panel spacing tightened, zero jank [VERIFIED 2026-09-25]
- [x] C4. 2560px ultrawide content max-width capped [VERIFIED 2026-09-25]
- [x] C5. QA evidence documented in /internal/qa/fix03/ [VERIFIED 2026-09-25]

### Part D: Design Elevation
- [x] D1. Color depth: layered surfaces in dark mode, subtle gradients, 1px low-opacity borders [VERIFIED 2026-09-25]
- [x] D2. Micro-animations: button press scale 0.98, card lift, respects prefers-reduced-motion [VERIFIED 2026-09-25]
- [x] D3. Lottie integration: lazy-loaded for empty/success states, <150KB payload [VERIFIED 2026-09-25]
- [x] D4. 3D-style SVG iconography: zero WebGL, static SVG depth [VERIFIED 2026-09-25]
- [x] D5. Preloader & smooth scroll: Lenis verified on all pages, reduced-motion aware [VERIFIED 2026-09-25]


## Fix Pack 04 — CI/CD Pipeline & Zero Lint Warnings

### Initial State & Root Cause
- Failing commit hash on main: `c1d64f9f839b96988fe806a30c574966c24f9f11`
- Captured lint output: `internal/qa/fix04/lint-before.txt` (299 problems: 4 errors, 295 warnings)

### Verbatim 4 ESLint Errors (Root Cause & Fix)
1. `/home/dayshift/Pictures/wefik-world/wefik-world/src/components/marketplace/before-after-slider.tsx:85:58` — `error Error: Cannot access refs during render react-hooks/refs`
2. `/home/dayshift/Pictures/wefik-world/wefik-world/src/components/marketplace/before-after-slider.tsx:85:67` — `error Error: Cannot access refs during render react-hooks/refs`
3. `/home/dayshift/Pictures/wefik-world/wefik-world/src/components/marketplace/before-after-slider.tsx:85:67` — `error Error: Cannot access refs during render react-hooks/refs`
4. `/home/dayshift/Pictures/wefik-world/wefik-world/src/components/marketplace/before-after-slider.tsx:85:67` — `error Error: Cannot access refs during render react-hooks/refs`
- Root cause: `containerRef.current?.offsetWidth` was accessed directly within the JSX inline style during render.
- Resolution: Converted clipped overlay container to use CSS `clipPath: inset(0 ${100 - sliderPosition}% 0 0)` without referencing `containerRef.current` during render. Fixed at root cause without suppression.

### Part A Checklist: Zero Lint Warnings & Strict Typecheck
- [x] A0. Reproduce and capture full lint log in `internal/qa/fix04/lint-before.txt`
- [x] A1. 4 errors listed verbatim in PROGRESS.md and fixed at root cause
- [ ] A2. Fix 295 warnings mechanically file by file (no-unused-vars, no-explicit-any, prefer-const, react-hooks)
- [ ] A3. Add typecheck script and update lint script to `--max-warnings=0` in package.json
- [ ] A4. Verification: npm run lint (0/0), npm run typecheck (clean), npm run build (clean), smoke tests pass

### Part B Checklist: CI/CD Pipeline
- [ ] B1. Pre-commit guard with husky + lint-staged (verified)
- [ ] B2. GitHub Actions .github/workflows/ci.yml with Node pinned (.nvmrc) & concurrency
- [ ] B3. Vercel deployment wiring confirmed
- [ ] B4. Branch protection instructions documented for founder
- [ ] B5. Dependabot config .github/dependabot.yml committed
- [ ] B6. End-to-end verification and negative test documented


