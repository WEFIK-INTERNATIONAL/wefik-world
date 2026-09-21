# wefik.world — DNS & Domain Setup Guide

This guide documents pointing the apex domain `wefik.world` and subdomain `www.wefik.world` from Cloudflare DNS to Vercel hosting.

---

## 1. Prerequisites
- **Domain**: `wefik.world` (registered on your registrar, e.g. Namecheap, Porkbun, or Cloudflare Registrar)
- **Nameservers**: Set to Cloudflare (e.g. `ada.ns.cloudflare.com`, `bob.ns.cloudflare.com`)
- **Hosting**: Vercel project created and linked to GitHub repository `wefikinternational/wefik-world`

---

## 2. Cloudflare DNS Configuration

In your Cloudflare Dashboard -> **DNS** -> **Records**, add the following:

| Type  | Name            | Content              | Proxy Status | TTL  |
|-------|-----------------|----------------------|--------------|------|
| `A`   | `@`             | `76.76.21.21`        | DNS Only (Grey Cloud) / Proxied* | Auto |
| `CNAME` | `www`         | `cname.vercel-dns.com` | DNS Only (Grey Cloud) / Proxied* | Auto |

> [!IMPORTANT]
> **Cloudflare Proxying (Orange Cloud)**:
> When first verifying the domain in Vercel, set the Proxy status to **DNS Only** (Grey Cloud) so Vercel can issue the Let's Encrypt SSL certificate. Once Vercel shows "Valid Configuration", you may switch to **Proxied** (Orange Cloud) for Cloudflare WAF, DDoS mitigation, and edge caching.
> In Cloudflare SSL/TLS settings, ensure encryption mode is set to **Full (Strict)** to avoid redirect loops with Vercel.

---

## 3. Cloudflare SSL/TLS and Page Rules
1. **SSL/TLS Mode**: **Full (Strict)**
2. **Always Use HTTPS**: **Enabled** (Edge Certificates -> Always Use HTTPS)
3. **Minimum TLS Version**: **TLS 1.2**
4. **Security Headers**: Managed in `next.config.ts` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
5. **Page Rule (Redirect Apex to WWW or vice versa)**:
   - If canonical is `https://wefik.world/*`:
     `http://www.wefik.world/*` -> 301 Redirect to `https://wefik.world/$1`

---

## 4. Vercel Domain Configuration
1. Go to **Vercel Dashboard** -> Project **wefik-world** -> **Settings** -> **Domains**.
2. Add:
   - `wefik.world` (Primary domain)
   - `www.wefik.world` (Redirects to `wefik.world`)
3. Wait for DNS propagation and SSL certificate issuance.
