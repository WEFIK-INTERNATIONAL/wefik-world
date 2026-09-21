'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import {
  Search,
  Package,
  Layers,
  FileCode,
  Tag,
  CreditCard,
  BookOpen,
  Sparkles,
  ShoppingBag,
  KeyRound,
  Download,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { FALLBACK_PRODUCTS } from '@/lib/data/fallback-products';
import { useCart } from '@/lib/cart-context';
import { usePageTransition } from '@/components/transitions/transition-provider';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { setIsOpen: setCartOpen } = useCart();
  const { navigate } = usePageTransition();

  // Toggle on Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wfk-open-cmdk', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wfk-open-cmdk', handleCustomOpen);
    };
  }, []);

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24 select-none animate-in fade-in duration-150"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          value={search}
          onValueChange={setSearch}
          className="w-full font-sans"
        >
          {/* Input Header */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="w-4 h-4 text-slate flex-shrink-0" />
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder="Search products, pages, guides, actions... (ESC to close)"
              className="w-full py-4 text-sm text-ink placeholder:text-slate bg-transparent focus:outline-none"
            />
            <span className="text-[10px] font-mono text-slate bg-soft px-2 py-0.5 rounded border border-border">
              ESC
            </span>
          </div>

          {/* Results List */}
          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-border/50 text-xs">
            <Command.Empty className="py-8 text-center text-slate">
              No results found for &ldquo;{search}&rdquo;.
            </Command.Empty>

            {/* Group 1: Products */}
            <Command.Group heading="Digital Products" className="py-2 text-[10px] font-bold uppercase tracking-wider text-slate px-2">
              {FALLBACK_PRODUCTS.filter((p) =>
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.tagline.toLowerCase().includes(search.toLowerCase())
              ).slice(0, 5).map((p) => (
                <Command.Item
                  key={p.id}
                  onSelect={() => handleSelect(() => navigate(`/products/${p.slug}`))}
                  className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-soft transition-colors aria-selected:bg-soft aria-selected:text-ink text-ink font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-deep-green" />
                    <div>
                      <span className="block font-bold">{p.title}</span>
                      <span className="text-[10px] text-slate font-normal line-clamp-1">{p.tagline}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-deep-green">
                    {p.is_free ? 'Free' : `₹${Math.round(p.price_inr / 100)}`}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Group 2: Core Pages */}
            <Command.Group heading="Navigation" className="py-2 text-[10px] font-bold uppercase tracking-wider text-slate px-2">
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/marketplace'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-soft transition-colors aria-selected:bg-soft text-ink font-semibold"
              >
                <Layers className="w-4 h-4 text-slate" />
                <span>Marketplace Catalog</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/wordpress-themes'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-soft transition-colors aria-selected:bg-soft text-ink font-semibold"
              >
                <FileCode className="w-4 h-4 text-slate" />
                <span>WordPress Themes (Gutenberg FSE)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/wordpress-plugins'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-soft transition-colors aria-selected:bg-soft text-ink font-semibold"
              >
                <Package className="w-4 h-4 text-slate" />
                <span>WordPress Plugins (High Performance)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/bundles'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-soft transition-colors aria-selected:bg-soft text-ink font-semibold"
              >
                <Tag className="w-4 h-4 text-amber-500" />
                <span>Curated Bundles (Save 60%)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/freebies'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-soft transition-colors aria-selected:bg-soft text-ink font-semibold"
              >
                <Sparkles className="w-4 h-4 text-deep-green" />
                <span>100% Free Templates & Code</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/pricing'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-soft transition-colors aria-selected:bg-soft text-ink font-semibold"
              >
                <CreditCard className="w-4 h-4 text-slate" />
                <span>All-Access Membership Pricing</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/blog'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-soft transition-colors aria-selected:bg-soft text-ink font-semibold"
              >
                <BookOpen className="w-4 h-4 text-slate" />
                <span>Engineering Blog & Guides</span>
              </Command.Item>
            </Command.Group>

            {/* Group 3: Quick Actions */}
            <Command.Group heading="Quick Actions" className="py-2 text-[10px] font-bold uppercase tracking-wider text-slate px-2">
              <Command.Item
                onSelect={() => handleSelect(() => setCartOpen(true))}
                className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-soft transition-colors aria-selected:bg-soft text-ink font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-slate" />
                  <span>Open Shopping Cart</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate" />
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/dashboard/licenses'))}
                className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-soft transition-colors aria-selected:bg-soft text-ink font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-slate" />
                  <span>View My License Keys</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate" />
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/dashboard/downloads'))}
                className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-soft transition-colors aria-selected:bg-soft text-ink font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-slate" />
                  <span>Download Product ZIPs</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate" />
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/admin'))}
                className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-soft transition-colors aria-selected:bg-soft text-ink font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Admin Console</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate" />
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer Guide */}
          <div className="flex items-center justify-between px-4 py-2 bg-soft border-t border-border text-[10px] text-slate">
            <span>Navigation: ↑ ↓ to navigate, Enter to select</span>
            <span>Wefik Command Palette</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

export function openCommandPalette() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wfk-open-cmdk'));
  }
}
