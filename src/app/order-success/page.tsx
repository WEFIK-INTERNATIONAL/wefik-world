import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OrderSuccessView } from '@/components/checkout/order-success-view';

export const dynamic = 'force-dynamic';

interface OrderSuccessPageProps {
  searchParams: Promise<{
    order_id?: string;
  }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const { order_id } = await searchParams;

  if (!order_id) {
    redirect('/dashboard');
  }

  const supabase = await createClient();

  // Get current user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/order-success?order_id=${encodeURIComponent(order_id)}`);
  }

  // Fetch order from Supabase
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      amount_inr,
      status,
      created_at,
      order_items (
        id,
        product_id,
        license_type,
        price_inr,
        product:products(title)
      )
    `)
    .eq('id', order_id)
    .single<any>();

  // If order not found or owner doesn't match session user -> 403 Forbidden!
  if (error || !order || order.user_id !== user.id) {
    redirect('/403');
  }

  // Fetch licenses issued for this user and order products
  const productIds = (order.order_items || []).map((i: any) => i.product_id);
  const { data: licenses } = await supabase
    .from('licenses')
    .select('product_id, license_key')
    .eq('user_id', user.id)
    .in('product_id', productIds);

  const licenseMap = new Map<string, string>();
  (licenses || []).forEach((l: any) => {
    licenseMap.set(l.product_id, l.license_key);
  });

  const formattedOrder = {
    id: order.id,
    amount_inr: order.amount_inr,
    created_at: order.created_at,
    items: (order.order_items || []).map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      title: item.product?.title || 'Digital Product',
      license_type: item.license_type,
      price_inr: item.price_inr,
      license_key: licenseMap.get(item.product_id) || 'WFK-DEMO-SAMPLE-KEY',
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <OrderSuccessView order={formattedOrder} />
    </div>
  );
}
