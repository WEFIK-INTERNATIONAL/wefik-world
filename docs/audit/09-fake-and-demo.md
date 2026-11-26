# 09 — Fake, Mock, and Demo Content Audit

| File Path | What is Fake / Demo | Class | Action Taken |
| --- | --- | --- | --- |
| `src/app/admin/page.tsx` | Hardcoded `{productCount ?? 6}` fallback count | **A** | Replaced with `{productCount ?? 0}` |
| `src/components/marketplace/product-detail-view.tsx` | Hardcoded `"Updated 6 days ago"` recency label | **A** | Wired to `product.updated_at` formatted in `en-IN` |
| `src/components/search/command-palette.tsx` | Imported static `FALLBACK_PRODUCTS` instead of live catalog | **A** | Wired to fetch published `products` from Supabase on open |
| `supabase/functions/create-order/index.ts` | Generated `order_mock_${Date.now()}` when Razorpay unconfigured | **B** | Fail closed with `503` error if Razorpay is not configured |
| `src/app/test-services/page.tsx` | Public `/test-services` diagnostic page with sample data | **B** | Gated with `notFound()` in production unless `NEXT_PUBLIC_ENABLE_TEST_SERVICES === 'true'` |
| `src/lib/api-edge.ts` | Simulated `existing`/`demo` emails when Supabase URL is placeholder | **B** | Removed fake email simulation; returns `{ registered: false, ... }` |
| `src/app/error.tsx` & `src/app/marketplace/error.tsx` | `Math.random()` fallback error reference ID in render | **B** | Replaced with deterministic `error.digest \|\| 'ERR_UNEXPECTED'` / `'ERR_MARKETPLACE'` |
| `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/sitemap-content.xml/route.ts`, `src/app/sitemap.xml/route.ts` | Renders `SEED_POSTS` from `src/lib/sanity/seed-posts.ts` instead of live Sanity CMS | **C** | Untouched — requires owner decision on Sanity dataset population vs hiding `/blog` |
| `src/lib/data/products.ts` & `src/lib/data/fallback-products.ts` | Falls back to `FALLBACK_PRODUCTS` when `NEXT_PUBLIC_SUPABASE_URL` is placeholder | **C** | Untouched — used for CI/offline builds when Supabase env vars are placeholders |

