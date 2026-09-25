import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/data/products';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wefik.world';
  const products = await getProducts();

  // Sort products by updated_at descending per Section 9
  const sorted = [...products].sort((a, b) => {
    const timeA = new Date(a.updated_at || a.created_at || '2026-09-22T00:00:00.000Z').getTime();
    const timeB = new Date(b.updated_at || b.created_at || '2026-09-22T00:00:00.000Z').getTime();
    return timeB - timeA;
  });

  const urls = sorted
    .map((p) => {
      const lastmod = new Date(p.updated_at || p.created_at || '2026-09-22T00:00:00.000Z').toISOString();
      return `  <url>
    <loc>${baseUrl}/products/${p.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
