'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Sparkles, ArrowRight, Zap, Shield, Code2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/transitions/transition-link';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { useMotionGates } from '@/hooks/use-reduced-motion';

export function HeroLightweight() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardStackRef = useRef<HTMLDivElement | null>(null);
  const card1Ref = useRef<HTMLDivElement | null>(null);
  const card2Ref = useRef<HTMLDivElement | null>(null);
  const card3Ref = useRef<HTMLDivElement | null>(null);
  const { disableHeavyMotion } = useMotionGates();

  useEffect(() => {
    const container = containerRef.current;
    const cardStack = cardStackRef.current;
    if (!container || !cardStack || disableHeavyMotion || typeof window === 'undefined') {
      return;
    }

    // Only enable interactive 3D tilt on desktop with fine mouse pointer
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }

    const rotX = gsap.quickTo(cardStack, 'rotationX', { duration: 0.6, ease: 'power2.out' });
    const rotY = gsap.quickTo(cardStack, 'rotationY', { duration: 0.6, ease: 'power2.out' });
    const c1Z = card1Ref.current
      ? gsap.quickTo(card1Ref.current, 'z', { duration: 0.6, ease: 'power2.out' })
      : null;
    const c2Z = card2Ref.current
      ? gsap.quickTo(card2Ref.current, 'z', { duration: 0.6, ease: 'power2.out' })
      : null;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      rotY(x * 16);
      rotX(-y * 14);
      if (c1Z) c1Z(35 + Math.abs(x) * 20);
      if (c2Z) c2Z(15 + Math.abs(y) * 15);
    };

    const handleMouseLeave = () => {
      rotX(0);
      rotY(0);
      if (c1Z) c1Z(0);
      if (c2Z) c2Z(0);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(cardStack);
      if (card1Ref.current) gsap.killTweensOf(card1Ref.current);
      if (card2Ref.current) gsap.killTweensOf(card2Ref.current);
    };
  }, [disableHeavyMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 select-none"
    >
      {/* 1. Layered Radial Gradients & Subtle Grid */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Lime Wash Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-radial from-lime/25 via-lime/5 to-transparent blur-3xl" />
        {/* Deep Green Ambient Glow */}
        <div className="absolute top-32 left-1/4 w-[500px] h-[300px] bg-radial from-[var(--accent)]/15 via-transparent to-transparent blur-3xl" />
        {/* Fine Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 dark:opacity-20" />
        {/* SVG Grain Noise Overlay (<1.5KB) */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Eyebrow Label */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-xs mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <span className="flex h-2 w-2 rounded-full bg-lime animate-pulse" />
          <span className="eyebrow text-[var(--accent)]">
            Curated by Wefik Agency Engineers
          </span>
          <span className="text-[var(--muted)]">•</span>
          <span className="eyebrow text-[var(--muted)]">100% Bloat-Free Code</span>
        </div>

        {/* Display-XL Headline per Section 2 */}
        <h1 className="display-xl max-w-5xl mx-auto mb-6 text-[var(--text)]">
          WordPress Themes, Plugins & Templates for People Who Build the Web
        </h1>

        {/* Subtitle */}
        <p className="body-lg max-w-3xl mx-auto mb-8 text-[var(--muted)] font-normal">
          The digital product marketplace built specifically for freelancers, digital agencies, and independent founders who refuse to compromise on website speed, code semantics, or licensing freedom. Zero page builder bloat. Pure Gutenberg & Tailwind CSS.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14">
          <MagneticButton strength={0.25} className="w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-ink dark:bg-white text-white dark:text-ink hover:bg-black dark:hover:bg-slate-100 font-semibold text-sm shadow-md transition-shadow hover:shadow-lime/20 hover:shadow-lg"
            >
              <TransitionLink href="/marketplace" className="flex items-center gap-2">
                <span>Browse Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </TransitionLink>
            </Button>
          </MagneticButton>
          <MagneticButton strength={0.15} className="w-full sm:w-auto">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-xl border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)] font-semibold text-sm"
            >
              <TransitionLink href="/pricing">
                <span>Get All-Access Membership</span>
              </TransitionLink>
            </Button>
          </MagneticButton>
        </div>

        {/* 2. Interactive CSS 3D Tilting Product Cards (Section 6) */}
        <div
          className="relative w-full max-w-4xl mx-auto h-[380px] sm:h-[440px] flex items-center justify-center"
          style={{ perspective: '1200px' }}
        >
          <div
            ref={cardStackRef}
            className="relative w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Card 3: Left Back Tilt (Tailwind HTML Starter) */}
            <div
              ref={card3Ref}
              className="absolute left-4 sm:left-12 top-10 sm:top-14 w-60 sm:w-72 p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl backdrop-blur-md -rotate-6 transition-transform hidden md:block select-none"
              style={{ transform: 'translateZ(-30px)' }}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]">
                <span className="eyebrow text-sky-500 font-bold">HTML5 / Tailwind</span>
                <span className="font-mono text-xs font-bold text-lime">₹799</span>
              </div>
              <h4 className="heading-3 text-sm text-[var(--text)] mb-1">DevStarter Kit Pro</h4>
              <p className="body-small text-xs text-[var(--muted)] line-clamp-2">
                Semantic HTML, responsive grid, zero jQuery, 100/100 Core Web Vitals.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-[var(--muted)]">
                <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)]">Single & Unlimited</span>
              </div>
            </div>

            {/* Card 2: Right Back Tilt (SuperCache Plugin) */}
            <div
              ref={card2Ref}
              className="absolute right-4 sm:right-12 bottom-8 sm:bottom-12 w-60 sm:w-72 p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl backdrop-blur-md rotate-6 transition-transform hidden md:block select-none"
              style={{ transform: 'translateZ(-15px)' }}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]">
                <span className="eyebrow text-lime font-bold">WordPress Plugin</span>
                <span className="font-mono text-xs font-bold text-lime">Freebie</span>
              </div>
              <h4 className="heading-3 text-sm text-[var(--text)] mb-1">SuperCache Turbo</h4>
              <p className="body-small text-xs text-[var(--muted)] line-clamp-2">
                Lightweight object cache & CSS minification for instant TTFB.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-deep-green-light">
                <Zap className="w-3 h-3 text-lime" />
                <span>Instant PageSpeed 100</span>
              </div>
            </div>

            {/* Card 1: Foreground Center Hero Card (AgencyPro FSE) */}
            <div
              ref={card1Ref}
              className="relative w-80 sm:w-[420px] p-6 sm:p-8 rounded-3xl bg-[var(--surface)]/95 dark:bg-[#141714]/95 border-2 border-lime/60 shadow-2xl shadow-lime/10 backdrop-blur-xl transition-all duration-300 z-20"
              style={{ transform: 'translateZ(40px)' }}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-lime flex items-center justify-center font-black text-ink shadow-xs">
                    W
                  </div>
                  <div className="text-left">
                    <span className="eyebrow text-xs text-[var(--text)] block font-bold">AgencyPro FSE</span>
                    <span className="text-[10px] font-mono text-[var(--muted)]">v1.2.0 • Gutenberg Native</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-display font-bold text-lime tabular-nums">₹999</span>
                </div>
              </div>

              <p className="body-base text-xs sm:text-sm text-[var(--muted)] text-left mb-4">
                Engineered with zero page builder bloat. Achieves sub-second LCP, perfect typography scale, and flawless mobile interactivity.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                <div className="flex items-center gap-1 text-[var(--text)] font-semibold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>5.0</span>
                  <span className="text-[var(--muted)] font-normal font-mono">(48 reviews)</span>
                </div>
                <span className="eyebrow text-[10px] text-lime font-bold">Commercial License</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
