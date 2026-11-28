import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import {
  getConfiguredSiteOrigin,
  getAuthRedirectOrigin,
  sanitizeNextPath,
  buildAuthCallbackUrl,
} from '../src/lib/auth/redirects';
import { classifyAuthError, mapAuthError } from '../src/lib/auth/error-mapper';
import { handleAuthCallback, type CallbackSupabaseLike } from '../src/app/auth/callback/route';
import { proxy } from '../src/proxy';

function makeCallbackRequest(url: string, headers: Record<string, string> = {}): Request {
  return new Request(url, { headers });
}

test('redirects helper: canonical origin, localhost, preview, conflicting/invalid env', () => {
  assert.equal(
    getConfiguredSiteOrigin({ NEXT_PUBLIC_APP_URL: 'https://www.wefik.world/' } as NodeJS.ProcessEnv),
    'https://www.wefik.world'
  );
  assert.throws(() =>
    getConfiguredSiteOrigin({ NEXT_PUBLIC_APP_URL: 'not-a-url' } as NodeJS.ProcessEnv)
  );
  assert.throws(() =>
    getConfiguredSiteOrigin({
      NEXT_PUBLIC_APP_URL: 'https://www.wefik.world',
      NEXT_PUBLIC_SITE_URL: 'https://wefik.world',
    } as NodeJS.ProcessEnv)
  );

  assert.equal(
    getAuthRedirectOrigin('http://localhost:3000', {
      NEXT_PUBLIC_APP_URL: 'https://www.wefik.world',
    } as NodeJS.ProcessEnv),
    'http://localhost:3000'
  );
  assert.equal(
    getAuthRedirectOrigin('https://wefik-preview.vercel.app', {
      NEXT_PUBLIC_APP_URL: 'https://www.wefik.world',
    } as NodeJS.ProcessEnv),
    'https://wefik-preview.vercel.app'
  );
  // Spoofed or non-canonical production host always resolves to configured canonical origin
  assert.equal(
    getAuthRedirectOrigin('https://evil.example.com', {
      NEXT_PUBLIC_APP_URL: 'https://www.wefik.world',
    } as NodeJS.ProcessEnv),
    'https://www.wefik.world'
  );
  assert.equal(
    buildAuthCallbackUrl('/account/library', 'https://wefik.world', {
      NEXT_PUBLIC_APP_URL: 'https://www.wefik.world',
    } as NodeJS.ProcessEnv),
    'https://www.wefik.world/auth/callback?next=%2Faccount%2Flibrary'
  );
});

test('sanitizeNextPath: rejects open redirects, control chars, double-encoded attacks; allows valid encoded paths', () => {
  assert.equal(sanitizeNextPath('/account/library'), '/account/library');
  assert.equal(sanitizeNextPath('%2Faccount%2Forders%3Ftab%3Dpaid'), '/account/orders?tab=paid');
  assert.equal(
    sanitizeNextPath('https://www.wefik.world/dashboard/licenses', 'https://www.wefik.world'),
    '/dashboard/licenses'
  );

  for (const bad of [
    '//evil.com',
    'https://evil.com',
    '/\\evil.com',
    'javascript:alert(1)',
    '/account\r\nSet-Cookie: a=b',
    '%2F%2Fevil.com',
    '%252F%252Fevil.com',
    '%5Cevil.com',
  ]) {
    assert.equal(sanitizeNextPath(bad, 'https://www.wefik.world'), '/account', `Expected rejection for ${bad}`);
  }
});

