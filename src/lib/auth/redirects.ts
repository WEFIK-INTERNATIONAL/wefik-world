const DEFAULT_PRODUCTION_ORIGIN = 'https://www.wefik.world';
let warnedMissingProdOrigin = false;

/**
 * Resolve the canonical site origin from environment configuration.
 * Throws if an explicitly configured URL is malformed or if NEXT_PUBLIC_SITE_URL
 * conflicts with NEXT_PUBLIC_APP_URL.
 */
export function getConfiguredSiteOrigin(env: NodeJS.ProcessEnv = process.env): string {
  const appUrlRaw = (env.NEXT_PUBLIC_APP_URL || '').trim();
  const siteUrlRaw = (env.NEXT_PUBLIC_SITE_URL || '').trim();

  if (appUrlRaw && siteUrlRaw) {
    const appOrigin = new URL(appUrlRaw).origin;
    const siteOrigin = new URL(siteUrlRaw).origin;
    if (appOrigin !== siteOrigin) {
      throw new Error(
        `Conflicting site URL configuration: NEXT_PUBLIC_APP_URL (${appOrigin}) !== NEXT_PUBLIC_SITE_URL (${siteOrigin})`
      );
    }
  }

  const raw = appUrlRaw || siteUrlRaw;
  if (!raw) {
    if (env.NODE_ENV === 'production' && !warnedMissingProdOrigin) {
      warnedMissingProdOrigin = true;
      console.error(
        `[auth/redirects] NEXT_PUBLIC_APP_URL is missing in production; defaulting to ${DEFAULT_PRODUCTION_ORIGIN}`
      );
    }
    return DEFAULT_PRODUCTION_ORIGIN;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`Invalid site URL configuration: "${raw}"`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Invalid site URL protocol: "${parsed.protocol}"`);
  }

  return parsed.origin;
}

/**
 * Determine the origin to use for OAuth / magic-link `redirectTo` and callback redirects.
 * Uses `requestOrClientOrigin` only for localhost/127.0.0.1 and Vercel preview hosts,
 * and always uses the configured canonical origin otherwise (never trusting spoofed Host headers).
 */
export function getAuthRedirectOrigin(
  requestOrClientOrigin?: string,
  env: NodeJS.ProcessEnv = process.env
): string {
  if (requestOrClientOrigin) {
    try {
      const parsed = new URL(requestOrClientOrigin);
      const host = parsed.hostname.toLowerCase();
      if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app')) {
        return parsed.origin;
      }
    } catch {
      // Fall through to configured canonical origin
    }
  }

  return getConfiguredSiteOrigin(env);
}

/**
 * Sanitize the `next` redirect path to prevent open redirects.
 * Rejects protocol-relative URLs, backslashes, control characters, javascript:, and foreign origins.
 * Accepts valid relative paths (including encoded ones) and same-origin full URLs.
 */
export function sanitizeNextPath(rawNext: string | null | undefined, canonicalOrigin?: string): string {
  if (!rawNext || typeof rawNext !== 'string') {
    return '/account';
  }

  let candidate = rawNext.trim();
  if (!candidate) {
    return '/account';
  }

  // Decode up to 2 times for encoded relative paths, but reject if control chars or backslashes appear
  for (let i = 0; i < 2; i++) {
    if (/%[0-9a-f]{2}/i.test(candidate)) {
      try {
        const decoded = decodeURIComponent(candidate);
        if (decoded === candidate) break;
        candidate = decoded.trim();
      } catch {
        return '/account';
      }
    }
  }

  // Reject ASCII control characters (0x00-0x1F, 0x7F), whitespace inside scheme/prefix, or backslashes
  if (/[\u0000-\u001f\u007f]/.test(candidate) || candidate.includes('\\')) {
    return '/account';
  }

  const lower = candidate.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return '/account';
  }

  // Accept same-origin full URLs by extracting path + search + hash
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    try {
      const parsed = new URL(candidate);
      const allowedOrigin = canonicalOrigin || getConfiguredSiteOrigin();
      if (parsed.origin === allowedOrigin) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/account';
      }
      return '/account';
    } catch {
      return '/account';
    }
  }

  // Must start with a single '/' and never '//'
  if (!candidate.startsWith('/') || candidate.startsWith('//')) {
    return '/account';
  }

  return candidate;
}

/**
 * Build the canonical `/auth/callback` redirect URL with sanitized `next` parameter.
 */
export function buildAuthCallbackUrl(
  nextPath?: string | null,
  clientOrigin?: string,
  env: NodeJS.ProcessEnv = process.env
): string {
  const origin = getAuthRedirectOrigin(clientOrigin, env);
  const safeNext = sanitizeNextPath(nextPath, origin);
  return `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}
