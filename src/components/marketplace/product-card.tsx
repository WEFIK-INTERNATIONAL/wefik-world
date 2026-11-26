'use client';

import React from 'react';
import { TransitionLink } from '@/components/transitions/transition-link';
import { SafeImage } from '@/components/ui/safe-image';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/image-placeholder';
import { Layout, Plug, Code2, Layers, Package } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  price_inr: number; // in paise
  is_free?: boolean;
  is_featured?: boolean;
  is_bundle?: boolean;
  thumbnail_url?: string;
  category?: {
    name: string;
    slug: string;
  } | null;
  rating_avg?: number;
  rating_count?: number;
  tech_stack?: string[];
  isWishlisted?: boolean;
  layout?: 'vertical' | 'horizontal';
  priority?: boolean;
  sizes?: string;
  className?: string;
}

function isUsableImageUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.includes('placeholder') || trimmed.includes('images.unsplash.com')) return false;
  return true;
}

function formatPrice(priceInr: number, isFree: boolean): string {
  if (isFree || priceInr <= 0) return 'Free';
  return `₹${Math.round(priceInr / 100).toLocaleString('en-IN')}`;
}

function CategoryIcon({ slug }: { slug?: string }) {
  switch (slug) {
    case 'wordpress-themes':
      return <Layout className="w-6 h-6 text-[var(--brand)]" aria-hidden="true" />;
    case 'wordpress-plugins':
      return <Plug className="w-6 h-6 text-[var(--brand)]" aria-hidden="true" />;
    case 'templates-starters':
    case 'html-templates':
    case 'nextjs-templates':
      return <Code2 className="w-6 h-6 text-[var(--brand)]" aria-hidden="true" />;
    case 'bundles':
      return <Layers className="w-6 h-6 text-[var(--brand)]" aria-hidden="true" />;
    default:
      return <Package className="w-6 h-6 text-[var(--brand)]" aria-hidden="true" />;
  }
}

export function ProductCard({
  title,
  slug,
  tagline = '',
  price_inr,
  is_free = false,
  thumbnail_url,
  category,
  layout = 'vertical',
  priority = false,
  sizes,
  className = '',
}: ProductCardProps) {
  const showImage = isUsableImageUrl(thumbnail_url);
  const categoryLabel = category?.name || 'Digital Product';
  const cleanTagline = tagline.trim();
  const priceText = formatPrice(price_inr, is_free);
  const imageSizes =
    sizes ||
    (layout === 'horizontal'
      ? '(max-width: 1024px) 100vw, 40vw'
      : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw');

  const mediaBlock = (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden bg-[var(--surface-2)] ${
        layout === 'horizontal' ? 'sm:col-span-7 sm:h-full' : ''
      }`}
    >
      {showImage ? (
        <SafeImage
          src={thumbnail_url!}
          alt={title}
          fill
          priority={priority}
          placeholder="blur"
          blurDataURL={DEFAULT_BLUR_DATA_URL}
          sizes={imageSizes}
          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-start justify-between p-5 bg-[var(--surface-2)]">
          <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
            <CategoryIcon slug={category?.slug} />
          </div>
          <p className="text-sm font-display font-semibold text-[var(--text-primary)] line-clamp-2">
            {title}
          </p>
        </div>
      )}
    </div>
  );

  const bodyBlock = (
    <div
      className={`p-5 flex flex-col flex-1 ${
        layout === 'horizontal' ? 'sm:col-span-5' : ''
      }`}
    >
      {/* 1. Category label (>= 13px, AA contrast) */}
      <span className="text-[13px] font-medium text-[var(--brand)] truncate mb-1.5">
        {categoryLabel}
      </span>

      {/* 2. Title (max 2 lines, strongest text on card) */}
      <h3 className="text-base sm:text-lg font-display font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors line-clamp-2 leading-snug mb-1.5">
        {title}
      </h3>

      {/* 3. One-line description clamp (empty spacer preserves baseline alignment) */}
      {cleanTagline ? (
        <p className="text-sm text-[var(--text-secondary)] line-clamp-1 leading-snug mb-4">
          {cleanTagline}
        </p>
      ) : (
        <div className="min-h-[1.25rem] mb-4" aria-hidden="true" />
      )}

      {/* 4. Price (pinned to bottom on shared baseline) */}
      <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
        <span
          className={`text-[15px] font-display font-semibold tabular-nums ${
            is_free || price_inr <= 0 ? 'text-[var(--brand)]' : 'text-[var(--text-primary)]'
          }`}
        >
          {priceText}
        </span>
      </div>
    </div>
  );

  return (
    <TransitionLink
      href={`/products/${slug}`}
      className={`group rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--brand)]/60 overflow-hidden transition-colors ${
        layout === 'horizontal'
          ? 'grid grid-cols-1 sm:grid-cols-12'
          : 'flex flex-col h-full'
      } ${className}`}
    >
      {mediaBlock}
      {bodyBlock}
    </TransitionLink>
  );
}

export function ProductCardSkeleton({ layout = 'vertical' }: { layout?: 'vertical' | 'horizontal' }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden ${
        layout === 'horizontal' ? 'grid grid-cols-1 sm:grid-cols-12' : 'flex flex-col h-full'
      }`}
    >
      <div
        className={`aspect-[16/10] w-full bg-[var(--surface-2)] animate-pulse ${
          layout === 'horizontal' ? 'sm:col-span-7' : ''
        }`}
      />
      <div className={`p-5 flex flex-col flex-1 space-y-2.5 ${layout === 'horizontal' ? 'sm:col-span-5' : ''}`}>
        <div className="h-3.5 w-24 rounded bg-[var(--surface-2)] animate-pulse" />
        <div className="h-5 w-4/5 rounded bg-[var(--surface-2)] animate-pulse" />
        <div className="h-4 w-full rounded bg-[var(--surface-2)] animate-pulse" />
        <div className="mt-auto pt-3 border-t border-[var(--border)]">
          <div className="h-4 w-16 rounded bg-[var(--surface-2)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
