'use client';

import React, { useState, useEffect } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  Check,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Globe,
  Infinity as InfinityIcon,
  Download,
  Loader2,
  Clock,
  Eye,
  Heart,
  Scale,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductMarkdownDocs } from './product-markdown-docs';
import { Badge } from '@/components/ui/badge';
import { useCart, CartLicenseType } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useCompare } from '@/lib/compare-context';
import { recordProductView } from '@/lib/recently-viewed';
import { ProductData } from '@/lib/data/products';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { FreebieMagnetKit } from '@/components/freebies/freebie-magnet-kit';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/image-placeholder';
import { LiveDemoViewer } from './live-demo-viewer';
import { BeforeAfterSlider } from './before-after-slider';
import { RecentlyViewedShelf } from './recently-viewed-shelf';

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
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();

  const [selectedLicense, setSelectedLicense] = useState<CartLicenseType>('single');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [claimLoading, setClaimLoading] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Review Form State
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    recordProductView(product);
  }, [product]);

  const singlePrice = product.price_inr;
  const unlimitedPrice = Math.round((product.price_inr * 2.5) / 100) * 100;
  const currentPrice = selectedLicense === 'unlimited' ? unlimitedPrice : singlePrice;

  const formattedSingle = (singlePrice / 100).toLocaleString('en-IN');
  const formattedUnlimited = (unlimitedPrice / 100).toLocaleString('en-IN');
  const formattedCurrent = (currentPrice / 100).toLocaleString('en-IN');

  const gallery = [product.thumbnail_url, ...(product.gallery_urls || [])].filter(Boolean);

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
      });

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

  const saved = isWishlisted(product.id);
  const compared = isInCompare(product.id);

  // Versions history list
  const versionsList = product.versions || [
    {
      version: 'v1.0.0',
      changelog: 'Initial marketplace release. FSE block templates, clean PHP 8.2 architecture, semantic styling.',
      is_latest: true,
      created_at: '2026-09-20',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Top Grid: Gallery & Purchasing Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Gallery Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-surface border border-border shadow-xs">
            <SafeImage
              src={gallery[activeImageIndex] || product.thumbnail_url}
              alt={product.title}
              fill
              priority
              placeholder="blur"
              blurDataURL={DEFAULT_BLUR_DATA_URL}
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />

            {/* Live Demo Viewer overlay button */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
              <Button
                onClick={() => setIsDemoOpen(true)}
                className="h-10 px-4 rounded-xl bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)] text-xs font-bold shadow-lg flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-lime" />
                <span>Live Demo (Desktop/Tablet/Mobile)</span>
              </Button>
            </div>
          </div>

          {/* Thumbnail Gallery Row */}
          {gallery.length > 1 && (
            <div data-lenis-prevent className="flex items-center gap-3 overflow-x-auto pb-1">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-deep-green ring-2 ring-lime/50'
                      : 'border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    placeholder="blur"
                    blurDataURL={DEFAULT_BLUR_DATA_URL}
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Compatibility & Tech Stack Badges */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate font-semibold">Compatibility:</span>
              <span className="text-xs bg-soft text-ink font-medium px-2.5 py-1 rounded-lg border border-border flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-lime" />
                WordPress 6.4+ (FSE)
              </span>
              <span className="text-xs bg-soft text-ink font-medium px-2.5 py-1 rounded-lg border border-border flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-lime" />
                PHP 8.1–8.3 Strict
              </span>
              <span className="text-xs bg-soft text-ink font-medium px-2.5 py-1 rounded-lg border border-border flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-lime" />
                Chrome / Safari / Firefox
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate font-semibold">Tech Stack:</span>
              {product.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs bg-soft text-ink font-medium px-2.5 py-1 rounded-lg border border-border font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Purchase & Licensing Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] shadow-lg space-y-6">
            {/* Title, Category & Wishlist/Compare */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
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

                <div className="flex items-center gap-1.5">
                  {/* Compare Button */}
                  <button
                    onClick={() => toggleCompare(product)}
                    aria-label="Toggle comparison"
                    title={compared ? 'In comparison' : 'Add to comparison'}
                    className={`w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center transition-all ${
                      compared ? 'bg-lime/20 text-lime border-lime' : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    <Scale className="w-4 h-4" />
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist({ id: product.id, title: product.title })}
                    aria-label="Toggle wishlist"
                    title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                    className={`w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center transition-all ${
                      saved ? 'bg-red-500/20 text-red-500 border-red-500' : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${saved ? 'fill-red-500' : ''}`} />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                {product.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate mt-2 leading-relaxed">
                {product.tagline}
              </p>
            </div>

            {/* Recency & Rating Summary */}
            <div className="flex items-center justify-between text-xs py-2.5 border-y border-border">
              <div className="flex items-center gap-2">
                {product.rating_count > 0 ? (
                  <>
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="font-bold text-ink">
                      {product.rating_avg.toFixed(1)}
                    </span>
                    <span className="text-slate">
                      ({product.rating_count} verified ratings)
                    </span>
                  </>
                ) : (
                  <span className="text-slate italic font-medium">No reviews yet</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] font-medium">
                <Clock className="w-3.5 h-3.5 text-lime" />
                <span>Updated 6 days ago</span>
              </div>
            </div>

            {/* License Option Selector (If paid) */}
            {!product.is_free && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate block">
                    Choose Your License
                  </label>
                  <Link href="/license" target="_blank" className="text-[11px] text-deep-green font-semibold underline hover:text-ink">
                    Compare Rights &rarr;
                  </Link>
                </div>

                {/* Option 1: Single Site */}
                <div
                  onClick={() => setSelectedLicense('single')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedLicense === 'single'
                      ? 'border-deep-green bg-soft/60 ring-2 ring-lime/30'
                      : 'border-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedLicense === 'single' ? 'border-deep-green bg-deep-green' : 'border-slate'
                        }`}
                      >
                        {selectedLicense === 'single' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--bg)]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-deep-green" />
                          <span>Single Site License</span>
                        </p>
                        <p className="text-[11px] text-slate mt-0.5">
                          1 production domain (personal or 1 client website)
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-extrabold text-ink">₹{formattedSingle}</span>
                  </div>
                </div>

                {/* Option 2: Unlimited Sites */}
                <div
                  onClick={() => setSelectedLicense('unlimited')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedLicense === 'unlimited'
                      ? 'border-deep-green bg-soft/60 ring-2 ring-lime/30'
                      : 'border-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedLicense === 'unlimited' ? 'border-deep-green bg-deep-green' : 'border-slate'
                        }`}
                      >
                        {selectedLicense === 'unlimited' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--bg)]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink flex items-center gap-1.5">
                          <InfinityIcon className="w-4 h-4 text-deep-green" />
                          <span>Unlimited Sites (Agency)</span>
                        </p>
                        <p className="text-[11px] text-slate mt-0.5">
                          Unlimited client websites + perpetual client site usage
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-extrabold text-ink">₹{formattedUnlimited}</span>
                  </div>
                </div>

                {/* Option 3: All-Access Membership Banner */}
                <Link
                  href="/pricing"
                  className="block p-3 rounded-2xl border border-lime/40 bg-lime/10 hover:bg-lime/20 transition-all text-xs"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-deep-green dark:text-lime">
                      <Sparkles className="w-4 h-4 text-lime" />
                      All-Access Membership
                    </span>
                    <span className="text-xs font-extrabold text-[var(--text-primary)]">From ₹999/mo</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    Get this product PLUS every theme, plugin & template with lifetime updates.
                  </p>
                </Link>
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
                  className="w-full h-12 bg-[var(--surface-inverted)] text-[var(--text-inverted)] hover:opacity-90 font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart ({selectedLicense === 'unlimited' ? 'Unlimited' : 'Single'})</span>
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setIsDemoOpen(true)}
                className="w-full h-11 border-border text-ink hover:bg-soft rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-lime" />
                <span>Open Live Demo in Device Frames</span>
              </Button>
            </div>

            {/* Security Guarantee */}
            <div className="pt-2 border-t border-border space-y-2 text-[11px] text-slate">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-deep-green shrink-0" />
                <span>Instant cryptographically generated WFK-XXXX license key</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-deep-green shrink-0" />
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

      {/* Before / After Visual Showcase for Themes */}
      {gallery.length >= 2 && (
        <section className="space-y-4 bg-[var(--surface)] p-8 sm:p-10 rounded-3xl border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
            <div>
              <h2 className="text-xl font-extrabold text-ink tracking-tight">
                Visual Transformation & Layout Comparison
              </h2>
              <p className="text-xs text-slate mt-0.5">
                Drag the slider handle to inspect how {product.title} transforms raw WordPress output into a high-converting agency storefront.
              </p>
            </div>
            <Badge variant="outline" className="text-xs border-lime/60 text-deep-green w-fit">
              Interactive Slider
            </Badge>
          </div>

          <BeforeAfterSlider
            beforeImage={gallery[0]}
            afterImage={gallery[1]}
            beforeLabel="Standard WP Baseline"
            afterLabel={`${product.title} FSE`}
          />
        </section>
      )}

      {/* Middle Grid: Detailed Description & Version Changelog Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Markdown Description (8 cols) */}
        <div className="lg:col-span-8 bg-[var(--surface)] p-8 sm:p-10 rounded-3xl border border-border shadow-xs space-y-6">
          <h2 className="text-xl font-extrabold text-ink tracking-tight pb-3 border-b border-border">
            Product Documentation & Highlights
          </h2>
          <ProductMarkdownDocs content={product.description} />
        </div>

        {/* Changelog & Version Timeline (4 cols) */}
        <div className="lg:col-span-4 bg-soft p-6 sm:p-8 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-lime" />
              <span>Changelog Timeline</span>
            </h3>
            <span className="text-[11px] text-slate font-mono">
              {versionsList.length} release{versionsList.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-4 pt-2 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
            {versionsList.map((ver) => (
              <div key={ver.version} className="relative pl-8 space-y-1.5">
                <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-[var(--surface)] border-2 border-lime -translate-x-1/2" />
                <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-border space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink font-mono flex items-center gap-1.5">
                      {ver.version}
                      {ver.is_latest && (
                        <Badge className="bg-lime text-black text-[9px] px-1.5 py-0 font-bold">
                          Latest
                        </Badge>
                      )}
                    </span>
                    <span className="text-slate text-[10px]">{ver.created_at}</span>
                  </div>
                  <p className="text-xs text-slate leading-relaxed">{ver.changelog}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <div className="bg-[var(--surface)] p-8 sm:p-10 rounded-3xl border border-border shadow-xs space-y-8">
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

      {/* Recently Viewed Shelf */}
      <RecentlyViewedShelf currentProductId={product.id} />

      {/* Live Demo Viewer Modal */}
      <LiveDemoViewer
        product={product}
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />
    </div>
  );
}
