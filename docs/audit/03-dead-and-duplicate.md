# 03 — Dead and Duplicate Code

*Note: `node_modules` is not installed in this environment, so `knip`/`depcheck`/`ts-prune` could not be executed. Findings below were verified via static AST/import scanning across `src/`, `scripts/`, `tests/`, and root config files.*

---

## 1. SAFE TO DELETE

### Unused NPM Dependencies (`package.json`)
- `es-abstract` (`^1.24.2`) — Zero imports anywhere in `src/`, `scripts/`, `tests/`.
- `styled-components` (`^6.5.3`) and `@types/styled-components` (`^5.1.36`) — Zero imports; app uses Tailwind CSS v4.
- `@gsap/react` (`^2.1.2`) — Zero imports; components import `gsap` directly.
- `gray-matter` (`^4.0.3`) — Zero imports anywhere in the repo.
- `next-mdx-remote` (`^6.0.0`) — Zero imports; markdown rendering uses `react-markdown` + `remark-gfm`.
- `zod` (`^4.6.5`) — Zero imports; validation is currently hand-rolled `if` checks.

### Unused Components & Files
- `src/components/hero/hero-poster.tsx` — Zero references anywhere in `src/`.
- `src/components/ui/cld-image.tsx` — Zero references (only `src/app/test-services/page.tsx` imports `CldImage` directly from `next-cloudinary`).
- `src/components/ui/pagination.tsx`, `src/components/ui/popover.tsx`, `src/components/ui/separator.tsx`, `src/components/ui/sonner.tsx` — Unused shadcn/UI primitives (app imports `Toaster` directly from `sonner` in `src/app/layout.tsx`).
- `src/app/licensing/page.tsx` — Unreachable because `next.config.ts` permanently 301-redirects `/licensing` to `/license`.
- `src/app/(auth)/signup/page.tsx` — Unreachable because both `next.config.ts` and `src/proxy.ts` permanently 301-redirect `/signup` to `/login`.

---

## 2. PROBABLY SAFE

### Legacy `/dashboard/*` Parallel Implementation (Replaced by `/account/*`)
`src/proxy.ts` (lines 17–22) permanently 301-redirects `/dashboard`, `/dashboard/downloads`, `/dashboard/licenses`, `/dashboard/purchases`, `/dashboard/membership`, and `/dashboard/settings` to `/account/*`. However, the entire legacy route tree and its components remain on disk:
- `src/app/dashboard/layout.tsx`, `page.tsx`, `downloads/page.tsx`, `licenses/page.tsx`, `purchases/page.tsx`, `membership/page.tsx`, `settings/page.tsx`
- `src/components/dashboard/download-list.tsx`, `license-list.tsx`, `membership-manager.tsx`, `settings-form.tsx`
- **Exception before deleting**: `src/app/dashboard/wishlist/page.tsx` is **not** in `src/proxy.ts` redirects, and `product-detail-view.tsx` (line 136) + `membership-pricing-cards.tsx` (line 82) still navigate to `/dashboard/licenses` and `/dashboard/membership`.

### Unused Lib / Debug Files
- `src/lib/constants.ts` — Zero imports across `src/`.
- `src/app/test-services/page.tsx` — Internal infrastructure test page (Redis/Cloudinary/PostHog) left in production `src/app/`.
- Root-level clutter: `LOGO.svg` and `LOGO-removebg-preview.png` at repo root alongside `public/logo.svg`.

---

## 3. NEEDS HUMAN DECISION

- **Broken / Stub Edge Functions**:
  - `supabase/functions/send-push/index.ts` (unauthenticated stub that never calls FCM) + `public/firebase-messaging-sw.js`.
  - `supabase/functions/review-reminder-email/index.ts` (queries non-existent `orders.status = 'completed'`).
- **Orphaned Test References in `package.json`**:
  - `package.json` `test` script references `tests/edge-functions.test.mjs` and `tests/sitemap-e2e.test.mjs` which **do not exist** in `tests/`, while `tests/ai-client-e2e.test.mjs` exists but is not in `npm test`.
- **Sanity CMS vs Static/Supabase Content**:
  - `src/lib/sanity/queries.ts` has zero imports in `src/` (only `sanity.config.ts` imports `./src/lib/sanity/schemas`). Verify whether Sanity is actively used for `/blog` or superseded by `seed-posts.ts`.
- **Conflicting Patterns**:
  - **Two styling approaches**: Tailwind CSS v4 CSS variables (`var(--bg)`, `var(--surface)`) mixed with legacy Tailwind color aliases (`text-ink`, `text-slate`, `bg-soft`), 168 hardcoded hex colors in `.tsx` files, and 35 inline `style={{...}}` usages (plus unused `styled-components` in `package.json`).
  - **Two data-fetching / image patterns**: `src/lib/data/products.ts` (`unstable_cache` + `FALLBACK_PRODUCTS`) vs direct client-side `createClient()` Supabase queries in `checkout/page.tsx`, `product-detail-view.tsx`, and `admin/*`; `<SafeImage>` vs raw `<Image>` (`download-list.tsx`) vs raw `<img>` (`freebie-magnet-kit.tsx`).
  - **Two route-protection mechanisms**: `src/proxy.ts` (`updateSession`) plus per-page `requireAuth()`/`requireAdmin()` (`src/lib/auth.ts`) — using inconsistent query params (`?next=` for `/account` vs `?redirect=` for `/dashboard` and `/admin`).

