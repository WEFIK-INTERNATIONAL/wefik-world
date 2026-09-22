'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { usePreloaderProgress } from '@/hooks/use-preloader-progress';
import { useMotionGates } from '@/hooks/use-reduced-motion';
import { Logo } from '@/components/brand/logo';
import { Zap, Palette, Code, Sparkles, Cpu } from 'lucide-react';

export function UnboxingPreloader() {
  const { progress, isLoaded } = usePreloaderProgress();
  const { disableHeavyMotion } = useMotionGates();
  const [mounted, setMounted] = useState(true);
  const [isReturnVisitor, setIsReturnVisitor] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const lidRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<HTMLDivElement | null>(null);
  const heroCardRef = useRef<HTMLDivElement | null>(null);
  const dustRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Check once-per-session storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = sessionStorage.getItem('wfk_intro_seen');
    if (seen === 'true') {
      setIsReturnVisitor(true);
    }
  }, []);

  // Failsafe timer: ensure preloader unmounts even if GSAP or window event stalls
  useEffect(() => {
    const failsafe = setTimeout(() => {
      setMounted(false);
    }, 3800);
    return () => clearTimeout(failsafe);
  }, []);

  // Animate preloader once mounted
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    // Return visitors get a rapid 600ms logo pulse per Section 3
    if (isReturnVisitor) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.35,
            ease: 'power2.out',
            onComplete: () => setMounted(false),
          });
        } else {
          setMounted(false);
        }
      }, 600);
      return () => clearTimeout(timer);
    }

    // Reduced motion or low-end gate fallback: Clean static centered logo + thin progress bar
    if (disableHeavyMotion) {
      if (isLoaded) {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            sessionStorage.setItem('wfk_intro_seen', 'true');
            setMounted(false);
          },
        });
      }
      return;
    }

    // Full 4-Phase Cinematic Unboxing via GSAP Timeline
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          sessionStorage.setItem('wfk_intro_seen', 'true');
          setMounted(false);
        },
      });

      timelineRef.current = tl;

      // Initial positions
      gsap.set(boxRef.current, { y: -350, scaleY: 1.1, scaleX: 0.9, opacity: 0 });
      gsap.set(lidRef.current, { transformOrigin: 'top right' });
      gsap.set('.unboxing-item', { scale: 0, opacity: 0, x: 0, y: 0 });
      gsap.set('.dust-particle', { scale: 0, opacity: 0 });

      // PHASE 1: The Drop (0 -> 0.6s)
      tl.to(boxRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.55,
        ease: 'bounce.out',
      })
        .to(
          boxRef.current,
          {
            scaleX: 1.15,
            scaleY: 0.85,
            duration: 0.1,
            ease: 'power2.out',
          },
          '-=0.15'
        )
        .to(boxRef.current, {
          scaleX: 1,
          scaleY: 1,
          duration: 0.15,
          ease: 'elastic.out(1, 0.4)',
        })
        // Dust kick on impact
        .to(
          '.dust-particle',
          {
            scale: 1,
            opacity: 1,
            x: (i) => (i % 2 === 0 ? -40 - i * 10 : 40 + i * 10),
            y: (i) => -15 - (i % 3) * 10,
            duration: 0.35,
            stagger: 0.02,
            ease: 'power2.out',
          },
          '-=0.2'
        )
        .to(
          '.dust-particle',
          {
            opacity: 0,
            scale: 0.5,
            duration: 0.25,
            ease: 'power2.in',
          },
          '-=0.1'
        );

      // PHASE 2: The Burst (0.6s -> 1.4s)
      // Lid snaps open
      tl.to(
        lidRef.current,
        {
          rotateZ: -110,
          x: -25,
          y: -15,
          duration: 0.35,
          ease: 'back.out(2)',
        },
        '+=0.05'
      )
        // Box shakes with energy
        .to(
          boxRef.current,
          {
            rotateZ: 3,
            duration: 0.06,
            yoyo: true,
            repeat: 3,
            ease: 'sine.inOut',
          },
          '-=0.3'
        )
        // 5 Category items fly out radially
        .to(
          '.unboxing-item',
          {
            scale: 1,
            opacity: 1,
            duration: 0.55,
            stagger: 0.05,
            ease: 'back.out(1.8)',
            x: (i) => {
              const offsets = [0, -110, 110, -85, 85];
              return offsets[i] || 0;
            },
            y: (i) => {
              const offsets = [-80, -120, -110, 50, 60];
              return offsets[i] || 0;
            },
          },
          '-=0.25'
        );

      // PHASE 3: The Dive (1.4s -> 2.2s)
      // Non-hero items fade and drift outward
      tl.to(
        '.unboxing-item:not(.hero-item)',
        {
          opacity: 0,
          scale: 0.7,
          x: (i) => (i % 2 === 0 ? -160 : 160),
          duration: 0.4,
          ease: 'power2.in',
        },
        '+=0.1'
      )
        // Box drops away
        .to(
          boxRef.current,
          {
            scale: 0.5,
            opacity: 0,
            y: 80,
            duration: 0.35,
            ease: 'power2.in',
          },
          '-=0.35'
        )
        // Hero Card moves to exact center and expands
        .to(
          heroCardRef.current,
          {
            x: 0,
            y: 0,
            scale: 1.35,
            boxShadow: '0 0 60px rgba(163, 230, 53, 0.4)',
            duration: 0.5,
            ease: 'power3.out',
          },
          '-=0.3'
        );

      // PHASE 4: Seamless Reveal (2.2s -> 2.8s)
      tl.to(heroCardRef.current, {
        scale: 4,
        opacity: 0,
        duration: 0.45,
        ease: 'power3.in',
      }).to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out',
        },
        '-=0.25'
      );
    }, containerRef);

    return () => ctx.revert();
  }, [mounted, isReturnVisitor, disableHeavyMotion]);

  // Trigger timeline play when progress reaches ready or asset loaded
  useEffect(() => {
    if (timelineRef.current && !isReturnVisitor && !disableHeavyMotion) {
      if (timelineRef.current.progress() === 0) {
        timelineRef.current.play();
      }
    }
  }, [isReturnVisitor, disableHeavyMotion]);

  // Click / tap instantly skips to reveal
  const handleSkip = () => {
    if (timelineRef.current) {
      timelineRef.current.seek(timelineRef.current.duration() - 0.35);
    } else {
      sessionStorage.setItem('wfk_intro_seen', 'true');
      setMounted(false);
    }
  };

  if (!mounted) return null;

  // Return visitor quick pulse
  if (isReturnVisitor) {
    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        className="fixed inset-0 z-[9999] bg-[var(--bg)] flex items-center justify-center pointer-events-none transition-colors duration-200"
      >
        <div className="flex items-center gap-2.5 animate-pulse">
          <Logo size="sm" showWordmark={true} />
        </div>
      </div>
    );
  }

  // Reduced motion or low-end gate view: static centered logo + thin progress bar
  if (disableHeavyMotion) {
    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        onClick={handleSkip}
        className="fixed inset-0 z-[9999] bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors duration-200"
      >
        <div className="space-y-4 max-w-xs w-full flex flex-col items-center">
          <Logo size="lg" showWordmark={true} />
          <p className="text-xs text-[var(--muted)]">Loading marketplace assets...</p>
          <div className="w-full h-1 bg-[var(--surface-2)] rounded-full overflow-hidden border border-[var(--border)]">
            <div
              className="h-full bg-lime transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider block">
            Click anywhere to skip
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      onClick={handleSkip}
      className="fixed inset-0 z-[9999] bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none transition-colors duration-200"
    >
      {/* 3D Scene Wrapper */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Dust Particles for landing */}
        <div ref={dustRef} className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="dust-particle absolute w-2 h-2 rounded-full bg-lime/80 shadow-xs shadow-lime"
            />
          ))}
        </div>

        {/* Wefik Shipping Box (CSS 3D / Isometric Aesthetic carrying Logo) */}
        <div
          ref={boxRef}
          className="relative w-32 h-32 bg-[var(--surface)] dark:bg-[#141714] rounded-2xl border border-[var(--border)] shadow-2xl flex flex-col items-center justify-center z-10"
        >
          {/* Lime Tape Stripe */}
          <div className="absolute inset-y-0 w-8 bg-lime/90 flex items-center justify-center shadow-inner">
            <span className="text-[9px] font-mono font-bold text-ink tracking-widest rotate-90 uppercase">
              WEFIK
            </span>
          </div>

          {/* Box Lid */}
          <div
            ref={lidRef}
            className="absolute -top-3 inset-x-0 h-4 bg-[var(--surface-2)] dark:bg-[#1C211C] rounded-t-xl border-t border-x border-[var(--border)] shadow-md"
          />

          {/* Front Box Seal with official Logo mark */}
          <div className="relative z-10 w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center shadow-md">
            <Logo markOnly size={22} />
          </div>
        </div>

        {/* Bursting Category Items & Chips (Phase 2 & 3) */}
        <div ref={itemsRef} className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          {/* 1. Hero Card (Featured Theme - The one that dives in Phase 3) */}
          <div
            ref={heroCardRef}
            className="unboxing-item hero-item absolute px-3.5 py-2.5 rounded-xl bg-ink border-2 border-lime text-white shadow-xl shadow-lime/20 flex items-center gap-2"
          >
            <div className="w-4 h-4 rounded-md bg-lime text-ink flex items-center justify-center font-bold text-[10px]">
              ★
            </div>
            <span className="text-[11px] font-bold font-display tracking-tight">AgencyPro Theme</span>
          </div>

          {/* 2. Plugin Puzzle */}
          <div className="unboxing-item absolute p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-lime shadow-lg flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold text-[var(--text)]">SuperCache</span>
          </div>

          {/* 3. HTML Template Chip */}
          <div className="unboxing-item absolute p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sky-400 shadow-lg flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold text-[var(--text)]">Tailwind HTML</span>
          </div>

          {/* 4. Code Snippet Chip */}
          <div className="unboxing-item absolute p-2 rounded-xl bg-[var(--surface-2)] border border-lime/40 text-lime shadow-lg flex items-center gap-1 font-mono text-[10px] font-bold">
            <Code className="w-3 h-3" />
            <span>&lt;/&gt;</span>
          </div>

          {/* 5. Mobile / Starter Chip */}
          <div className="unboxing-item absolute p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-emerald-400 shadow-lg flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold text-[var(--text)]">Next.js Starter</span>
          </div>
        </div>
      </div>

      {/* Real Progress Bar & Skip Hint */}
      <div className="mt-8 flex flex-col items-center gap-2 w-48 max-w-xs">
        <div className="w-full h-1 bg-[var(--surface-2)] rounded-full overflow-hidden border border-[var(--border)]">
          <div
            className="h-full bg-lime transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-[var(--muted)] tracking-wider uppercase">
          Click anywhere to skip
        </span>
      </div>
    </div>
  );
}
