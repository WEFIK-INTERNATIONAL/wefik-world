'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface MembershipProps {
  membership: {
    id: string;
    plan: 'monthly' | 'lifetime';
    status: 'active' | 'cancelled' | 'expired';
    current_period_end: string | null;
    created_at: string;
  } | null;
}

export function MembershipManager({ membership }: MembershipProps) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(membership?.status || 'expired');
  const supabase = createClient();

  const handleCancelSubscription = async () => {
    if (!membership) return;
    if (!confirm('Are you sure you want to cancel your monthly membership? You will retain access until the end of your current billing period.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('memberships')
        .update({ status: 'cancelled' })
        .eq('id', membership.id);

      if (error) throw error;

      setCurrentStatus('cancelled');
      toast.success('Subscription cancelled. You will maintain access until your billing cycle ends.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel subscription';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!membership || currentStatus === 'expired') {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-soft border border-border space-y-4">
        <div className="w-14 h-14 rounded-full bg-[var(--surface-2)] border border-border flex items-center justify-center text-slate mx-auto">
          <Sparkles className="w-7 h-7 text-deep-green" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-ink">No Active Membership</h2>
          <p className="text-xs text-slate mt-1 max-w-sm mx-auto">
            Upgrade to All-Access Monthly (₹999/mo) or Lifetime Deal (₹9,999) for unlimited downloads of every theme, plugin, and template in our catalog.
          </p>
        </div>
        <Button asChild className="bg-deep-green hover:bg-deep-green/90 text-white font-bold text-xs h-10 px-6 rounded-xl">
          <Link href="/pricing">View Membership Plans</Link>
        </Button>
      </div>
    );
  }

  const isLifetime = membership.plan === 'lifetime';
  const periodEndFormatted = membership.current_period_end
    ? new Date(membership.current_period_end).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Perpetual (Never Expires)';

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-soft border border-border space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-deep-green">
              Active Tier
            </span>
            <h2 className="text-2xl font-black text-ink mt-0.5">
              {isLifetime ? 'Lifetime Deal — All-Access Pass' : 'All-Access Monthly Subscription'}
            </h2>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              currentStatus === 'active'
                ? 'bg-lime text-ink'
                : 'bg-error/10 text-error'
            }`}
          >
            {currentStatus === 'active' ? 'Active & Valid' : 'Cancelled (Grace Period)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-border text-xs">
          <div>
            <span className="text-slate uppercase block font-semibold text-[10px]">Renewal / Expiry</span>
            <span className="font-bold text-ink">{periodEndFormatted}</span>
          </div>
          <div>
            <span className="text-slate uppercase block font-semibold text-[10px]">License Entitlement</span>
            <span className="font-bold text-deep-green">Unlimited Commercial Sites</span>
          </div>
          <div>
            <span className="text-slate uppercase block font-semibold text-[10px]">Catalog Access</span>
            <span className="font-bold text-ink">100% Unrestricted Downloads</span>
          </div>
        </div>
      </div>

      {/* Benefits List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-border shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-ink">Included Membership Privileges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-deep-green flex-shrink-0" />
            <span>Instant downloads of all WordPress themes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-deep-green flex-shrink-0" />
            <span>Access to all performance plugins & WebP engines</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-deep-green flex-shrink-0" />
            <span>Next.js 15 and HTML5 Tailwind starters</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-deep-green flex-shrink-0" />
            <span>Commercial rights on unlimited client projects</span>
          </div>
        </div>

        {/* Cancellation Option for Monthly */}
        {!isLifetime && currentStatus === 'active' && (
          <div className="pt-6 border-t border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-ink">Cancel Monthly Subscription</p>
              <p className="text-[11px] text-slate">
                You can cancel recurring billing anytime. You will keep your access until {periodEndFormatted}.
              </p>
            </div>
            <Button
              onClick={handleCancelSubscription}
              disabled={loading}
              variant="outline"
              size="sm"
              className="text-error border-error/20 hover:bg-error/10 text-xs h-9 rounded-xl"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              Cancel Subscription
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
