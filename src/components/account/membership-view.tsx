'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Crown, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface MembershipViewProps {
  membership: {
    id: string;
    plan: 'monthly' | 'lifetime';
    status: 'active' | 'cancelled' | 'expired';
    current_period_end: string | null;
    created_at: string;
  } | null;
}

export function MembershipView({ membership }: MembershipViewProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(membership?.status || 'expired');

  const supabase = createClient();

  const handleCancelSubscription = async () => {
    if (!membership) return;
    if (
      !confirm(
        'Cancel your All-Access Monthly subscription? You will continue to have full access until the end of your current billing period, after which no further charges will occur.'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('memberships')
        .update({ status: 'cancelled' })
        .eq('id', membership.id);

      if (error) throw error;

      setStatus('cancelled');
      toast.success('Subscription cancelled. You retain full access until the end of your current billing period.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!membership || status === 'expired') {
    return (
      <div className="space-y-8">
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-deep-green/10 border border-deep-green/20 flex items-center justify-center text-deep-green mx-auto">
            <Crown className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold font-display text-[var(--text)]">No Active Membership</h3>
          <p className="text-xs sm:text-sm text-slate max-w-md mx-auto leading-relaxed">
            Equip your engineering team with unrestricted access to every WordPress theme, plugin, and Next.js starter in our catalog.
          </p>
          <div className="pt-2">
            <Link href="/pricing">
              <Button className="bg-deep-green hover:bg-deep-green/90 text-white text-xs font-semibold px-6 py-2.5">
                View All-Access Plans &amp; Pricing <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Plan Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-deep-green">Monthly Flex</span>
              <span className="font-mono text-lg font-bold text-[var(--text)]">₹999 / mo</span>
            </div>
            <h4 className="text-base font-bold font-display text-[var(--text)]">All-Access Monthly</h4>
            <ul className="text-xs text-slate space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-deep-green shrink-0" />
                <span>Unlimited downloads across entire catalog</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-deep-green shrink-0" />
                <span>Automatic updates during active cycle</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-deep-green shrink-0" />
                <span>Cancel anytime with 1 click, no questions asked</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-deep-green/30 relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-deep-green">Founder Choice</span>
              <span className="font-mono text-lg font-bold text-[var(--text)]">₹9,999 once</span>
            </div>
            <h4 className="text-base font-bold font-display text-[var(--text)]">All-Access Lifetime</h4>
            <ul className="text-xs text-slate space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-deep-green shrink-0" />
                <span>Perpetual access to all current and future releases</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-deep-green shrink-0" />
                <span>Unlimited-Site Commercial Licenses</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-deep-green shrink-0" />
                <span>Priority direct engineer support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const isLifetime = membership.plan === 'lifetime';
  const isCancelled = status === 'cancelled';

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-deep-green/10 text-deep-green border border-deep-green/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-display text-[var(--text)]">
                  {isLifetime ? 'All-Access Lifetime Deal' : 'All-Access Monthly Plan'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    isCancelled
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-deep-green/10 text-deep-green'
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate mt-0.5">
                {isLifetime ? 'Perpetual Commercial Access' : 'Recurring Billing • Razorpay Auto-Debit'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono">
            <span className="text-2xl font-bold text-[var(--text)] tabular-nums">
              {isLifetime ? '₹9,999' : '₹999'}
            </span>
            <span className="text-xs text-slate"> {isLifetime ? 'one-time' : '/ month'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-[var(--border)] text-xs">
          <div>
            <span className="text-slate uppercase tracking-wider text-[10px] font-semibold block mb-1">
              Member Since
            </span>
            <span className="font-medium text-[var(--text)]">
              {new Date(membership.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div>
            <span className="text-slate uppercase tracking-wider text-[10px] font-semibold block mb-1">
              {isLifetime ? 'Access Expiration' : isCancelled ? 'Access Valid Until' : 'Next Auto-Renewal'}
            </span>
            <span className="font-medium text-[var(--text)]">
              {isLifetime
                ? 'Never (Perpetual Lifetime)'
                : membership.current_period_end
                ? new Date(membership.current_period_end).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Active'}
            </span>
          </div>
        </div>

        {/* Cancellation / Upgrade Footer */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate">
            {isLifetime ? (
              <p>Your lifetime deal includes unrestricted rights to all current &amp; future products.</p>
            ) : isCancelled ? (
              <p className="text-amber-600 dark:text-amber-400">
                Your cancellation has been registered. You maintain download privileges until the period end.
              </p>
            ) : (
              <p>Cancellation is immediate and effective at the end of your paid billing period.</p>
            )}
          </div>

          {!isLifetime && !isCancelled && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelSubscription}
              disabled={loading}
              className="text-xs text-red-500 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              Cancel Membership
            </Button>
          )}

          {!isLifetime && isCancelled && (
            <Link href="/pricing">
              <Button size="sm" className="bg-deep-green text-white text-xs hover:bg-deep-green/90">
                Resubscribe
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
