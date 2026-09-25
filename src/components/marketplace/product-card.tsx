'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TransitionLink } from '@/components/transitions/transition-link';
import { SafeImage } from '@/components/ui/safe-image';
import { Star, Heart, ShoppingBag, ArrowUpRight, Sparkles, Eye, Scale } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useCompare } from '@/lib/compare-context';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuickViewModal } from './quick-view-modal';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/image-placeholder';
import { ProductData } from '@/lib/data/products';

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  price_inr: number; // in paise
  is_free?: boolean;
  is_featured?: boolean;
  is_bundle?: boolean;
  thumbnail_url: string;
  category?: {
    name: string;
    slug: string;
  } | null;
  rating_avg?: number;
  rating_count?: number;
  tech_stack?: string[];
  isWishlisted?: boolean;
}

export function ProductCard({
  id,
  title,
  slug,
  tagline,
  price_inr,
  is_free = false,
  is_featured = false,
  is_bundle = false,
  thumbnail_url,
  category,
  rating_avg = 5.0,
  rating_count = 0,
  tech_stack = [],
}: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const productData: ProductData = {
    id,
    title,
    slug,
    tagline,
    price_inr,
    is_free,
    is_featured,
    is_bundle,
    thumbnail_url,
    category,
    rating_avg,
    rating_count,
    download_count: 0,
    tech_stack,
    description: tagline,
  };

  const formattedPrice = (price_inr / 100).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist({ id, title });
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(productData);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: id,
      title,
      slug,
      thumbnailUrl: thumbnail_url,
      licenseType: 'single',
      singlePricePaise: price_inr,
      unlimitedPricePaise: Math.round((price_inr * 2.5) / 100) * 100,
      isFree: is_free,
    });

    toast.success(`Added ${title} to cart`);
  };

  const saved = isWishlisted(id);
  const compared = isInCompare(id);

  return (
    <>
      <div className="group relative flex flex-col bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden hover:border-lime/60 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-lime/10 transition-all duration-300 will-change-transform">
        {/* Thumbnail Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--surface-2)]">
          <TransitionLink href={`/products/${slug}`} className="block w-full h-full">
            <SafeImage
              src={thumbnail_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800'}
              alt={title}
              fill
              placeholder="blur"
              blurDataURL={DEFAULT_BLUR_DATA_URL}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
            />
          </TransitionLink>

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
            {category && (
              <Badge variant="secondary" className="bg-[var(--surface)]/90 backdrop-blur-sm text-[var(--text)] font-semibold text-[10px] px-2 py-0.5 shadow-xs border border-[var(--border)]">
                {category.name}
              </Badge>
            )}
            {is_bundle && (
              <Badge className="bg-lime text-[#0a0f0a] font-black text-[10px] px-2 py-0.5 shadow-xs">
                Bundle Deal
              </Badge>
            )}
            {is_free && (
              <Badge className="bg-deep-green text-white font-bold text-[10px] px-2 py-0.5 shadow-xs">
                Freebie
              </Badge>
            )}
            {is_featured && !is_free && (
              <Badge className="bg-[var(--text)] text-[var(--surface)] font-medium text-[10px] px-2 py-0.5 shadow-xs border-0 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-lime" />
                Featured
              </Badge>
            )}
          </div>

          {/* Action Icons Overlay (Wishlist + Compare + QuickView) */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              aria-label={saved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
              className="w-8 h-8 rounded-full bg-[var(--surface)]/90 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-red-500 hover:scale-110 active:scale-95 transition-all shadow-xs"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  saved ? 'fill-red-500 text-red-500' : ''
                }`}
              />
            </button>

            {/* Compare Toggle Button */}
            <button
              onClick={handleCompareToggle}
              aria-label={compared ? `Remove ${title} from comparison` : `Compare ${title}`}
              title={compared ? 'In comparison' : 'Add to comparison'}
              className={`w-8 h-8 rounded-full bg-[var(--surface)]/90 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xs ${
                compared ? 'text-lime border-lime bg-lime/20' : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>

            {/* Quick View Button */}
            <button
              onClick={handleQuickView}
              aria-label={`Quick view ${title}`}
              title="Quick view"
              className="w-8 h-8 rounded-full bg-[var(--surface)]/90 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:scale-110 active:scale-95 transition-all shadow-xs"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Rating and Tech Stack */}
          <div className="flex items-center justify-between gap-2 mb-2 text-xs">
            {rating_count > 0 ? (
              <div className="flex items-center gap-1 text-[var(--text)] font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rating_avg.toFixed(1)}</span>
                <span className="text-[var(--muted)]">({rating_count})</span>
              </div>
            ) : (
              <span className="text-[11px] text-[var(--muted)] italic">No reviews yet</span>
            )}

            {tech_stack.length > 0 && (
              <div className="flex items-center gap-1">
                {tech_stack.slice(0, 2).map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Title with word-aware 2-line clamp */}
          <Link href={`/products/${slug}`} className="group-hover:text-[var(--accent)] transition-colors">
            <h3 className="heading-3 line-clamp-2 break-words [overflow-wrap:break-word] [hyphens:none] min-h-[2.5rem]" title={title}>
              {title}
            </h3>
          </Link>

          {/* Tagline */}
          <p className="body-small text-[var(--muted)] line-clamp-2 mt-1 mb-4 flex-1">
            {tagline}
          </p>

          {/* Price & Action Row */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2 mt-auto">
            <div>
              <span className="eyebrow text-[10px] text-[var(--muted)] block leading-tight">
                {is_free ? 'License' : 'From'}
              </span>
              <div className="text-base font-display font-bold text-[var(--text)] tracking-tight tabular-nums">
                {is_free ? (
                  <span className="text-[var(--accent)] font-bold">Free Download</span>
                ) : (
                  `₹${formattedPrice}`
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="h-9 px-3 rounded-xl bg-[var(--text)] hover:opacity-90 text-[var(--surface)] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{is_free ? 'Claim' : 'Add'}</span>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
                aria-label={`View ${title} details`}
              >
                <Link href={`/products/${slug}`}>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={productData}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
