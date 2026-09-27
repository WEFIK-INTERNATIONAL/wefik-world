import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/data/products';

export const revalidate = 3600;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.wefik.world';
  const products = await getProducts();

  // Sort products by updated_at descending
  const sorted = [...products].sort((a, b) => {
    const timeA = new Date(a.updated_at || a.created_at || '2026-09-22T00:00:00.000Z').getTime();
    const timeB = new Date(b.updated_at || b.created_at || '2026-09-22T00:00:00.000Z').getTime();
    return timeB - timeA;
  });

  const urls = sorted
    .map((p) => {
      const lastmod = new Date(p.updated_at || p.created_at || '2026-09-22T00:00:00.000Z').toISOString();
      const productUrl = `${baseUrl}/products/${p.slug}`;

      // B3: Real product images (CDN / absolute URL, no placeholders)
      const images: string[] = [];
      if (p.thumbnail_url && p.thumbnail_url.startsWith('http') && !p.thumbnail_url.includes('placeholder')) {
        images.push(p.thumbnail_url);
      }
      if (Array.isArray(p.gallery_urls)) {
        p.gallery_urls.forEach((url) => {
          if (url && url.startsWith('http') && !url.includes('placeholder') && !images.includes(url)) {
            images.push(url);
          }
        });
      }

      const imageTags = images
        .slice(0, 5) // Google allows up to 1,000 images per page; 5 primary shots is optimal
        .map(
          (img) => `    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(p.title)}</image:title>
      <image:caption>${escapeXml(p.tagline || p.title)}</image:caption>
    </image:image>`
        )
        .join('\n');

      return `  <url>
    <loc>${productUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
${imageTags ? imageTags + '\n' : ''}  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
