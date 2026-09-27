import { NextResponse } from 'next/server';
import {
  USE_CASE_PAGES,
  ALTERNATIVES_PAGES,
  COMPARE_PAGES,
  FREE_HUBS,
  COLLECTIONS_PAGES,
} from '@/lib/seo/programmatic-data';

export const revalidate = 86400;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.wefik.world';
  const now = '2026-09-22T00:00:00.000Z';

  const urls: { loc: string; priority: string; changefreq: string }[] = [];

  // Flagship marketplace comparison
  urls.push({
    loc: `${baseUrl}/themeforest-alternative`,
    priority: '0.8',
    changefreq: 'weekly',
  });

  // Use-Case Pages
  Object.keys(USE_CASE_PAGES).forEach((slug) => {
    if (slug.includes('html-templates')) {
      const cleanSlug = slug.replace('html-templates-', '');
      urls.push({
        loc: `${baseUrl}/html-templates/${cleanSlug}`,
        priority: '0.7',
        changefreq: 'weekly',
      });
    } else if (slug.includes('wordpress-plugins')) {
      const cleanSlug = slug.replace('wordpress-plugins-', '');
      urls.push({
        loc: `${baseUrl}/wordpress-plugins/${cleanSlug}`,
        priority: '0.7',
        changefreq: 'weekly',
      });
    } else {
      const cleanSlug = slug.replace('wordpress-themes-', '');
      urls.push({
        loc: `${baseUrl}/wordpress-themes/${cleanSlug}`,
        priority: '0.7',
        changefreq: 'weekly',
      });
    }
  });

  // Alternatives Pages
  Object.keys(ALTERNATIVES_PAGES).forEach((slug) => {
    urls.push({
      loc: `${baseUrl}/alternatives/${slug}`,
      priority: '0.7',
      changefreq: 'weekly',
    });
  });

  // Compare Pages
  Object.keys(COMPARE_PAGES).forEach((slug) => {
    urls.push({
      loc: `${baseUrl}/compare/${slug}`,
      priority: '0.7',
      changefreq: 'weekly',
    });
  });

  // Free Hubs
  Object.keys(FREE_HUBS).forEach((slug) => {
    urls.push({
      loc: `${baseUrl}/free/${slug}`,
      priority: '0.7',
      changefreq: 'weekly',
    });
  });

  // Collections
  Object.keys(COLLECTIONS_PAGES).forEach((slug) => {
    urls.push({
      loc: `${baseUrl}/collections/${slug}`,
      priority: '0.7',
      changefreq: 'weekly',
    });
  });

  const urlTags = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
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
