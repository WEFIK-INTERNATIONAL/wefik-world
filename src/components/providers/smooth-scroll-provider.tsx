'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion, useLowEndDevice } from '@/hooks/use-reduced-motion';

// Register ScrollTrigger plugin safely on client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface LenisContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: Record<string, unknown>) => void;
  stopScroll: (source?: string) => void;
  startScroll: (source?: string) => void;
  forceResetScroll: () => void;
}

const LenisContext = createContext<LenisContextType>({
  lenis: null,
  scrollTo: () => {},
  stopScroll: () => {},
  startScroll: () => {},
  forceResetScroll: () => {},
});

export function useLenis() {
  return useContext(LenisContext);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const isLowEnd = useLowEndDevice();
  const shouldDisable = prefersReducedMotion || isLowEnd;

  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const lockCountRef = useRef(0);

  // Initialize strictly ONE Lenis instance in root layout
  useEffect(() => {
    // Reduced motion & low-end gate: Lenis OFF, native scrolling used
    if (shouldDisable || typeof window === 'undefined') {
      return;
    }

    // StrictMode double-mount guard
    if (lenisRef.current) {
      lenisRef.current.destroy();
      lenisRef.current = null;
    }

    // Baseline configuration per Section 1: lerp 0.1, smoothWheel true, wheelMultiplier 1, touchMultiplier 1.5
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // Wire Lenis scroll events to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis directly via GSAP ticker
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger after font & layout settle
    if (document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [shouldDisable]);

  // Smooth scroll helper
  const scrollTo = useCallback((target: string | number | HTMLElement, options?: Record<string, unknown>) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    } else if (typeof window !== 'undefined') {
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: shouldDisable ? 'auto' : 'smooth' });
      } else if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: shouldDisable ? 'auto' : 'smooth' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: shouldDisable ? 'auto' : 'smooth' });
      }
    }
  }, [shouldDisable]);

  // Reference-counted scroll-lock to prevent stuck scroll states
  const stopScroll = useCallback((source = 'unknown') => {
    lockCountRef.current += 1;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Lenis] stopScroll() called by: ${source} (active locks: ${lockCountRef.current})`);
    }
    if (lenisRef.current) {
      lenisRef.current.stop();
    }
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const startScroll = useCallback((source = 'unknown') => {
    lockCountRef.current = Math.max(0, lockCountRef.current - 1);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Lenis] startScroll() called by: ${source} (remaining locks: ${lockCountRef.current})`);
    }
    if (lockCountRef.current === 0) {
      if (lenisRef.current) {
        lenisRef.current.start();
      }
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }
  }, []);

  const forceResetScroll = useCallback(() => {
    lockCountRef.current = 0;
    if (lenisRef.current) {
      lenisRef.current.start();
    }
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }, []);

  // Intercept anchor links site-wide: route <a href="#..."> through lenis.scrollTo()
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const element = document.querySelector(href);
        if (element) {
          e.preventDefault();
          scrollTo(element as HTMLElement, { offset: -80 });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [scrollTo]);

  return (
    <LenisContext.Provider
      value={{
        lenis: lenisInstance,
        scrollTo,
        stopScroll,
        startScroll,
        forceResetScroll,
      }}
    >
      {children}
    </LenisContext.Provider>
  );
}
