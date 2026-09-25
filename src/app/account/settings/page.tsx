import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsView } from '@/components/account/settings-view';

export const revalidate = 0;

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account/settings');
  }

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id, email, full_name, display_name, avatar_url, recovery_email, recovery_email_verified_at')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <SettingsView
        initialProfile={{
          id: user.id,
          email: user.email || '',
          full_name: profile?.full_name || null,
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,
          recovery_email: profile?.recovery_email || null,
          recovery_email_verified_at: profile?.recovery_email_verified_at || null,
        }}
      />
    </div>
  );
}
