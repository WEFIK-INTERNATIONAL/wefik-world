# 05 — Security and Risk Audit

*(No secret values are printed in this report; all findings reference file paths and line numbers only.)*

## 1. Exposed Secrets & Committed `.env` Files

- **Committed `.env` files**: None found. Only `.env.example` is tracked, and `.gitignore` excludes `.env*` (except `!.env.example`).
- **[CRITICAL] Hardcoded live Upstash Redis REST URL and token in source code**:
  - `src/lib/redis.ts` (lines 6–7): `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` have hardcoded production-looking fallback credentials committed directly in the repository.
- **[LOW] Hardcoded third-party identifiers**:
  - `src/app/api/health/route.ts` (line 25), `src/app/test-services/page.tsx` (lines 35, 85, 109), and `.github/workflows/ci.yml` (line 65) hardcode Cloudinary cloud name, Redis instance name, and PostHog project ID.

---

## 2. Missing Auth Checks on API Routes & Edge Functions

| Severity | Location | Issue |
|---|---|---|
| **HIGH** | `supabase/functions/send-push/index.ts` (lines 9–55) | **Zero authentication or admin check.** Any unauthenticated caller can POST `{ title, body, user_id }` to trigger the endpoint (currently a stub, but exposes `push_subscriptions` count). |
| **HIGH** | `supabase/functions/review-reminder-email/index.ts` (lines 13–124) | **Zero authentication or cron secret check.** Any external caller can invoke the function repeatedly to spam customers (if the `orders.status` bug were fixed). |
| **MEDIUM** | `src/app/api/health/route.ts` (lines 4–38) | Publicly exposes internal Redis connection status, raw error messages (`(error as Error).message`), and service configuration state. |
| **LOW** | `src/app/test-services/page.tsx` (lines 7–143) | Internal infrastructure test page is publicly routable and not excluded in `src/app/robots.ts`. |

---

## 3. Payment Webhook Verification

- **[CRITICAL] Signature verification bypass when secret is unset**:
  - `supabase/functions/razorpay-webhook/index.ts` (lines 18–19):
    `if (!isValid && secret)` — if `RAZORPAY_WEBHOOK_SECRET` is empty or missing in Edge Function secrets, the condition is `false` and **all webhook payloads (including `payment.captured` and `subscription.charged`) are accepted without signature verification**, allowing forged license/membership issuance.
- **[MEDIUM] Non-constant-time HMAC comparison & fail-open idempotency**:
  - `supabase/functions/_shared/razorpay.ts` (line 109) uses `===` on hex strings rather than constant-time comparison.
  - `supabase/functions/_shared/redis.ts` (lines 86–90) `acquireIdempotency` returns `true` (fail-open) if Upstash Redis is unconfigured or unreachable, falling back only to DB order status checks.

---

## 4. Unsafe File Uploads & Downloads

- **Downloads (`supabase/functions/download-url/index.ts`)**:
  - **Solid**: Authenticates user via JWT (`getAuthenticatedUser`), verifies active `licenses` or active/unexpired `memberships`, rate-limits via Redis (20/hr/user), generates a 60-second signed URL from private bucket `product-files`, and logs to `downloads`.
  - **[MEDIUM] Fail-open rate limit**: `supabase/functions/_shared/redis.ts` (line 68) allows unlimited downloads if Redis is unconfigured/down.
- **Uploads (`src/components/admin/product-admin-manager.tsx`)**:
  - **[MEDIUM] Silent upload failure**: Lines 69–76 catch/warn on `supabase.storage.from('product-files').upload(...)` failure and proceed to insert `product_versions` pointing to a missing file.
  - **[LOW] Client-constructed storage path**: Path `${selectedProduct.slug}/${newVersion}.zip` (`line 65`) does not sanitize `newVersion` for path traversal (`../`), though Supabase Storage policies/admin role mitigate external abuse.
- **Avatars (`supabase/migrations/004_auth_system.sql`)**:
  - **Solid**: `avatars` bucket enforces `2097152` (2MB) limit, MIME allowlist (`image/jpeg`, `image/png`, `image/webp`), and `auth.uid()::text = (storage.foldername(name))[1]` RLS.

---

## 5. Unvalidated Input & XSS Risks

- **[HIGH] Unescaped HTML interpolation in contact email**:
  - `src/app/api/contact/route.ts` (lines 48–63) interpolates user-supplied `name`, `email`, `category`, `subject`, and `message` directly into an HTML email body sent to `hello@wefik.world` without HTML entity escaping (HTML/script injection in admin mail client).
- **[MEDIUM] Lack of schema validation (`zod` unused)**:
  - `src/app/api/contact/route.ts`, `src/app/api/newsletter/route.ts`, `src/app/api/auth/check-pwned/route.ts`, and Edge Functions (`create-order`, `claim-free`, `license-validate`) use ad-hoc checks (`email.includes('@')`) rather than strict `zod` schemas, despite `zod` being in `package.json`.
- **[LOW] `dangerouslySetInnerHTML` usage**:
  - 19 occurrences across `src/app/` and `src/components/`. Inspected usages in `layout.tsx`, `products/[slug]/page.tsx`, and `page.tsx` are JSON-LD (`JSON.stringify`) or static theme anti-flash scripts, but `JSON.stringify` does not escape `</script>` if untrusted DB text ever enters product `title`/`tagline`.

---

## 6. Missing Rate Limiting

- **[HIGH] Unauthenticated Next.js API routes have no rate limiting**:
  - `src/app/api/contact/route.ts` (can be abused for Resend email quota exhaustion / inbox flooding).
  - `src/app/api/newsletter/route.ts` (allows unbounded DB inserts into `newsletter_subscribers`).
  - `src/app/api/auth/check-pwned/route.ts` (allows proxying arbitrary requests to HIBP).
  - *Note*: `src/lib/redis.ts` defines `checkRateLimit()`, and `supabase/functions/auth-*` + `download-url` + `license-validate` use it, but **no Next.js `/api/*` route calls `checkRateLimit()`**.

---

## 7. Insecure CORS & Headers

- **[MEDIUM] Wildcard CORS on all Supabase Edge Functions**:
  - Every Edge Function (`create-order`, `create-subscription`, `download-url`, `claim-free`, `auth-*`, `send-push`, `license-validate`) sets `"Access-Control-Allow-Origin": "*"` instead of restricting to `https://www.wefik.world` (except `license-validate` which legitimately serves external WordPress sites).
- **[LOW] Missing CSP & HSTS in `next.config.ts`**:
  - `next.config.ts` (lines 87–98) sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`, but omits `Strict-Transport-Security` and `Content-Security-Policy`.

