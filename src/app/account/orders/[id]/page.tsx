import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Logo } from '@/components/brand/logo';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PrintButton } from '@/components/account/print-button';

interface OrderReceiptPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

interface OrderDetail {
  id: string;
  order_number: string | null;
  total_amount_inr: number;
  subtotal_inr: number;
  discount_inr: number;
  tax_inr: number;
  status: string;
  razorpay_payment_id: string | null;
  created_at: string;
  user_id: string;
  order_items: Array<{
    id: string;
    price_inr: number;
    license_type: string;
    product: {
      id: string;
      title: string;
      slug: string;
    } | null;
  }>;
}

interface OrderLicense {
  license_key: string;
  license_type: string;
  product: {
    title: string;
  } | null;
}

export default async function OrderReceiptPage({ params }: OrderReceiptPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/account/orders/${id}`);
  }

  // Fetch order details
  const { data: order } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      total_amount_inr,
      subtotal_inr,
      discount_inr,
      tax_inr,
      status,
      razorpay_payment_id,
      created_at,
      user_id,
      order_items (
        id,
        price_inr,
        license_type,
        product:products (
          id,
          title,
          slug
        )
      )
    `)
    .eq('id', id)
    .maybeSingle()
    .returns<OrderDetail>();

  if (!order) {
    notFound();
  }

  // RLS enforcement: user must own this order or be admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, display_name')
    .eq('id', user.id)
    .maybeSingle();

  if (order.user_id !== user.id && profile?.role !== 'admin') {
    redirect('/403');
  }

  // Fetch licenses issued for this order
  const { data: licenses } = await supabase
    .from('licenses')
    .select('license_key, license_type, product:products(title)')
    .eq('order_id', order.id)
    .returns<OrderLicense[]>();

  const customerName = profile?.full_name || profile?.display_name || user.email;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back button and Print Action (Hidden during print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/account/orders"
          className="text-xs font-semibold text-slate hover:text-[var(--text)] inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
        </Link>
        <PrintButton />
      </div>

      {/* Official Tax Invoice Container */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-md print:shadow-none print:border-none print:p-0 print:bg-[var(--surface)] print:text-black">
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[var(--border)]">
          <div>
            <Logo size="md" />
            <p className="text-xs text-slate print:text-gray-600 mt-2">
              wefik.world by Wefik Agency<br />
              Commercial Software &amp; Digital Licensing<br />
              support@wefik.world • wefik.in
            </p>
          </div>
          <div className="sm:text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-deep-green/10 text-deep-green border border-deep-green/20 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Official Receipt: Paid
            </span>
            <p className="font-mono text-xs text-slate print:text-gray-600">
              Order: <strong className="text-[var(--text)] print:text-black">{order.order_number || order.id.slice(0, 12)}</strong>
            </p>
            <p className="text-xs text-slate print:text-gray-600 mt-0.5">
              Date: {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Bill To & Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-[var(--border)] text-xs">
          <div>
            <h5 className="font-bold text-slate print:text-gray-600 uppercase tracking-wider text-[10px] mb-1">
              Billed To
            </h5>
            <p className="font-bold text-[var(--text)] print:text-black text-sm">{customerName}</p>
            <p className="text-slate print:text-gray-600">{user.email}</p>
          </div>
          <div className="sm:text-right">
            <h5 className="font-bold text-slate print:text-gray-600 uppercase tracking-wider text-[10px] mb-1">
              Payment Reference
            </h5>
            <p className="font-mono font-medium text-[var(--text)] print:text-black">
              {order.razorpay_payment_id || 'Instant Free Claim (₹0)'}
            </p>
            <p className="text-slate print:text-gray-600 capitalize">Method: {order.razorpay_payment_id ? 'Razorpay Secure' : 'Free Checkout'}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6 border-b border-[var(--border)]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate print:text-gray-600 border-b border-[var(--border)]">
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold text-center">License</th>
                <th className="pb-3 font-semibold text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {order.order_items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-3.5 font-medium text-[var(--text)] print:text-black">
                    {item.product?.title || 'Digital Product'}
                  </td>
                  <td className="py-3.5 text-center font-mono capitalize text-slate print:text-gray-600">
                    {item.license_type || 'Single Site'}
                  </td>
                  <td className="py-3.5 text-right font-mono font-semibold text-[var(--text)] print:text-black tabular-nums">
                    {item.price_inr === 0 ? '₹0.00' : `₹${(item.price_inr / 100).toLocaleString('en-IN')}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="py-6 border-b border-[var(--border)] flex justify-end text-xs">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-slate print:text-gray-600">
              <span>Subtotal:</span>
              <span className="font-mono font-medium text-[var(--text)] print:text-black tabular-nums">
                ₹{((order.subtotal_inr || order.total_amount_inr) / 100).toLocaleString('en-IN')}
              </span>
            </div>
            {Boolean(order.discount_inr && order.discount_inr > 0) && (
              <div className="flex justify-between text-deep-green font-medium">
                <span>Coupon Discount:</span>
                <span className="font-mono tabular-nums">-₹{(order.discount_inr / 100).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate print:text-gray-600">
              <span>GST / Taxes:</span>
              <span className="font-mono font-medium text-[var(--text)] print:text-black tabular-nums">
                {order.tax_inr ? `₹${(order.tax_inr / 100).toLocaleString('en-IN')}` : 'Included'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[var(--border)] text-sm font-bold text-[var(--text)] print:text-black">
              <span>Total Paid:</span>
              <span className="font-mono text-base tabular-nums">
                ₹{(order.total_amount_inr / 100).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Issued License Keys */}
        {licenses && licenses.length > 0 && (
          <div className="py-6 border-b border-[var(--border)]">
            <h5 className="font-bold text-slate print:text-gray-600 uppercase tracking-wider text-[10px] mb-3">
              Generated License Keys
            </h5>
            <div className="space-y-2">
              {licenses.map((lic, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[var(--surface-2)] print:bg-gray-100 flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-[var(--text)] print:text-black font-semibold">{lic.license_key}</span>
                  <span className="text-slate print:text-gray-600 capitalize text-[11px]">
                    {lic.product?.title} ({lic.license_type})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-6 text-center text-slate print:text-gray-500 text-[11px] leading-relaxed">
          <p>Thank you for choosing wefik.world! All digital assets are backed by our Commercial License.</p>
          <p className="mt-1">
            Need support or custom integrations? Contact our engineering team at <a href="mailto:support@wefik.world" className="text-deep-green hover:underline">support@wefik.world</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
