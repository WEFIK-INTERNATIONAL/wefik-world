'use client';

import { useSyncExternalStore } from 'react';

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/**
 * Global hook to observe and enforce user's prefers-reduced-motion OS setting.
 * All animations (GSAP, Lenis, Preloader, Transitions) must respect this.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

interface NetworkInformation {
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

function checkIsLowEnd(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const concurrency = navigator.hardwareConcurrency ?? 8;
  const nav = navigator as NavigatorWithConnection;
  const saveData = Boolean(nav.connection?.saveData);

  return concurrency <= 4 || saveData;
}

const emptySubscribe = () => () => {};

/**
 * Low-end device gate per Section 1:
 * if navigator.hardwareConcurrency <= 4 OR navigator.connection.saveData
 * -> disable Lenis + parallax + magnetic effects (core fades still OK).
 */
export function useLowEndDevice(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    checkIsLowEnd,
    () => false
  );
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
