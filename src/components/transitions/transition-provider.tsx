'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useLenis } from '@/components/providers/smooth-scroll-provider';

interface TransitionContextType {
  navigate: (href: string) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextType>({
  navigate: () => {},
  isTransitioning: false,
});

export function usePageTransition() {
  return useContext(TransitionContext);
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const { scrollTo } = useLenis();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [, startTransition] = useTransition();

  const inkPanelRef = useRef<HTMLDivElement | null>(null);
  const limePanelRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const targetHrefRef = useRef<string | null>(null);

  // Initial panel positioning offscreen
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.set([inkPanelRef.current, limePanelRef.current], {
      yPercent: 100,
    });
  }, []);

  // Handle browser back / forward navigation (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      if (prefersReducedMotion) return;
      // Quick 250ms fade per Section 3
      const main = document.querySelector('main');
      if (main) {
        gsap.fromTo(main, { opacity: 0.4 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [prefersReducedMotion]);

  // Reveal phase when pathname changes after a transition
  useEffect(() => {
    if (!isTransitioning || prefersReducedMotion) {
      return;
    }

    // Panels wipe out upward staggered per Section 3
    const tl = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        setShowProgressBar(false);
        // Reset panels to bottom for next transition
        gsap.set([inkPanelRef.current, limePanelRef.current], { yPercent: 100 });
      },
    });

    // Wipe out panels upward: yPercent: 0 -> -100
    tl.to([limePanelRef.current, inkPanelRef.current], {
      yPercent: -100,
      duration: 0.55,
      stagger: 0.1,
      ease: 'expo.out',
    });

    // Animate in new page content (y: 35 -> 0, opacity: 0 -> 1)
    const main = document.querySelector('main');
    if (main) {
      tl.fromTo(
        main,
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' },
        '-=0.45'
      );
    }
  }, [pathname, isTransitioning, prefersReducedMotion]);

  // The custom Barba-free transition engine
  const navigate = (href: string) => {
    if (href === pathname || isTransitioning) {
      return;
    }

    targetHrefRef.current = href;

    // Reduced motion guard: Instant cut
    if (prefersReducedMotion) {
      router.push(href);
      return;
    }

    setIsTransitioning(true);

    // Show top progress bar if route takes >400ms per Section 3
    const progressTimer = setTimeout(() => {
      setShowProgressBar(true);
    }, 400);

    // Scroll reset: on transition start lenis.scrollTo(0, { immediate: true })
    scrollTo(0, { immediate: true });

    // Current page content subtly scales down (0.98) and fades
    const main = document.querySelector('main');
    if (main) {
      gsap.to(main, {
        scale: 0.98,
        opacity: 0.6,
        duration: 0.35,
        ease: 'power2.in',
      });
    }

    // Cover Phase: two panels (Ink, then Lime) wipe in from bottom with expo.inOut stagger (700ms)
    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(progressTimer);
        // router.push happens mid-cover so content swap is completely invisible to user
        startTransition(() => {
          router.push(href);
        });
      },
    });

    tl.set([inkPanelRef.current, limePanelRef.current], { yPercent: 100 });

    tl.to([inkPanelRef.current, limePanelRef.current], {
      yPercent: 0,
      duration: 0.65,
      stagger: 0.08,
      ease: 'expo.inOut',
    });
  };

  return (
    <TransitionContext.Provider value={{ navigate, isTransitioning }}>
      {/* Top Thin Lime Progress Bar for slow routes (>400ms) */}
      {showProgressBar && (
        <div className="fixed top-0 inset-x-0 h-1 z-[99999] pointer-events-none overflow-hidden bg-black/10">
          <div
            ref={progressBarRef}
            className="h-full bg-lime animate-pulse transition-all duration-300 w-full"
          />
        </div>
      )}

      {/* Wipe Panels (Ink, then Lime) */}
      <div
        ref={inkPanelRef}
        aria-hidden="true"
        className="fixed inset-0 z-[99990] bg-[#202124] pointer-events-none will-change-transform"
      />
      <div
        ref={limePanelRef}
        aria-hidden="true"
        className="fixed inset-0 z-[99995] bg-lime pointer-events-none will-change-transform"
      />

      {children}
    </TransitionContext.Provider>
  );
}
