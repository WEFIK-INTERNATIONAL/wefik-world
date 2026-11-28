import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import type { Database } from '@/types/database';
import { classifyAuthError } from '@/lib/auth/error-mapper';
import { getAuthRedirectOrigin, sanitizeNextPath } from '@/lib/auth/redirects';
import { redis } from '@/lib/redis';

interface CookieToSet {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}

export interface CallbackSupabaseLike {
  auth: {
    getUser: () => Promise<{ data: { user: { id: string } | null }; error?: unknown }>;
    exchangeCodeForSession: (code: string) => Promise<{
      error: { message?: string; code?: string; status?: number; name?: string } | null;
    }>;
  };
}

export interface HandleCallbackDeps {
  createSupabaseForResponse?: (
    request: Request,
    onCookiesSet: (cookiesToSet: CookieToSet[]) => void
  ) => Promise<CallbackSupabaseLike>;
  checkAndMarkCodeUsed?: (codeHash: string) => Promise<boolean>;
}

const CODE_DEDUPE_TTL_SECONDS = 60;

async function hashCode(code: string): Promise<string> {
  const bytes = new TextEncoder().encode(code);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Distributed 60s code-exchange guard backed by Upstash Redis.
 * Fails OPEN if Redis is unconfigured or unreachable so legitimate logins are never blocked.
 */
async function defaultCheckAndMarkCodeUsed(codeHash: string): Promise<boolean> {
  if (!redis) return false;
  try {
    const key = `oauth:code:${codeHash}`;
    const result = await redis.set(key, '1', { nx: true, ex: CODE_DEDUPE_TTL_SECONDS });
    // result is 'OK' on first set, null if key already existed
    return result === null;
  } catch {
    return false;
  }
}

function logStructuredAuthEvent(details: {
  cid: string;
  flow: string;
  errorName?: string;
  errorCode?: string | null;
  status?: number | null;
  mappedCode?: string;
}) {
  console.error(
    JSON.stringify({
      event: 'auth_callback',
      cid: details.cid,
      flow: details.flow,
      errorName: details.errorName || null,
      errorCode: details.errorCode || null,
      status: details.status ?? null,
      mappedCode: details.mappedCode || null,
    })
  );
}

async function defaultCreateSupabaseForResponse(
  request: Request,
  onCookiesSet: (cookiesToSet: CookieToSet[]) => void
): Promise<CallbackSupabaseLike> {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

  const reqCookies =
    'cookies' in request && typeof (request as NextRequest).cookies?.getAll === 'function'
      ? (request as NextRequest).cookies.getAll()
      : cookieStore.getAll();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return reqCookies;
      },
      setAll(cookiesToSet) {
        onCookiesSet(cookiesToSet);
      },
    },
  });
}

function applyCookiesToResponse(
  response: NextResponse,
  cookiesToSet: CookieToSet[],
  isHttps: boolean
) {
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, {
      path: '/',
      sameSite: 'lax',
      secure: isHttps,
      ...(options || {}),
    });
  }
}

export async function handleAuthCallback(
  request: Request,
  deps: HandleCallbackDeps = {}
): Promise<NextResponse> {
  const parsedUrl = new URL(request.url);
  const { searchParams } = parsedUrl;
  // Never trust spoofed Host / X-Forwarded-Host headers in production; use configured canonical origin
  const origin = getAuthRedirectOrigin(parsedUrl.origin);
  const isHttps = origin.startsWith('https://');
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorCodeParam = searchParams.get('error_code');
  const errorDesc = searchParams.get('error_description');
  const safeNext = sanitizeNextPath(searchParams.get('next'), origin);
  const cid = crypto.randomUUID().slice(0, 8);

  // 1. Handle explicit OAuth / Supabase query errors before touching code exchange
  if (errorDesc || errorParam || errorCodeParam) {
    const mappedCode = classifyAuthError({
      error: errorParam,
      errorCode: errorCodeParam,
      errorDescription: errorDesc,
    });
    logStructuredAuthEvent({
      cid,
      flow: 'oauth_query_error',
      errorName: errorParam || 'OAuthError',
      errorCode: errorCodeParam || errorParam,
      status: 400,
      mappedCode,
    });
    Sentry.captureMessage(`Auth callback error (${mappedCode})`, {
      level: 'warning',
      tags: { correlationId: cid, authFlow: 'oauth_redirect', mappedCode },
    });
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(mappedCode)}&cid=${cid}&next=${encodeURIComponent(safeNext)}`
    );
  }

  // 2. If no code is present, route through client hash-error inspector (/auth/callback/error)
  if (!code) {
    logStructuredAuthEvent({
      cid,
      flow: 'missing_code',
      errorName: 'MissingAuthCode',
      status: 400,
      mappedCode: 'session_lost',
    });
    return NextResponse.redirect(
      `${origin}/auth/callback/error?error=missing_code&cid=${cid}&next=${encodeURIComponent(safeNext)}`
    );
  }

  const pendingCookies: CookieToSet[] = [];
  const createSupabase = deps.createSupabaseForResponse || defaultCreateSupabaseForResponse;
  const supabase = await createSupabase(request, (cookiesToSet) => {
    pendingCookies.push(...cookiesToSet);
  });

  // 3. If a session already exists (e.g. refresh of callback URL), proceed cleanly
  const { data: existingData } = await supabase.auth.getUser();
  if (existingData?.user) {
    const response = NextResponse.redirect(`${origin}${safeNext}`);
    applyCookiesToResponse(response, pendingCookies, isHttps);
    return response;
  }

  // 4. Distributed duplicate-code guard (Redis 60s TTL, fails open if Redis unavailable)
  const checkCodeUsed = deps.checkAndMarkCodeUsed || defaultCheckAndMarkCodeUsed;
  const codeHash = await hashCode(code);
  const alreadyConsumed = await checkCodeUsed(codeHash);
  if (alreadyConsumed) {
    logStructuredAuthEvent({
      cid,
      flow: 'duplicate_code_no_session',
      errorName: 'DuplicateAuthCode',
      status: 400,
      mappedCode: 'session_lost',
    });
    return NextResponse.redirect(
      `${origin}/login?error=session_lost&cid=${cid}&next=${encodeURIComponent(safeNext)}`
    );
  }

  // 5. Exchange PKCE code once and bind cookies directly onto the returned response
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) {
    const response = NextResponse.redirect(`${origin}${safeNext}`);
    applyCookiesToResponse(response, pendingCookies, isHttps);
    return response;
  }

  const mappedCode = classifyAuthError({
    error: error.name,
    errorCode: error.code,
    errorDescription: error.message,
  });

  logStructuredAuthEvent({
    cid,
    flow: 'pkce_exchange',
    errorName: error.name || 'AuthApiError',
    errorCode: error.code || null,
    status: error.status ?? 400,
    mappedCode,
  });

  Sentry.captureException(error, {
    tags: { correlationId: cid, authFlow: 'pkce_exchange', mappedCode },
    extra: { origin, safeNext },
  });

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(mappedCode)}&cid=${cid}&next=${encodeURIComponent(safeNext)}`
  );
}

export async function GET(request: Request) {
  return handleAuthCallback(request);
}
