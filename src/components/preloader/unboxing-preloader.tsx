'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useLenis } from '@/components/providers/smooth-scroll-provider';
import { Logo } from '@/components/brand/logo';
import { MOTION_EASE } from '@/lib/motion';

const SESSION_KEY = 'wfk_intro_seen';
const EASE_PRIMARY = MOTION_EASE.out;

/**
 * First-visit unboxing preloader.
 * - Plays once per browser session (skipped immediately for same-session returners).
 * - Uses CSS 3D perspective + preserve-3d so the lid hinges on its back top edge.
 * - Animates transform and opacity only; exits early once page assets are ready.
 * - Respects prefers-reduced-motion with a simple opacity fade.
 */
export function UnboxingPreloader() {
  const prefersReducedMotion = useReducedMotion();
  const { stopScroll, startScroll } = useLenis();

  // Server and initial client render MUST match identically (no window/sessionStorage branching here)
  const [mounted, setMounted] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const lidRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isExitingRef = useRef(false);

  // Lock smooth scroll while preloader is visible; always restore on unmount
  useEffect(() => {
    if (!mounted) return;
    stopScroll('unboxing-preloader');
    return () => {
      startScroll('unboxing-preloader');
    };
  }, [mounted, stopScroll, startScroll]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    // Same-session returners are already hidden by CSS via data-preloader="skip"; unmount immediately
    try {
      if (
        sessionStorage.getItem(SESSION_KEY) === 'true' ||
        document.documentElement.getAttribute('data-preloader') === 'skip'
      ) {
        queueMicrotask(() => setMounted(false));
        return;
      }
    } catch {
      // Ignore storage errors
    }

    const markSeenAndUnmount = () => {
      try {
        sessionStorage.setItem(SESSION_KEY, 'true');
        document.documentElement.setAttribute('data-preloader', 'skip');
      } catch {
        // Ignore storage errors in restricted contexts
      }
      setMounted(false);
    };

    const fadeOut = (duration = 0.3) => {
      if (isExitingRef.current) return;
      isExitingRef.current = true;
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      if (!containerRef.current) {
        markSeenAndUnmount();
        return;
      }
      gsap.to(containerRef.current, {
        opacity: 0,
        duration,
        ease: EASE_PRIMARY,
        onComplete: markSeenAndUnmount,
      });
    };

    // Reduced motion: simple fade out as soon as document is interactive/ready
    if (prefersReducedMotion) {
      const timer = setTimeout(() => fadeOut(0.25), 180);
      return () => clearTimeout(timer);
    }

    // Track real page readiness so we can exit early if the page is already loaded
    let pageReady = document.readyState === 'complete';
    const onLoad = () => {
      pageReady = true;
    };
    if (!pageReady) {
      window.addEventListener('load', onLoad, { once: true });
    }

    // Hard failsafe at 1.9s so LCP/content is never blocked
    const failsafeTimer = setTimeout(() => fadeOut(0.25), 1900);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: markSeenAndUnmount,
      });
      timelineRef.current = tl;

      // Initial states (transform & opacity only)
      gsap.set(boxRef.current, { y: -48, scale: 0.94, opacity: 0 });
      gsap.set(shadowRef.current, { scaleX: 0.65, scaleY: 0.8, opacity: 0 });
      gsap.set(lidRef.current, {
        transformOrigin: '50% 0% -48px',
        rotationX: 0,
      });
      gsap.set(badgeRef.current, { y: 12, scale: 0.85, opacity: 0 });

      // 1. Box settles onto surface with weight (0.00s -> 0.42s)
      tl.to(
        boxRef.current,
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.42,
          ease: EASE_PRIMARY,
        },
        0
      )
        .to(
          shadowRef.current,
          {
            scaleX: 1,
            scaleY: 1,
            opacity: 0.35,
            duration: 0.42,
            ease: EASE_PRIMARY,
          },
          0
        )
        // 2. Lid hinges on back top edge and rotates up & away with subtle overshoot + settle (0.36s -> 1.00s)
        .to(
          lidRef.current,
          {
            rotationX: 122,
            duration: 0.42,
            ease: EASE_PRIMARY,
          },
          0.36
        )
        .to(
          lidRef.current,
          {
            rotationX: 110,
            duration: 0.22,
            ease: EASE_PRIMARY,
          },
          0.78
        )
        // Shadow responds to lid opening (widens & softens slightly)
        .to(
          shadowRef.current,
          {
            scaleX: 1.18,
            opacity: 0.22,
            duration: 0.45,
            ease: EASE_PRIMARY,
          },
          0.36
        )
        // 3. Brand mark rises gently from inside the open box (0.52s -> 0.98s)
        .to(
          badgeRef.current,
          {
            y: -26,
            scale: 1,
            opacity: 1,
            duration: 0.46,
            ease: EASE_PRIMARY,
          },
          0.52
        )
        // Early-exit check: if page is already ready after lid opens, proceed directly to reveal
        .call(() => {
          if (pageReady && tl.time() < 1.1) {
            tl.seek(1.1);
          }
        })
        // 4. Clean fade-out reveal (1.15s -> 1.55s, total ~1.55s)
        .to(
          [boxRef.current, shadowRef.current, badgeRef.current],
          {
            y: -10,
            opacity: 0,
            duration: 0.3,
            ease: EASE_PRIMARY,
          },
          1.15
        )
        .to(
          containerRef.current,
          {
            opacity: 0,
            duration: 0.32,
            ease: EASE_PRIMARY,
          },
          1.23
        );
    }, containerRef);

    return () => {
      clearTimeout(failsafeTimer);
      window.removeEventListener('load', onLoad);
      ctx.revert();
    };
  }, [mounted, prefersReducedMotion]);

  const handleSkip = () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
      document.documentElement.setAttribute('data-preloader', 'skip');
    } catch {
      // Ignore storage errors
    }
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: EASE_PRIMARY,
        onComplete: () => setMounted(false),
      });
    } else {
      setMounted(false);
    }
  };

  // Allow Escape / Enter / Space to skip without trapping focus
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
     
  }, [mounted]);

  if (!mounted) return null;

  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        data-wefik-preloader="true"
        aria-hidden="true"
        onClick={handleSkip}
        className="fixed inset-0 z-[9999] bg-[var(--bg)] flex items-center justify-center pointer-events-none"
      >
        <Logo size="md" showWordmark={true} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-wefik-preloader="true"
      aria-hidden="true"
      onClick={handleSkip}
      className="fixed inset-0 z-[9999] bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center cursor-pointer select-none"
    >
      {/* 3D Scene Wrapper with perspective on parent */}
      <div
        className="relative w-64 h-64 flex flex-col items-center justify-center"
        style={{ perspective: '900px' }}
      >
        {/* Emerging Brand Badge */}
        <div
          ref={badgeRef}
          className="relative z-20 mb-2 px-3.5 py-2 rounded-xl bg-[var(--surface)] border border-lime/60 shadow-lg flex items-center gap-2 will-change-transform"
        >
          <Logo size="sm" showWordmark={true} />
        </div>

        {/* 3D Package / Gift Box */}
        <div
          ref={boxRef}
          className="relative w-32 h-24 rounded-2xl bg-[var(--surface)] dark:bg-[#141714] border border-[var(--border)] shadow-xl flex items-center justify-center z-10 will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Vertical Lime Tape Stripe */}
          <div className="absolute inset-y-0 w-7 bg-lime/90 flex items-center justify-center">
            <span className="text-[8px] font-mono font-black text-[#0a0f0a] tracking-widest rotate-90 uppercase">
              WEFIK
            </span>
          </div>

          {/* Front Box Seal */}
          <div className="relative z-10 w-9 h-9 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center shadow-sm">
            <Logo markOnly size={20} />
          </div>

          {/* Hinged Lid (Back-Top Edge Pivot) */}
          <div
            ref={lidRef}
            className="absolute -top-3 -inset-x-1 h-5 will-change-transform"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Outer Lid Face */}
            <div
              className="absolute inset-0 rounded-t-xl rounded-b-sm bg-[var(--surface-2)] dark:bg-[#1C211C] border border-[var(--border)] shadow-md flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="w-7 h-full bg-lime/90" />
            </div>
            {/* Inner Lid Face (prevents bleed-through when rotated open) */}
            <div
              className="absolute inset-0 rounded-t-xl rounded-b-sm bg-[var(--surface)] dark:bg-[#0f120f] border border-[var(--border)]"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateX(180deg)',
              }}
            />
          </div>
        </div>

        {/* Ground Shadow responding to box weight & lid motion */}
        <div
          ref={shadowRef}
          className="mt-4 w-32 h-3 rounded-full bg-black/25 dark:bg-black/60 blur-md will-change-transform"
        />
      </div>
    </div>
  );
}
