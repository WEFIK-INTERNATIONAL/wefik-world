# Architecture Overview — wefik.world

## Stack
- **Framework:** Next.js App Router (`src/app/`) with React 19, TypeScript, and Tailwind CSS v4.
- **Database, Auth & Storage:** Supabase Postgres (`supabase/migrations/`), Supabase Auth, private Storage buckets for product ZIPs, and Deno Edge Functions (`supabase/functions/`).
- **Payments:** Razorpay checkout & webhooks (`create-order`, `razorpay-webhook`, `create-subscription`). Webhooks fail closed when `RAZORPAY_WEBHOOK_SECRET` or Redis idempotency is unavailable.
- **Rate Limiting & Idempotency:** Upstash Redis (`src/lib/redis.ts`, `supabase/functions/_shared/redis.ts`). Both fail closed in production.
- **CMS:** Sanity (`src/lib/sanity/`) for editorial blog posts.

## Key Modules
- **Product Data (`src/lib/data/products.ts`, `fallback-products.ts`):** Server-side normalized fetching via `getProducts()` with `unstable_cache`. `FALLBACK_PRODUCTS` is intentionally empty so no fake/demo products are rendered when unseeded.
- **Marketplace (`src/app/marketplace/page.tsx`, `src/components/marketplace/marketplace-client-view.tsx`):** URL-driven search (`?q=`) and facet filtering (`category`, `type`, `tech`, `price`, `sort`, `page`), with advanced facets gated behind `ADVANCED_FILTER_THRESHOLD = 8`.
- **Shared Product Card (`src/components/marketplace/product-card.tsx`):** Single card component across home, marketplace, and bundles, using `aspect-[16/10]` and falling back to a typographic/icon tile when no real screenshot is present.
- **Design & Motion Tokens (`src/app/globals.css`, `src/lib/motion.ts`):** Semantic CSS variables (`--bg`, `--surface`, `--text-primary`, `--brand`, etc.) and shared GSAP motion constants (`MOTION_DURATION`, `MOTION_EASE`).

