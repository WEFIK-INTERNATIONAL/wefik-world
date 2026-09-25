import React from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  KeyRound,
  Download,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Customer Dashboard — wefik.world',
};

interface DashboardRecentOrder {
  id: string;
  amount_inr: number;
  status: string;
  created_at: string;
  order_items: Array<{
    id: string;
    license_type: string;
    product: { title: string } | null;
  }>;
}

export default async function DashboardOverviewPage() {
  const user = await requireAuth('/dashboard');
  const supabase = await createClient();

  // Fetch licenses count
  const { count: licenseCount } = await supabase
    .from('licenses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active');

  // Fetch downloads count
  const { count: downloadCount } = await supabase
    .from('downloads')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Fetch active membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      id,
      amount_inr,
      status,
      created_at,
      order_items(id, license_type, product:products(title))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)
    .returns<DashboardRecentOrder[]>();

  const activeLicenses = licenseCount ?? 0;
  const totalDownloads = downloadCount ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-deep-green">
            Customer Dashboard
          </span>
          <h1 className="text-2xl font-black text-ink tracking-tight mt-0.5">
            Welcome back, {user.profile?.full_name || 'Creator'}!
          </h1>
          <p className="text-xs text-slate mt-1">
            Manage your digital assets, download updates, and generate domain keys.
          </p>
        </div>

        <Button asChild className="bg-ink hover:bg-black text-white text-xs h-10 px-4 rounded-xl font-semibold">
          <Link href="/marketplace">Browse Catalog</Link>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-border space-y-2">
          <div className="flex items-center justify-between text-slate">
            <span className="text-xs font-semibold">Active Licenses</span>
            <KeyRound className="w-4 h-4 text-deep-green" />
          </div>
          <p className="text-2xl font-black text-ink">{activeLicenses}</p>
          <Link href="/dashboard/licenses" className="text-[11px] text-deep-green font-semibold hover:underline block">
            View all keys →
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-border space-y-2">
          <div className="flex items-center justify-between text-slate">
            <span className="text-xs font-semibold">Total Downloads</span>
            <Download className="w-4 h-4 text-deep-green" />
          </div>
          <p className="text-2xl font-black text-ink">{totalDownloads}</p>
          <Link href="/dashboard/downloads" className="text-[11px] text-deep-green font-semibold hover:underline block">
            Download files →
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-border space-y-2">
          <div className="flex items-center justify-between text-slate">
            <span className="text-xs font-semibold">Membership</span>
            <Sparkles className="w-4 h-4 text-deep-green" />
          </div>
          <p className="text-sm font-extrabold text-ink truncate">
            {membership
              ? membership.plan === 'lifetime'
                ? 'Lifetime Deal'
                : 'All-Access Monthly'
              : 'No Active Pass'}
          </p>
          <Link href="/dashboard/membership" className="text-[11px] text-deep-green font-semibold hover:underline block">
            {membership ? 'Manage status →' : 'Upgrade now →'}
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-border space-y-2">
          <div className="flex items-center justify-between text-slate">
            <span className="text-xs font-semibold">Commercial Rights</span>
            <ShieldCheck className="w-4 h-4 text-deep-green" />
          </div>
          <p className="text-xs font-bold text-ink">Verified Client License</p>
          <span className="text-[11px] text-slate block">GPL & Commercial ready</span>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-deep-green" />
            <span>Recent Orders</span>
          </h2>
          <Link href="/dashboard/purchases" className="text-xs font-semibold text-deep-green hover:underline">
            View All Orders
          </Link>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate space-y-3">
            <p>You haven&apos;t placed any orders yet.</p>
            <Button asChild variant="outline" size="sm" className="h-9 text-xs rounded-xl">
              <Link href="/marketplace">Explore Digital Catalog</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3 divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <div>
                  <span className="font-mono text-ink font-bold block">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-slate text-[11px]">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-ink">
                    ₹{(order.amount_inr / 100).toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      order.status === 'paid'
                        ? 'bg-lime/30 text-deep-green'
                        : 'bg-soft text-slate'
                    }`}
                  >
                    {order.status}
                  </span>
                  <Link
                    href={`/order-success?order_id=${order.id}`}
                    className="text-deep-green font-semibold hover:underline"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