test('handleAuthCallback: success sets Secure, SameSite=Lax, Path=/ cookies on returned response', async () => {
  process.env.NEXT_PUBLIC_APP_URL = 'https://www.wefik.world';
  const req = makeCallbackRequest('https://www.wefik.world/auth/callback?code=pkce_code_1&next=%2Faccount%2Flibrary');

  const res = await handleAuthCallback(req, {
    checkAndMarkCodeUsed: async () => false,
    createSupabaseForResponse: async (_r, onCookiesSet): Promise<CallbackSupabaseLike> => ({
      auth: {
        getUser: async () => ({ data: { user: null } }),
        exchangeCodeForSession: async () => {
          onCookiesSet([{ name: 'sb-test-auth-token', value: 'session_val', options: { httpOnly: true } }]);
          return { error: null };
        },
      },
    }),
  });

  assert.equal(res.status, 307);
  assert.equal(res.headers.get('location'), 'https://www.wefik.world/account/library');
  const setCookie = res.headers.get('set-cookie') || '';
  assert.match(setCookie, /sb-test-auth-token=session_val/);
  assert.match(setCookie, /Path=\//i);
  assert.match(setCookie, /SameSite=Lax/i);
  assert.match(setCookie, /Secure/i);
});

test('handleAuthCallback: spoofed Host header cannot hijack redirect location', async () => {
  process.env.NEXT_PUBLIC_APP_URL = 'https://www.wefik.world';
  const req = makeCallbackRequest('https://evil.attacker.com/auth/callback?code=pkce_code_2', {
    host: 'evil.attacker.com',
    'x-forwarded-host': 'evil.attacker.com',
  });

  const res = await handleAuthCallback(req, {
    checkAndMarkCodeUsed: async () => false,
    createSupabaseForResponse: async () => ({
      auth: {
        getUser: async () => ({ data: { user: null } }),
        exchangeCodeForSession: async () => ({ error: null }),
      },
    }),
  });

  assert.equal(res.headers.get('location'), 'https://www.wefik.world/account');
});

test('handleAuthCallback: missing code routes to /auth/callback/error', async () => {
  process.env.NEXT_PUBLIC_APP_URL = 'https://www.wefik.world';
  const req = makeCallbackRequest('https://www.wefik.world/auth/callback?next=%2Faccount');
  const res = await handleAuthCallback(req);
  assert.equal(res.status, 307);
  assert.match(res.headers.get('location') || '', /^https:\/\/www\.wefik\.world\/auth\/callback\/error\?error=missing_code/);
});

test('handleAuthCallback: provider query error params map cleanly without exposing raw text', async () => {
  process.env.NEXT_PUBLIC_APP_URL = 'https://www.wefik.world';
  const req = makeCallbackRequest(
    'https://www.wefik.world/auth/callback?error=access_denied&error_description=User+denied+access'
  );
  const res = await handleAuthCallback(req);
  assert.match(res.headers.get('location') || '', /\/login\?error=cancelled&cid=/);
});

test('handleAuthCallback: maps exchange failure codes (session_lost, provider_conflict, database_error, link_expired)', async () => {
  process.env.NEXT_PUBLIC_APP_URL = 'https://www.wefik.world';
  const cases: Array<[string, string]> = [
    ['both auth code and code verifier should be non-empty', 'session_lost'],
    ['identity_already_exists', 'provider_conflict'],
    ['Database error saving new user', 'database_error'],
    ['otp_expired', 'link_expired'],
  ];

  for (const [msg, expected] of cases) {
    const req = makeCallbackRequest('https://www.wefik.world/auth/callback?code=bad_code');
    const res = await handleAuthCallback(req, {
      checkAndMarkCodeUsed: async () => false,
      createSupabaseForResponse: async () => ({
        auth: {
          getUser: async () => ({ data: { user: null } }),
          exchangeCodeForSession: async () => ({ error: { message: msg, status: 400 } }),
        },
      }),
    });
    assert.match(res.headers.get('location') || '', new RegExp(`error=${expected}&cid=`));
  }
});

test('handleAuthCallback: session already present skips exchange; duplicate code without session shows session_lost', async () => {
  process.env.NEXT_PUBLIC_APP_URL = 'https://www.wefik.world';
  let exchanged = 0;
  const req = makeCallbackRequest('https://www.wefik.world/auth/callback?code=dup_code&next=%2Faccount');

  const resWithSession = await handleAuthCallback(req, {
    checkAndMarkCodeUsed: async () => true,
    createSupabaseForResponse: async () => ({
      auth: {
        getUser: async () => ({ data: { user: { id: 'user-1' } } }),
        exchangeCodeForSession: async () => {
          exchanged++;
          return { error: null };
        },
      },
    }),
  });
  assert.equal(exchanged, 0);
  assert.equal(resWithSession.headers.get('location'), 'https://www.wefik.world/account');

  const resDupNoSession = await handleAuthCallback(req, {
    checkAndMarkCodeUsed: async () => true,
    createSupabaseForResponse: async () => ({
      auth: {
        getUser: async () => ({ data: { user: null } }),
        exchangeCodeForSession: async () => {
          exchanged++;
          return { error: null };
        },
      },
    }),
  });
  assert.equal(exchanged, 0);
  assert.match(resDupNoSession.headers.get('location') || '', /error=session_lost&cid=/);
});

test('proxy: canonical host 308 redirect, no loop, /auth/callback excluded, localhost/preview untouched', async () => {
  process.env.NEXT_PUBLIC_APP_URL = 'https://www.wefik.world';

  const apexReq = new NextRequest('https://wefik.world/auth/callback?code=abc&next=%2Faccount');
  const apexRes = await proxy(apexReq);
  assert.equal(apexRes.status, 308);
  assert.equal(apexRes.headers.get('location'), 'https://www.wefik.world/auth/callback?code=abc&next=%2Faccount');

  const canonicalReq = new NextRequest('https://www.wefik.world/auth/callback?code=abc&next=%2Faccount');
  const canonicalRes = await proxy(canonicalReq);
  assert.equal(canonicalRes.status, 200);

  for (const untouched of [
    'http://localhost:3000/auth/callback?code=abc',
    'http://127.0.0.1:3000/login',
    'https://wefik-preview.vercel.app/login',
    'https://other-domain.com/login',
  ]) {
    const res = await proxy(new NextRequest(untouched));
    assert.equal(res.status, 200, `Expected no redirect for ${untouched}`);
  }
});

test('error-mapper: never exposes raw provider text', () => {
  const mapped = mapAuthError({ error: 'unexpected_provider_token_xyz', errorDescription: 'SECRET_INTERNAL_DETAIL' });
  assert.equal(mapped.code, 'temporary_error');
  assert.ok(!mapped.message.includes('SECRET_INTERNAL_DETAIL'));
  assert.equal(classifyAuthError({ errorDescription: 'disallowed_useragent' }), 'disallowed_useragent');
});
