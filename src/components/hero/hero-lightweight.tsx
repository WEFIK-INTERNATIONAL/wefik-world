'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/transitions/transition-link';
import { SafeImage } from '@/components/ui/safe-image';
import { useMotionGates } from '@/hooks/use-reduced-motion';
import { MOTION_DURATION, MOTION_EASE } from '@/lib/motion';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/image-placeholder';
import type { ProductData } from '@/lib/data/products';

interface HeroLightweightProps {
  products?: ProductData[];
}

const MARKETPLACE_CATEGORIES = [
  { name: 'WordPress themes', slug: 'wordpress-themes', description: 'Block themes & FSE layouts' },
  { name: 'WordPress plugins', slug: 'wordpress-plugins', description: 'Caching, SEO & utilities' },
  { name: 'HTML templates', slug: 'html-templates', description: 'Responsive Tailwind starters' },
  { name: 'Next.js starters', slug: 'nextjs-templates', description: 'App Router & TypeScript kits' },
];

function formatPrice(product: ProductData): string {
  if (product.is_free || product.price_inr <= 0) return 'Free';
  return `₹${Math.round(product.price_inr / 100).toLocaleString('en-IN')}`;
}

export function HeroLightweight({ products = [] }: HeroLightweightProps) {
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const { disableHeavyMotion } = useMotionGates();

  // Pick up to 4 real products with valid images (featured first)
  const featuredWithImages = [...products]
    .filter((p) => Boolean(p.thumbnail_url && p.thumbnail_url.trim().length > 0))
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .slice(0, 4);

  const hasEnoughProducts = featuredWithImages.length >= 3;

  // Subtle entrance for showcase cards (transform & opacity only, shared tokens)
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
  }, [disableHeavyMotion, hasEnoughProducts]);

  return (
    <div className="relative w-full pt-8 sm:pt-10 lg:pt-12 pb-12 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Copy, Categories & CTAs */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <p className="text-sm font-medium text-[var(--brand)]">
              WordPress &amp; Next.js marketplace
            </p>

            <h1 className="text-[clamp(2.25rem,4.2vw,3.75rem)] font-display font-semibold tracking-tight leading-[1.08] text-[var(--text-primary)] [text-wrap:balance]">
              Themes, plugins, and starters built to ship.
            </h1>

            <p className="text-lg sm:text-[19px] leading-relaxed text-[var(--text-secondary)] max-w-[56ch] [text-wrap:pretty]">
              Production WordPress themes, plugins, HTML templates, and Next.js starters. Modify the source code freely, deploy on client sites, and get lifetime updates.
            </p>

            {/* Category Links */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {MARKETPLACE_CATEGORIES.map((cat) => (
                <TransitionLink
                  key={cat.slug}
                  href={`/marketplace?category=${cat.slug}`}
                  className="px-2.5 py-1 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] transition-colors"
                >
                  {cat.name}
                </TransitionLink>
              ))}
            </div>

            {/* Primary CTA + Quiet Secondary Link */}
            <div className="flex flex-wrap items-center gap-5 pt-2">
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

            {/* Verified License & Support Summary */}
            <p className="text-xs text-[var(--text-secondary)] pt-1 leading-relaxed">
              Full source code modification · Lifetime product updates ·{' '}
              <Link href="/license" className="underline hover:text-[var(--text-primary)] transition-colors">
                Commercial license
              </Link>{' '}
              &amp;{' '}
              <Link href="/terms" className="underline hover:text-[var(--text-primary)] transition-colors">
                support terms
              </Link>
              .
            </p>
          </div>

          {/* Right Column: Real Product Showcase (or Category Grid Fallback) */}
          <div ref={showcaseRef} className="lg:col-span-7 relative">
            {/* Subtle local wash behind showcase only */}
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-3xl bg-[var(--brand)]/5 blur-2xl pointer-events-none"
            />

            {hasEnoughProducts ? (
              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Featured Card (spans 2 cols on sm+) */}
                {featuredWithImages.slice(0, 1).map((product) => (
                  <TransitionLink
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="hero-showcase-card sm:col-span-2 group rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--brand)]/60 overflow-hidden transition-colors"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center">
                      <div className="sm:col-span-7 relative aspect-[16/10] w-full bg-[var(--surface-2)] overflow-hidden">
                        <SafeImage
                          src={product.thumbnail_url}
                          alt={product.title}
                          fill
                          priority
                          placeholder="blur"
                          blurDataURL={DEFAULT_BLUR_DATA_URL}
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                      <div className="sm:col-span-5 p-5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-[var(--brand)]">
                            {product.category?.name || 'Featured'}
                          </span>
                          <span className="text-sm font-display font-semibold text-[var(--text-primary)] tabular-nums">
                            {formatPrice(product)}
                          </span>
                        </div>
                        <h2 className="text-base font-display font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors line-clamp-2">
                          {product.title}
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                          {product.tagline}
                        </p>
                      </div>
                    </div>
                  </TransitionLink>
                ))}

                {/* Secondary Product Cards (2 or 3 items) */}
                {featuredWithImages.slice(1, 3).map((product) => (
                  <TransitionLink
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="hero-showcase-card group rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--brand)]/60 overflow-hidden transition-colors flex flex-col"
                  >
                    <div className="relative aspect-[16/10] w-full bg-[var(--surface-2)] overflow-hidden">
                      <SafeImage
                        src={product.thumbnail_url}
                        alt={product.title}
                        fill
                        placeholder="blur"
                        blurDataURL={DEFAULT_BLUR_DATA_URL}
                        sizes="(max-width: 640px) 100vw, 25vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[11px] font-medium text-[var(--text-secondary)] block truncate">
                          {product.category?.name || 'Digital Product'}
                        </span>
                        <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors truncate">
                          {product.title}
                        </h3>
                      </div>
                      <span className="text-sm font-display font-semibold text-[var(--text-primary)] tabular-nums shrink-0">
                        {formatPrice(product)}
                      </span>
                    </div>
                  </TransitionLink>
                ))}
              </div>
            ) : (
              /* Fallback Category Grid when fewer than 3 real products have images */
              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MARKETPLACE_CATEGORIES.map((cat) => (
                  <TransitionLink
                    key={cat.slug}
                    href={`/marketplace?category=${cat.slug}`}
                    className="hero-showcase-card group p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--brand)]/60 transition-colors space-y-1.5"
                  >
                    <h2 className="text-base font-display font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {cat.description}
                    </p>
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
