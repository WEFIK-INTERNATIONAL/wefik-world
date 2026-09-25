'use client';

import React from 'react';
import Link from 'next/link';
import { useCompare } from '@/lib/compare-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SafeImage } from '@/components/ui/safe-image';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';
import {
  Scale,
  X,
  ShoppingBag,
  Star,
  Check,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react';

export function CompareModal() {
  const { compareItems, removeFromCompare, clearCompare, isCompareModalOpen, setIsCompareModalOpen } =
    useCompare();
  const { addItem } = useCart();

  const handleAddToCart = (item: (typeof compareItems)[0]) => {
    addItem({
      productId: item.id,
      title: item.title,
      slug: item.slug,
      thumbnailUrl: item.thumbnail_url,
      licenseType: 'single',
      singlePricePaise: item.price_inr,
      unlimitedPricePaise: Math.round(item.price_inr * 2.5 / 100) * 100,
      isFree: item.is_free,
    });
    toast.success(`Added ${item.title} to cart`);
  };

  return (
    <Dialog open={isCompareModalOpen} onOpenChange={setIsCompareModalOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[var(--surface)] text-[var(--text)] border-[var(--border)] p-6 sm:p-8">
        <DialogHeader className="pb-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)] border border-[var(--border)]">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-extrabold text-[var(--text)]">
                  Product Comparison Matrix
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--muted)]">
                  Compare technical specifications, licensing tiers, and architecture side by side.
                </DialogDescription>
              </div>
            </div>

            {compareItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompare}
                className="text-xs border-[var(--border)]"
              >
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>

        {compareItems.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm font-semibold text-[var(--text)]">No products selected for comparison</p>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              Click the compare icon on any product card in the marketplace to add up to 3 products.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr>
                  <th className="p-3 w-40 font-bold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]">
                    Specification
                  </th>
                  {compareItems.map((item) => (
                    <th
                      key={item.id}
                      className="p-3 min-w-[220px] max-w-[280px] border-b border-[var(--border)] align-top"
                    >
                      <div className="relative group space-y-2">
                        <button
                          onClick={() => removeFromCompare(item.id)}
                          aria-label={`Remove ${item.title}`}
                          className="absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)] hover:text-red-500 flex items-center justify-center shadow-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)]">
                          <SafeImage
                            src={item.thumbnail_url}
                            alt={item.title}
                            fill
                            sizes="280px"
                            className="object-cover"
                          />
                        </div>

                        <div>
                          <Badge variant="outline" className="text-[9px] mb-1">
                            {item.category?.name || 'General'}
                          </Badge>
                          <h4 className="font-bold text-sm text-[var(--text)] line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-[var(--muted)] line-clamp-2 mt-0.5">
                            {item.tagline}
                          </p>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(item)}
                            className="w-full h-8 bg-[var(--text)] text-[var(--surface)] font-semibold text-xs rounded-xl"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                            {item.is_free ? 'Claim Free' : 'Add to Cart'}
                          </Button>

                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs rounded-xl border-[var(--border)]"
                          >
                            <Link href={`/products/${item.slug}`} onClick={() => setIsCompareModalOpen(false)}>
                              <span>Full Specs</span>
                              <ExternalLink className="w-3 h-3 ml-1.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </th>
                  ))}
                  {Array.from({ length: 3 - compareItems.length }).map((_, i) => (
                    <th
                      key={`empty-head-${i}`}
                      className="p-3 min-w-[200px] border-b border-[var(--border)] text-center align-middle"
                    >
                      <div className="p-6 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-2)]/30 text-[var(--muted)] space-y-1">
                        <p className="font-bold text-xs">Empty Comparison Slot</p>
                        <p className="text-[10px]">Add another product to compare</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {/* Price Row */}
                <tr>
                  <td className="p-3 font-semibold text-[var(--text)] bg-[var(--surface-2)]/40">
                    Pricing (INR)
                  </td>
                  {compareItems.map((item) => (
                    <td key={`price-${item.id}`} className="p-3 font-bold text-sm text-[var(--text)]">
                      {item.is_free ? (
                        <span className="text-[var(--accent)]">Free Download</span>
                      ) : (
                        `₹${(item.price_inr / 100).toLocaleString('en-IN')}`
                      )}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareItems.length }).map((_, i) => (
                    <td key={`price-empty-${i}`} className="p-3 text-[var(--muted)]">—</td>
                  ))}
                </tr>

                {/* Rating & Reviews */}
                <tr>
                  <td className="p-3 font-semibold text-[var(--text)] bg-[var(--surface-2)]/40">
                    Verified Rating
                  </td>
                  {compareItems.map((item) => (
                    <td key={`rating-${item.id}`} className="p-3">
                      {item.rating_count > 0 ? (
                        <div className="flex items-center gap-1 text-[var(--text)] font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{item.rating_avg.toFixed(1)}</span>
                          <span className="text-[var(--muted)]">({item.rating_count} reviews)</span>
                        </div>
                      ) : (
                        <span className="text-[var(--muted)] italic">No reviews yet</span>
                      )}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareItems.length }).map((_, i) => (
                    <td key={`rating-empty-${i}`} className="p-3 text-[var(--muted)]">—</td>
                  ))}
                </tr>

                {/* Tech Stack */}
                <tr>
                  <td className="p-3 font-semibold text-[var(--text)] bg-[var(--surface-2)]/40">
                    Tech Stack
                  </td>
                  {compareItems.map((item) => (
                    <td key={`tech-${item.id}`} className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tech_stack.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[10px] font-mono text-[var(--muted)]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareItems.length }).map((_, i) => (
                    <td key={`tech-empty-${i}`} className="p-3 text-[var(--muted)]">—</td>
                  ))}
                </tr>

                {/* System Requirements */}
                <tr>
                  <td className="p-3 font-semibold text-[var(--text)] bg-[var(--surface-2)]/40">
                    Compatibility
                  </td>
                  {compareItems.map((item) => (
                    <td key={`compat-${item.id}`} className="p-3 text-[11px] text-[var(--muted)] space-y-1">
                      <div className="flex items-center gap-1.5 text-[var(--text)]">
                        <Check className="w-3.5 h-3.5 text-lime" />
                        <span>WP 6.4+ / PHP 8.1–8.3</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-lime" />
                        <span>Chrome, Safari, Firefox</span>
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareItems.length }).map((_, i) => (
                    <td key={`compat-empty-${i}`} className="p-3 text-[var(--muted)]">—</td>
                  ))}
                </tr>

                {/* Commercial Licensing */}
                <tr>
                  <td className="p-3 font-semibold text-[var(--text)] bg-[var(--surface-2)]/40">
                    Commercial Rights
                  </td>
                  {compareItems.map((item) => (
                    <td key={`license-${item.id}`} className="p-3 text-[11px] text-[var(--muted)] space-y-1">
                      <div className="flex items-center gap-1.5 text-[var(--text)]">
                        <Shield className="w-3.5 h-3.5 text-deep-green" />
                        <span>Client Sites Allowed</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--text)]">
                        <Zap className="w-3.5 h-3.5 text-deep-green" />
                        <span>Lifetime Updates Included</span>
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareItems.length }).map((_, i) => (
                    <td key={`license-empty-${i}`} className="p-3 text-[var(--muted)]">—</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
