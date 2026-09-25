import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingChecklist } from '@/components/account/onboarding-checklist';
import { SecurityNudge } from '@/components/account/security-nudge';
import {
  Package,
  Key,
  Receipt,
  Crown,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const revalidate = 0; // Dynamic account overview

export default async function AccountOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account');
  }

  // 1. Fetch user profile
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('full_name, display_name, avatar_url, recovery_email, recovery_email_verified_at')
    .eq('id', user.id)
    .maybeSingle();

  // 2. Fetch user membership
  const { data: membership } = await (supabase as any)
    .from('memberships')
    .select('plan, status, current_period_end, razorpay_subscription_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  // 3. Fetch active licenses & products owned count
  const { data: licenses } = await (supabase as any)
    .from('licenses')
    .select('id, product_id, is_active')
    .eq('user_id', user.id);

  const activeLicensesCount = licenses?.filter((l: any) => l.is_active).length || 0;
  const uniqueProductsCount = new Set(licenses?.map((l: any) => l.product_id) || []).size;

  // 4. Fetch recent orders (last 5)
  const { data: orders } = await (supabase as any)
    .from('orders')
    .select('id, order_number, total_amount_inr, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const totalOrdersCount = orders?.length || 0;

  // 5. Check if user has MFA enrolled via factors
  let hasMfa = false;
  try {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    hasMfa = Boolean(factors?.totp && factors.totp.length > 0);
  } catch {
    hasMfa = false;
  }

  const emailConfirmed = Boolean(user.email_confirmed_at);
  const profileCompleted = Boolean(profile?.display_name && profile?.avatar_url);

  return (
    <div className="space-y-8">
      {/* 2FA Security Nudge */}
      <SecurityNudge hasMfa={hasMfa} />

      {/* Onboarding Checklist */}
      <OnboardingChecklist
        emailConfirmed={emailConfirmed}
        profileCompleted={profileCompleted}
        mfaEnabled={hasMfa}
      />

      {/* Membership Status & Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Membership Banner */}
        <div className="md:col-span-3 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-deep-green/10 text-deep-green border border-deep-green/20 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-deep-green">Current Plan</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime/20 text-deep-green">
                  {membership ? 'Active' : 'Free Member'}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[var(--text)] font-display mt-0.5">
                {membership?.plan === 'lifetime'
                  ? 'All-Access Lifetime Deal'
                  : membership?.plan === 'monthly'
                  ? 'All-Access Monthly Pass'
                  : 'Pay-As-You-Go Catalog Access'}
              </h3>
              <p className="text-xs text-slate mt-1 max-w-xl">
                {membership?.plan === 'lifetime'
                  ? 'Perpetual commercial access to all current and future themes, plugins, and templates.'
                  : membership?.plan === 'monthly'
                  ? `Active monthly subscription. Auto-renews on ${new Date(membership.current_period_end).toLocaleDateString()}.`
                  : 'You can purchase individual licenses or upgrade to an All-Access membership for unlimited downloads.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 self-start sm:self-auto">
            {membership ? (
              <Link href="/account/membership">
                <Button variant="outline" size="sm" className="text-xs border-[var(--border)]">
                  Manage Plan
                </Button>
              </Link>
            ) : (
              <Link href="/pricing">
                <Button size="sm" className="bg-deep-green hover:bg-deep-green/90 text-white text-xs font-semibold">
                  Upgrade to All-Access <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stat 1: Products Owned */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-slate mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Products Owned</span>
            <Package className="w-4 h-4 text-deep-green" />
          </div>
          <div className="text-3xl font-extrabold font-display text-[var(--text)] tabular-nums">
            {uniqueProductsCount}
          </div>
          <p className="text-[11px] text-slate mt-1">Themes, plugins &amp; starters</p>
        </div>

        {/* Stat 2: Active Licenses */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-slate mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Licenses</span>
            <Key className="w-4 h-4 text-deep-green" />
          </div>
          <div className="text-3xl font-extrabold font-display text-[var(--text)] tabular-nums">
            {activeLicensesCount}
          </div>
          <p className="text-[11px] text-slate mt-1">Cryptographic WFK keys</p>
        </div>

        {/* Stat 3: Total Orders */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-slate mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <Receipt className="w-4 h-4 text-deep-green" />
          </div>
          <div className="text-3xl font-extrabold font-display text-[var(--text)] tabular-nums">
            {totalOrdersCount}
          </div>
          <p className="text-[11px] text-slate mt-1">Purchases and ₹0 free claims</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
          <div>
            <h3 className="text-base font-bold text-[var(--text)] font-display">Recent Orders &amp; Receipts</h3>
            <p className="text-xs text-slate">View your recent payment history and download invoices.</p>
          </div>
          <Link
            href="/account/orders"
            className="text-xs font-semibold text-deep-green hover:underline inline-flex items-center gap-1"
          >
            View all orders <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate border-b border-[var(--border)]">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Total Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-3 font-mono font-medium text-[var(--text)]">
                      {order.order_number || order.id.slice(0, 8)}
                    </td>
                    <td className="py-3 text-slate">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 font-mono font-semibold text-[var(--text)] tabular-nums">
                      {order.total_amount_inr === 0 ? 'FREE' : `₹${(order.total_amount_inr / 100).toLocaleString('en-IN')}`}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-deep-green/10 text-deep-green capitalize">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-deep-green font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        View Receipt <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Honest Empty State — Zero fake data */
          <div className="py-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-slate">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text)]">You haven&apos;t bought anything yet</h4>
            <p className="text-xs text-slate max-w-sm mx-auto">
              Explore our curated marketplace of production WordPress themes, plugins, and free starter kits.
            </p>
            <div className="pt-2">
              <Link href="/marketplace">
                <Button size="sm" className="bg-deep-green hover:bg-deep-green/90 text-white text-xs font-semibold">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
