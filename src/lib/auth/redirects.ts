const DEFAULT_PRODUCTION_ORIGIN = 'https://www.wefik.world';

/**
 * Resolve the canonical site origin from environment configuration.
 * Throws if an explicitly configured URL is malformed.
 */
export function getConfiguredSiteOrigin(env: NodeJS.ProcessEnv = process.env): string {
  const raw = (env.NEXT_PUBLIC_APP_URL || env.NEXT_PUBLIC_SITE_URL || '').trim();
  if (!raw) {
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
 * Determine the origin to use for OAuth / magic-link `redirectTo` on the client.
 * Uses `window.location.origin` for localhost/127.0.0.1 and Vercel preview hosts,
 * and the configured canonical origin in production so sign-in and callback share the same host.
 */
export function getAuthRedirectOrigin(
  clientOrigin?: string,
  env: NodeJS.ProcessEnv = process.env
): string {
  if (clientOrigin) {
    try {
      const parsedClient = new URL(clientOrigin);
      const host = parsedClient.hostname.toLowerCase();
      if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app')) {
        return parsedClient.origin;
      }
    } catch {
      // Fall through to configured canonical origin
    }
  }

  return getConfiguredSiteOrigin(env);
}

/**
 * Sanitize the `next` redirect path to prevent open redirects.
 * Accepts relative paths (including URL-encoded ones) and same-origin full URLs.
 */
export function sanitizeNextPath(rawNext: string | null | undefined, canonicalOrigin?: string): string {
  if (!rawNext || typeof rawNext !== 'string') {
    return '/account';
  }

  let candidate = rawNext.trim();
  if (!candidate) {
    return '/account';
  }

  // Decode up to 2 times if URL-encoded (e.g. %2Faccount%2Flibrary)
  for (let i = 0; i < 2; i++) {
    if (candidate.startsWith('%2F') || candidate.startsWith('%2f')) {
      try {
        candidate = decodeURIComponent(candidate);
      } catch {
        break;
      }
    }
  }

  // Accept same-origin full URLs by extracting path + search + hash
  if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
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

  // Must start with a single '/' and never '//' or '/\'
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.startsWith('/\\')) {
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
