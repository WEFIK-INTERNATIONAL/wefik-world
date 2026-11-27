# Google OAuth & Login Checklist (`wefik.world`)

Follow these steps in order after deploying `fix/google-oauth-callback`. Never share or paste secret values, auth codes, or cookie values.

---

## 1. Supabase Dashboard -> Authentication -> URL Configuration
1. **Site URL:** Set to the exact canonical production URL expected by the app:
   - `https://www.wefik.world` (must match `NEXT_PUBLIC_APP_URL` in Vercel **exactly**).
2. **Redirect URLs allow-list:** Add every one of these:
   - `https://www.wefik.world/auth/callback`
   - `https://wefik.world/auth/callback` (while DNS/Vercel redirects apex -> `www`)
   - `http://localhost:3000/auth/callback`
   - `https://*-*.vercel.app/auth/callback` (Vercel preview deployments)

---

## 2. Supabase Dashboard -> Authentication -> Providers -> Google
1. Toggle **Google enabled** ON.
2. Paste the **Client ID** and **Client Secret** from Google Cloud Console.
3. Leave **Skip nonce check** OFF (untouched) — the web PKCE flow does not need it.
4. Click **Save**.

---

## 3. Google Cloud Console -> APIs & Services -> Credentials & OAuth Consent Screen
1. Open your **OAuth 2.0 Client ID** (Web application):
   - **Authorized redirect URI:** Must be **exactly**:
     `https://<project-ref>.supabase.co/auth/v1/callback`
     *(If you use a Supabase custom auth domain, add `https://<custom-auth-domain>/auth/v1/callback` as well.)*
   - **Authorized JavaScript origins:**
     - `https://www.wefik.world`
     - `https://wefik.world`
     - `http://localhost:3000`
2. Open **OAuth consent screen**:
   - **Publishing status:** Must be **In production** (in *Testing* mode, only manually listed test users can sign in).
   - **App name:** `wefik.world`
   - **User support email:** Your verified support email.
   - **Authorized domains:** `wefik.world` and `supabase.co`.

---

## 4. Vercel Project Settings -> Domains & Environment Variables
1. **Domains:** Ensure `www.wefik.world` is the primary canonical domain and `wefik.world` (apex) redirects to `https://www.wefik.world` (the app's `src/proxy.ts` also enforces a 308 redirect from apex to `NEXT_PUBLIC_APP_URL`).
2. **Environment Variable Names** (check **Production**, **Preview**, and **Development**):
   - `NEXT_PUBLIC_APP_URL` (`https://www.wefik.world` in Production, `http://localhost:3000` in Development)
   - `NEXT_PUBLIC_SUPABASE_URL` (must point to the **same** `<project-ref>` Supabase project as Google Cloud's callback URI)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (must belong to that same Supabase project)

---

## 5. Checking Supabase Auth Logs Safely
1. Open **Supabase Dashboard -> Logs -> Auth**.
2. Filter by the approximate UTC timestamp of the failed login or the `Request ID` shown on `/login`.
3. Copy **only** `timestamp`, `status`, `msg`, `error`, and `path` (e.g. `Database error saving new user`, `invalid_grant`, `pkce`).
4. **Never copy** `email`, `user_id`, `ip_address`, `code`, `code_verifier`, or `access_token`.

---

## 6. Real-Browser Test Plan (Owner)
Test all 7 scenarios after deploying. If any fails, send: **(1) the URL with any `code=` value removed, (2) the `Request ID` shown on `/login`, and (3) the UTC time**.

| Scenario | Expected Result |
|---|---|
| **(a) Brand-new Google account** | Redirects to `/account`, creates `auth.users` + `public.profiles` row (`role = 'customer'`). |
| **(b) Existing email/password account (same email)** | Either links cleanly or shows `"Account uses another sign-in method"` with Request ID (never `"login link expired"`). |
| **(c) Cancel on Google consent screen** | Returns to `/login` with `"Sign-in cancelled"` and a **Try again** button. |
| **(d) Start on apex (`wefik.world`) and `www.wefik.world`** | Apex 308-redirects to `www.wefik.world` before sign-in; both complete login without PKCE loss. |
| **(e) Normal window & Private/Incognito window** | Both complete login cleanly. |
| **(f) Mobile Chrome & embedded in-app browsers** | Mobile Chrome succeeds. *Note:* Embedded in-app browsers (Instagram, Facebook, some email apps) are blocked by Google with `disallowed_useragent`; `/login` tells the user to open in Chrome/Safari. |
| **(g) Second device** | Completes login cleanly with independent session cookies. |
