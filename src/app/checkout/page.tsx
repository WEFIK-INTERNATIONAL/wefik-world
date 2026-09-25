'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Session } from '@supabase/supabase-js';
import {
  ShieldCheck,
  Lock,
  Loader2,
  Tag,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface RazorpaySuccessResponse {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayFailureResponse {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (resp: RazorpayFailureResponse) => void) => void;
}

type RazorpayOptions = Record<string, unknown>;

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPaise, removeItem, clearCart } = useCart();
  const [session, setSession] = useState<Session | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    discountPaise: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession) {
        router.push(`/login?redirect=/checkout`);
        return;
      }

      setSession(currentSession);
      setLoadingUser(false);
    }

    checkAuth();
  }, [router, supabase]);

  // Discount math
  const discountPaise = appliedCoupon ? appliedCoupon.discountPaise : 0;
  const finalTotalPaise = Math.max(0, totalPaise - discountPaise);

  const formattedSubtotal = (totalPaise / 100).toLocaleString('en-IN');
  const formattedDiscount = (discountPaise / 100).toLocaleString('en-IN');
  const formattedTotal = (finalTotalPaise / 100).toLocaleString('en-IN');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    try {
      interface CouponRecord {
        code: string;
        discount_percent: number;
        valid_from?: string | null;
        valid_until?: string | null;
        max_uses?: number | null;
        used_count?: number | null;
        min_order_paise?: number | null;
      }

      // Validate coupon against Supabase coupons table
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single<CouponRecord>();

      if (error || !coupon) {
        toast.error('Invalid or expired coupon code.');
        setCouponLoading(false);
        return;
      }

      // Check date validity
      const now = new Date();
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        toast.error('Coupon is not yet active.');
        setCouponLoading(false);
        return;
      }
      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        toast.error('Coupon has expired.');
        setCouponLoading(false);
        return;
      }

      // Check max uses
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        toast.error('Coupon usage limit reached.');
        setCouponLoading(false);
        return;
      }

      // Calculate discount
      let calcDiscountPaise = 0;
      if (coupon.discount_percent) {
        calcDiscountPaise = Math.round((totalPaise * coupon.discount_percent) / 100);
      } else if (coupon.discount_amount_inr) {
        calcDiscountPaise = coupon.discount_amount_inr;
      }

      setAppliedCoupon({
        code: coupon.code,
        discountPercent: coupon.discount_percent || 0,
        discountPaise: calcDiscountPaise,
      });

      toast.success(`Coupon ${coupon.code} applied!`);
    } catch {
      toast.error('Failed to validate coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!session) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setCheckoutLoading(true);

    try {
      const orderPayload = {
        kind: 'products',
        items: items.map((item) => ({
          product_id: item.productId,
          license_type: item.licenseType,
        })),
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // If amount is 0 (100% discount or free order), fulfill immediately
      if (data.amount === 0) {
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/order-success?order_id=${data.order_id}`);
        return;
      }

      // Launch Razorpay Checkout
      if (!window.Razorpay) {
        throw new Error('Razorpay payment gateway failed to load. Please check your connection.');
      }

      const options = {
        key: data.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'Wefik World',
        description: `Order #${data.order_id.slice(0, 8)}`,
        order_id: data.razorpay_order_id,
        handler: async function (_response: RazorpaySuccessResponse) {
          clearCart();
          toast.success('Payment captured successfully!');
          router.push(`/order-success?order_id=${data.order_id}`);
        },
        prefill: {
          name: session?.user?.user_metadata?.full_name || '',
          email: session?.user?.email || '',
        },
        theme: {
          color: '#4F741B', // Deep Green
        },
        modal: {
          ondismiss: function () {
            setCheckoutLoading(false);
            toast.info('Payment cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: RazorpayFailureResponse) {
        toast.error(`Payment failed: ${resp.error?.description || 'Declined'}`);
        setCheckoutLoading(false);
      });
      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout error';
      toast.error(msg);
      setCheckoutLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-deep-green" />
        <p className="text-xs text-slate font-medium">Verifying account & session...</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate mb-2">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span>/</span>
            <Link href="/marketplace" className="hover:text-ink">Marketplace</Link>
            <span>/</span>
            <span className="text-ink font-semibold">Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight flex items-center gap-2">
            <Lock className="w-5 h-5 text-deep-green" />
            <span>Secure Checkout</span>
          </h1>
          <p className="text-xs text-slate mt-1">
            Review your order and license details. Instant digital delivery with Razorpay test mode.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-soft border border-border space-y-4 max-w-lg mx-auto">
            <h2 className="text-base font-bold text-ink">Your cart is empty</h2>
            <p className="text-xs text-slate">
              Please add products from our marketplace before proceeding to checkout.
            </p>
            <Button asChild className="bg-ink hover:bg-black text-white text-xs rounded-xl h-10">
              <Link href="/marketplace">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Order Items (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-4">
                <h2 className="text-base font-bold text-ink pb-3 border-b border-border">
                  Order Items ({items.length})
                </h2>

                <div className="divide-y divide-border/80">
                  {items.map((item) => {
                    const priceFormatted = (item.pricePaise / 100).toLocaleString('en-IN');
                    return (
                      <div key={item.productId} className="py-4 first:pt-0 flex gap-4 items-center">
                        <div className="relative w-16 h-14 rounded-xl overflow-hidden bg-surface border border-border flex-shrink-0">
                          <SafeImage
                            src={item.thumbnailUrl}
                            alt={item.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-ink truncate">{item.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-semibold text-deep-green bg-soft px-2 py-0.5 rounded-md border border-border">
                              {item.licenseType === 'unlimited' ? 'Unlimited Sites License' : 'Single Site License'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-ink">₹{priceFormatted}</span>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="block text-slate hover:text-error text-xs mt-1 ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Account Info */}
              <div className="p-6 rounded-2xl bg-soft border border-border text-xs space-y-1">
                <p className="font-bold text-ink">Account & License Delivery Email</p>
                <p className="text-slate">
                  Digital license keys and signed download URLs will be registered to:
                </p>
                <p className="font-mono text-deep-green font-semibold text-xs pt-1">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            {/* Right: Payment & Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-lg space-y-6">
                <h2 className="text-base font-bold text-ink pb-3 border-b border-border">
                  Order Summary
                </h2>

                {/* Coupon Input Form */}
                <div>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                      <Input
                        type="text"
                        placeholder="Discount Code (e.g. WELCOME10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={couponLoading || !!appliedCoupon}
                        className="pl-8 text-xs h-10 rounded-xl uppercase font-mono"
                      />
                    </div>
                    {appliedCoupon ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAppliedCoupon(null)}
                        className="text-xs h-10 px-3 border-border rounded-xl text-error"
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={couponLoading || !couponCode.trim()}
                        className="bg-ink hover:bg-black text-white text-xs h-10 px-4 rounded-xl font-semibold"
                      >
                        {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                      </Button>
                    )}
                  </form>

                  {appliedCoupon && (
                    <div className="flex items-center gap-1 text-[11px] text-deep-green font-semibold mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Coupon {appliedCoupon.code} applied (-₹{formattedDiscount})</span>
                    </div>
                  )}
                </div>

                {/* Line Items Calculation */}
                <div className="space-y-2 text-xs border-t border-border pt-4">
                  <div className="flex justify-between text-slate">
                    <span>Subtotal</span>
                    <span className="font-semibold text-ink">₹{formattedSubtotal}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-deep-green">
                      <span>Discount ({appliedCoupon.discountPercent}%)</span>
                      <span className="font-bold">-₹{formattedDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate">
                    <span>GST (Goods and Services Tax)</span>
                    <span className="font-semibold text-deep-green">Included (18%)</span>
                  </div>

                  <div className="flex justify-between text-base font-extrabold text-ink pt-3 border-t border-border items-baseline">
                    <span>Total Payable</span>
                    <span className="text-2xl font-black text-ink">₹{formattedTotal}</span>
                  </div>
                </div>

                {/* Payment Action Button */}
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] text-[var(--muted)] text-center leading-normal">
                    By proceeding to pay, you agree to our{' '}
                    <Link href="/terms" target="_blank" className="underline text-[var(--text)] hover:text-deep-green">
                      Terms &amp; Conditions
                    </Link>{' '}
                    and acknowledge our{' '}
                    <Link href="/refunds" target="_blank" className="underline text-[var(--text)] hover:text-deep-green">
                      Refund Policy
                    </Link>.
                  </p>

                  <Button
                    onClick={handlePayment}
                    disabled={checkoutLoading}
                    className="w-full h-12 bg-deep-green hover:bg-deep-green/90 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2"
                  >
                    {checkoutLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span>Pay ₹{formattedTotal} with Razorpay</span>
                  </Button>

                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate">
                    <ShieldCheck className="w-3.5 h-3.5 text-deep-green" />
                    <span>256-Bit SSL Encryption • Razorpay Secure • Instant Digital Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
