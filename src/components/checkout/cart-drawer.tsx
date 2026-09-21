'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart, CartLicenseType } from '@/lib/cart-context';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateLicense,
    totalPaise,
    totalCount,
  } = useCart();

  const formattedTotal = (totalPaise / 100).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col h-full w-full sm:max-w-md p-6 bg-white">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink">
            <ShoppingBag className="w-5 h-5 text-deep-green" />
            Shopping Cart ({totalCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-soft border border-border flex items-center justify-center text-slate">
              <ShoppingBag className="w-8 h-8 stroke-1" />
            </div>
            <div>
              <p className="text-base font-semibold text-ink">Your cart is empty</p>
              <p className="text-xs text-slate mt-1 max-w-[240px]">
                Explore our premium WordPress themes, HTML templates, and code starters.
              </p>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              asChild
              className="bg-ink hover:bg-black text-white text-xs h-10 px-5 rounded-xl font-medium"
            >
              <Link href="/marketplace">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 space-y-4 divide-y divide-border/60">
            {items.map((item) => {
              const itemFormattedPrice = (item.pricePaise / 100).toLocaleString('en-IN', {
                maximumFractionDigits: 0,
              });

              return (
                <div key={item.productId} className="pt-4 first:pt-0 flex gap-4 items-start">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface border border-border flex-shrink-0">
                    <Image
                      src={item.thumbnailUrl || '/placeholder.png'}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-semibold text-ink truncate hover:text-deep-green transition-colors"
                      >
                        {item.title}
                      </Link>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-slate hover:text-error transition-colors p-1"
                        aria-label={`Remove ${item.title} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      {/* License Selector */}
                      <select
                        value={item.licenseType}
                        onChange={(e) =>
                          updateLicense(item.productId, e.target.value as CartLicenseType)
                        }
                        className="text-[11px] bg-soft border border-border rounded-md px-2 py-1 text-slate font-medium focus:outline-none focus:ring-1 focus:ring-lime cursor-pointer"
                      >
                        <option value="single">Single Site (1 Domain)</option>
                        <option value="unlimited">Unlimited Sites</option>
                      </select>

                      <div className="text-sm font-bold text-ink whitespace-nowrap">
                        {item.isFree ? (
                          <span className="text-deep-green font-bold uppercase text-xs">Free</span>
                        ) : (
                          `₹${itemFormattedPrice}`
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {items.length > 0 && (
          <div className="pt-4 border-t border-border space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate">
                <span>Subtotal</span>
                <span className="font-medium text-ink">₹{formattedTotal}</span>
              </div>
              <div className="flex justify-between text-slate">
                <span>Taxes & Fees</span>
                <span className="font-medium text-deep-green">Included (GST)</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between items-baseline text-sm font-bold text-ink">
                <span>Total Due</span>
                <span className="text-lg text-ink font-extrabold">₹{formattedTotal}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate bg-soft p-2.5 rounded-lg border border-border">
              <ShieldCheck className="w-4 h-4 text-deep-green flex-shrink-0" />
              <span>Instant digital download & crypto-secure license key</span>
            </div>

            <SheetFooter className="sm:flex-col gap-2">
              <Button
                asChild
                onClick={() => setIsOpen(false)}
                className="w-full bg-deep-green hover:bg-deep-green/90 text-white font-semibold h-11 rounded-xl shadow-sm"
              >
                <Link href="/checkout" className="flex items-center justify-center gap-2">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="w-full text-xs text-slate hover:text-ink h-8"
              >
                Continue Browsing
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
