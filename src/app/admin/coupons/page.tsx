import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CouponAdminManager } from '@/components/admin/coupon-admin-manager';
import { TicketPercent } from 'lucide-react';

export const metadata = {
  title: 'Discount Coupons — Admin',
};

export default async function AdminCouponsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: coupons } = await supabase
    .from('coupons')
    .select('id, code, discount_percent, used_count, max_uses, is_active, valid_until')
    .order('created_at', { ascending: false });

  const fallbackCoupons = [
    {
      id: 'c1',
      code: 'WELCOME10',
      discount_percent: 10,
      used_count: 3,
      max_uses: 100,
      is_active: true,
      valid_until: null,
    },
  ];

  return (
    <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
            <TicketPercent className="w-5 h-5 text-deep-green" />
            <span>Marketplace Discount Coupons</span>
          </h1>
          <p className="text-xs text-slate mt-1">
            Create promotional discount codes and monitor usage counters across checkout flows.
          </p>
        </div>
      </div>

      <CouponAdminManager initialCoupons={coupons && coupons.length > 0 ? coupons : fallbackCoupons} />
    </div>
  );
}
