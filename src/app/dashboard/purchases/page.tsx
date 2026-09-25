import React from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Order History & Receipts — wefik.world',
};

export default async function PurchasesPage() {
  const user = await requireAuth('/dashboard/purchases');
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      amount_inr,
      status,
      created_at,
      order_items(id, license_type, price_inr, product:products(title, slug))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-deep-green" />
            <span>Order History & Receipts</span>
          </h1>
          <p className="text-xs text-slate mt-1">
            Access tax invoices, purchase summaries, and order confirmation receipts.
          </p>
        </div>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate space-y-3">
          <p>No orders found in your account.</p>
          <Button asChild className="bg-ink hover:bg-black text-white text-xs rounded-xl h-10">
            <Link href="/marketplace">Browse Marketplace</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-soft text-slate uppercase text-[10px] font-bold border-y border-border">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-soft/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-ink">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="py-3.5 px-4 text-slate">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-ink font-medium max-w-[200px] truncate">
                    {(order.order_items || [])
                      .map((i: any) => i.product?.title || 'Product')
                      .join(', ')}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-ink">
                    ₹{(order.amount_inr / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.status === 'paid'
                          ? 'bg-lime/30 text-deep-green'
                          : 'bg-soft text-slate'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/order-success?order_id=${order.id}`}
                      className="text-deep-green font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
