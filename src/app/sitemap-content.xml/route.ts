import { NextResponse } from 'next/server';
import { SEED_POSTS } from '@/lib/sanity/seed-posts';
import { GLOSSARY_TERMS } from '@/lib/seo/programmatic-data';

export const revalidate = 86400;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.wefik.world';
  const glossaryLastmod = '2026-09-22T00:00:00.000Z';

  // Latest blog post date for /blog hub
  const latestPostDate = SEED_POSTS.reduce((latest, post) => {
    const postTime = new Date(post.publishedAt).getTime();
    return postTime > latest ? postTime : latest;
  }, new Date('2026-03-20T00:00:00.000Z').getTime());
  const blogHubLastmod = new Date(latestPostDate).toISOString();

  // Content Hubs
  const contentHubs = [
    { loc: `${baseUrl}/blog`, priority: '0.8', changefreq: 'daily', lastmod: blogHubLastmod },
    { loc: `${baseUrl}/glossary`, priority: '0.7', changefreq: 'weekly', lastmod: glossaryLastmod },
  ];

  // Blog posts (real publishedAt from Sanity seed)
  const blogUrls = SEED_POSTS.map((post) => ({
    loc: `${baseUrl}/blog/${post.slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: new Date(post.publishedAt).toISOString(),
  }));

  // Educational Glossary Terms
  const glossaryUrls = Object.keys(GLOSSARY_TERMS).map((slug) => ({
    loc: `${baseUrl}/glossary/${slug}`,
    priority: '0.6',
    changefreq: 'monthly',
    lastmod: glossaryLastmod,
  }));

  const allUrls = [...contentHubs, ...blogUrls, ...glossaryUrls]
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
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
