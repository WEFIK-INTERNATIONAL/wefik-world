# 07 — Performance and Quality Audit

## 1. Lint, Typecheck & Build Verification

- **Status**: **Could not run** `npm run lint` (`eslint --max-warnings=0`), `npm run typecheck` (`tsc --noEmit`), or `npm run build` because `node_modules/` is not installed in the workspace (`eslint: not found`, `tsc: not found`).
- **Secret Scan (`node scripts/check-secrets.mjs`)**: Ran and exited `0` (`PASS: No secrets detected across audited files`), **but missed** the hardcoded Upstash Redis credentials in `src/lib/redis.ts` (lines 6–7).
- **Predicted Type / Runtime Issues Observed Static-Side**:
  - `src/types/database.ts` (`line 150`) defines `products.Row.price_usd`, which does not exist in `supabase/migrations/001_schema.sql`.
  - Multiple server components (`account/page.tsx`, `account/orders/page.tsx`, `dashboard/page.tsx`, `admin/page.tsx`, `admin/orders/page.tsx`, `order-success/page.tsx`, `admin/reviews/page.tsx`) use `.returns<CustomInterface[]>()` or `any` casts to bypass Supabase type checking for non-existent columns (`amount_inr`, `total_amount_inr`, `order_number`, `is_active`, `title`, `comment`).

---

## 2. Bundle Size & Client JS Concerns

- **Heavy dependencies shipped / configured**:
  - `sanity` (`^6.15.0`) + `next-sanity` (`^13.3.4`) for `/studio`.
  - `gsap` (`^3.15.0`) + `lenis` (`^1.3.26`) loaded in root `SmoothScrollProvider` (`src/app/layout.tsx`).
  - Unused packages still in `package.json` (`styled-components`, `es-abstract`, `next-mdx-remote`, `gray-matter`, `@gsap/react`, `zod`).
- **Good practice observed**: `src/app/layout.tsx` (`lines 18–44`) dynamically imports 9 below-fold/overlay components (`Footer`, `CartDrawer`, `CommandPalette`, `UnboxingPreloader`, `TawkToChat`, etc.) and uses `gtag.js` with `lazyOnload`.

---

## 3. Images & Media

- `next.config.ts` (`lines 9–43`) enables `image/avif` and `image/webp` with scoped `remotePatterns` (`*.supabase.co`, `res.cloudinary.com`, `unsplash.com`, `cdn.sanity.io`).
- Most UI uses `SafeImage` (`next/image` wrapper with one-shot error fallback), except:
  - `src/components/freebies/freebie-magnet-kit.tsx` uses a raw `<img>` tag (unoptimized).
  - `src/components/dashboard/download-list.tsx` (`line 79`) uses raw `next/image` without `SafeImage` fallback.

---

## 4. Caching & Query Performance

- **Catalog caching**: `src/lib/data/products.ts` uses `unstable_cache` (`revalidate: 3600`) with a `2500ms` `Promise.race` timeout falling back to `FALLBACK_PRODUCTS`.
- **Header auth waterfall**: `src/components/layout/header.tsx` (`lines 96–119`) runs `supabase.auth.getSession()` + a `profiles` query on every client mount.
- **Unbounded admin/account queries**: `src/app/admin/page.tsx` (`lines 31–34`) fetches **all** `orders` rows and sums `paidOrders` in JS rather than using a SQL aggregate/RPC.
- **Database indexes**: `001_schema.sql` (`lines 333–355`) defines solid B-tree, `pg_trgm` GIN, and `to_tsvector` GIN indexes, though `MarketplaceClientView` currently filters in-memory on the client instead of using Postgres FTS/trigram queries.

---

## 5. Testing & CI/CD Gaps

- **Broken `npm test` script (`package.json` line 10)**:
  - References `tests/edge-functions.test.mjs` and `tests/sitemap-e2e.test.mjs`, **neither of which exists** in `tests/`.
  - `tests/ai-client-e2e.test.mjs` exists in `tests/` but is not included in `npm test`.
  - No unit or component test runner (Vitest / Jest / Playwright) is configured.
- **CI Workflow (`.github/workflows/ci.yml`)**:
  - Runs `lint`, `typecheck`, `check-secrets.mjs`, and `next build` (with placeholder env vars).
  - **Does NOT run `npm test`** or any Supabase Edge Function / Deno tests.
  - **No CD / deployment workflow** exists in `.github/workflows/` for Vercel or Supabase Edge Functions/migrations.

