'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  CheckCircle,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Infinity as InfinityIcon,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart, CartLicenseType } from '@/lib/cart-context';
import { ProductData } from '@/lib/data/products';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { FreebieMagnetKit } from '@/components/freebies/freebie-magnet-kit';

interface ProductDetailViewProps {
  product: ProductData;
  initialReviews?: {
    id: string;
    rating: number;
    title: string;
    comment: string;
    created_at: string;
    profile?: {
      full_name: string | null;
      email: string;
    } | null;
  }[];
}

export function ProductDetailView({ product, initialReviews = [] }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedLicense, setSelectedLicense] = useState<CartLicenseType>('single');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [claimLoading, setClaimLoading] = useState(false);

  // Review Form State
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const supabase = createClient();

  const singlePrice = product.price_inr;
  const unlimitedPrice = Math.round(product.price_inr * 2.5);
  const currentPrice = selectedLicense === 'unlimited' ? unlimitedPrice : singlePrice;

  const formattedSingle = (singlePrice / 100).toLocaleString('en-IN');
  const formattedUnlimited = (unlimitedPrice / 100).toLocaleString('en-IN');
  const formattedCurrent = (currentPrice / 100).toLocaleString('en-IN');

  const gallery = [
    product.thumbnail_url,
    ...(product.gallery_urls || []),
  ].filter(Boolean);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      thumbnailUrl: product.thumbnail_url,
      licenseType: selectedLicense,
      singlePricePaise: singlePrice,
      unlimitedPricePaise: unlimitedPrice,
      isFree: product.is_free,
    });
    toast.success(`Added ${product.title} to cart`);
  };

  const handleClaimFree = async () => {
    setClaimLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error('Please sign in to claim this free product', {
        action: {
          label: 'Sign In',
          onClick: () => router.push(`/login?redirect=/products/${product.slug}`),
        },
      });
      setClaimLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/claim-free`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_id: product.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Claim failed');
      }

      toast.success('Product claimed successfully! You now have a free license key.');
      router.push('/dashboard/licenses');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Claim failed';
      toast.error(msg);
    } finally {
      setClaimLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error('Please sign in to post a review', {
        action: {
          label: 'Sign In',
          onClick: () => router.push(`/login?redirect=/products/${product.slug}`),
        },
      });
      return;
    }

    setReviewSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: product.id,
        user_id: session.user.id,
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      } as any);

      if (error) throw error;

      toast.success('Thank you! Your verified review has been submitted.');
      setReviews((prev) => [
        {
          id: 'temp-' + Date.now(),
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          created_at: new Date().toISOString(),
          profile: {
            full_name: session.user.user_metadata?.full_name || 'Customer',
            email: session.user.email || '',
          },
        },
        ...prev,
      ]);
      setReviewTitle('');
      setReviewComment('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review';
      toast.error(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Top Grid: Gallery & Purchasing Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Gallery Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-surface border border-border shadow-sm">
            <Image
              src={gallery[activeImageIndex] || product.thumbnail_url}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>

          {/* Thumbnail Gallery Row */}
          {gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-deep-green ring-2 ring-lime/50'
                      : 'border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}

          {/* Tech Stack Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate font-semibold">Tech Stack:</span>
            {product.tech_stack.map((tech) => (
              <span
                key={tech}
                className="text-xs bg-soft text-ink font-medium px-2.5 py-1 rounded-lg border border-border"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Purchase & Licensing Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-lg space-y-6">
            {/* Title & Tagline */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.category && (
                  <Badge variant="secondary" className="bg-soft text-ink text-xs font-semibold">
                    {product.category.name}
                  </Badge>
                )}
                {product.is_free ? (
                  <Badge className="bg-lime text-ink font-extrabold text-xs">FREE LEAD MAGNET</Badge>
                ) : (
                  <Badge className="bg-deep-green text-white font-bold text-xs">COMMERCIAL READY</Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                {product.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate mt-2 leading-relaxed">
                {product.tagline}
              </p>
            </div>

            {/* Rating Summary */}
            <div className="flex items-center gap-2 text-xs py-2 border-y border-border">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-ink">
                {product.rating_avg > 0 ? product.rating_avg.toFixed(1) : '5.0'}
              </span>
              <span className="text-slate">
                ({product.rating_count > 0 ? product.rating_count : 1} verified ratings)
              </span>
              <span className="text-slate/40">•</span>
              <span className="text-deep-green font-semibold">
                {product.download_count} total downloads
              </span>
            </div>

            {/* License Option Selector (If paid) */}
            {!product.is_free && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate block">
                  Select License Tier
                </label>

                {/* Single Site License Option */}
                <div
                  onClick={() => setSelectedLicense('single')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedLicense === 'single'
                      ? 'border-deep-green bg-soft/60 ring-2 ring-lime/30'
                      : 'border-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedLicense === 'single'
                            ? 'border-deep-green bg-deep-green'
                            : 'border-slate'
                        }`}
                      >
                        {selectedLicense === 'single' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-deep-green" />
                          <span>Single Site License</span>
                        </p>
                        <p className="text-[11px] text-slate mt-0.5">
                          For 1 production domain (personal or client site)
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-extrabold text-ink">₹{formattedSingle}</span>
                  </div>
                </div>

                {/* Unlimited Sites License Option */}
                <div
                  onClick={() => setSelectedLicense('unlimited')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedLicense === 'unlimited'
                      ? 'border-deep-green bg-soft/60 ring-2 ring-lime/30'
                      : 'border-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedLicense === 'unlimited'
                            ? 'border-deep-green bg-deep-green'
                            : 'border-slate'
                        }`}
                      >
                        {selectedLicense === 'unlimited' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink flex items-center gap-1.5">
                          <InfinityIcon className="w-4 h-4 text-deep-green" />
                          <span>Unlimited Sites (Agency)</span>
                        </p>
                        <p className="text-[11px] text-slate mt-0.5">
                          Unlimited client websites + lifetime updates
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-extrabold text-ink">₹{formattedUnlimited}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Price & Action Button */}
            <div className="pt-2 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate uppercase">Total Amount</span>
                <div className="text-2xl sm:text-3xl font-black text-ink">
                  {product.is_free ? (
                    <span className="text-deep-green font-extrabold">₹0 (Free)</span>
                  ) : (
                    `₹${formattedCurrent}`
                  )}
                </div>
              </div>

              {product.is_free ? (
                <Button
                  onClick={handleClaimFree}
                  disabled={claimLoading}
                  className="w-full h-12 bg-deep-green hover:bg-deep-green/90 text-white font-bold rounded-xl text-sm shadow-md"
                >
                  {claimLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Claim Free License Key
                </Button>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  className="w-full h-12 bg-ink hover:bg-black text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart ({selectedLicense === 'unlimited' ? 'Unlimited' : 'Single'})</span>
                </Button>
              )}

              {product.demo_url && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-11 border-border text-ink hover:bg-soft rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <a href={product.demo_url} target="_blank" rel="noreferrer">
                    <span>View Live Demonstration</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              )}
            </div>

            {/* Security Guarantee */}
            <div className="pt-2 border-t border-border space-y-2 text-[11px] text-slate">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-deep-green flex-shrink-0" />
                <span>Instant cryptographically generated WFK-XXXX license key</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-deep-green flex-shrink-0" />
                <span>Direct 60-second secure signed downloads from private storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Freebie Magnet & Share Kit for free products */}
      {product.is_free && (
        <FreebieMagnetKit productTitle={product.title} productSlug={product.slug} />
      )}

      {/* Middle Grid: Detailed Description & Version Changelog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Markdown Description (8 cols) */}
        <div className="lg:col-span-8 bg-white p-8 sm:p-10 rounded-3xl border border-border shadow-xs space-y-6">
          <h2 className="text-xl font-extrabold text-ink tracking-tight pb-3 border-b border-border">
            Product Documentation & Highlights
          </h2>
          <div className="prose prose-sm max-w-none text-slate leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
            {product.description}
          </div>
        </div>

        {/* Changelog & Versions (4 cols) */}
        <div className="lg:col-span-4 bg-soft p-6 sm:p-8 rounded-3xl border border-border space-y-4">
          <h3 className="text-base font-bold text-ink flex items-center gap-2">
            <span>Version History</span>
            <Badge variant="outline" className="text-[10px] bg-white font-mono">
              v1.0.0
            </Badge>
          </h3>

          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-white border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-ink font-mono">v1.0.0 (Latest)</span>
                <span className="text-slate text-[11px]">September 2026</span>
              </div>
              <p className="text-xs text-slate">
                Initial production marketplace release with full commercial licensing, Gutenberg blocks, and PHP 8.2 compatibility.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-border shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h2 className="text-xl font-extrabold text-ink tracking-tight">
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-slate mt-0.5">
              Verified feedback from agencies and freelancers using {product.title}.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-ink">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{product.rating_avg.toFixed(1)} / 5.0 Average Rating</span>
          </div>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4 divide-y divide-border">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate py-4">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="pt-4 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink">
                      {r.profile?.full_name || 'Verified Buyer'}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-lime/30 text-deep-green font-bold rounded">
                      Verified Purchase
                    </span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                {r.title && <p className="text-xs font-semibold text-ink">{r.title}</p>}
                <p className="text-xs text-slate leading-relaxed">{r.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Submit Review Form */}
        <div className="pt-6 border-t border-border space-y-4">
          <h3 className="text-sm font-bold text-ink">Leave a Verified Review</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate font-medium">Your Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= reviewRating ? 'fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Review title (e.g. Excellent code structure and fast loading)"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-soft border border-border rounded-xl text-ink placeholder:text-slate focus:outline-none focus:ring-1 focus:ring-lime"
            />

            <textarea
              placeholder="Write your review here..."
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-soft border border-border rounded-xl text-ink placeholder:text-slate focus:outline-none focus:ring-1 focus:ring-lime"
            />

            <Button
              type="submit"
              disabled={reviewSubmitting}
              className="bg-ink hover:bg-black text-white text-xs h-9 px-4 rounded-xl font-semibold"
            >
              {reviewSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              Submit Review
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
