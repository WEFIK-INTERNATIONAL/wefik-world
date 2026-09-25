#!/usr/bin/env node
/**
 * scripts/assert-image-hostnames.mjs
 *
 * Pre-deploy / CI assertion script that verifies all image URLs in the production
 * database (or fallback catalog if running offline) strictly match next.config.ts
 * remotePatterns.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Remote patterns from next.config.ts
const REMOTE_PATTERNS = [
  { protocol: 'https:', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
  { protocol: 'https:', hostname: 'res.cloudinary.com', pathname: '/**' },
  { protocol: 'https:', hostname: 'images.unsplash.com', pathname: '/**' },
  { protocol: 'https:', hostname: 'plus.unsplash.com', pathname: '/**' },
  { protocol: 'https:', hostname: 'unsplash.com', pathname: '/**' },
  { protocol: 'https:', hostname: 'cdn.sanity.io', pathname: '/**' },
];

function matchesHostname(urlHostname, patternHostname) {
  if (patternHostname.startsWith('*.')) {
    const baseDomain = patternHostname.slice(2);
    return urlHostname.endsWith('.' + baseDomain) || urlHostname === baseDomain;
  }
  return urlHostname === patternHostname;
}

function matchesPathname(urlPath, patternPath) {
  if (patternPath === '/**') return true;
  if (patternPath.endsWith('/**')) {
    const prefix = patternPath.slice(0, -3);
    return urlPath.startsWith(prefix);
  }
  return urlPath === patternPath;
}

function testUrl(urlString) {
  if (!urlString || urlString.startsWith('/') || urlString.startsWith('data:')) {
    return { ok: true, reason: 'Local or data URI' };
  }

  let parsed;
  try {
    parsed = new URL(urlString);
  } catch (err) {
    return { ok: false, reason: `Invalid URL format: ${urlString}` };
  }

  for (const pattern of REMOTE_PATTERNS) {
    if (parsed.protocol === pattern.protocol) {
      if (matchesHostname(parsed.hostname, pattern.hostname)) {
        if (matchesPathname(parsed.pathname, pattern.pathname)) {
          return { ok: true, matchedPattern: pattern };
        }
      }
    }
  }

  return {
    ok: false,
    reason: `Hostname ${parsed.hostname} with path ${parsed.pathname} not allowed by remotePatterns`,
  };
}

async function collectUrls() {
  const urls = new Set();

  // 1. Try querying production DB if credentials are present
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && serviceKey && !supabaseUrl.includes('placeholder-project')) {
    try {
      console.log(`📡 Querying Supabase DB at ${supabaseUrl}...`);
      const res = await fetch(`${supabaseUrl}/rest/v1/products?select=thumbnail_url,gallery_urls`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      });

      if (res.ok) {
        const rows = await res.json();
        for (const row of rows) {
          if (row.thumbnail_url) urls.add(row.thumbnail_url);
          if (Array.isArray(row.gallery_urls)) {
            row.gallery_urls.forEach((u) => u && urls.add(u));
          }
        }
        console.log(`✓ Fetched ${urls.size} distinct production image URLs from DB.`);
      } else {
        console.warn(`⚠️ DB query returned HTTP ${res.status}. Falling back to catalog source scan.`);
      }
    } catch (e) {
      console.warn(`⚠️ DB connection skipped: ${e.message}`);
    }
  }

  // 2. Scan catalog sources (seed posts, fallback products, etc.)
  const filesToScan = [
    'src/lib/data/products.ts',
    'src/lib/sanity/seed-posts.ts',
    'supabase/migrations/002_seed.sql',
    'supabase/migrations/003_fixpack02_integrity.sql',
  ];

  for (const relPath of filesToScan) {
    try {
      const content = readFileSync(resolve(rootDir, relPath), 'utf-8');
      const urlRegex = /https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s"'`\)]+/g;
      const matches = content.match(urlRegex) || [];
      for (const m of matches) {
        if (m.match(/\.(png|jpg|jpeg|webp|avif|gif|svg)(\?.*)?$/i) || m.includes('unsplash.com') || m.includes('storage/v1')) {
          urls.add(m);
        }
      }
    } catch {
      // file might not exist or be empty
    }
  }

  return Array.from(urls);
}

async function run() {
  console.log('🔍 Running Pre-Deploy Image Hostname Assertion...');
  const urls = await collectUrls();

  if (urls.length === 0) {
    console.log('ℹ️ No external image URLs discovered to assert.');
    process.exit(0);
  }

  console.log(`🔍 Asserting ${urls.length} distinct image URLs against next.config.ts remotePatterns...`);

  let failures = 0;
  for (const url of urls) {
    const result = testUrl(url);
    if (!result.ok) {
      console.error(`❌ REJECTED: ${url}`);
      console.error(`   Reason: ${result.reason}`);
      failures++;
    }
  }

  if (failures > 0) {
    console.error(`\n💥 Assertion failed: ${failures} image URL(s) violate next.config.ts remotePatterns!`);
    console.error(`Add the missing domains/paths to remotePatterns in next.config.ts before deploying.`);
    process.exit(1);
  }

  console.log(`✅ All ${urls.length} image URLs successfully validated against remotePatterns!`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error during image assertion:', err);
  process.exit(1);
});
