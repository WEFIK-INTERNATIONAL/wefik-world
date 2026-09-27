import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as Sentry from '@sentry/nextjs';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/account';
  const correlationId = crypto.randomUUID();

  // Sanitize next path to prevent open redirects (must start with single slash, not //)
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/account';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    // Capture PKCE exchange failure to Sentry
    Sentry.captureException(error, {
      tags: { correlationId, authFlow: 'pkce_exchange' },
      extra: { origin, hasCode: Boolean(code), safeNext },
    });
    console.error(`[Auth Callback] PKCE exchange failed (CID: ${correlationId}):`, error.message);
  }

  // Forward specific OAuth error if present
  if (errorDesc || errorParam) {
    const message = errorDesc || errorParam || 'auth_failed';
    Sentry.captureMessage(`OAuth Callback Error: ${message}`, {
      level: 'warning',
      tags: { correlationId, authFlow: 'oauth_redirect' },
      extra: { errorParam, errorDesc },
    });
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(message)}&cid=${correlationId}&next=${encodeURIComponent(safeNext)}`
    );
  }

  // Return the user to login with friendly expired/failed error parameter and correlation ID
  return NextResponse.redirect(
    `${origin}/login?error=link_expired&cid=${correlationId}&next=${encodeURIComponent(safeNext)}`
  );
}

