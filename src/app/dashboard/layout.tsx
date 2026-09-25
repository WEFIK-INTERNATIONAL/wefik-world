import React from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import {
  LayoutDashboard,
  ShoppingBag,
  Download,
  KeyRound,
  Sparkles,
  Heart,
  Settings,
  Shield,
} from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth('/dashboard');

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/purchases', label: 'Orders & Receipts', icon: ShoppingBag },
    { href: '/dashboard/downloads', label: 'My Downloads', icon: Download },
    { href: '/dashboard/licenses', label: 'License Keys', icon: KeyRound },
    { href: '/dashboard/membership', label: 'Membership Status', icon: Sparkles },
    { href: '/dashboard/wishlist', label: 'Saved Wishlist', icon: Heart },
    { href: '/dashboard/settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Nav (Desktop & Mobile) */}
        <aside className="w-full lg:w-64 bg-soft p-4 sm:p-5 rounded-3xl border border-border flex-shrink-0 space-y-6">
          <div className="px-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate">
              Customer Account
            </p>
            <p className="text-sm font-extrabold text-ink truncate mt-0.5">
              {user.profile?.full_name || 'My Account'}
            </p>
            <p className="text-xs text-slate truncate">{user.email}</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate hover:text-ink hover:bg-[var(--surface-2)] transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {user.profile?.role === 'admin' && (
              <div className="pt-4 border-t border-border mt-4">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-deep-green bg-lime/20 hover:bg-lime/30 border border-lime/30 transition-colors"
                >
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>Admin Console</span>
                </Link>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Dashboard Content Area */}
        <main className="flex-1 w-full min-w-0">{children}</main>
      </div>
    </div>
  );
}
