import assert from 'node:assert';
import { GET as getSitemapIndex } from '../src/app/sitemap.xml/route.ts';
import { GET as getSitemapStatic } from '../src/app/sitemap-static.xml/route.ts';
import { GET as getSitemapProducts } from '../src/app/sitemap-products.xml/route.ts';
import { GET as getSitemapContent } from '../src/app/sitemap-content.xml/route.ts';
import { GET as getSitemapProgrammatic } from '../src/app/sitemap-programmatic.xml/route.ts';

async function run() {
  console.log('--- Testing Sitemap XML Architecture (E2E Unit Test) ---');

  // 1. Test Sitemap Index
  const resIndex = await getSitemapIndex();
  assert.strictEqual(resIndex.status, 200);
  const textIndex = await resIndex.text();
  assert(textIndex.includes('<sitemapindex'), 'Index must use <sitemapindex>');
  assert(textIndex.includes('/sitemap-static.xml</loc>'), 'Index must include sitemap-static.xml');
  assert(textIndex.includes('/sitemap-products.xml</loc>'), 'Index must include sitemap-products.xml');
  assert(textIndex.includes('/sitemap-content.xml</loc>'), 'Index must include sitemap-content.xml');
  assert(textIndex.includes('/sitemap-programmatic.xml</loc>'), 'Index must include sitemap-programmatic.xml');
  assert(!textIndex.includes('https://wefik.world/'), 'Must not contain non-www domain');
  console.log('✓ 1. Sitemap Index renders valid <sitemapindex> with all 4 child sitemaps');

  // 2. Test Static Sitemap
  const resStatic = await getSitemapStatic();
  assert.strictEqual(resStatic.status, 200);
  const textStatic = await resStatic.text();
  const staticUrls = [...textStatic.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert(staticUrls.length >= 15, 'Static sitemap must contain core pages');
  assert(!textStatic.includes('/status'), 'Must NOT include /status utility page');
  
  // Verify /delivery appears exactly once
  const deliveryCount = staticUrls.filter(u => u.endsWith('/delivery')).length;
  assert.strictEqual(deliveryCount, 1, '/delivery must appear exactly once');
  console.log(`✓ 2. Static Sitemap renders ${staticUrls.length} pages (single /delivery, zero /status)`);

  // 3. Test Products Sitemap
  const resProducts = await getSitemapProducts();
  assert.strictEqual(resProducts.status, 200);
  const textProducts = await resProducts.text();
  const productUrls = [...textProducts.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert(textProducts.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'), 'Must have Google Image schema');
  assert(textProducts.includes('<image:image>'), 'Must have image extensions for products');
  assert(textProducts.includes('<image:loc>'), 'Must have image loc');
  console.log(`✓ 3. Products Sitemap renders ${productUrls.length} products with <image:image> extensions`);

  // 4. Test Content Sitemap
  const resContent = await getSitemapContent();
  assert.strictEqual(resContent.status, 200);
  const textContent = await resContent.text();
  const contentUrls = [...textContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert(contentUrls.some(u => u.includes('/blog/')), 'Must include blog posts');
  assert(contentUrls.some(u => u.includes('/glossary/')), 'Must include glossary terms');
  console.log(`✓ 4. Content Sitemap renders ${contentUrls.length} URLs (blog posts + glossary)`);

  // 5. Test Programmatic Sitemap
  const resProg = await getSitemapProgrammatic();
  assert.strictEqual(resProg.status, 200);
  const textProg = await resProg.text();
  const progUrls = [...textProg.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert(progUrls.some(u => u.includes('/alternatives/')), 'Must include alternatives');
  assert(progUrls.some(u => u.includes('/compare/')), 'Must include comparisons');
  console.log(`✓ 5. Programmatic Sitemap renders ${progUrls.length} URLs`);

  // 6. Zero Duplication Assertion across ALL child sitemaps
  const allChildUrls = [...staticUrls, ...productUrls, ...contentUrls, ...progUrls];
  const urlSet = new Set();
  const duplicates = [];
  for (const url of allChildUrls) {
    if (urlSet.has(url)) {
      duplicates.push(url);
    }
    urlSet.add(url);
  }

  assert.strictEqual(duplicates.length, 0, `Duplicate URLs found across sitemaps: ${duplicates.join(', ')}`);
  console.log(`✓ 6. Zero Duplication Verified: All ${allChildUrls.length} URLs live in EXACTLY ONE sitemap!`);

  // 7. Canonical Domain Assertion
  for (const url of allChildUrls) {
    assert(url.startsWith('https://www.wefik.world'), `URL does not use canonical domain: ${url}`);
  }
  console.log(`✓ 7. Canonical Lock-in Verified: 100% of sitemap URLs use https://www.wefik.world`);

  console.log('🎉 All Sitemap Architecture Tests Passed 100%!\n');
}

run().catch(err => {
  console.error('❌ Sitemap E2E Test Failed:', err);
  process.exit(1);
});
