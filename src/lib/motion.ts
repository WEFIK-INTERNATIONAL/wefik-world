/**
 * Shared Motion Tokens for wefik.world
 *
 * Single source of truth for GSAP & CSS animation durations and easings.
 * All interactive motion uses transform and opacity only.
 */

export const MOTION_DURATION = {
  fast: 0.18,
  base: 0.3,
  slow: 0.55,
} as const;

export const MOTION_EASE = {
  out: 'power3.out',
  in: 'power3.in',
  inOut: 'expo.inOut',
} as const;

