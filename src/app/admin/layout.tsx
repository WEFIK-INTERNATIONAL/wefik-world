import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TicketPercent,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  const adminNav = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products & Versions', icon: Package },
    { href: '/admin/orders', label: 'Orders & Payments', icon: ShoppingBag },
    { href: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
    { href: '/admin/reviews', label: 'Review Moderation', icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full lg:w-64 bg-ink text-white p-5 rounded-3xl border border-ink shadow-xl flex-shrink-0 space-y-6">
          <div className="px-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-lime">
                Admin Console
              </p>
            </div>
            <p className="text-sm font-black text-white truncate">
              {user.profile?.full_name || 'System Admin'}
            </p>
            <p className="text-[11px] text-slate-300 truncate">{user.email}</p>
          </div>

          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-4 h-4 text-lime flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 border-t border-white/10 mt-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Store</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Admin Main Body */}
        <main className="flex-1 w-full min-w-0">{children}</main>
      </div>
    </div>
  );
}
