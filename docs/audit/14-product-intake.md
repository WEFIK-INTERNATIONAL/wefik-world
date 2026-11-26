# 14 — Product Intake Checklist (Owner Action Required)

> For each of the five upcoming products, items marked **[MANDATORY]** must be provided before launch.

---

## 1. Site Checkup (WordPress Security Plugin — `download`)

| Field | Status / Requirement |
| --- | --- |
| **Name & Slug** **[MANDATORY]** | Final product title & URL slug (e.g. `site-checkup-security`). |
| **One-line Summary (`tagline`)** **[MANDATORY]** | 10–18 words describing what it scans/protects. |
| **Target Audience (`primary_use_case`)** **[MANDATORY]** | e.g. WordPress agencies, WooCommerce stores, site maintainers. |
| **Delivery Type** **[MANDATORY]** | `download` (ZIP + cryptographic license key). |
| **Price / Free Tier** **[MANDATORY]** | Single-Site price in whole INR (or `is_free = true`); confirm Unlimited-Site multiplier (`2.0x` vs `2.5x`). |
| **License Terms** **[MANDATORY]** | Confirm `Single-Site` (1 domain) & `Unlimited-Site` domain activation applies; confirm GPL-compatible PHP headers. |
| **Supported Versions** **[MANDATORY]** | Minimum & tested WordPress version (e.g. `6.4–6.7`), PHP version (`8.1–8.3`). |
| **Version Number & Changelog** **[MANDATORY]** | Initial semver (e.g. `1.0.0`) + release notes + `.zip` build artifact. |
| **Screenshots (`thumbnail_url` + `gallery_urls`)** **[MANDATORY]** | Real plugin admin UI screenshots (16:10 `1200×750` or `1600×1000` WebP, zero stock photos) + `image_alt`. |
| **Demo & Docs Links** | Optional sandbox `demo_url`; `docs_url` for setup/scan rules (recommended). |
| **Requirements** **[MANDATORY]** | Server extensions / cron / WP permissions needed. |
| **Support Terms** **[MANDATORY]** | Confirm standard email/desk support scope and update cadence. |

---

## 2. Original WordPress Theme / Template (`download`)

| Field | Status / Requirement |
| --- | --- |
| **Name & Slug** **[MANDATORY]** | Original theme name & slug (trademark-checked). |
| **One-line Summary (`tagline`)** **[MANDATORY]** | 10–18 words (e.g. niche, FSE/block vs classic). |
| **Target Audience (`primary_use_case`)** **[MANDATORY]** | e.g. Creative agencies, SaaS marketing, restaurants, portfolios. |
| **Delivery Type** **[MANDATORY]** | `download` (ZIP + license key). |
| **Price / Free Tier** **[MANDATORY]** | Single-Site price in whole INR. |
| **License Terms** **[MANDATORY]** | Confirm commercial rights + **asset provenance** (confirm all bundled fonts, icons, and demo images are 100% redistributable). |
| **Supported Versions** **[MANDATORY]** | Minimum & tested WordPress version, PHP version, Gutenberg/FSE compatibility. |
| **Version Number & Changelog** **[MANDATORY]** | Initial semver (e.g. `1.0.0`) + changelog + `.zip` theme package. |
| **Screenshots (`thumbnail_url` + `gallery_urls`)** **[MANDATORY]** | Real desktop + mobile screenshots of the theme itself (16:10 WebP) + `image_alt`. |
| **Demo & Docs Links** **[MANDATORY]** | Live `demo_url` (for `LiveDemoViewer`) and `docs_url` (setup/pattern import guide). |
| **Requirements** | Required plugins (if any; note "zero page builder" if FSE-only). |
| **Support Terms** **[MANDATORY]** | Confirm defect/compatibility support scope. |

---

## 3. Animated Next.js Components Code Pack (`download`)

