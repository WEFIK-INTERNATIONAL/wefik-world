/**
 * src/lib/security/hibp.ts
 * Implements Have I Been Pwned (HIBP) k-anonymity password checking.
 * Only the first 5 characters of the SHA-1 hash are sent to api.pwnedpasswords.com.
 * Fail-open design: network issues or timeouts NEVER block legitimate users.
 */

export async function isPasswordBreached(password: string): Promise<{ breached: boolean; count?: number }> {
  if (!password || password.length === 0) {
    return { breached: false };
  }

  try {
    // Generate SHA-1 hash using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    // Query HIBP range endpoint with 2.5s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true', // Prevents response size side-channels
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`HIBP responded with status ${response.status}. Failing open.`);
      return { breached: false };
    }

    const text = await response.text();
    const lines = text.split('\r\n');

    for (const line of lines) {
      const [entrySuffix, countStr] = line.split(':');
      if (entrySuffix && entrySuffix.toUpperCase() === suffix) {
        const count = parseInt(countStr || '0', 10);
        return { breached: true, count };
      }
    }

    return { breached: false };
  } catch (err: unknown) {
    // Fail-open: Never block users on DNS failure or network timeout
    const message = err instanceof Error ? err.message : String(err);
    console.warn('HIBP check error (failing open):', message);
    return { breached: false };
  }
}
