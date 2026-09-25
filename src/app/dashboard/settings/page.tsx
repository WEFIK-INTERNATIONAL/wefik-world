import React from 'react';
import { requireAuth } from '@/lib/auth';
import { SettingsForm } from '@/components/dashboard/settings-form';
import { Settings } from 'lucide-react';

export const metadata = {
  title: 'Account Settings — wefik.world',
};

export default async function SettingsPage() {
  const user = await requireAuth('/dashboard/settings');

  const userData = {
    id: user.id,
    email: user.email || '',
    fullName: user.profile?.full_name || '',
    avatarUrl: user.profile?.avatar_url || '',
    role: user.profile?.role || 'customer',
  };

  return (
    <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-deep-green" />
            <span>Account Settings</span>
          </h1>
          <p className="text-xs text-slate mt-1">
            Update your profile name, upload an avatar, and manage notification preferences.
          </p>
        </div>
      </div>

      <SettingsForm user={userData} />
    </div>
  );
}
