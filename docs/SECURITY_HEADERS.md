# Security Headers & CSP Report-Only Policy

Configured in `next.config.ts` (`headers()`).

## Headers Applied
- `Content-Security-Policy-Report-Only`: Non-blocking report-only mode for initial rollout.
- `X-Frame-Options: DENY` + `frame-ancestors 'none'`: Prevents clickjacking.
- `X-Content-Type-Options: nosniff`: Prevents MIME sniffing.
- `Referrer-Policy: strict-origin-when-cross-origin`: Limits referrer leakage on cross-origin requests.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`: Disables unused browser hardware/tracking APIs.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`: Enforces HTTPS on production (`wefik.world` is HTTPS-only).

## Allowed CSP Sources & Justification
- `'self'`: First-party Next.js scripts, styles, APIs, and local assets.
- `https://checkout.razorpay.com`, `https://api.razorpay.com`, `https://lumberjack.razorpay.com`: Razorpay checkout script, API calls, telemetry, and payment modal frames.
- `https://us.i.posthog.com`, `https://us-assets.i.posthog.com`: PostHog analytics SDK and event ingestion.
- `https://*.supabase.co`, `wss://*.supabase.co`: Supabase Auth, Postgres REST/Realtime, and Storage product assets.
- `https://cdn.sanity.io`: Sanity CMS editorial images.
- `https://res.cloudinary.com`: Cloudinary media assets (if configured).
- `https://*.ingest.sentry.io`: Sentry error reporting ingestion.
- `https://va.vercel-scripts.com`, `https://vitals.vercel-insights.com`: Vercel Speed Insights.
- `'unsafe-inline'`, `'unsafe-eval'`: Currently needed by Next.js inline hydration/JSON-LD scripts and GSAP; switching to nonces is recommended before moving CSP from Report-Only to enforcing mode.

## What Report-Only Would Block
- Any external stock/Unsplash image URLs (`images.unsplash.com` is intentionally excluded).
- Any unapproved third-party scripts, frames, or `object-src` embeds.
- Resend is server-side only and does not require client CSP allowances.

