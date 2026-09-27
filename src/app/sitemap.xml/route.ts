import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/data/products';
import { SEED_POSTS } from '@/lib/sanity/seed-posts';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.wefik.world';

  // Real latest lastmod from products
  const products = await getProducts();
  const latestProduct = products.reduce((latest, p) => {
    const pTime = new Date(p.updated_at || p.created_at || '2026-09-22T00:00:00.000Z').getTime();
    return pTime > latest ? pTime : latest;
  }, new Date('2026-09-22T00:00:00.000Z').getTime());
  const productLastmod = new Date(latestProduct).toISOString();

  // Real latest lastmod from blog posts
  const latestPost = SEED_POSTS.reduce((latest, post) => {
    const postTime = new Date(post.publishedAt).getTime();
    return postTime > latest ? postTime : latest;
  }, new Date('2026-03-20T00:00:00.000Z').getTime());
  const contentLastmod = new Date(latestPost).toISOString();

  // Static pages last real content edit
  const staticLastmod = '2026-09-27T00:00:00.000Z';
  const programmaticLastmod = '2026-09-22T00:00:00.000Z';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
    <lastmod>${staticLastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-products.xml</loc>
    <lastmod>${productLastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-content.xml</loc>
    <lastmod>${contentLastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-programmatic.xml</loc>
    <lastmod>${programmaticLastmod}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
