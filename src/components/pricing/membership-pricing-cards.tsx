'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Sparkles, Loader2, Zap, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface PlanProps {
  plan: 'monthly' | 'lifetime';
  name: string;
  price_inr: number; // in paise
  interval: string;
  description: string;
  features: string[];
}

interface MembershipPricingCardsProps {
  plans: PlanProps[];
}

export function MembershipPricingCards({ plans }: MembershipPricingCardsProps) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const supabase = createClient();

  const handleSelectPlan = async (plan: PlanProps) => {
    setLoadingPlan(plan.plan);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error('Please sign in or create an account to start a membership', {
        action: {
          label: 'Sign In',
          onClick: () => router.push(`/login?redirect=/pricing`),
        },
      });
      setLoadingPlan(null);
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';

    try {
      if (plan.plan === 'monthly') {
        // Recurring Razorpay Subscription via create-subscription
        const res = await fetch(`${supabaseUrl}/functions/v1/create-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to initialize subscription');
        }

        if (!window.Razorpay) {
          throw new Error('Payment gateway not loaded. Please refresh.');
        }

        const options = {
          key: data.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          subscription_id: data.subscription_id,
          name: 'Wefik World',
          description: 'All-Access Monthly Membership',
          handler: function (response: any) {
            toast.success('Subscription activated successfully!');
            router.push('/dashboard/membership');
          },
          prefill: {
            name: session.user?.user_metadata?.full_name || '',
            email: session.user?.email || '',
          },
          theme: {
            color: '#4F741B',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Lifetime Deal one-time order via create-order
        const res = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            kind: 'membership',
            plan: 'lifetime',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to initialize lifetime order');
        }

        if (!window.Razorpay) {
          throw new Error('Payment gateway not loaded. Please refresh.');
        }

        const options = {
          key: data.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: 'INR',
          name: 'Wefik World',
          description: 'Lifetime Deal All-Access Membership',
          order_id: data.razorpay_order_id,
          handler: function (response: any) {
            toast.success('Welcome to Wefik World Lifetime!');
            router.push(`/order-success?order_id=${data.order_id}`);
          },
          prefill: {
            name: session.user?.user_metadata?.full_name || '',
            email: session.user?.email || '',
          },
          theme: {
            color: '#4F741B',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Membership initiation error';
      toast.error(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  const monthlyPlan = plans.find((p) => p.plan === 'monthly') || {
    plan: 'monthly' as const,
    name: 'All-Access Monthly',
    price_inr: 99900,
    interval: 'month',
    description: 'Unrestricted access to all current and future themes, plugins, and templates.',
    features: [
      'Access to all current digital products',
      'All new monthly releases included',
      'Unlimited personal & commercial project use',
      'Discord & priority email support',
      'Cancel anytime with one click',
    ],
  };

  const lifetimePlan = plans.find((p) => p.plan === 'lifetime') || {
    plan: 'lifetime' as const,
    name: 'Lifetime Deal',
    price_inr: 999900,
    interval: 'one-time',
    description: 'Pay once, get perpetual access to everything wefik ever builds. Zero renewals.',
    features: [
      'Perpetual access to all current & future products',
      'All major version upgrades included forever',
      'Unlimited site licenses for agency client work',
      'Direct founder Discord access & priority support',
      'Zero recurring bills or subscription fatigue',
    ],
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        {/* Monthly Plan Card */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-border hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate tracking-wider">
                Monthly Subscription
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-soft text-slate rounded-full border border-border">
                Flexible
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-ink">{monthlyPlan.name}</h3>
            <p className="text-xs text-slate mt-2 leading-relaxed">{monthlyPlan.description}</p>

            <div className="mt-6 mb-8 flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-black text-ink font-mono tabular-nums">
                ₹{(monthlyPlan.price_inr / 100).toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-slate">/ month</span>
            </div>

            <ul className="space-y-3.5 text-xs text-slate">
              {monthlyPlan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-deep-green flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={() => handleSelectPlan(monthlyPlan)}
            disabled={loadingPlan === 'monthly'}
            className="w-full mt-10 bg-ink hover:bg-black text-white h-12 rounded-xl font-bold text-xs shadow-sm"
          >
            {loadingPlan === 'monthly' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Subscribe Monthly (₹{(monthlyPlan.price_inr / 100).toLocaleString('en-IN')}/mo)
          </Button>
        </div>

        {/* Lifetime Deal Card (Highlighted) */}
        <div className="bg-ink text-white p-8 sm:p-10 rounded-3xl border-2 border-deep-green shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-lime text-ink text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Best Value</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase text-lime tracking-wider">
                Single One-Time Investment
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-white">{lifetimePlan.name}</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">{lifetimePlan.description}</p>

            <div className="mt-6 mb-8 flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tabular-nums">
                ₹{(lifetimePlan.price_inr / 100).toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-slate-400">one-time payment</span>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-200">
              {lifetimePlan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-lime flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={() => handleSelectPlan(lifetimePlan)}
            disabled={loadingPlan === 'lifetime'}
            className="w-full mt-10 bg-deep-green hover:bg-deep-green/90 text-white h-12 rounded-xl font-bold text-xs shadow-lg"
          >
            {loadingPlan === 'lifetime' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Get Lifetime Deal (₹{(lifetimePlan.price_inr / 100).toLocaleString('en-IN')})
          </Button>
        </div>
      </div>
    </>
  );
}
