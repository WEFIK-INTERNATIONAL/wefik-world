import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/account';

  // Sanitize next path to prevent open redirects (must start with single slash, not //)
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/account';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Forward specific OAuth error if present
  if (errorDesc || errorParam) {
    const message = errorDesc || errorParam || 'auth_failed';
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
  }

  // Return the user to login with friendly expired/failed error parameter
  return NextResponse.redirect(`${origin}/login?error=link_expired`);
}

