# 13 — Implementation Plan: Supporting New Product Types

> **Constraint note:** Per task instructions ("The only things you may create are markdown files in `/docs/audit/`"), the proposed SQL migration `005_product_delivery_types.sql` is documented in full below rather than created as a `.sql` file in `supabase/migrations/`. Nothing was applied to any database.

---

## 1. Core Concept: `delivery_type`

Add a single 3-value discriminator to `public.products`:

| `delivery_type` | Examples | Primary CTA (Product Page) | Cart & Checkout | `/account/library` & Dashboard | Must **NOT** Show |
| --- | --- | --- | --- | --- | --- |
| `'download'` *(default)* | Site Checkup, WP Theme, Next.js Code Pack | `Add to Cart` (paid) or `Claim Free License` (free) | Existing `cart-context` → `create-order` → `razorpay-webhook` | License key (`WFK-...`) + `Download ZIP` (`download-url`); hide domain counter for code packs (`requires_domain_activation = false`) | External store install badge or "Open App" button |
| `'external_install'` | Kuracode Extension | `Install Extension` (external store URL, `rel="noopener noreferrer"`) + secondary `Link Account` button | **Bypass cart** when free; if paid Pro tier exists, checkout grants entitlement without ZIP | `"Linked Devices / Tokens"` + `"Open Store"` + `"Manual Install Guide"` | **No** `Download ZIP` button, **no** `Single-Site / Unlimited-Site Domain` selector, **no** `activated_domains` counter |
| `'hosted_app'` | weclip | `Launch App` / `Start Free Trial` (`app_url`) + optional plan/upgrade CTA | **Bypass cart** for free/trial; paid subscription uses per-product Razorpay plan (`create-subscription`) | `"Active Plan / Trial"` + `"Open weclip"` button | **No** `Download ZIP` button, **no** `Single-Site / Unlimited-Site Domain` selector, **no** ZIP version table |

### `ProductCard` Behaviour
- `ProductCard` keeps its exact unified 5-slot structure (`image → category → title → 1-line tagline → price`).
- Price slot renders:
  - `'download'`: `Free` or `₹X,XXX`
  - `'external_install'`: `Free` (or `Free · Pro available`)
  - `'hosted_app'`: `Free trial` / `From ₹X/mo` / `Free` (from `pricing_label` or `price_inr`).

---

## 2. Proposed Schema Migration (`005_product_delivery_types.sql` — Not Applied)

Smallest additive change that preserves 100% backward compatibility with existing products:

```sql
-- ============================================================================
-- 005_product_delivery_types.sql (PROPOSED — DO NOT APPLY YET)
-- ============================================================================

-- 1. Extend products with delivery_type, external links, compatibility, and billing mode
alter table public.products
  add column if not exists delivery_type text not null
    check (delivery_type in ('download', 'external_install', 'hosted_app'))
    default 'download',
  add column if not exists billing_mode text not null
    check (billing_mode in ('one_time', 'free', 'freemium', 'subscription'))
    default 'one_time',
  add column if not exists external_install_url text,       -- Chrome/Edge/Firefox Web Store URL
  add column if not exists app_url text,                    -- Hosted app entry URL (e.g. https://weclip.wefik.world)
  add column if not exists docs_url text,                   -- Documentation / manual install guide URL
  add column if not exists pricing_label text,              -- Optional display label (e.g. "Free tier · Pro ₹499/mo")
  add column if not exists requires_domain_activation boolean not null default true,
  add column if not exists compatibility jsonb not null default '{}'::jsonb;
  -- compatibility example:
  -- { "wordpress": "6.4+", "php": "8.1–8.3", "nextjs": "16+", "browsers": ["Chrome", "Edge"] }

-- 2. Allow product_versions without a storage ZIP (e.g. release notes for extensions/hosted apps)
alter table public.product_versions
  alter column file_path drop not null;

-- 3. Per-product Razorpay subscription plans (for hosted_app / freemium upgrades)
create table if not exists public.product_plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  slug text not null,                                       -- e.g. 'free', 'pro-monthly'
  name text not null,
  price_inr integer not null default 0,                     -- in paise
  interval text not null check (interval in ('month', 'year', 'one_time', 'free')),
  razorpay_plan_id text,                                    -- NULL for free/trial
  features text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, slug)
);

-- 4. Extension / external client account-linking tokens (Kuracode Extension)
create table if not exists public.client_link_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  token_hash text unique not null,                          -- SHA-256 of opaque bearer token
  label text not null default 'Browser Extension',
  scopes text[] not null default '{"sync:read","sync:write"}',
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_client_link_tokens_user on public.client_link_tokens(user_id, product_id);

alter table public.product_plans enable row level security;
alter table public.client_link_tokens enable row level security;

create policy "Anyone can view active product plans" on public.product_plans
  for select using (is_active = true);

create policy "Users manage own client link tokens" on public.client_link_tokens
  for all using (auth.uid() = user_id);
```

