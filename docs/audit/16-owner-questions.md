# 16 — Owner Questions (Blocking)

> Questions that must be answered before real products can be added.
> Items marked 🔴 block all progress on that product.

---

## Site Checkup

| # | Question | Why it matters |
|---|---|---|
| 1 | 🔴 What is the GitHub repo URL (or local path) for Site Checkup? | Need source to install, run, and screenshot |
| 2 | Is Site Checkup free on wp.org with a separate premium/pro version, or one product? | Determines pricing and whether we need two product entries |
| 3 | What is the current version number? | Needed for the product_versions row |
| 4 | What price should it be listed at on wefik.world? (If premium exists) | Cannot invent pricing |
| 5 | Does it require a licence key activation like the current products, or just the wp.org install? | Affects delivery flow |
| 6 | What category should it be in? `wordpress-plugins` exists. Confirm or add new. | Seed SQL needs a category_id |

## KuraCode Extension

| # | Question | Why it matters |
|---|---|---|
| 7 | 🔴 What is the GitHub repo URL (or local path) for KuraCode? | Need source to install and screenshot |
| 8 | Is it on the Chrome Web Store, or only Edge Add-ons? | Determines install link and store badges |
| 9 | Is KuraCode free, freemium, or paid? What is the pricing? | Cannot invent pricing |
| 10 | When you said "syncs with the webapp" — does it sync with wefik.world, or a separate KuraCode webapp? | Affects the product page copy, account linking flow, and schema |
| 11 | What category should it be in? Current categories are WP-focused. Add `browser-extensions`? | Need a new category row |
| 12 | Does KuraCode need a licence key, or just a store install + optional sign-in? | Determines whether the current licence schema applies |

## weclip

| # | Question | Why it matters |
|---|---|---|
| 13 | 🔴 Does weclip exist as shipped software? We found no source, no listing, no docs. | Cannot proceed at all without this |
| 14 | If it exists: what is the repo URL or hosted URL? | Need to install/access and screenshot |
| 15 | How is it delivered? Hosted webapp, desktop app, CLI tool? | Determines `delivery_type` |
| 16 | Is it free, subscription, or one-time purchase? What pricing? | Cannot invent pricing |
| 17 | What category? `tools`, `multimedia`, something new? | Need a category row |

## General

| # | Question | Why it matters |
|---|---|---|
| 18 | Are there any existing live orders or licences for the 6 demo products in the production database? | Determines whether we can DELETE demo products or only ARCHIVE them |
| 19 | Should the blog seed posts file (`src/lib/sanity/seed-posts.ts`) be deleted? It references demo products and fake authors but may not be used in production. | Cleanup |
| 20 | Should we keep the `/bundles` and `/freebies` pages visible (with empty states), or hide them from navigation until real products exist in those categories? | UX decision |
| 21 | The `hero-poster.tsx` component (the decorative glassmorphic card stack) hardcodes "AgencyPro FSE" and is not used by the current hero. Delete it? | Cleanup |
| 22 | The `before-after-slider.tsx` defaults to "AgencyPro FSE" label. Should it remain as a reusable component with neutral defaults, or be removed? | Cleanup |


## Marketplace Copy Removed (Part 1)

| Removed string | Reason / question |
|---|---|
| `"Digital Products Marketplace"` | Replaced with plain `"Marketplace"` H1. |
| `"Single-vendor engineering by Wefik"` | Removed from marketplace subtitle; confirm if any ownership tagline is needed. |
| `"Verified commercial rights"` | Replaced with factual product count and `"Licence details"` link to `/license`. |