| Field | Status / Requirement |
| --- | --- |
| **Name & Slug** **[MANDATORY]** | Final pack name & slug. |
| **One-line Summary (`tagline`)** **[MANDATORY]** | 10–18 words stating component count and animation stack. |
| **Target Audience (`primary_use_case`)** **[MANDATORY]** | Next.js / React frontend engineers and agencies. |
| **Delivery Type** **[MANDATORY]** | `download` (ZIP of TypeScript/React source; `requires_domain_activation = false`). |
| **Price / Free Tier** **[MANDATORY]** | Price in whole INR (and clarify whether Unlimited-Site / Team seat applies instead of domain count). |
| **License Terms** **[MANDATORY]** | Confirm project/seat license rules (what is allowed in client apps vs banned from component-library resale). |
| **Supported Versions** **[MANDATORY]** | Next.js (`16+`), React (`19+`), TypeScript (`5+`), Tailwind CSS (`v4`), GSAP/Framer Motion versions. |
| **Version Number & Changelog** **[MANDATORY]** | Initial semver + changelog + `.zip` source archive. |
| **Screenshots / Previews** **[MANDATORY]** | Real screenshots or animated WebP/MP4 previews of the actual components (16:10) + `image_alt`. |
| **Demo & Docs Links** **[MANDATORY]** | Interactive component showcase `demo_url` + copy-paste/install `docs_url`. |
| **Requirements** **[MANDATORY]** | Peer dependencies (`npm` packages, Node.js `20+`). |
| **Support Terms** **[MANDATORY]** | Confirm bug-fix/update policy (not custom integration). |

---

## 4. Kuracode Extension (`external_install`)

| Field | Status / Requirement |
| --- | --- |
| **Name & Slug** **[MANDATORY]** | `Kuracode Extension` & slug (e.g. `kuracode-extension`). |
| **One-line Summary (`tagline`)** **[MANDATORY]** | 10–18 words explaining what it does and what syncs with `wefik.world`. |
| **Target Audience (`primary_use_case`)** **[MANDATORY]** | Target developer/user workflow. |
| **Delivery Type** **[MANDATORY]** | `external_install` (Chrome/Edge/Firefox Web Store link + manual unpacked instructions + account linking). |
| **Price / Free Tier** **[MANDATORY]** | Free base install vs paid Pro sync tier (`pricing_label` + INR price if paid). |
| **License Terms** **[MANDATORY]** | Extension EULA + data sync permissions + what happens if a paid tier expires. |
| **Supported Versions** **[MANDATORY]** | Supported browsers & minimum versions (e.g. Chrome `120+`, Edge `120+`, Firefox `121+`, Manifest V3). |
| **Version Number & Changelog** **[MANDATORY]** | Current store version (e.g. `1.0.0`) + changelog (no ZIP required). |
| **Screenshots (`thumbnail_url` + `gallery_urls`)** **[MANDATORY]** | Real extension popup/sidepanel/workflow screenshots (16:10 WebP) + `image_alt`. |
| **Install, Demo & Docs Links** **[MANDATORY]** | `external_install_url` (store listing), `docs_url` (manual install + account-linking guide), and optional `demo_url`. |
| **Requirements & Permissions** **[MANDATORY]** | Justification for browser permissions requested (host permissions, storage, identity) for privacy disclosure. |
| **Support Terms** **[MANDATORY]** | Support channel & bug-fix policy. |

---

## 5. weclip — Automated Video & Multimedia Clipping Tool (`hosted_app`)

| Field | Status / Requirement |
| --- | --- |
| **Name & Slug** **[MANDATORY]** | `weclip` & slug (e.g. `weclip`). |
| **One-line Summary (`tagline`)** **[MANDATORY]** | 10–18 words explaining automated clipping output. |
| **Target Audience (`primary_use_case`)** **[MANDATORY]** | Creators, podcasts, marketing teams, agencies. |
| **Delivery Type** **[MANDATORY]** | `hosted_app` (`app_url` + trial/subscription). |
| **Price, Free Tier & Quotas** **[MANDATORY]** | Exact free trial / free tier limits (minutes, exports, watermark, retention) and paid Razorpay subscription tiers in INR (`month` / `year`). |
| **License & Acceptable Use Terms** **[MANDATORY]** | SaaS ToS: copyright/DMCA warranty, prohibited content, media retention window, and subprocessor list for `/privacy`. |
| **Supported Platforms / Input Formats** **[MANDATORY]** | Supported browsers, max file size/duration, supported video/audio formats (MP4, MOV, WebM, etc.). |
| **Version / Release & Changelog** | Current app release tag + changelog. |
| **Screenshots (`thumbnail_url` + `gallery_urls`)** **[MANDATORY]** | Real `weclip` workspace/timeline/export screenshots (16:10 WebP) + `image_alt`. |
| **App, Demo & Docs Links** **[MANDATORY]** | `app_url` (production app entry), `docs_url` (usage/limits), optional interactive `demo_url`. |
| **Requirements** | Account requirement, minimum browser/WebCodecs support (if client-side). |
| **Support Terms** **[MANDATORY]** | Support SLA, refund policy for SaaS subscriptions, and cancellation terms. |

