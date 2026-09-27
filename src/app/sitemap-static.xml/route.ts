import { NextResponse } from 'next/server';

export const revalidate = 86400;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.wefik.world';
  // Real last content edit date for static core pages
  const staticLastmod = '2026-09-27T00:00:00.000Z';
  const legalLastmod = '2026-09-22T00:00:00.000Z';

  // Sane priority & changefreq per Part B2
  const staticRoutes = [
    { loc: `${baseUrl}`, priority: '1.0', changefreq: 'daily', lastmod: staticLastmod },
    { loc: `${baseUrl}/marketplace`, priority: '0.9', changefreq: 'daily', lastmod: staticLastmod },
    { loc: `${baseUrl}/bundles`, priority: '0.8', changefreq: 'weekly', lastmod: staticLastmod },
    { loc: `${baseUrl}/freebies`, priority: '0.8', changefreq: 'weekly', lastmod: staticLastmod },
    { loc: `${baseUrl}/pricing`, priority: '0.9', changefreq: 'weekly', lastmod: staticLastmod },
    { loc: `${baseUrl}/about`, priority: '0.7', changefreq: 'monthly', lastmod: staticLastmod },
    { loc: `${baseUrl}/contact`, priority: '0.7', changefreq: 'monthly', lastmod: staticLastmod },
    { loc: `${baseUrl}/faqs`, priority: '0.7', changefreq: 'weekly', lastmod: staticLastmod },
    { loc: `${baseUrl}/licensing`, priority: '0.7', changefreq: 'monthly', lastmod: staticLastmod },
    // Category Hubs
    { loc: `${baseUrl}/wordpress-themes`, priority: '0.8', changefreq: 'daily', lastmod: staticLastmod },
    { loc: `${baseUrl}/wordpress-plugins`, priority: '0.8', changefreq: 'daily', lastmod: staticLastmod },
    { loc: `${baseUrl}/html-templates`, priority: '0.8', changefreq: 'weekly', lastmod: staticLastmod },
    { loc: `${baseUrl}/code-snippets`, priority: '0.8', changefreq: 'weekly', lastmod: staticLastmod },
    // Legal & Policy Pages (sane lower priority, single /delivery, no /status)
    { loc: `${baseUrl}/terms`, priority: '0.4', changefreq: 'yearly', lastmod: legalLastmod },
    { loc: `${baseUrl}/privacy`, priority: '0.4', changefreq: 'yearly', lastmod: legalLastmod },
    { loc: `${baseUrl}/refunds`, priority: '0.4', changefreq: 'yearly', lastmod: legalLastmod },
    { loc: `${baseUrl}/license`, priority: '0.4', changefreq: 'yearly', lastmod: legalLastmod },
    { loc: `${baseUrl}/cookies`, priority: '0.4', changefreq: 'yearly', lastmod: legalLastmod },
    { loc: `${baseUrl}/membership-terms`, priority: '0.4', changefreq: 'yearly', lastmod: legalLastmod },
    { loc: `${baseUrl}/delivery`, priority: '0.4', changefreq: 'yearly', lastmod: legalLastmod },
  ];

  const urlTags = staticRoutes
    .map(
      (r) => `  <url>
    <loc>${r.loc}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlTags}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
