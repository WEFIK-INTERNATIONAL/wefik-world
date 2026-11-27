'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/transitions/transition-link';
import { ProductCard, ProductCardSkeleton } from '@/components/marketplace/product-card';
import { useMotionGates } from '@/hooks/use-reduced-motion';
import { MOTION_DURATION, MOTION_EASE } from '@/lib/motion';
import { Code2, Shield, RefreshCw } from 'lucide-react';
import type { ProductData } from '@/lib/data/products';

interface HeroLightweightProps {
  products?: ProductData[];
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Category tags — rendered as a balanced 2×2 grid on desktop and mobile.
 * Links map to real marketplace query filters.
 */
const CATEGORIES = [
  { name: 'WordPress Themes', href: '/marketplace?category=wordpress-themes' },
  { name: 'WordPress Plugins', href: '/marketplace?category=wordpress-plugins' },
  { name: 'HTML Templates', href: '/marketplace?category=templates-starters' },
  { name: 'Next.js Starters', href: '/marketplace?tech=Next.js' },
] as const;

export function HeroLightweight({
  products = [],
  isLoading = false,
  error = null,
}: HeroLightweightProps) {
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const { disableHeavyMotion } = useMotionGates();

  /* Pick up to 3 real products (featured first) */
  const showcaseProducts = [...products]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .slice(0, 3);

  const hasShowcase = showcaseProducts.length >= 3;

  /* Subtle entrance for showcase cards */
  useEffect(() => {
    const el = showcaseRef.current;
    if (!el || disableHeavyMotion || typeof window === 'undefined') return;

    const cards = el.querySelectorAll('.hero-showcase-card');
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: MOTION_DURATION.base,
          stagger: 0.06,
          ease: MOTION_EASE.out,
        }
      );
    }, el);

    return () => ctx.revert();
  }, [disableHeavyMotion, hasShowcase, isLoading]);

  return (
    <div className="relative w-full pt-5 sm:pt-7 lg:pt-8 pb-10 lg:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* ═══ Left column: copy ═══ */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5 text-left">
            {/* Eyebrow */}
            <p className="text-sm font-medium text-[var(--brand)]">
              WordPress Themes, Plugins, HTML Templates &amp; Next.js Starters
            </p>

            {/* Headline — Option 1 (implemented) */}
            <h1 className="text-[clamp(2rem,3.8vw,3.25rem)] font-display font-semibold tracking-tight leading-[1.08] text-[var(--text-primary)] [text-wrap:balance]">
              Themes, plugins and starters for production sites
            </h1>
            {/*
              Option 2 (alternative):
              "WordPress themes, plugins, HTML templates and Next.js starters — ready to deploy"
            */}

            {/* Supporting paragraph — one idea only */}
            <p className="text-base sm:text-lg leading-relaxed text-[var(--text-secondary)] max-w-[52ch] [text-wrap:pretty]">
              Hand-crafted WordPress themes, WordPress plugins, HTML templates, and Next.js starters built and maintained by a single agency team.
            </p>

            {/* Category tags — 2×2 grid */}
            <div className="grid grid-cols-2 gap-2 max-w-sm pt-1">
              {CATEGORIES.map((cat) => (
                <TransitionLink
                  key={cat.name}
                  href={cat.href}
                  className="px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] transition-colors text-center"
                >
                  {cat.name}
                </TransitionLink>
              ))}
            </div>

            {/* Primary CTA + quiet secondary link */}
            <div className="flex flex-wrap items-center gap-5 pt-1">
              <Button
                asChild
                variant="primary"
                className="h-11 px-6 rounded-full font-semibold text-sm"
              >
                <TransitionLink href="/marketplace">Browse the marketplace</TransitionLink>
              </Button>

              <TransitionLink
                href="/freebies"
                className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--brand)] underline underline-offset-4 transition-colors"
              >
                Free products
              </TransitionLink>
            </div>

            {/* Commercial promises — verified against /license */}
            <ul className="flex flex-col gap-2 pt-2">
              <li className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                <Code2 className="w-4 h-4 text-[var(--brand)] mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Modify PHP, TypeScript, CSS, and HTML source code —{' '}
                  <Link href="/license#modifications" className="underline hover:text-[var(--text-primary)] transition-colors">
                    Licence details
                  </Link>
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                <Shield className="w-4 h-4 text-[var(--brand)] mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Commercial rights for 1 domain (Single-Site) or unlimited client sites (Unlimited-Site) —{' '}
                  <Link href="/license" className="underline hover:text-[var(--text-primary)] transition-colors">
                    Licence details
                  </Link>
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                <RefreshCw className="w-4 h-4 text-[var(--brand)] mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Lifetime security patches, bug fixes, and compatibility updates for purchased items —{' '}
                  <Link href="/license#updates-support" className="underline hover:text-[var(--text-primary)] transition-colors">
                    Licence details
                  </Link>
                </span>
              </li>
            </ul>
          </div>

          {/* ═══ Right column: product showcase ═══ */}
          <div ref={showcaseRef} className="lg:col-span-7 relative">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <ProductCardSkeleton layout="horizontal" />
                </div>
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </div>
            ) : error ? (
              <div className="p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-3">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Unable to load featured products right now.
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {error}
                </p>
                <Button asChild variant="outline" size="sm">
                  <TransitionLink href="/marketplace">Open marketplace</TransitionLink>
                </Button>
              </div>
            ) : hasShowcase ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Featured card — same ProductCard, horizontal layout */}
                <div className="hero-showcase-card sm:col-span-2">
                  <ProductCard
                    {...showcaseProducts[0]}
                    layout="horizontal"
                    priority={true}
                  />
                </div>

                {/* Secondary cards — same ProductCard, vertical layout */}
                {showcaseProducts.slice(1, 3).map((product) => (
                  <div key={product.id} className="hero-showcase-card">
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
            ) : (
              /* Empty / fallback state when < 3 products available */
              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => (
                  <TransitionLink
                    key={cat.name}
                    href={cat.href}
                    className="hero-showcase-card group p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--brand)]/60 transition-colors"
                  >
                    <h2 className="text-base font-display font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">
                      {cat.name}
                    </h2>
                  </TransitionLink>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
