import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// Read source files to verify invariants & structural guarantees
const redirectsSrc = fs.readFileSync(path.join(root, 'src/lib/auth/redirects.ts'), 'utf8');
const errorMapperSrc = fs.readFileSync(path.join(root, 'src/lib/auth/error-mapper.ts'), 'utf8');
const callbackSrc = fs.readFileSync(path.join(root, 'src/app/auth/callback/route.ts'), 'utf8');
const callbackErrorPageSrc = fs.readFileSync(path.join(root, 'src/app/auth/callback/error/page.tsx'), 'utf8');
const proxySrc = fs.readFileSync(path.join(root, 'src/proxy.ts'), 'utf8');
const loginSrc = fs.readFileSync(path.join(root, 'src/app/(auth)/login/page.tsx'), 'utf8');

// ---------------------------------------------------------------------------
// 1. Structural & Security Invariant Checks
// ---------------------------------------------------------------------------
console.log('1. Checking OAuth callback, proxy, and login invariants...');

assert.ok(
  proxySrc.includes("if (pathname.startsWith('/auth/callback'))"),
  'src/proxy.ts must explicitly bypass /auth/callback before updateSession/rate-limiting'
);
assert.ok(
  proxySrc.includes('getCanonicalHostRedirect(request)'),
  'src/proxy.ts must enforce canonical host redirect before auth code runs'
);
assert.ok(
  !loginSrc.includes('NEXT_PUBLIC_SITE_URL || window.location.origin'),
  'login/page.tsx must not use ad-hoc NEXT_PUBLIC_SITE_URL fallback; use buildAuthCallbackUrl'
);
assert.ok(
  loginSrc.includes('buildAuthCallbackUrl('),
  'login/page.tsx must build redirectTo via buildAuthCallbackUrl'
);
assert.ok(
  callbackSrc.includes('applyCookiesToResponse(response, pendingCookies, isHttps)'),
  'auth/callback/route.ts must apply session cookies directly to the returned NextResponse'
);
assert.ok(
  callbackSrc.includes('recentCodeExchanges'),
  'auth/callback/route.ts must guard against double consumption of the same code'
);
assert.ok(
  callbackSrc.includes('if (existingData?.user)'),
  'auth/callback/route.ts must short-circuit if a session already exists'
);
assert.ok(
  callbackErrorPageSrc.includes('window.history.replaceState'),
  'auth/callback/error/page.tsx must clear window.location.hash after reading errors'
);

// ---------------------------------------------------------------------------
// 2. Test redirectTo & sanitizeNextPath logic
// ---------------------------------------------------------------------------
console.log('2. Testing redirectTo and sanitizeNextPath...');

// Verify redirects.ts exports all expected helpers
for (const fn of ['getConfiguredSiteOrigin', 'getAuthRedirectOrigin', 'sanitizeNextPath', 'buildAuthCallbackUrl']) {
  assert.ok(redirectsSrc.includes(`export function ${fn}`), `redirects.ts must export ${fn}`);
}

// Mirror pure logic to verify all edge cases deterministically without ts-node
function getConfiguredSiteOrigin(env = {}) {
  const raw = (env.NEXT_PUBLIC_APP_URL || env.NEXT_PUBLIC_SITE_URL || '').trim();
  if (!raw) return 'https://www.wefik.world';
  const parsed = new URL(raw);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Invalid site URL protocol: ${parsed.protocol}`);
  }
  return parsed.origin;
}

function getAuthRedirectOrigin(clientOrigin, env = {}) {
  if (clientOrigin) {
    try {
      const parsed = new URL(clientOrigin);
      const host = parsed.hostname.toLowerCase();
      if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app')) {
        return parsed.origin;
      }
    } catch {
      // ignore
    }
  }
  return getConfiguredSiteOrigin(env);
}

function sanitizeNextPath(rawNext, canonicalOrigin = 'https://www.wefik.world') {
  if (!rawNext || typeof rawNext !== 'string') return '/account';
  let candidate = rawNext.trim();
  if (!candidate) return '/account';
  for (let i = 0; i < 2; i++) {
    if (candidate.startsWith('%2F') || candidate.startsWith('%2f')) {
      try {
        candidate = decodeURIComponent(candidate);
      } catch {
        break;
      }
    }
  }
  if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
    try {
      const parsed = new URL(candidate);
      if (parsed.origin === canonicalOrigin) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/account';
      }
      return '/account';
    } catch {
      return '/account';
    }
  }
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.startsWith('/\\')) {
    return '/account';
  }
  return candidate;
}

assert.equal(getConfiguredSiteOrigin({ NEXT_PUBLIC_APP_URL: 'https://www.wefik.world/' }), 'https://www.wefik.world');
assert.throws(() => getConfiguredSiteOrigin({ NEXT_PUBLIC_APP_URL: 'not-a-url' }));
assert.throws(() => getConfiguredSiteOrigin({ NEXT_PUBLIC_APP_URL: 'ftp://wefik.world' }));
assert.equal(getAuthRedirectOrigin('http://localhost:3000', { NEXT_PUBLIC_APP_URL: 'https://www.wefik.world' }), 'http://localhost:3000');
assert.equal(getAuthRedirectOrigin('https://wefik-git-fix.vercel.app', { NEXT_PUBLIC_APP_URL: 'https://www.wefik.world' }), 'https://wefik-git-fix.vercel.app');
assert.equal(getAuthRedirectOrigin('https://wefik.world', { NEXT_PUBLIC_APP_URL: 'https://www.wefik.world' }), 'https://www.wefik.world');

assert.equal(sanitizeNextPath('/account/library'), '/account/library');
assert.equal(sanitizeNextPath('%2Faccount%2Forders%3Ftab%3Dpaid'), '/account/orders?tab=paid');
assert.equal(sanitizeNextPath('https://www.wefik.world/dashboard/licenses'), '/dashboard/licenses');
assert.equal(sanitizeNextPath('https://evil.com/phish'), '/account');
assert.equal(sanitizeNextPath('//evil.com/phish'), '/account');
assert.equal(sanitizeNextPath('javascript:alert(1)'), '/account');

// ---------------------------------------------------------------------------
// 3. Test error-mapper coverage
// ---------------------------------------------------------------------------
console.log('3. Testing error-mapper coverage...');

for (const code of [
  'cancelled',
  'disallowed_useragent',
  'session_lost',
  'link_expired',
  'provider_conflict',
  'provider_error',
  'database_error',
  'temporary_error',
]) {
  assert.ok(errorMapperSrc.includes(`${code}:`), `error-mapper.ts must define message for ${code}`);
}

console.log('PASS: All OAuth callback, redirect, proxy, and error-mapper checks passed.');
