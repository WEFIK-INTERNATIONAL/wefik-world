import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  KeyRound,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const metadata = {
  title: 'Admin Console — wefik.world',
};

interface AdminOverviewOrder {
  id: string;
  amount_inr: number;
  status: string;
  created_at: string;
  user: { email: string; full_name: string | null } | null;
}

export default async function AdminOverviewPage() {
  await requireAdmin();
  const supabase = await createClient();

  // 1. Total Gross Revenue & Orders
  const { data: orders } = await supabase
    .from('orders')
    .select('id, amount_inr, status, created_at, user:profiles(email, full_name)')
    .returns<AdminOverviewOrder[]>();

  const paidOrders = (orders || []).filter((o) => o.status === 'paid');
  const grossRevenuePaise = paidOrders.reduce((sum: number, o) => sum + (o.amount_inr || 0), 0);
  const formattedRevenue = (grossRevenuePaise / 100).toLocaleString('en-IN');

  // 2. Active Memberships
  const { count: subscriberCount } = await supabase
    .from('memberships')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  // 3. Products Count
  const { count: productCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true });

  // 4. Licenses Count
  const { count: licenseCount } = await supabase
    .from('licenses')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  const recentOrders = (orders || []).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-deep-green">
            Wefik Single-Vendor Analytics
          </span>
          <h1 className="text-2xl font-black text-ink tracking-tight mt-0.5">
            Admin Management Console
          </h1>
          <p className="text-xs text-slate mt-1">
            Real-time sales tracking, product publishing, version uploads, and license controls.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime/20 text-deep-green font-bold text-xs border border-lime/40">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>System Healthy</span>
        </span>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-border space-y-2">
          <div className="flex items-center justify-between text-slate">
            <span className="text-xs font-semibold">Gross Revenue</span>
            <IndianRupee className="w-4 h-4 text-deep-green" />
          </div>
          <p className="text-2xl font-black text-ink">₹{formattedRevenue}</p>
          <span className="text-[11px] text-slate block">{paidOrders.length} paid transactions</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-border space-y-2">
          <div className="flex items-center justify-between text-slate">
            <span className="text-xs font-semibold">Active Members</span>
            <Sparkles className="w-4 h-4 text-deep-green" />
          </div>
          <p className="text-2xl font-black text-ink">{subscriberCount ?? 0}</p>
          <span className="text-[11px] text-slate block">Monthly & Lifetime passes</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-border space-y-2">
          <div className="flex items-center justify-between text-slate">
            <span className="text-xs font-semibold">Live Products</span>
            <Package className="w-4 h-4 text-deep-green" />
          </div>
          <p className="text-2xl font-black text-ink">{productCount ?? 6}</p>
          <Link href="/admin/products" className="text-[11px] text-deep-green font-semibold hover:underline block">
            Manage catalog →
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-border space-y-2">
          <div className="flex items-center justify-between text-slate">
            <span className="text-xs font-semibold">Active Licenses</span>
            <KeyRound className="w-4 h-4 text-deep-green" />
          </div>
          <p className="text-2xl font-black text-ink">{licenseCount ?? 0}</p>
          <span className="text-[11px] text-slate block">Issued to clients</span>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-deep-green" />
            <span>Latest Marketplace Transactions</span>
          </h2>
          <Link href="/admin/orders" className="text-xs font-semibold text-deep-green hover:underline">
            View All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate py-6 text-center">No orders placed yet.</p>
        ) : (
          <div className="space-y-3 divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <div>
                  <span className="font-mono text-ink font-bold block">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-slate text-[11px]">
                    Customer: {order.user?.email || 'Customer'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-ink">
                    ₹{((order.amount_inr || 0) / 100).toLocaleString('en-IN')}
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
                  <span className="text-slate text-[11px]">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
