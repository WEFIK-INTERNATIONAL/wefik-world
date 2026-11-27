# Manual Dashboard & Service Checklist (`wefik.world`)

Complete these steps **after** running the SQL pack (`01` through `05`). Use placeholders (`<PROJECT_REF>`, `<SECRET>`) — never commit real credentials.

---

## 1. Backups (Do Before Any Changes)
- **Supabase Backups:** Availability depends on your Supabase plan (Free plans have no automated daily backups). Check **Dashboard -> Project Settings -> Database -> Backups**.
- **`pg_dump` CLI Backup:**
  ```bash
  pg_dump "<DB_CONNECTION_STRING>" --format=custom --no-owner --no-acl -f wefik-backup-$(date +%Y%m%d).dump
  ```
- **Fallback (Table Export):** If `pg_dump` is unavailable, export `profiles`, `products`, `product_versions`, `orders`, `order_items`, `licenses`, `memberships`, `reviews`, and `coupons` as CSV from **Table Editor -> Export**.

---

## 2. Authentication Settings (`Dashboard -> Authentication -> URL Configuration & Providers`)
1. **Site URL:** Set to your canonical production URL: `https://wefik.world` (must match `NEXT_PUBLIC_APP_URL` **exactly** — a `www` vs non-`www` mismatch drops the PKCE cookie in `/auth/callback` and breaks login).
2. **Redirect URLs allow-list:**
   - `https://wefik.world/auth/callback`
   - `https://www.wefik.world/auth/callback` (only if `www` redirects or is served)
   - `http://localhost:3000/auth/callback`
   - `https://*-*.vercel.app/auth/callback` (Vercel preview deployments)
   - `https://wefik.world/reset-password`
   - `http://localhost:3000/reset-password`
3. **Email Auth & Passwords (`Authentication -> Providers -> Email` & `Settings`):**
   - Enable **Confirm email** (`true`).
   - Minimum password length: `10` (matches `evaluatePassword` in `src/lib/security/password-strength.ts`).
   - Enable **Leaked Password Protection** (HaveIBeenPwned) if available on your plan (the app also checks `/api/auth/check-pwned`).
   - Enable **MFA (TOTP)** (`Authentication -> Multi-Factor`).
   - Review session timeout / refresh token reuse settings (keep refresh token rotation enabled).
   - **Disposable email blocking:** Handled by Edge Function `auth-validate-email` + `public.blocked_email_domains`.

---

## 3. Custom SMTP & Email Delivery (`Authentication -> SMTP Settings & Email Templates`)
- Supabase's built-in emailer is heavily rate-limited (2-4 emails/hr). Configure **Custom SMTP** using **Resend**:
  - Host: `smtp.resend.com`, Port: `465` (SSL) or `587`, Username: `resend`, Password: `<RESEND_API_KEY>`.
  - Sender email: `noreply@wefik.world` (domain must be verified in Resend with **SPF**, **DKIM**, and **DMARC** DNS records).
- **Email Templates:** Ensure Confirm Signup, Magic Link, and Reset Password templates redirect to `{{ .SiteURL }}/auth/callback?code={{ .TokenHash }}` (or default PKCE `{{ .ConfirmationURL }}`).
- **Test:** Send signup, password reset, and magic link emails to both a **Gmail** and an **Outlook** address and verify inbox delivery.

---

## 4. OAuth Providers (`Authentication -> Providers`)
The app uses **Google** and **GitHub** (`src/app/(auth)/login/page.tsx`):
- **Callback URL (for both consoles):** `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
- **Google Cloud Console:** Create OAuth 2.0 Web Client -> add Authorized Redirect URI above -> paste **Client ID** and **Client Secret** into Supabase **Google** provider.
- **GitHub Developer Settings:** Create OAuth App -> set Authorization callback URL above -> paste **Client ID** and **Client Secret** into Supabase **GitHub** provider.

---

## 5. Edge Functions & Secrets
Link once locally (when deploying): `supabase link --project-ref <PROJECT_REF>`

### Deploy Commands & JWT Settings
- **JWT Verification ON (authenticated user required):**
  ```bash
  supabase functions deploy create-order --project-ref <PROJECT_REF>
  supabase functions deploy create-subscription --project-ref <PROJECT_REF>
  supabase functions deploy claim-free --project-ref <PROJECT_REF>
  supabase functions deploy download-url --project-ref <PROJECT_REF>
  supabase functions deploy auth-delete-account --project-ref <PROJECT_REF>
  ```
- **JWT Verification OFF (`--no-verify-jwt`, authenticated by webhook signature, cron secret, or pre-login public flow):**
  ```bash
  supabase functions deploy razorpay-webhook --no-verify-jwt --project-ref <PROJECT_REF>
  supabase functions deploy license-validate --no-verify-jwt --project-ref <PROJECT_REF>
  supabase functions deploy auth-check-email --no-verify-jwt --project-ref <PROJECT_REF>
  supabase functions deploy auth-validate-email --no-verify-jwt --project-ref <PROJECT_REF>
  supabase functions deploy auth-mfa-reset-request --no-verify-jwt --project-ref <PROJECT_REF>
  supabase functions deploy auth-mfa-reset-confirm --no-verify-jwt --project-ref <PROJECT_REF>
  supabase functions deploy auth-recovery-email-otp --no-verify-jwt --project-ref <PROJECT_REF>
  supabase functions deploy auth-recovery-reset --no-verify-jwt --project-ref <PROJECT_REF>
  supabase functions deploy review-reminder-email --no-verify-jwt --project-ref <PROJECT_REF>
  supabase functions deploy send-push --no-verify-jwt --project-ref <PROJECT_REF>
  ```

### Edge Function Secrets (Names Only — use placeholders)
```bash
supabase secrets set --project-ref <PROJECT_REF> \
  RAZORPAY_KEY_ID=<RAZORPAY_KEY_ID> \
  RAZORPAY_KEY_SECRET=<RAZORPAY_KEY_SECRET> \
  RAZORPAY_WEBHOOK_SECRET=<RAZORPAY_WEBHOOK_SECRET> \
  RAZORPAY_MONTHLY_PLAN_ID=<RAZORPAY_MONTHLY_PLAN_ID> \
  UPSTASH_REDIS_REST_URL=<UPSTASH_REDIS_REST_URL> \
  UPSTASH_REDIS_REST_TOKEN=<UPSTASH_REDIS_REST_TOKEN> \
  RESEND_API_KEY=<RESEND_API_KEY> \
  CRON_SECRET=<CRON_SECRET>
