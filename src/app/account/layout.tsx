import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TransitionLink } from '@/components/transitions/transition-link';
import {
  LayoutDashboard,
  Package,
  Receipt,
  Crown,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: 'My Account — wefik.world',
  description: 'Manage your digital product library, licenses, memberships, and security settings.',
};

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, display_name, avatar_url, role')
    .eq('id', user.id)
    .maybeSingle();

  const navItems = [
    { label: 'Overview', href: '/account', icon: LayoutDashboard },
    { label: 'My Library', href: '/account/library', icon: Package },
    { label: 'Orders & Receipts', href: '/account/orders', icon: Receipt },
    { label: 'Membership', href: '/account/membership', icon: Crown },
    { label: 'Profile & Security', href: '/account/settings', icon: Settings },
  ];

  return (
    <div className="w-full min-h-screen bg-[var(--bg)] pt-[calc(var(--header-height)+1.5rem)] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Account Header / Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)] mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[var(--text)]">
              My Account
            </h1>
            <p className="text-xs sm:text-sm text-slate mt-0.5">
              Welcome back, <strong className="text-[var(--text)]">{profile?.display_name || profile?.full_name || user.email}</strong>
            </p>
          </div>
          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-deep-green/10 text-deep-green text-xs font-bold border border-deep-green/20 hover:bg-deep-green/20 transition-all self-start sm:self-auto"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 w-full">
            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TransitionLink
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate hover:text-[var(--text)] hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border)] transition-all shrink-0"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </TransitionLink>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 w-full min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
