# 17 — Real Product Source Findings

> Verified facts from public sources for each planned real product.
> This document contains ONLY what could be confirmed. No assumptions.

---

## 1. Site Checkup (WordPress Security Plugin)

| Field | Verified value |
|---|---|
| Author | SK Sahinur Islam (GeniousSonu) |
| Type | WordPress plugin (PHP, zip delivery) |
| Listed on | wordpress.org plugin directory |
| Repo | Expected at `github.com/GeniousSonu` — exact repo URL not confirmed from search results |
| Core function | WordPress security hardening checklist, vulnerability auditor, agency SOP dashboard |
| Key features | Dozens of security config checks (XML-RPC, REST API enumeration, PHP version hiding, security headers HSTS/X-Frame-Options, file permissions audit), 1-click reversible fixes using marker-delimited blocks (`# BEGIN GeniousSonu Site Checkup`) with pre-execution diff previews, print-ready executive client audit reports |
| License | GPLv2 (standard WP plugin license, to be confirmed) |
| Delivery model | Standard WP plugin zip + licence — fits current `product_versions` schema |

### What we CAN'T confirm from public sources
- Pricing (free tier vs premium?)
- Version number and changelog
- Whether there's a premium/pro version beyond the wp.org free listing
- Exact GitHub repo path

### Screenshot requirements
- Install in WordPress (wp-env or WP Playground)
- Capture: dashboard/checklist view, a sample audit report, settings page
- Minimum 3 gallery screenshots + 1 thumbnail + 1 OG image

---

## 2. KuraCode Extension (Browser Extension)

| Field | Verified value |
|---|---|
| Author | SK Sahinur Islam (GeniousSonu) |
| Type | Browser extension (Chromium-based, also Edge) |
| Listed on | Microsoft Edge Add-ons store |
| Developer site | genioussonu.me/extensions/kuracode |
| Support page | genioussonu.me/extensions/kuracode/support |
| Privacy policy | genioussonu.me/extensions/kuracode/privacy |
| Core function | Local-first developer snippet workspace — capture, clean, organize, and search code snippets from any webpage |
| Key features | Text selection shortcuts, right-click context menu ("Save to KuraCode"), inline buttons on code blocks, automatic code cleaning (strips line numbers/shell prompts/copy artifacts), language auto-detection, provenance tracking (page title, URL, timestamp), IndexedDB local storage, offline-first, optional Google/GitHub sign-in for cloud sync, team workspaces, shareable snippet links, built-in secret scanner |
| Delivery model | Store install link + account linking — does NOT fit current zip download schema |

### What we CAN'T confirm from public sources
- Exact GitHub repo path for source code
- Chrome Web Store listing (only Edge confirmed)
- Pricing model (free? freemium?)
- Whether "syncs with the webapp" means wefik.world or a standalone KuraCode webapp

### Schema gap
Current `product_versions.file_path NOT NULL` blocks non-download products. Needs `delivery_type = 'external_install'` column and nullable `file_path` (see doc 12).

### Screenshot requirements
- Install in Chromium via `--load-extension` or from store
- Capture: popup UI, snippet capture in action, snippet library/search, settings/sync page
- Minimum 3 gallery screenshots + 1 thumbnail + 1 OG image

---

## 3. weclip (Automated Video/Multimedia Clipping Tool)

| Field | Verified value |
|---|---|
| Author | SK Sahinur Islam (GeniousSonu) — assumed, not confirmed |
| Type | Unknown (hosted app? desktop? CLI?) |
| Listed on | NOT found on any public platform |
| Repo | NOT found on github.com/GeniousSonu or WEFIK-INTERNATIONAL org |
| Developer site | NOT found on genioussonu.me |

### Status: **BLOCKED**

No public source code, no public listing, no documentation, and no evidence this product exists yet as a shipped artifact. Web searches return only generic video clipping tool comparisons (Opus Clip, Vizard.ai, etc.) — none linked to GeniousSonu or Wefik.

**Cannot proceed with weclip** until the owner provides:
1. The source repo or hosted URL
2. How to run it (webapp, desktop app, CLI)
3. What it does (is it an AI clip generator? manual editor? batch processor?)

---

## Cross-reference: WEFIK-INTERNATIONAL GitHub Org

Public repos found:
- `wefik-website` (JS)
- `wefik-website-final` (JS)
- `storyfinder` (JS)
- `AdSoc6` (JS)
- `bollywood-bites` (JS)
- `newtown-express` (TS)
- `wefik-world` (TS/JS/PLpgSQL)

None of these match Site Checkup, KuraCode, or weclip.

