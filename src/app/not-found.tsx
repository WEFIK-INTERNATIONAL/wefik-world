'use client';

import React, { useEffect, useRef } from 'react';
import { Search, ArrowRight, Home, AlertCircle } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
import gsap from 'gsap';
import { TransitionLink } from '@/components/transitions/transition-link';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { useMotionGates } from '@/hooks/use-reduced-motion';
import { Logo } from '@/components/brand/logo';

export default function NotFound() {
  const floatingCardRef = useRef<HTMLDivElement | null>(null);
  const { disableHeavyMotion } = useMotionGates();

  useEffect(() => {
    // 1. Report broken 404 URL to Sentry to identify broken links
    if (typeof window !== 'undefined') {
      try {
        Sentry.captureMessage(
          `404 Not Found: ${window.location.href}`,
          'warning'
        );
      } catch (err) {
        console.warn('Sentry 404 log failed', err);
      }
    }

    // 2. GSAP Floating Card Loop (gentle loop, static if reduced motion per Section 11.2)
    if (!disableHeavyMotion && floatingCardRef.current) {
      const tween = gsap.to(floatingCardRef.current, {
        y: -12,
        rotation: 4,
        duration: 2.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      return () => {
        tween.kill();
      };
    }
  }, [disableHeavyMotion]);

  return (
    <main className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center max-w-3xl mx-auto select-none">
      {/* Visual: Tipped Wefik Box with <Logo/> + Floating Product Card (Section 11.2) */}
      <div className="relative w-48 h-36 mx-auto mb-8 flex items-center justify-center">
        {/* Empty, Tipped Shipping Box */}
        <div className="relative w-28 h-24 bg-ink dark:bg-[#141714] rounded-2xl border-2 border-[var(--border)] shadow-2xl rotate-[-18deg] translate-y-3 flex flex-col items-center justify-center overflow-hidden">
          {/* Lime Tape Stripe */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 bg-lime/90 flex items-center justify-center shadow-xs">
            <span className="text-[8px] font-mono font-bold tracking-widest text-ink uppercase">WEFIK</span>
          </div>
          {/* Box Mark */}
          <div className="w-8 h-8 rounded-lg bg-[var(--surface)]/10 border border-[var(--border)] flex items-center justify-center z-10">
            <Logo markOnly size={18} />
          </div>
        </div>

        {/* Floating Product Card (Flew off the shelf) */}
        <div
          ref={floatingCardRef}
          className="absolute -top-3 right-6 w-24 h-16 rounded-xl bg-[var(--surface)] border border-lime/60 shadow-lg p-2 flex flex-col justify-between rotate-[12deg] z-20 backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span className="text-[8px] font-mono text-[var(--muted)] font-bold">₹499</span>
          </div>
          <div className="space-y-1 text-left">
            <div className="h-1.5 w-12 bg-lime/40 rounded-full" />
            <div className="h-1.5 w-8 bg-[var(--border)] rounded-full" />
          </div>
        </div>
      </div>

      {/* 404 Display Number & Headline */}
      <span className="display-xl text-lime font-bold block mb-1">404</span>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--accent)] mb-4">
        <AlertCircle className="w-3.5 h-3.5 text-lime" />
        <span className="eyebrow text-xs text-[var(--accent)]">Shelf Empty</span>
      </div>

      <h1 className="display-title font-bold text-[var(--text)] mb-3">
        This page flew off the shelf.
      </h1>

      <p className="body-base text-[var(--muted)] max-w-md mb-8">
        The digital asset or URL you requested isn&apos;t here. It may have been renamed, packaged into a bundle, or moved to our main catalog.
      </p>

      {/* Live Catalog Search */}
      <form
        action="/marketplace"
        method="GET"
        className="w-full max-w-md relative mb-8 flex items-center shadow-xs rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] focus-within:ring-2 focus-within:ring-lime"
      >
        <Search className="w-4 h-4 text-[var(--muted)] ml-4 flex-shrink-0" />
        <input
          type="text"
          name="q"
          placeholder="Search WordPress themes, plugins, templates..."
          className="w-full py-3 pl-3 pr-24 text-xs text-[var(--text)] bg-transparent focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-ink dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-ink text-xs font-bold rounded-xl transition-colors"
        >
          Search
        </button>
      </form>

      {/* Magnetic Primary CTA */}
      <div className="mb-12">
        <MagneticButton strength={0.3}>
          <TransitionLink
            href="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-ink dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-ink font-semibold text-sm shadow-md hover:shadow-lime/20 hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4 text-lime" />
            <span>Go to Marketplace</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </TransitionLink>
        </MagneticButton>
      </div>

      {/* Quick Category Anchors */}
      <div className="w-full bg-[var(--surface)] rounded-3xl p-6 border border-[var(--border)] text-left">
        <p className="eyebrow text-[var(--muted)] mb-4 text-center sm:text-left">
          Or explore popular catalog destinations:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <TransitionLink
            href="/marketplace"
            className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] hover:border-lime/60 hover:shadow-xs transition-all block group"
          >
            <span className="text-xs font-bold text-[var(--text)] group-hover:text-lime block">Marketplace</span>
            <span className="text-[10px] text-[var(--muted)]">All catalog items</span>
          </TransitionLink>
          <TransitionLink
            href="/freebies"
            className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] hover:border-lime/60 hover:shadow-xs transition-all block group"
          >
            <span className="text-xs font-bold text-[var(--text)] group-hover:text-lime block">Freebies</span>
            <span className="text-[10px] text-[var(--muted)]">100% free assets</span>
          </TransitionLink>
          <TransitionLink
            href="/bundles"
            className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] hover:border-lime/60 hover:shadow-xs transition-all block group"
          >
            <span className="text-xs font-bold text-[var(--text)] group-hover:text-lime block">Bundles</span>
            <span className="text-[10px] text-[var(--muted)]">Save up to 60%</span>
          </TransitionLink>
          <TransitionLink
            href="/pricing"
            className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] hover:border-lime/60 hover:shadow-xs transition-all block group"
          >
            <span className="text-xs font-bold text-[var(--text)] group-hover:text-lime block">Pricing</span>
            <span className="text-[10px] text-[var(--muted)]">All-Access passes</span>
          </TransitionLink>
        </div>
      </div>
    </main>
  );
}
