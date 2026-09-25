import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MembershipView } from '@/components/account/membership-view';

export const revalidate = 0;

export default async function AccountMembershipPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account/membership');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('id, plan, status, current_period_end, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-[var(--text)]">Membership &amp; Access Plan</h2>
        <p className="text-xs sm:text-sm text-slate mt-0.5">
          Manage your All-Access subscription status, billing periods, and plan upgrades.
        </p>
      </div>

      <MembershipView membership={membership} />
    </div>
  );
}
