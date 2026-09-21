'use client';

import React, { useState } from 'react';
import { TicketPercent, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface CouponItem {
  id: string;
  code: string;
  discount_percent: number;
  used_count: number;
  max_uses: number | null;
  is_active: boolean;
  valid_until: string | null;
}

export function CouponAdminManager({ initialCoupons }: { initialCoupons: CouponItem[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [maxUses, setMaxUses] = useState('100');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const percent = parseInt(discountPercent, 10);
    const uses = parseInt(maxUses, 10) || null;

    if (!cleanCode || isNaN(percent) || percent <= 0 || percent > 100) {
      toast.error('Invalid code or discount percentage');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert({
          code: cleanCode,
          discount_percent: percent,
          max_uses: uses,
          is_active: true,
        } as any)
        .select('*')
        .single<any>();

      if (error) throw error;

      toast.success(`Coupon ${cleanCode} created successfully!`);
      setCoupons((prev) => [
        data || {
          id: 'temp-' + Date.now(),
          code: cleanCode,
          discount_percent: percent,
          used_count: 0,
          max_uses: uses,
          is_active: true,
          valid_until: null,
        },
        ...prev,
      ]);
      setCode('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create coupon';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Coupon Box */}
      <div className="bg-soft p-6 sm:p-8 rounded-3xl border border-border space-y-4">
        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
          <Plus className="w-4 h-4 text-deep-green" />
          <span>Create New Coupon Code</span>
        </h3>

        <form onSubmit={handleCreateCoupon} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="space-y-1 w-full sm:w-48">
            <label className="text-xs font-semibold text-slate">Coupon Code</label>
            <Input
              type="text"
              placeholder="FESTIVE20"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="h-10 text-xs uppercase font-mono rounded-xl bg-white"
            />
          </div>

          <div className="space-y-1 w-full sm:w-36">
            <label className="text-xs font-semibold text-slate">Discount (%)</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              required
              className="h-10 text-xs rounded-xl bg-white"
            />
          </div>

          <div className="space-y-1 w-full sm:w-36">
            <label className="text-xs font-semibold text-slate">Max Uses</label>
            <Input
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="h-10 text-xs rounded-xl bg-white"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-10 px-5 bg-ink hover:bg-black text-white text-xs font-bold rounded-xl"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
            Create Coupon
          </Button>
        </form>
      </div>

      {/* Coupons List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-soft text-slate uppercase text-[10px] font-bold border-y border-border">
            <tr>
              <th className="py-3 px-4">Coupon Code</th>
              <th className="py-3 px-4">Discount</th>
              <th className="py-3 px-4">Usage Count</th>
              <th className="py-3 px-4">Max Uses</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-soft/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-ink">
                  {c.code}
                </td>
                <td className="py-3.5 px-4 font-black text-deep-green">
                  {c.discount_percent}% OFF
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate">
                  {c.used_count || 0} times
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate">
                  {c.max_uses ? `${c.max_uses} limit` : 'Unlimited'}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.is_active
                        ? 'bg-lime/30 text-deep-green'
                        : 'bg-error/10 text-error'
                    }`}
                  >
                    {c.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
