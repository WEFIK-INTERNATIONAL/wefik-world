'use client';

import React, { useEffect, useRef } from 'react';
import { Search, ArrowRight, Home, Sparkles, AlertCircle } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
import gsap from 'gsap';
import { TransitionLink } from '@/components/transitions/transition-link';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export default function NotFound() {
  const floatingCardRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // 1. Report broken 404 URL to Sentry to identify broken links
    if (typeof window !== 'undefined') {
      try {
        Sentry.captureMessage(
          `404 Not Found: ${window.location.href}`,
          'warning'
        );
      } catch (err) {
        // Safe catch if Sentry DSN is not configured
        console.warn('Sentry 404 log failed', err);
      }
    }

    // 2. GSAP Floating Card Loop (Section 7.1)
    if (!prefersReducedMotion && floatingCardRef.current) {
      const tween = gsap.to(floatingCardRef.current, {
        y: -14,
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
  }, [prefersReducedMotion]);

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center max-w-3xl mx-auto">
      {/* Visual: Tipped Wefik Box + Floating Product Card */}
      <div className="relative w-48 h-36 mx-auto mb-8 flex items-center justify-center select-none">
        {/* Empty, Tipped Shipping Box */}
        <div className="relative w-28 h-24 bg-[#202124] rounded-2xl border-2 border-white/20 shadow-2xl rotate-[-18deg] translate-y-3 flex flex-col items-center justify-center overflow-hidden group">
          {/* Lime Tape Stripe */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 bg-lime/90 flex items-center justify-center shadow-xs">
            <span className="text-[8px] font-black tracking-widest text-[#202124] uppercase">WEFIK</span>
          </div>
          {/* Box Mark */}
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-black text-sm z-10">
            W
          </div>
        </div>

        {/* Floating Product Card (Flew off the shelf) */}
        <div
          ref={floatingCardRef}
          className="absolute -top-3 right-6 w-24 h-16 rounded-xl bg-white border border-lime/60 shadow-lg p-2 flex flex-col justify-between rotate-[12deg] z-20 backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span className="text-[8px] font-mono text-slate font-bold">₹499</span>
          </div>
          <div className="space-y-1 text-left">
            <div className="h-1.5 w-12 bg-deep-green/30 rounded-full" />
            <div className="h-1.5 w-8 bg-slate/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Display 404 Headline */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-soft border border-border text-xs font-semibold text-deep-green mb-4">
        <AlertCircle className="w-3.5 h-3.5 text-deep-green" />
        <span>404 — Shelf Empty</span>
      </div>

      <h1 className="text-5xl sm:text-7xl font-extrabold text-ink tracking-tight mb-3">
        This page flew off the shelf.
      </h1>

      <p className="text-slate max-w-md text-sm sm:text-base mb-8 leading-relaxed">
        The digital asset or URL you requested isn&apos;t here. It may have been renamed, packaged into a bundle, or moved to our main catalog.
      </p>

      {/* Live Catalog Search */}
      <form
        action="/marketplace"
        method="GET"
        className="w-full max-w-md relative mb-8 flex items-center shadow-sm rounded-2xl overflow-hidden border border-border bg-white focus-within:ring-2 focus-within:ring-lime"
      >
        <Search className="w-4 h-4 text-slate ml-4 flex-shrink-0" />
        <input
          type="text"
          name="q"
          placeholder="Search WordPress themes, plugins, templates..."
          className="w-full py-3 pl-3 pr-24 text-sm text-ink bg-transparent focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-ink hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
        >
          Search
        </button>
      </form>

      {/* Magnetic Primary CTA */}
      <div className="mb-12">
        <MagneticButton strength={0.3}>
          <TransitionLink
            href="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-ink hover:bg-black text-white font-semibold text-sm shadow-md hover:shadow-lime/20 hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4 text-lime" />
            <span>Go to Marketplace</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </TransitionLink>
        </MagneticButton>
      </div>

      {/* Quick Category Anchors */}
      <div className="w-full bg-soft/60 rounded-3xl p-6 border border-border/80 text-left">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate mb-4 text-center sm:text-left">
          Or explore popular catalog destinations:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <TransitionLink
            href="/marketplace"
            className="p-3 bg-white rounded-xl border border-border/60 hover:border-deep-green/40 hover:shadow-xs transition-all block group"
          >
            <span className="text-xs font-bold text-ink group-hover:text-deep-green block">Marketplace</span>
            <span className="text-[10px] text-slate">All 50+ items</span>
          </TransitionLink>
          <TransitionLink
            href="/freebies"
            className="p-3 bg-white rounded-xl border border-border/60 hover:border-deep-green/40 hover:shadow-xs transition-all block group"
          >
            <span className="text-xs font-bold text-ink group-hover:text-deep-green block">Freebies</span>
            <span className="text-[10px] text-slate">100% free assets</span>
          </TransitionLink>
          <TransitionLink
            href="/bundles"
            className="p-3 bg-white rounded-xl border border-border/60 hover:border-deep-green/40 hover:shadow-xs transition-all block group"
          >
            <span className="text-xs font-bold text-ink group-hover:text-deep-green block">Bundles</span>
            <span className="text-[10px] text-slate">Save up to 60%</span>
          </TransitionLink>
          <TransitionLink
            href="/pricing"
            className="p-3 bg-white rounded-xl border border-border/60 hover:border-deep-green/40 hover:shadow-xs transition-all block group"
          >
            <span className="text-xs font-bold text-ink group-hover:text-deep-green block">Pricing</span>
            <span className="text-[10px] text-slate">All-Access passes</span>
          </TransitionLink>
        </div>
      </div>
    </main>
  );
}
