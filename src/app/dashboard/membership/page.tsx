import React from 'react';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { MembershipManager } from '@/components/dashboard/membership-manager';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Membership Status — wefik.world',
};

export default async function MembershipPage() {
  const user = await requireAuth('/dashboard/membership');
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('id, plan, status, current_period_end, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .maybeSingle<any>();

  return (
    <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-deep-green" />
            <span>Membership Pass & Subscription</span>
          </h1>
          <p className="text-xs text-slate mt-1">
            Manage your All-Access pass, view expiration dates, or upgrade your agency entitlement.
          </p>
        </div>
      </div>

      <MembershipManager membership={membership} />
    </div>
  );
}
