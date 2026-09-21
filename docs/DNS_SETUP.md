# DNS & Hosting Configuration Guide: Cloudflare to Vercel

This document outlines the official production DNS and CDN setup for **wefik.world** linking Cloudflare (DNS/WAF) to Vercel (Next.js Application Hosting).

---

## 1. Domain Registration & Nameservers
1. Purchase or transfer the domain **wefik.world**.
2. Point your registrar nameservers to Cloudflare:
   - \`ns1.cloudflare.com\`
   - \`ns2.cloudflare.com\`

---

## 2. Cloudflare DNS Records
In your Cloudflare dashboard under **DNS → Records**, add the following:

| Type  | Name | Content / Target       | Proxy Status | TTL  | Purpose               |
|-------|------|------------------------|--------------|------|-----------------------|
| CNAME | @    | \`cname.vercel-dns.com\` | Proxied (Orange) | Auto | Apex domain root      |
| CNAME | www  | \`cname.vercel-dns.com\` | Proxied (Orange) | Auto | WWW subdomain redirect|

> [!NOTE]
> Cloudflare automatically performs **CNAME Flattening** for apex (\`@\`) domains.

---

## 3. SSL / TLS Settings (Critical)
To prevent infinite redirect loops (\`ERR_TOO_MANY_REDIRECTS\`):
1. Navigate to **SSL/TLS → Overview** in Cloudflare.
2. Select encryption mode: **Full (Strict)**.
3. Under **Edge Certificates**:
   - Enable **Always Use HTTPS**.
   - Enable **Automatic HTTPS Rewrites**.
   - Minimum TLS Version: **TLS 1.2**.

---

## 4. Caching & Performance Rules
1. Navigate to **Caching → Cache Rules**.
2. **Rule 1: Next.js Static Assets**
   - Field: \`URI Path starts with\` → \`/_next/static/\`
   - Cache Eligibility: **Eligible for cache**
   - Edge TTL: **1 Month**
   - Browser TTL: **1 Month**
3. **Rule 2: Bypass Dynamic Routes**
   - Field: \`URI Path starts with\` → \`/api/\` OR \`/dashboard/\` OR \`/admin/\` OR \`/checkout/\` OR \`/studio/\`
   - Cache Eligibility: **Bypass cache**

---

## 5. Web Application Firewall (WAF)
In Cloudflare **Security → WAF**:
1. **Bot Fight Mode**: Enable.
2. **Rate Limiting Rule**:
   - Target: \`/api/revalidate\`
   - Action: Block requests exceeding 20 requests per 10 seconds.
