import { NextResponse } from 'next/server';
import { SEED_POSTS } from '@/lib/sanity/seed-posts';
import { GLOSSARY_TERMS } from '@/lib/seo/programmatic-data';

export const revalidate = 86400;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wefik.world';
  const now = new Date().toISOString();

  const staticContent = [
    { loc: `${baseUrl}/about`, priority: '0.8', changefreq: 'monthly', lastmod: '2026-09-22T00:00:00.000Z' },
    { loc: `${baseUrl}/pricing`, priority: '0.9', changefreq: 'weekly', lastmod: now },
    { loc: `${baseUrl}/faqs`, priority: '0.8', changefreq: 'monthly', lastmod: '2026-09-22T00:00:00.000Z' },
    { loc: `${baseUrl}/licensing`, priority: '0.8', changefreq: 'monthly', lastmod: '2026-09-22T00:00:00.000Z' },
    { loc: `${baseUrl}/blog`, priority: '0.8', changefreq: 'daily', lastmod: now },
    { loc: `${baseUrl}/glossary`, priority: '0.8', changefreq: 'weekly', lastmod: now },
  ];

  const blogUrls = SEED_POSTS.map((post) => ({
    loc: `${baseUrl}/blog/${post.slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: new Date(post.publishedAt).toISOString(),
  }));

  const glossaryUrls = Object.keys(GLOSSARY_TERMS).map((slug) => ({
    loc: `${baseUrl}/glossary/${slug}`,
    priority: '0.6',
    changefreq: 'monthly',
    lastmod: '2026-09-22T00:00:00.000Z',
  }));

  const allUrls = [...staticContent, ...blogUrls, ...glossaryUrls]
    .map(
      (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
