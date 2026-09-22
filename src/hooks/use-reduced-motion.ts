'use client';

import { useState, useEffect } from 'react';

/**
 * Global hook to observe and enforce user's prefers-reduced-motion OS setting.
 * All animations (GSAP, Lenis, Preloader, Transitions) must respect this.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Low-end device gate per Section 1:
 * if navigator.hardwareConcurrency <= 4 OR navigator.connection.saveData
 * -> disable Lenis + parallax + magnetic effects (core fades still OK).
 */
export function useLowEndDevice(): boolean {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    const concurrency = navigator.hardwareConcurrency ?? 8;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connection = (navigator as any).connection;
    const saveData = Boolean(connection && connection.saveData);

    if (concurrency <= 4 || saveData) {
      setIsLowEnd(true);
    }
  }, []);

  return isLowEnd;
}

/**
 * Helper hook combining reduced motion and low-end hardware gates.
 */
export function useMotionGates() {
  const prefersReducedMotion = useReducedMotion();
  const isLowEnd = useLowEndDevice();

  return {
    prefersReducedMotion,
    isLowEnd,
    disableHeavyMotion: prefersReducedMotion || isLowEnd,
  };
}
