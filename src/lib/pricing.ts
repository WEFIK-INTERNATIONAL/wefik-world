/**
 * Shared pricing constants.
 *
 * The unlimited-license multiplier is awaiting a business decision.
 * The server (create-order) uses 2.0×; the UI (product-detail-view, product-card)
 * previously hardcoded 2.5×. This constant unifies them so the value is changed
 * in one place once the owner decides.
 *
 * TODO: Owner to decide between 2.0 and 2.5 — see Task 5 in fix/critical-integrity.
 */
export const UNLIMITED_LICENSE_MULTIPLIER = 2.0;

