'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { usePreloaderProgress } from '@/hooks/use-preloader-progress';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Sparkles, Code, Package, Palette, Zap, Cpu, ArrowRight } from 'lucide-react';

export function UnboxingPreloader() {
  const { progress, isLoaded } = usePreloaderProgress();
  const prefersReducedMotion = useReducedMotion();
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

  // Animate preloader once mounted
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    // Return visitors get a rapid 600ms logo pulse per Section 2
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

    // Reduced motion fallback: Clean, static centered logo + thin progress bar
    if (prefersReducedMotion) {
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
          ease: 'elastic.out(1, 0.3)',
        })
        .to(
          '.dust-particle',
          {
            scale: 1,
            opacity: 0.8,
            y: (i) => (i % 2 === 0 ? -25 : -15),
            x: (i) => (i % 2 === 0 ? -30 : 30),
            duration: 0.3,
            stagger: 0.03,
            ease: 'power2.out',
          },
          '-=0.2'
        )
        .to(
          '.dust-particle',
          {
            opacity: 0,
            scale: 0.5,
            duration: 0.2,
          },
          '-=0.1'
        );

      // PHASE 2: The Burst (0.6 -> 1.5s)
      tl.to(lidRef.current, {
        rotateZ: 45,
        y: -90,
        x: 40,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
      })
        .to(
          '.unboxing-item',
          {
            scale: 1,
            opacity: 1,
            duration: 0.65,
            ease: 'back.out(1.5)',
            stagger: {
              each: 0.05,
              from: 'center',
            },
            x: (i) => {
              const angles = [-140, -110, -70, -35, 35, 70, 110, 140, -90, 90];
              const dist = 110 + (i % 3) * 25;
              return Math.cos((angles[i % angles.length] * Math.PI) / 180) * dist;
            },
            y: (i) => {
              const angles = [-140, -110, -70, -35, 35, 70, 110, 140, -90, 90];
              const dist = 110 + (i % 3) * 25;
              return Math.sin((angles[i % angles.length] * Math.PI) / 180) * dist;
            },
          },
          '-=0.3'
        );

      // PHASE 3: The Dive (1.5 -> 2.3s)
      tl.to(
        '.unboxing-item:not(.hero-item)',
        {
          opacity: 0,
          scale: 0.4,
          filter: 'blur(8px)',
          duration: 0.5,
          ease: 'power2.in',
        },
        '+=0.1'
      )
        .to(
          boxRef.current,
          {
            opacity: 0,
            scale: 0.5,
            duration: 0.4,
            ease: 'power2.in',
          },
          '<'
        )
        .to(heroCardRef.current, {
          x: 0,
          y: 0,
          scale: 7.5,
          opacity: 1,
          duration: 0.75,
          ease: 'expo.inOut',
        });

      // PHASE 4: The Reveal (2.3 -> 2.7s)
      tl.to(containerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, [mounted, isReturnVisitor, prefersReducedMotion]);

  // Trigger timeline play when progress reaches ready or asset loaded
  useEffect(() => {
    if (timelineRef.current && !isReturnVisitor && !prefersReducedMotion) {
      if (timelineRef.current.progress() === 0) {
        timelineRef.current.play();
      }
    }
  }, [isReturnVisitor, prefersReducedMotion]);

  // Click / tap instantly skips to Phase 4 per Section 2
  const handleSkip = () => {
    if (timelineRef.current) {
      timelineRef.current.seek(timelineRef.current.duration() - 0.4);
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
        className="fixed inset-0 z-[9999] bg-[#202124] flex items-center justify-center pointer-events-none"
      >
        <div className="flex items-center gap-2.5 animate-pulse">
          <div className="w-8 h-8 rounded-xl bg-lime flex items-center justify-center font-black text-ink shadow-lg shadow-lime/20">
            W
          </div>
          <span className="text-white font-extrabold text-sm tracking-tight">wefik.world</span>
        </div>
      </div>
    );
  }

  // Reduced motion view
  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        onClick={handleSkip}
        className="fixed inset-0 z-[9999] bg-[#202124] flex flex-col items-center justify-center p-6 text-center cursor-pointer"
      >
        <div className="space-y-4 max-w-xs w-full">
          <div className="w-12 h-12 rounded-2xl bg-lime text-ink flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-lime/20">
            W
          </div>
          <h2 className="text-white font-extrabold text-base tracking-tight">wefik.world</h2>
          <p className="text-xs text-slate-400">Loading catalog assets...</p>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-lime transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
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
      className="fixed inset-0 z-[9999] bg-[#202124] flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
    >
      {/* 3D Scene Wrapper */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Dust Particles for landing */}
        <div ref={dustRef} className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="dust-particle absolute w-2 h-2 rounded-full bg-lime/80 shadow-sm shadow-lime"
            />
          ))}
        </div>

        {/* Wefik Shipping Box (CSS 3D / Isometric Aesthetic) */}
        <div
          ref={boxRef}
          className="relative w-32 h-32 bg-[#2E3136] rounded-2xl border border-white/15 shadow-2xl flex flex-col items-center justify-center z-10"
        >
          {/* Lime Tape Stripe */}
          <div className="absolute inset-y-0 w-8 bg-lime/90 flex items-center justify-center shadow-inner">
            <span className="text-[9px] font-black text-ink tracking-widest rotate-90 uppercase">
              WEFIK
            </span>
          </div>

          {/* Box Lid */}
          <div
            ref={lidRef}
            className="absolute -top-3 inset-x-0 h-4 bg-[#3A3E45] rounded-t-xl border-t border-x border-white/20 shadow-md"
          />

          {/* Front Box Seal Badge */}
          <div className="relative z-10 w-9 h-9 rounded-xl bg-white text-ink flex items-center justify-center font-black text-base shadow-md">
            W
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
            <span className="text-[11px] font-extrabold tracking-tight">AgencyPro Theme</span>
          </div>

          {/* 2. Plugin Puzzle */}
          <div className="unboxing-item absolute p-2.5 rounded-xl bg-[#2D3139] border border-white/10 text-lime shadow-lg flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold text-white">SuperCache</span>
          </div>

          {/* 3. HTML Template Chip */}
          <div className="unboxing-item absolute p-2.5 rounded-xl bg-[#2D3139] border border-white/10 text-sky-400 shadow-lg flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold text-white">Tailwind HTML</span>
          </div>

          {/* 4. Code Snippet Chip */}
          <div className="unboxing-item absolute p-2 rounded-xl bg-[#1C1E22] border border-lime/30 text-lime shadow-lg flex items-center gap-1 font-mono text-[10px] font-bold">
            <Code className="w-3 h-3" />
            <span>&lt;/&gt;</span>
          </div>

          {/* 5. Bundle Box Chip */}
          <div className="unboxing-item absolute p-2.5 rounded-xl bg-[#2D3139] border border-white/10 text-amber-400 shadow-lg flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold text-white">Bundle 60%</span>
          </div>

          {/* 6. Indian Rupee Price Tag */}
          <div className="unboxing-item absolute px-2.5 py-1.5 rounded-full bg-lime text-ink font-black text-xs shadow-md">
            ₹799
          </div>

          {/* 7. Freebie Tag */}
          <div className="unboxing-item absolute px-2.5 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] uppercase shadow-md">
            100% Free
          </div>

          {/* 8. Gutenberg FSE Chip */}
          <div className="unboxing-item absolute p-2 rounded-xl bg-[#2D3139] border border-white/10 text-slate-300 text-[10px] font-bold shadow-md">
            FSE Blocks
          </div>

          {/* 9. Next.js 16 Chip */}
          <div className="unboxing-item absolute p-2 rounded-xl bg-[#18191C] border border-white/10 text-white font-mono text-[10px] font-bold shadow-md">
            Next.js
          </div>

          {/* 10. Sparkle Chip */}
          <div className="unboxing-item absolute p-2 rounded-full bg-lime/20 text-lime border border-lime/40">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Bottom Progress & Skip Notice */}
      <div className="absolute bottom-10 inset-x-0 max-w-xs mx-auto px-6 text-center space-y-2">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-lime transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Unpacking store...</span>
          <span>{progress}%</span>
        </div>
        <span className="text-[9px] text-slate-500 uppercase tracking-widest block pt-1">
          Click anywhere to skip
        </span>
      </div>
    </div>
  );
}
