import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { ExternalLink, Inbox, ArrowRight } from 'lucide-react';

export const revalidate = 0;

interface OrderListItem {
  id: string;
  order_number: string | null;
  total_amount_inr: number;
  subtotal_inr: number;
  status: string;
  created_at: string;
  order_items: Array<{
    id: string;
    price_inr: number;
    product: {
      title: string;
    } | null;
  }>;
}

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account/orders');
  }

  // Fetch orders with line items count
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      total_amount_inr,
      subtotal_inr,
      status,
      created_at,
      order_items (
        id,
        price_inr,
        product:products (
          title
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .returns<OrderListItem[]>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-[var(--text)]">Order History &amp; Invoices</h2>
        <p className="text-xs sm:text-sm text-slate mt-0.5">
          View your complete transaction history, download printable invoices, and check fulfillment statuses.
        </p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate border-b border-[var(--border)] bg-[var(--surface-2)]">
                  <th className="py-3.5 px-4 font-semibold">Order ID</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Items</th>
                  <th className="py-3.5 px-4 font-semibold">Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {orders.map((order) => {
                  const itemsList = order.order_items
                    ?.map((i) => i.product?.title)
                    .filter((t): t is string => Boolean(t))
                    .join(', ') || 'Digital Products';

                  return (
                    <tr key={order.id} className="hover:bg-[var(--surface-2)] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-[var(--text)]">
                        {order.order_number || order.id.slice(0, 8)}
                      </td>
                      <td className="py-3.5 px-4 text-slate">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-slate truncate" title={itemsList}>
                        {itemsList}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[var(--text)] tabular-nums">
                        {order.total_amount_inr === 0 ? 'FREE' : `₹${(order.total_amount_inr / 100).toLocaleString('en-IN')}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-deep-green/10 text-deep-green capitalize">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="text-deep-green font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          View Receipt <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Honest Empty State — Zero fake data */
        <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-slate">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[var(--text)] font-display">
            You haven&apos;t placed any orders yet
          </h3>
          <p className="text-xs text-slate max-w-sm mx-auto">
            Once you purchase a product or claim a free template, your official tax invoices will be permanently recorded here.
          </p>
          <div className="pt-2">
            <Link href="/marketplace">
              <Button size="sm" className="bg-deep-green hover:bg-deep-green/90 text-white text-xs font-semibold">
                Browse Marketplace <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
