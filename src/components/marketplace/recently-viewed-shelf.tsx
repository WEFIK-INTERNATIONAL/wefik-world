'use client';

import React from 'react';
import Link from 'next/link';
import { useRecentlyViewed } from '@/lib/recently-viewed';
import { SafeImage } from '@/components/ui/safe-image';
import { Clock, ArrowRight } from 'lucide-react';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/image-placeholder';

interface RecentlyViewedShelfProps {
  currentProductId?: string;
}

export function RecentlyViewedShelf({ currentProductId }: RecentlyViewedShelfProps) {
  const items = useRecentlyViewed(currentProductId);

  if (items.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-[var(--border)] space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-lime" />
          <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">
            Recently Viewed
          </h3>
        </div>
        <Link
          href="/marketplace"
          className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
        >
          <span>Explore All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.slice(0, 4).map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group flex flex-col bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden hover:border-lime/60 hover:-translate-y-1 transition-all p-3"
          >
            <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-[var(--surface-2)] mb-2.5">
              <SafeImage
                src={product.thumbnail_url}
                alt={product.title}
                fill
                placeholder="blur"
                blurDataURL={DEFAULT_BLUR_DATA_URL}
                sizes="240px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h4 className="text-xs font-bold text-[var(--text)] line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
              {product.title}
            </h4>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-[var(--muted)] font-mono">
                {product.is_free ? 'Free' : `₹${(product.price_inr / 100).toLocaleString('en-IN')}`}
              </span>
              <span className="text-[10px] text-lime font-semibold">View &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
