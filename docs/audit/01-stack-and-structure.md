# 01 — Stack and Structure

## Technology Stack

| Layer | Technology | Evidence / Config |
|---|---|---|
| **Framework** | Next.js `16.3.5` (App Router) + React `19.2.8` | `package.json` (`next`, `react`, `react-dom`), `next.config.ts` |
| **Language** | TypeScript `^5` (`strict: true`, `target: ES2017`) | `tsconfig.json` |
| **Package Manager** | npm (`package-lock.json` present; `node >= 20.9.0`, `.nvmrc` = `22` / Node 22) | `package.json`, `package-lock.json`, `.github/workflows/ci.yml` |
| **Database** | Supabase PostgreSQL (`pg_trgm`, `unaccent`, `uuid-ossp`) | `supabase/migrations/001_schema.sql`–`004_auth_system.sql`, `@supabase/supabase-js`, `@supabase/ssr` |
| **Auth** | Supabase Auth (email/password, OAuth PKCE `/auth/callback`, TOTP MFA) + custom Deno Edge Functions + HIBP k-anonymity check | `src/app/auth/callback/route.ts`, `src/lib/supabase/middleware.ts`, `supabase/functions/auth-*`, `src/app/api/auth/check-pwned/route.ts` |
| **Payments** | Razorpay (Checkout JS SDK + Orders API + Subscriptions API + HMAC-SHA256 webhooks) | `src/app/checkout/page.tsx`, `src/components/pricing/membership-pricing-cards.tsx`, `supabase/functions/create-order/`, `create-subscription/`, `razorpay-webhook/` |
| **Storage & Media** | Supabase Storage (`product-files` private bucket, `product-images` & `avatars` public buckets) + Cloudinary (`next-cloudinary`) + Sanity CDN | `001_schema.sql`, `004_auth_system.sql`, `next.config.ts` |
| **CMS** | Sanity (`sanity ^6.15.0`, `next-sanity ^13.3.4`) mounted at `/studio` | `sanity.config.ts`, `src/app/studio/[[...index]]/page.tsx`, `src/lib/sanity/` |
| **Cache / Rate Limit** | Upstash Redis (`@upstash/redis` in Next.js + REST API in Deno Edge Functions) | `src/lib/redis.ts`, `supabase/functions/_shared/redis.ts` |
| **Email** | Resend (`resend ^6.28.1` + raw `fetch` to `api.resend.com`) | `src/lib/email.ts`, `src/app/api/contact/route.ts`, `supabase/functions/_shared/email-templates.ts` |
| **Styling & UI** | Tailwind CSS v4 (`@tailwindcss/postcss`), Radix UI primitives, `class-variance-authority`, `lucide-react`, `sonner`, `cmdk`, GSAP + Lenis | `src/app/globals.css`, `postcss.config.mjs`, `components.json`, `package.json` |
| **Analytics & Monitoring** | Sentry (`@sentry/nextjs`), PostHog (`posthog-js`), Vercel Speed Insights (`@vercel/speed-insights`), Google Tag (`gtag.js`) | `next.config.ts`, `sentry.*.config.ts`, `src/app/layout.tsx`, `src/lib/posthog.ts` |
| **Hosting & Deploy** | Vercel (inferred from `@vercel/speed-insights`, `.gitignore` `.vercel`, `next.config.ts` ISR/headers) + Supabase Edge Functions (Deno). **No explicit deploy workflow in `.github/workflows/`** (only CI lint/typecheck/secrets/build). | `.github/workflows/ci.yml`, `package.json` |

---

## Two-Level Folder Map & Top-Level Purposes

```text
.
├── .github/                  # GitHub Actions CI workflow & Dependabot config
│   ├── dependabot.yml
│   └── workflows/
├── .husky/                   # Git pre-commit hook (secret scan + lint-staged)
│   └── pre-commit
├── .vscode/                  # Editor workspace settings
├── docs/                     # Project, SEO, design, and launch documentation
│   ├── AI_VISIBILITY.md ...
│   └── audit/                # (Added) Read-only engineering audit reports
├── internal/                 # Internal brand voice and tone guidelines
│   └── voice-and-tone.md
├── public/                   # Static assets, SVG icons, llms.txt, FCM service worker
│   ├── badges/
│   └── images/
├── scripts/                  # Standalone Node.js audit, SEO, secret-scan, and email scripts
│   └── *.mjs
├── src/                      # Main Next.js App Router application source
│   ├── app/                  # Pages, layouts, route handlers, sitemaps, and metadata routes
│   ├── components/           # Feature and UI components (account, admin, marketplace, ui, etc.)
│   ├── hooks/                # Custom React hooks (use-preloader-progress, use-reduced-motion)
│   ├── lib/                  # Clients (Supabase, Redis, Sanity, AI), contexts, data fetchers, helpers
│   ├── proxy.ts              # Next.js middleware/proxy for redirects, GSC verification, and auth gating
│   └── types/                # TypeScript database type definitions (database.ts)
├── supabase/                 # Database SQL migrations and Deno Edge Functions
│   ├── functions/            # 15 Edge Functions + _shared helpers
│   └── migrations/           # 001_schema.sql through 004_auth_system.sql
└── tests/                    # Node-based E2E and RLS/authz verification test scripts
    └── *.test.mjs
```

### Top-Level File Notes
- `src/proxy.ts` exports `proxy` and aliases `middleware` + `default`, acting as the Next.js request interceptor for redirects and `/account`, `/dashboard`, `/admin` session checks.
- `BUILD_LOG.md`, `PROGRESS.md`, `SEO_PROGRESS.md`, `UX_PROGRESS.md`, `keyword-map.csv`, `redirects.csv`, `LOGO.svg`, and `LOGO-removebg-preview.png` sit at the repository root alongside config files.

