# Search Engine Verification & Sitemap Submission Guide (Day 1)

This document provides exact steps to verify **wefik.world** on Google Search Console (GSC) and Bing Webmaster Tools, and submit all sitemaps on Day 1.

---

## 1. Verification Methods

### Option A: HTML Tag (Already Wired in `src/app/layout.tsx`)
1. **Google Search Console**:
   - Go to [Google Search Console](https://search.google.com/search-console).
   - Add property: `https://wefik.world` (URL prefix) or Domain.
   - Choose **HTML tag** verification. Copy the `content="..."` token.
   - Add to `.env.local` / Vercel Environment Variables:
     ```bash
     NEXT_PUBLIC_GSC_VERIFICATION=your_google_token_here
     ```
2. **Bing Webmaster Tools**:
   - Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
   - Add site: `https://wefik.world`. You can import directly from Google Search Console (1-click) or copy the HTML meta tag code `msvalidate.01`.
   - Add to `.env.local` / Vercel Environment Variables:
     ```bash
     NEXT_PUBLIC_BING_VERIFICATION=your_bing_token_here
     ```

### Option B: DNS TXT Record via Cloudflare (Recommended for Domain Properties)
- Type: `TXT`
- Name: `@`
- Content: `google-site-verification=...`
- TTL: Auto

---

## 2. Sitemap Submission URLs

Submit each of the following XML sitemaps in both Google Search Console and Bing Webmaster Tools:

| Sitemap Name | Full URL | Contents |
| :--- | :--- | :--- |
| **Primary Index** | `https://wefik.world/sitemap.xml` | Index linking all sub-sitemaps |
| **Products** | `https://wefik.world/sitemap-products.xml` | All active marketplace products |
| **Content** | `https://wefik.world/sitemap-content.xml` | Blog posts, guides, glossary terms |
| **Programmatic** | `https://wefik.world/sitemap-programmatic.xml` | Category hubs, alternatives, collections, use-cases |

---

## 3. Post-Submission Checklist
- [ ] Check Coverage tab after 48 hours for 0 errors.
- [ ] Test live URL inspection for `https://wefik.world/` and verify mobile friendliness.
- [ ] Enable weekly performance email alerts in Search Console.
