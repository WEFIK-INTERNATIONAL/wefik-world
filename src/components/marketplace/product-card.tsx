'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, Heart, ShoppingBag, ArrowUpRight, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  isWishlisted = false,
}: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const supabase = createClient();

  const formattedPrice = (price_inr / 100).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setWishlistLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error('Please sign in to save items to your wishlist', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/login'),
        },
      });
      setWishlistLoading(false);
      return;
    }

    try {
      if (wishlisted) {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', session.user.id)
          .eq('product_id', id);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await supabase
          .from('wishlists')
          .insert([{ user_id: session.user.id, product_id: id }] as any);
        setWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
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
      unlimitedPricePaise: Math.round(price_inr * 2.5),
      isFree: is_free,
    });

    toast.success(`Added ${title} to cart`);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-border overflow-hidden hover:border-slate-300 hover:shadow-xl transition-all duration-300">
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface">
        <Link href={`/products/${slug}`} className="block w-full h-full">
          <Image
            src={thumbnail_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800'}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          {category && (
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-ink font-semibold text-[10px] px-2 py-0.5 shadow-sm border border-border">
              {category.name}
            </Badge>
          )}
          {is_bundle && (
            <Badge className="bg-deep-green text-white font-bold text-[10px] px-2 py-0.5 shadow-sm border-0">
              Bundle Deal
            </Badge>
          )}
          {is_free && (
            <Badge className="bg-lime text-ink font-extrabold text-[10px] px-2 py-0.5 shadow-sm border-0">
              FREE
            </Badge>
          )}
          {is_featured && !is_free && (
            <Badge className="bg-ink text-white font-medium text-[10px] px-2 py-0.5 shadow-sm border-0 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-lime" />
              Featured
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm z-10 ${
            wishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/85 text-slate hover:text-red-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col p-5">
        {/* Rating and Tech Stack */}
        <div className="flex items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex items-center gap-1 text-slate font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-ink">
              {rating_avg > 0 ? rating_avg.toFixed(1) : '5.0'}
            </span>
            <span className="text-[11px] text-slate/70">
              ({rating_count > 0 ? rating_count : 1})
            </span>
          </div>

          {tech_stack.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate truncate font-medium">
              <span>{tech_stack.slice(0, 2).join(' • ')}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={`/products/${slug}`} className="group-hover:text-deep-green transition-colors">
          <h3 className="font-bold text-base text-ink tracking-tight line-clamp-1">
            {title}
          </h3>
        </Link>

        {/* Tagline */}
        <p className="text-xs text-slate line-clamp-2 mt-1 mb-4 flex-1">
          {tagline}
        </p>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate block leading-tight">
              {is_free ? 'License' : 'From'}
            </span>
            <div className="text-base font-extrabold text-ink tracking-tight">
              {is_free ? (
                <span className="text-deep-green font-black">Free Download</span>
              ) : (
                `₹${formattedPrice}`
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="h-9 px-3 rounded-xl bg-ink hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{is_free ? 'Claim' : 'Add'}</span>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-xl border-border text-slate hover:text-ink hover:bg-soft"
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
  );
}