---

## 3. Licensing, Bundles & Checkout Rules

1. **Licences for non-download products:**
   - **Code packs** (`delivery_type = 'download'`, `requires_domain_activation = false`): still issue a `WFK-XXXX-XXXX-XXXX` license record as proof of purchase/ownership, but hide domain activation UI on `/account/library`.
   - **Extensions / Hosted Apps** (`external_install`, `hosted_app`): do **not** create domain-locked `licenses` rows for free installs. Paid upgrades create an entitlement row (or `memberships` / `product_subscriptions` record) scoped to `user_id` + `product_id`.
2. **Bundles (`bundle_product_ids`):**
   - `razorpay-webhook` currently expands `bundle_product_ids` and inserts `licenses` for every item. Update the expansion check to filter `delivery_type = 'download'` for ZIP/key issuance, and only include non-download products in a bundle if an explicit entitlement rule is defined.
3. **`download-url` guard:**
   - Reject `delivery_type !== 'download'` or `versionRow.file_path == null` with HTTP `400` (`"This product is delivered externally and has no ZIP download"`).

---

## 4. Account Linking Flow (Kuracode Extension ↔ `wefik.world`)

Use a short-lived **OAuth-style one-time code exchange** (never store a long-lived Supabase session JWT inside `chrome.storage`):

1. User clicks **"Connect Kuracode Account"** in the extension.
2. Extension generates a `code_verifier` + `code_challenge` (PKCE S256) and opens `https://www.wefik.world/account/link-extension?product=kuracode-extension&challenge=...`.
3. User authenticates on `wefik.world` (existing Supabase Auth) and clicks **"Approve Extension Access"**.
4. Server generates a single-use 60-second auth code stored in Redis (`ext_code:{code} -> { user_id, product_id, challenge }`) and redirects to the extension's `chrome.identity.getRedirectURL()` or displays a copyable 1-time pairing code for manual installs.
5. Extension calls `POST /api/extension/token` with `{ code, code_verifier }`. Server verifies PKCE, generates a random 256-bit opaque token (`wfk_ext_...`), stores `SHA-256(token)` in `client_link_tokens`, and returns the plaintext token **once**.
6. Users can view `last_used_at` and click **Revoke** anytime under `/account/connections`.

**Security notes:**
- Store only `SHA-256` hash in `client_link_tokens` (if DB leaks, tokens cannot be replayed).
- Enforce `scopes` (`sync:read`, `sync:write`), rate-limit token exchange (`checkRateLimit`), and set an expiration/rotation policy (e.g. 90 days).
- Never accept wildcard CORS (`*`) on `/api/extension/token`; restrict or validate extension ID / PKCE challenge.

---

## 5. Admin Form Changes (`src/components/admin/product-admin-manager.tsx`)

1. Add a **"Create / Edit Product"** drawer supporting `delivery_type`, `billing_mode`, `external_install_url`, `app_url`, `docs_url`, `pricing_label`, `requires_domain_activation`, and `compatibility` fields.
2. Make the `.zip` file upload optional in **Publish New Version** when `product.delivery_type !== 'download'` (allowing version + changelog entries for extension releases and `weclip` updates without uploading a ZIP).

---

## 6. SEO & Structured Data (`src/app/products/[slug]/page.tsx`)

- **`download`:** Keep `@type: "Product"` (or `"SoftwareApplication"` for plugins/themes) with `Offer` in `INR`.
- **`external_install` & `hosted_app`:** Emit `@type: "SoftwareApplication"` with:
  - `applicationCategory`: `'BrowserApplication'` (Kuracode) or `'MultimediaApplication'` (`weclip`)
  - `operatingSystem`: `'Chrome, Edge, Firefox'` / `'Web'`
  - `installUrl` (for `external_install`) or `url` (`app_url` for `hosted_app`)
  - `offers`: `price: "0"` for free tier, or `UnitPriceSpecification` for subscription pricing.

