/**
 * Shared Motion Tokens for wefik.world
 *
 * Single source of truth for GSAP & CSS animation durations and easings.
 * All interactive motion should use transform and opacity only.
 */

export const MOTION_DURATION = {
  /** Micro-interactions (hover, press, focus): 180ms */
  fast: 0.18,
  /** Standard UI transitions (menus, drawers, magnetic settle): 300ms */
  base: 0.3,
  /** Expressive reveals (page wipes, hero tilt, stat counter): 550ms */
  slow: 0.55,
  /** Ambient loops (404 float): 2.4s */
  ambient: 2.4,
} as const;

export const MOTION_EASE = {
  /** Primary deceleration curve for entrances and settles */
  out: 'power3.out',
  /** Symmetric curve for page wipe transitions */
  inOut: 'expo.inOut',
  /** Exit acceleration curve */
  in: 'power3.in',
  /** Gentle sine curve for ambient loops */
  ambient: 'sine.inOut',
  /** CSS cubic-bezier equivalent of power3.out */
  cssOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const;

