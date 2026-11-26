/**
 * HTML escaping utility for user-supplied content interpolated into emails.
 * Prevents XSS in HTML email bodies rendered by mail clients.
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] || ch);
}

