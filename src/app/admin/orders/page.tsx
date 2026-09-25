import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ShoppingBag } from 'lucide-react';

export const metadata = {
  title: 'Orders & Payments — Admin',
};

interface AdminOrderRow {
  id: string;
  amount_inr: number;
  status: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  user: { email: string; full_name: string | null } | null;
  order_items: Array<{ product: { title: string } | null }>;
}

export default async function AdminOrdersPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      amount_inr,
      status,
      razorpay_order_id,
      razorpay_payment_id,
      created_at,
      user:profiles(email, full_name),
      order_items(product:products(title))
    `)
    .order('created_at', { ascending: false })
    .returns<AdminOrderRow[]>();

  return (
    <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-deep-green" />
            <span>Orders & Payment Transactions</span>
          </h1>
          <p className="text-xs text-slate mt-1">
            Audit customer payments, Razorpay order IDs, and license issuance records.
          </p>
        </div>
      </div>

      {!orders || orders.length === 0 ? (
        <p className="text-xs text-slate py-8 text-center">No orders recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-soft text-slate uppercase text-[10px] font-bold border-y border-border">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-soft/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-ink">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-ink block">{order.user?.email || 'Customer'}</span>
                    <span className="text-[11px] text-slate">{order.user?.full_name || ''}</span>
                  </td>
                  <td className="py-3.5 px-4 text-ink max-w-[180px] truncate">
                    {(order.order_items || []).map((i) => i.product?.title).filter(Boolean).join(', ') || 'Item'}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-ink">
                    ₹{((order.amount_inr || 0) / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate">
                    {order.razorpay_payment_id || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.status === 'paid'
                          ? 'bg-lime/30 text-deep-green'
                          : order.status === 'failed'
                          ? 'bg-error/10 text-error'
                          : 'bg-soft text-slate'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate text-[11px]">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
