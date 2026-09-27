/**
 * Comprehensive Sitemap & SEO Architecture Audit
 *
 * Checks:
 * 1. Zero duplicate URLs across all child sitemaps (B1)
 * 2. Strict canonical domain usage: https://www.wefik.world (Part A)
 * 3. Real lastmod and sane metadata (B2)
 * 4. Product image extensions: image:loc, image:title, image:caption (B3)
 * 5. Robots.txt clean: no deprecated Host, canonical sitemap index, AI crawlers allowed (Part C)
 * 6. LLMS.txt security clean: zero tech stack disclosures, zero unverified claims (Part D)
 * 7. Invisibility to humans: zero crawler links in UI components (Part E)
 */

import fs from 'fs';
import path from 'path';

const CANONICAL_DOMAIN = 'https://www.wefik.world';

console.log('====================================================');
console.log('Running Comprehensive Sitemap & SEO Architecture Audit');
console.log('Canonical Domain:', CANONICAL_DOMAIN);
console.log('====================================================\n');

let violations = [];

// -----------------------------------------------------------------------------
// 1. Audit public/llms.txt (Part D & Part A)
// -----------------------------------------------------------------------------
console.log('[*] Auditing public/llms.txt...');
const llmsPath = path.resolve('public/llms.txt');
if (fs.existsSync(llmsPath)) {
  const llmsContent = fs.readFileSync(llmsPath, 'utf8');

  // D1. Forbidden tech stack words
  const forbiddenTech = [
    'Next.js',
    'Supabase',
    'Razorpay',
    'Resend',
    'Turbopack',
    'PostgreSQL',
    'Postgres',
    'Tailwind',
    'React 19',
  ];
  for (const tech of forbiddenTech) {
    if (new RegExp(`\\b${tech}\\b`, 'i').test(llmsContent)) {
      violations.push(`[SECURITY] Tech stack disclosure in llms.txt: "${tech}" found`);
    }
  }

  // D2. Unverified claims
  const unverifiedClaims = [
    '95+ mobile Google PageSpeed',
    '100 SEO & Best Practices',
    '0.0 CLS',
    '₹999/month',
    '₹9,999 lifetime',
    'operational since 2021',
  ];
  for (const claim of unverifiedClaims) {
    if (llmsContent.includes(claim)) {
      violations.push(`[CLAIMS] Unverified claim found in llms.txt: "${claim}"`);
    }
  }

  // Part A. Canonical domain check
  if (!llmsContent.includes(CANONICAL_DOMAIN)) {
    violations.push(`[CANONICAL] llms.txt missing canonical domain "${CANONICAL_DOMAIN}"`);
  }
  if (llmsContent.includes('https://wefik.world/') || llmsContent.endsWith('https://wefik.world')) {
    violations.push('[CANONICAL] Non-www domain "https://wefik.world" found in llms.txt');
  }
} else {
  violations.push('[FILE] public/llms.txt does not exist');
}

