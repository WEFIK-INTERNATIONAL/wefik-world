# 06 — Design and UX Audit

*Note: `node_modules` is not installed in this environment, so the Next.js dev server could not be started for live browser rendering inspection. Findings below are derived directly from `src/app/globals.css`, `src/app/layout.tsx`, `src/components/`, and `src/app/` UI code.*

---

## 1. Design System as Implemented

- **Typography (`src/app/layout.tsx`, `src/app/globals.css`)**:
  - Display: `Space Grotesk` (`600`, `700`) via `--font-space-grotesk` (`preload: true`).
  - Body: `Inter` (`400`, `500`, `600`) via `--font-inter` (`preload: false`).
  - Mono: `JetBrains Mono` (`500`) via `--font-jetbrains-mono` (`preload: false`).
  - Custom typography utility classes in `globals.css`: `.display-xl`, `.display-title`, `.heading-1`, `.heading-2`, `.heading-3`, `.body-lg`.
- **Colors & Dark Mode (`src/app/globals.css` lines 13–109)**:
  - Light mode (`:root`): `--bg: #FFFFFF`, `--surface: #F8F9FA`, `--surface-2: #EFF1EE`, `--text-primary: #202124`, `--text-secondary: #5F6368`, `--brand: #4F741B` (Deep Green), `--primary: #A3E635` (Lime).
  - Dark mode (`.dark`): `--bg: #0B0D0B`, `--surface: #141714`, `--surface-elevated: #1C211C`, `--text-primary: #EDEFEA`, `--text-secondary: #9AA39A`, `--brand: #8FCE3F`, `--primary: #A3E635`.
  - Status tokens: `--color-success: #34A853`, `--color-error: #EA4335`, `--color-warning: #FBBC04`, `--color-info: #4285F4`.
- **Radii (`src/app/globals.css` lines 103–108)**: `--radius-sm` (`10px`) through `--radius-2xl` (`20px`).
- **Component Variants (`src/components/ui/button.tsx`)**:
  - `cva`-based `Button` with 10 variants (`default`, `primary`, `lime`, `accent`, `green`, `destructive`, `outline`, `secondary`, `ghost`, `link`) and 4 sizes (`default`, `sm`, `lg`, `icon`).

---

## 2. Inconsistencies, Hardcoded Values & Mixed Styling

- **Mixed token systems**:
  - Components mix CSS variable syntax (`bg-[var(--surface)]`, `text-[var(--text)]`) with legacy Tailwind aliases (`text-ink`, `text-slate`, `bg-soft`, `border-border`) and raw Tailwind palette classes (`bg-zinc-950`, `text-amber-400`, `bg-blue-600`).
  - `src/components/ui/button.tsx` duplicates variants (`default` and `primary` are identical; `lime` and `accent` are identical) and hardcodes `#0a0f0a`, `#8fd32b`, `#3d5a15`, and `hover:bg-red-600` instead of theme tokens.
- **Hardcoded colors & inline styles**:
  - **168 hex color literals** across `.tsx`/`.ts` files in `src/` (including `product-admin-manager.tsx`, `checkout/page.tsx`, `bundles/page.tsx`, `pricing/page.tsx`, `(auth)/login/page.tsx`).
  - **35 inline `style={{...}}` blocks** across `src/` (e.g., `hero-lightweight.tsx` has 7, `before-after-slider.tsx` has 2, `unboxing-preloader.tsx` has 2, `safe-image.tsx` has 1).
- **Dark-only / off-brand internal route**:
  - `src/app/test-services/page.tsx` uses hardcoded `bg-zinc-950`, `bg-zinc-900`, `bg-blue-600`, ignoring `--bg`/`--surface` and light/dark theme switching.
- **Admin & Dashboard button inconsistency**:
  - `src/app/dashboard/page.tsx` (`line 89`) and `src/components/dashboard/download-list.tsx` (`lines 66, 106`) use `bg-ink hover:bg-black text-white`, which breaks contrast in dark mode where `--ink` resolves to `#EDEFEA` (light gray) with `text-white`!

---

## 3. Missing States, Accessibility & Responsive Issues

- **Missing/broken states**:
  - **Reviews on `/products/[slug]`**: `initialReviews` is never fetched server-side (`products/[slug]/page.tsx`), so the reviews list always starts empty (`[]`), and submitting a review fails silently or toasts a Postgres column error.
  - **Order history & Account overview**: Due to schema column mismatches (`total_amount_inr`, `amount_inr`, `is_active`), `/account`, `/account/orders`, `/order-success`, and `/admin/orders` fail to load data or redirect to `/403` rather than showing meaningful empty/error states.
- **Accessibility**:
  - `src/app/globals.css` (`lines 141–144`) defines `*:focus-visible` with `outline: 2px solid var(--primary)` (lime `#A3E635`). On light `#FFFFFF` backgrounds, `#A3E635` has low contrast (~1.5:1) against white, failing WCAG 2.1 focus-indicator contrast (3:1 minimum).
  - `src/components/freebies/freebie-magnet-kit.tsx` uses a raw `<img>` tag instead of `<SafeImage>`/`<Image>`.
  - `src/components/layout/footer.tsx` (`line 77`) uses `text-lime` on `var(--surface)` (`#F8F9FA`) for the mail icon, which has low contrast in light mode.
- **Responsive**:
  - Fixed header height is measured dynamically via JS in `src/components/layout/header.tsx` (`lines 51–66`) into `--header-height`; if JS is delayed or disabled, `[id] { scroll-margin-top }` relies on the `4rem` default.

---

## 4. Generic / AI-Generated / Templated Artifacts

- **Mismatched copy & leftover markers**:
  - `src/app/page.tsx` (`line 49`) claims `Next.js 15` while `package.json` runs `Next.js 16.3.5`.
  - `src/app/page.tsx` (`line 120`) says *"Start free. No account needed."* while free claims require login.
  - `src/app/admin/page.tsx` (`line 106`) falls back to `{productCount ?? 6}` (hardcoded `6` from seed data).
  - `src/app/layout.tsx` (`line 98`) sets `openGraph.locale: "en_IE"` (Ireland) on an INR/India-focused marketplace (`en_IN`).
  - Comments reference numbered fix-packs (`P0-1`, `P0-2`, `P0-4`, `P1-10`, `Fix 2`, `Fix 4`, `Fix 6`, `Fix 8`, `Fix 12`, `Fix 15`, `Fix 16`, `Section 5`, `Part C1`) across code from multiple AI/dev passes, leaving inconsistent naming (`amount_inr` vs `total_amount`, `/dashboard` vs `/account`).