---

## 7. Legal, Licensing & Trust Risks (Required Review Before Launch)

1. **Third-party assets inside the new WordPress theme:**
   - Any bundled fonts, icons, SVGs, stock photos, or JS libraries must have permissive commercial redistribution licenses (e.g. SIL OFL, MIT, GPL-compatible). Never ship Unsplash/Pexels photos or proprietary fonts inside downloadable ZIPs unless explicitly cleared; prefer system fonts / Google Fonts loaded cleanly or OFL-bundled WOFF2 + original/CC0 placeholders.
2. **Trademark & name clearance:**
   - Run trademark/package-registry checks before launch for **Site Checkup** (WordPress.org plugin directory & USPTO/India IP), **Kuracode** (Chrome Web Store, GitHub, npm), and **weclip** (SaaS/video tools, app stores).
3. **Terms for a media-clipping tool (`weclip`):**
   - Current `/terms` (`src/app/terms/page.tsx`) only covers downloadable code and accounts. `weclip` processes user-provided video/audio, requiring:
     - **Copyright & DMCA / Intermediary compliance:** User warrants they own or have rights to clip the source media; prohibited from ripping DRM-protected or third-party copyrighted streams.
     - **Media retention & privacy:** State clearly how long uploaded/clipped files are stored before auto-deletion, and whether any third-party AI/transcoding subprocessors are used (update `/privacy`).
     - **Fair-use / compute quotas:** Define monthly minute/render limits and file size caps for free trial vs paid plans.
4. **Updates needed to `/license` (`src/app/license/page.tsx`) and `/terms`:**
   - `/license` currently states all products are governed by Single-Site / Unlimited-Site domain deployment rules and lifetime patches. Add separate sections or clarifications for:
     - **Code Packs** (repo/project usage rights, no domain activation key).
     - **Browser Extensions** (client software EULA + store terms).
     - **Hosted SaaS (`weclip`)** (SaaS Terms of Service, not source-code modification rights).

---

## 8. Ordered, Independently Shippable Implementation Steps

| Step | Scope | Independently Testable Outcome |
| --- | --- | --- |
| **1. Schema & Types** | Apply `005_product_delivery_types.sql`, update `src/types/database.ts` & `normalizeProduct()` in `src/lib/data/products.ts`. | `tsc --noEmit` passes; existing 6 products default to `delivery_type = 'download'`. |
| **2. Download & Checkout Guards** | Guard `download-url`, `create-order`, and `razorpay-webhook` against non-download items. | Unit tests verify `download-url` returns `400` for `hosted_app`/`external_install`. |
| **3. Product Page & Card Branching** | Update `ProductDetailView`, `ProductCard`, `/account/library`, and JSON-LD in `products/[slug]/page.tsx` per `delivery_type`. | Visual + E2E check: `hosted_app` shows `Launch App` (no Download/Domain UI); `external_install` shows `Install Extension`. |
| **4. Compatibility & Changelog UI** | Render structured `compatibility` specs, `docs_url`, and version changelog list on `ProductDetailView`. | Verify WP/PHP/Next.js/Browser specs render cleanly when present and are omitted when empty. |
| **5. Admin Product & Release Form** | Extend `ProductAdminManager` to create/edit products, set `delivery_type`, and publish ZIP-less changelogs. | Admin can publish a release note for `Kuracode` or `weclip` without a `.zip` file. |
| **6. Kuracode Account Linking** | Build `/account/link-extension`, `POST /api/extension/token`, and `/account/connections` revoke UI. | Integration test: PKCE code exchange issues hashed token; revoked token returns `401`. |
| **7. Per-Product Subscriptions (`weclip`)** | Add `product_plans` checkout via `create-subscription` + webhook handler for `product_plans`. | Test subscription webhook activates `weclip` Pro plan and `cancelled` revokes access. |
| **8. Legal & Policy Updates** | Update `/terms`, `/license`, and `/privacy` for SaaS, media clipping, and non-ZIP code packs. | Owner legal sign-off prior to public launch of `weclip` and `Kuracode`. |