```

---

## 6. Razorpay Configuration
1. **Webhook URL:** `https://<PROJECT_REF>.supabase.co/functions/v1/razorpay-webhook`
2. **Events to subscribe:** `payment.captured`, `payment.failed`, `refund.processed`, `refund.created`.
3. **Webhook Secret:** Set in Razorpay Dashboard to the exact same value as `RAZORPAY_WEBHOOK_SECRET`.
4. **Test vs Live:** Use **Test Mode** (`rzp_test_...`) in Preview/Development and **Live Mode** (`rzp_live_...`) ONLY in Production.
5. **Test Payment:** Add a product to cart -> checkout with Razorpay Test Card/UPI -> confirm `payment.captured` webhook returns `200`, `orders.status = 'paid'`, and `licenses` row is created.

---

## 7. Vercel Environment Variables (Names Only)
- **Public (`NEXT_PUBLIC_*`) — safe for client, same or env-specific:**
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` (prod `https://wefik.world`, dev `http://localhost:3000`), `NEXT_PUBLIC_RAZORPAY_KEY_ID` (**test key outside Production**), `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_VAPID_KEY`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_BING_VERIFICATION`.
- **Server-Only (NEVER prefix with `NEXT_PUBLIC_`):**
  `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET` (**test key outside Production**), `RAZORPAY_WEBHOOK_SECRET` (**test secret outside Production**), `RAZORPAY_MONTHLY_PLAN_ID`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `REDIS_URL`, `RESEND_API_KEY`, `REVALIDATION_SECRET`, `CRON_SECRET`, `SANITY_API_TOKEN`, `SANITY_WEBHOOK_SECRET`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_URL`, `FCM_SERVICE_ACCOUNT_JSON`, `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`, `POSTHOG_PROJECT_ID`, `GEMINI_API_KEY`, `GROQ_API_KEY`.

---

## 8. Upstash, Resend, PostHog & Sanity
- **Upstash:** Rotate old REST credentials (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) as noted in `docs/CHANGES.md`; set in both Vercel and Supabase Edge Function secrets.
- **Resend:** Verify `wefik.world` DNS (SPF, DKIM, DMARC); set `RESEND_API_KEY`.
- **PostHog:** Set `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `POSTHOG_PROJECT_ID`.
- **Sanity:** Set `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN`, `SANITY_WEBHOOK_SECRET` (webhook -> `https://wefik.world/api/revalidate`).

---

## 9. Supabase Advisors (`Dashboard -> Advisors -> Security & Performance`)
- **Security Advisor:** Confirm 0 tables with RLS disabled, 0 `SECURITY DEFINER` functions without `search_path`, and Leaked Password Protection status.
- **Performance Advisor:** Confirm indexes from `05-extras-indexes-and-cron.sql` are present; ignore low-volume unused-index notices until live traffic accrues.

---

## 10. Final Smoke-Test Procedure
1. **Sign Up & Confirm Email:** Register with a new email -> receive Resend email -> click link -> lands on `/account` logged in (`profiles` row exists).
2. **Sign In (Password + OAuth):** Sign out -> sign in with email/password and test Google/GitHub -> lands on `/account`.
3. **Reset Password:** Trigger reset -> open email link -> `/reset-password` -> set 10+ char password -> succeeds.
4. **MFA (TOTP):** Enroll TOTP in `/account/settings` -> sign out -> sign in -> prompted for 6-digit TOTP code.
5. **Cart & Test Payment:** Add product -> checkout -> complete Razorpay test payment -> `/order-success` shows paid order.
6. **Licence & Download:** Visit `/account/library` -> `WFK-...` licence appears -> click Download -> signed URL downloads ZIP from `product-files`.
7. **Verified Review:** On product page, submit review -> succeeds for purchaser (and fails for non-purchaser).
8. **Admin View:** As `role = 'admin'` user, open `/admin` -> products, orders, reviews, and coupons load without 403/500.
