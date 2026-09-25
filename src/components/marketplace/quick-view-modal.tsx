'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProductData } from '@/lib/data/products';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SafeImage } from '@/components/ui/safe-image';
import { useCart, CartLicenseType } from '@/lib/cart-context';
import { LiveDemoViewer } from './live-demo-viewer';
import { toast } from 'sonner';
import {
  ShoppingBag,
  ExternalLink,
  Star,
  Check,
  Globe,
  Infinity as InfinityIcon,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/image-placeholder';

interface QuickViewModalProps {
  product: ProductData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedLicense, setSelectedLicense] = useState<CartLicenseType>('single');
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const { addItem } = useCart();

  if (!product) return null;

  const singlePrice = product.price_inr;
  const unlimitedPrice = Math.round((product.price_inr * 2.5) / 100) * 100;
  const currentPrice = selectedLicense === 'unlimited' ? unlimitedPrice : singlePrice;

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
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl bg-[var(--surface)] text-[var(--text)] border-[var(--border)] p-6 sm:p-8 overflow-hidden rounded-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Gallery & Demo Button */}
            <div className="space-y-3">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)]">
                <SafeImage
                  src={gallery[activeImgIndex] || product.thumbnail_url}
                  alt={product.title}
                  fill
                  placeholder="blur"
                  blurDataURL={DEFAULT_BLUR_DATA_URL}
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />

                <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                  {product.category && (
                    <Badge variant="secondary" className="bg-[var(--surface)]/90 backdrop-blur-sm text-[10px]">
                      {product.category.name}
                    </Badge>
                  )}
                  {product.is_free && (
                    <Badge className="bg-lime text-ink font-bold text-[10px]">Freebie</Badge>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={`relative w-16 h-11 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImgIndex === idx
                          ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]'
                          : 'border-[var(--border)] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <SafeImage
                        src={img}
                        alt={`Thumb ${idx}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Live Demo Trigger */}
              <Button
                variant="outline"
                onClick={() => setIsDemoOpen(true)}
                className="w-full h-10 border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl font-semibold text-xs flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-lime" />
                <span>Launch Interactive Live Demo (Device Frames)</span>
              </Button>
            </div>

            {/* Right: Info, License Picker & Add to Cart */}
            <div className="space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[var(--text)] tracking-tight">
                  {product.title}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {product.tagline}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 text-xs py-1.5 border-y border-[var(--border)]">
                  {product.rating_count > 0 ? (
                    <div className="flex items-center gap-1 font-semibold text-[var(--text)]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating_avg.toFixed(1)}</span>
                      <span className="text-[var(--muted)]">({product.rating_count} ratings)</span>
                    </div>
                  ) : (
                    <span className="text-[var(--muted)] italic text-[11px]">No reviews yet</span>
                  )}
                </div>

                {/* Compatibility Badges */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    System Compatibility
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[10px] text-[var(--text)] flex items-center gap-1">
                      <Check className="w-3 h-3 text-lime" />
                      WordPress 6.4+ (FSE)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[10px] text-[var(--text)] flex items-center gap-1">
                      <Check className="w-3 h-3 text-lime" />
                      PHP 8.1–8.3 Strict
                    </span>
                  </div>
                </div>

                {/* License Option if not free */}
                {!product.is_free && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      License Type
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedLicense('single')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedLicense === 'single'
                            ? 'border-[var(--accent)] bg-[var(--surface-2)] ring-1 ring-[var(--accent)]'
                            : 'border-[var(--border)] hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--text)] flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5" /> Single
                          </span>
                          <span className="text-xs font-extrabold text-[var(--text)]">
                            ₹{(singlePrice / 100).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--muted)] mt-0.5">1 domain site</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedLicense('unlimited')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedLicense === 'unlimited'
                            ? 'border-[var(--accent)] bg-[var(--surface-2)] ring-1 ring-[var(--accent)]'
                            : 'border-[var(--border)] hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--text)] flex items-center gap-1">
                            <InfinityIcon className="w-3.5 h-3.5" /> Unlimited
                          </span>
                          <span className="text-xs font-extrabold text-[var(--text)]">
                            ₹{(unlimitedPrice / 100).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--muted)] mt-0.5">Unlimited clients</p>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Price & Action */}
              <div className="pt-4 border-t border-[var(--border)] space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-[var(--muted)] font-medium">Total</span>
                  <span className="text-xl font-black text-[var(--text)]">
                    {product.is_free ? (
                      <span className="text-[var(--accent)]">Free</span>
                    ) : (
                      `₹${(currentPrice / 100).toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 h-10 bg-[var(--text)] text-[var(--surface)] font-bold text-xs rounded-xl"
                  >
                    <ShoppingBag className="w-4 h-4 mr-1.5" />
                    <span>{product.is_free ? 'Claim Freebie' : 'Add to Cart'}</span>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-10 px-3 text-xs rounded-xl border-[var(--border)] text-[var(--text)]"
                  >
                    <Link href={`/products/${product.slug}`} onClick={onClose}>
                      <span>Full Page</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] justify-center pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-deep-green" />
                  <span>Verified Single-Vendor Guarantee — Built by Wefik</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Live Demo Viewer */}
      <LiveDemoViewer
        product={product}
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />
    </>
  );
}
