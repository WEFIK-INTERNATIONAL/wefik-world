export type AuthErrorCode =
  | 'cancelled'
  | 'disallowed_useragent'
  | 'session_lost'
  | 'link_expired'
  | 'provider_conflict'
  | 'provider_error'
  | 'database_error'
  | 'temporary_error';

export interface MappedAuthError {
  code: AuthErrorCode;
  title: string;
  message: string;
  nextAction: string;
}

const ERROR_CATALOG: Record<AuthErrorCode, Omit<MappedAuthError, 'code'>> = {
  cancelled: {
    title: 'Sign-in cancelled',
    message: 'You cancelled the sign-in request before completing authentication.',
    nextAction: 'Click "Try again" to restart sign-in.',
  },
  disallowed_useragent: {
    title: 'Open in your browser',
    message:
      'Google blocks sign-in inside embedded in-app browsers (such as Instagram, Facebook, or email apps).',
    nextAction: 'Tap the menu (⋯) and choose "Open in Chrome" or "Open in Safari", then try again.',
  },
  session_lost: {
    title: 'Sign-in session was lost',
    message:
      'Your browser did not send the sign-in verification cookie back to our callback. This happens if cookies are blocked or sign-in started on a different domain.',
    nextAction: 'Enable cookies for wefik.world and click "Try again".',
  },
  link_expired: {
    title: 'Login link expired',
    message: 'This email sign-in or confirmation link has expired or was already used.',
    nextAction: 'Request a fresh link or sign in with Google/password.',
  },
  provider_conflict: {
    title: 'Account uses another sign-in method',
    message: 'An account with this email already exists using a different sign-in method.',
    nextAction: 'Sign in with your email and password (or original provider), then try again.',
  },
  provider_error: {
    title: 'Google sign-in unavailable',
    message: 'Google reported a problem while signing you in.',
    nextAction: 'Wait a moment and click "Try again".',
  },
  database_error: {
    title: 'Temporary account setup error',
    message: 'We encountered a temporary error while setting up your profile.',
    nextAction: 'Please try again in a moment. If it persists, share the Request ID below with support.',
  },
  temporary_error: {
    title: 'Temporary sign-in error',
    message: 'Something went wrong while completing your sign-in.',
    nextAction: 'Click "Try again". If this keeps happening, share the Request ID below with support.',
  },
};

/**
 * Classify a Supabase / OAuth error into one of our safe, typed AuthErrorCode values.
 * Never returns raw provider text to the UI.
 */
export function classifyAuthError(input: {
  error?: string | null;
  errorCode?: string | null;
  errorDescription?: string | null;
}): AuthErrorCode {
  const err = (input.error || '').trim().toLowerCase();
  const code = (input.errorCode || '').trim().toLowerCase();
  const desc = (input.errorDescription || '').trim().toLowerCase();
  const combined = `${err} ${code} ${desc}`;

  if (err === 'cancelled' || err === 'access_denied' || desc.includes('user denied') || desc.includes('access_denied')) {
    return 'cancelled';
  }
  if (combined.includes('disallowed_useragent')) {
    return 'disallowed_useragent';
  }
  if (
    err === 'session_lost' ||
    combined.includes('code verifier') ||
    combined.includes('code_verifier') ||
    combined.includes('pkce') ||
    err === 'missing_code'
  ) {
    return 'session_lost';
  }
  if (
    err === 'link_expired' ||
    err === 'auth_callback_failed' ||
    combined.includes('otp_expired') ||
    combined.includes('expired')
  ) {
    return 'link_expired';
  }
  if (
    err === 'provider_conflict' ||
    combined.includes('identity_already_exists') ||
    combined.includes('email_exists') ||
    combined.includes('different_credential') ||
    combined.includes('already registered')
  ) {
    return 'provider_conflict';
  }
  if (
    err === 'database_error' ||
    combined.includes('database error saving new user') ||
    combined.includes('saving new user')
  ) {
    return 'database_error';
  }
  if (
    err === 'provider_error' ||
    err === 'server_error' ||
    err === 'temporarily_unavailable' ||
    code === 'oauth_error'
  ) {
    return 'provider_error';
  }

  return 'temporary_error';
}

/**
 * Map an error parameter or Supabase auth error to a calm, user-safe message object.
 */
export function mapAuthError(input: {
  error?: string | null;
  errorCode?: string | null;
  errorDescription?: string | null;
}): MappedAuthError {
  const code = classifyAuthError(input);
  return {
    code,
    ...ERROR_CATALOG[code],
  };
}