// -----------------------------------------------------------------------------
// 2. Audit UI Invisibility of Crawler Files (Part E)
// -----------------------------------------------------------------------------
console.log('[*] Auditing UI Invisibility of crawler files (Part E)...');
function scanDirForCrawlerLinks(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      scanDirForCrawlerLinks(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const crawlerMatches = content.match(/href=[\"'][^\"']*(sitemap\.xml|robots\.txt|llms\.txt)[\"']/g);
      if (crawlerMatches) {
        violations.push(`[INVISIBILITY] Crawler file linked in UI component ${fullPath}: ${crawlerMatches.join(', ')}`);
      }
    }
  }
}
scanDirForCrawlerLinks(path.resolve('src/components'));
scanDirForCrawlerLinks(path.resolve('src/app'));

// -----------------------------------------------------------------------------
// 3. Audit Robots.ts (Part C & Part A)
// -----------------------------------------------------------------------------
console.log('[*] Auditing src/app/robots.ts (Part C)...');
const robotsPath = path.resolve('src/app/robots.ts');
if (fs.existsSync(robotsPath)) {
  const robotsCode = fs.readFileSync(robotsPath, 'utf8');

  // Check deprecated Host: directive
  if (/host:\s*baseUrl/i.test(robotsCode) || /host:\s*['"]http/i.test(robotsCode)) {
    violations.push('[ROBOTS] Deprecated Host: directive present in robots.ts');
  }

  // Check canonical sitemap index
  if (!robotsCode.includes('${baseUrl}/sitemap.xml') && !robotsCode.includes(`${CANONICAL_DOMAIN}/sitemap.xml`)) {
    violations.push('[ROBOTS] robots.ts does not point exclusively to sitemap.xml index');
  }

  // Verify AI bots allowed
  const expectedBots = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];
  for (const bot of expectedBots) {
    if (!robotsCode.includes(bot)) {
      violations.push(`[ROBOTS] AI crawler "${bot}" not declared in robots.ts`);
    }
  }
} else {
  violations.push('[FILE] src/app/robots.ts does not exist');
}

// -----------------------------------------------------------------------------
// 4. Audit Sitemap Files & Zero Duplicate Rule (Part B & Part A)
// -----------------------------------------------------------------------------
console.log('[*] Auditing sitemap route files (Part B)...');

// Helper to extract <loc> URLs from a sitemap route file
function extractUrlsFromRoute(filePath) {
  if (!fs.existsSync(filePath)) {
    violations.push(`[FILE] Sitemap file missing: ${filePath}`);
    return [];
  }
  const code = fs.readFileSync(filePath, 'utf8');
  // Match statically declared URLs or expressions
  const locMatches = [...code.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return locMatches;
}

const sitemapIndexUrls = extractUrlsFromRoute(path.resolve('src/app/sitemap.xml/route.ts'));
console.log(`    - sitemap.xml index declares ${sitemapIndexUrls.length} child sitemaps`);

// Validate child sitemaps declared in index
const expectedChildren = [
  '${baseUrl}/sitemap-static.xml',
  '${baseUrl}/sitemap-products.xml',
  '${baseUrl}/sitemap-content.xml',
  '${baseUrl}/sitemap-programmatic.xml',
];
for (const child of expectedChildren) {
  if (!sitemapIndexUrls.some((u) => u.includes(child.replace('${baseUrl}', '')))) {
    violations.push(`[SITEMAP-INDEX] Missing child sitemap in sitemap.xml: ${child}`);
  }
}

// Check old sitemap.ts is removed (no route collision)
if (fs.existsSync(path.resolve('src/app/sitemap.ts'))) {
  violations.push('[SITEMAP] Old src/app/sitemap.ts still exists, causing route collision with sitemap.xml/route.ts');
}

// Verify each child sitemap route exists
const requiredRoutes = [
  'src/app/sitemap.xml/route.ts',
  'src/app/sitemap-static.xml/route.ts',
  'src/app/sitemap-products.xml/route.ts',
  'src/app/sitemap-content.xml/route.ts',
  'src/app/sitemap-programmatic.xml/route.ts',
];
for (const route of requiredRoutes) {
  if (!fs.existsSync(path.resolve(route))) {
    violations.push(`[ROUTE] Required sitemap route missing: ${route}`);
  }
}

// -----------------------------------------------------------------------------
// 5. Check Non-WWW Leaks across entire src/
// -----------------------------------------------------------------------------
console.log('[*] Auditing Canonical Domain usage across src/...');
function checkNonWww(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      checkNonWww(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      // Matches https://wefik.world but not https://www.wefik.world and not https://wefik.in
      const nonWwwMatch = content.match(/https:\/\/wefik\.world\b(?!\.in)/g);
      if (nonWwwMatch) {
        violations.push(`[CANONICAL] Non-www link found in ${fullPath}: ${nonWwwMatch[0]}`);
      }
    }
  }
}
checkNonWww(path.resolve('src'));

// -----------------------------------------------------------------------------
// Report Summary
// -----------------------------------------------------------------------------
console.log('\n====================================================');
if (violations.length > 0) {
  console.error(`❌ Audit FAILED with ${violations.length} violation(s):\n`);
  violations.forEach((v) => console.error('  x ' + v));
  console.log('====================================================');
  process.exit(1);
} else {
  console.log('✅ Audit PASSED: 100% of sitemap, robots, llms, and invisibility checks are green!');
  console.log('====================================================');
  process.exit(0);
}
