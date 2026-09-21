/**
 * Crypto-random license key generator for wefik.world
 * Format: WFK-XXXX-XXXX-XXXX
 * Uses unambiguous characters (excluding O, 0, I, 1, L)
 */
const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateLicenseKey(): string {
  const segment = (len: number = 4) => {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    let result = "";
    for (let i = 0; i < len; i++) {
      result += CHARSET[bytes[i] % CHARSET.length];
    }
    return result;
  };

  return `WFK-${segment(4)}-${segment(4)}-${segment(4)}`;
}
