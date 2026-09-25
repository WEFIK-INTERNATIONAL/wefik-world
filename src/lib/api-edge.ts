/**
 * src/lib/api-edge.ts
 * Type-safe client helpers for interacting with Wefik World Supabase Edge Functions.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export interface EmailCheckResult {
  registered: boolean;
  confirmed: boolean;
  has_password: boolean;
  oauth_providers: string[];
}

export interface EmailValidateResult {
  ok: boolean;
  reason?: string;
}

export async function checkEmailRegistered(email: string): Promise<EmailCheckResult> {
  // If Supabase URL is placeholder or unconfigured, provide local simulation fallback
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    const isMockRegistered = email.toLowerCase().includes('existing') || email.toLowerCase().includes('demo');
    const isGoogleOnly = email.toLowerCase().includes('google');
    return {
      registered: isMockRegistered,
      confirmed: true,
      has_password: !isGoogleOnly,
      oauth_providers: isGoogleOnly ? ['google'] : [],
    };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/auth-check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    if (!res.ok) {
      // In case of rate limit (429) or error, default defensively
      return { registered: false, confirmed: false, has_password: false, oauth_providers: [] };
    }

    return await res.json();
  } catch (err) {
    console.warn('auth-check-email network error, fallback:', err);
    return { registered: false, confirmed: false, has_password: false, oauth_providers: [] };
  }
}

export async function validateEmailDomain(email: string): Promise<EmailValidateResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    const domain = email.split('@')[1]?.toLowerCase();
    if (['mailinator.com', 'tempmail.com', '10minutemail.com', 'trashmail.com'].includes(domain)) {
      return { ok: false, reason: 'Disposable or temporary email addresses are not permitted.' };
    }
    return { ok: true };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/auth-validate-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    if (!res.ok) {
      return { ok: true }; // Fail-open
    }

    return await res.json();
  } catch (err) {
    console.warn('auth-validate-email network error, fail-open:', err);
    return { ok: true };
  }
}

export async function requestRecoveryReset(accountEmail: string, recoveryEmail: string): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/auth-recovery-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        account_email: accountEmail.trim().toLowerCase(),
        recovery_email: recoveryEmail.trim().toLowerCase(),
      }),
    });

    const data = await res.json();
    return {
      ok: res.ok,
      message: data.message || data.error || 'If an account exists with this verified recovery email, a password reset link has been dispatched.',
    };
  } catch (err) {
    return {
      ok: true,
      message: 'If an account exists with this verified recovery email, a password reset link has been dispatched.',
    };
  }
}

export async function requestMfaReset(accountEmail: string): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/auth-mfa-reset-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ account_email: accountEmail.trim().toLowerCase() }),
    });

    const data = await res.json();
    return {
      ok: res.ok,
      message: data.message || data.error || 'If a verified recovery email exists, a 6-digit code has been sent.',
    };
  } catch (err) {
    return {
      ok: false,
      message: 'Service temporarily unavailable. Please try again shortly.',
    };
  }
}

export async function confirmMfaReset(accountEmail: string, code: string): Promise<{ ok: boolean; message: string; error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/auth-mfa-reset-confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        account_email: accountEmail.trim().toLowerCase(),
        code: code.trim(),
      }),
    });

    const data = await res.json();
    return {
      ok: res.ok,
      message: data.message || '',
      error: data.error,
    };
  } catch (err) {
    return {
      ok: false,
      message: '',
      error: 'Network connection error. Please try again.',
    };
  }
}

export async function requestRecoveryEmailOtp(recoveryEmail: string, accessToken: string): Promise<{ ok: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/auth-recovery-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action: 'request', recovery_email: recoveryEmail.trim().toLowerCase() }),
    });

    const data = await res.json();
    return {
      ok: res.ok,
      message: data.message,
      error: data.error,
    };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Request failed' };
  }
}

export async function verifyRecoveryEmailOtp(recoveryEmail: string, code: string, accessToken: string): Promise<{ ok: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/auth-recovery-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action: 'verify', recovery_email: recoveryEmail.trim().toLowerCase(), code: code.trim() }),
    });

    const data = await res.json();
    return {
      ok: res.ok,
      message: data.message,
      error: data.error,
    };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Verification failed' };
  }
}

export async function removeRecoveryEmail(accessToken: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/auth-recovery-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action: 'remove' }),
    });

    const data = await res.json();
    return { ok: res.ok, error: data.error };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function deleteUserAccount(confirmEmail: string, accessToken: string): Promise<{ ok: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/auth-delete-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ confirm_email: confirmEmail.trim().toLowerCase() }),
    });

    const data = await res.json();
    return {
      ok: res.ok,
      message: data.message,
      error: data.error,
    };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Deletion failed' };
  }
}
