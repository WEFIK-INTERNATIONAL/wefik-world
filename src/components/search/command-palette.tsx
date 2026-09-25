'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
import { useLenis } from '@/components/providers/smooth-scroll-provider';

/**
 * P0-3 FIX — Root cause: cmdk v1's Command root `value` prop controls the
 * *selected item*, not search text. Passing `search` as the root `value`
 * caused a render cascade: every keystroke set a new "selected" value →
 * cmdk fired onValueChange → state update → re-render → loop.
 *
 * Fix: removed value/onValueChange from Command root entirely.
 * cmdk manages its own selection state internally.
 * Search text is controlled only via Command.Input value/onValueChange.
 *
 * Secondary fixes:
 * - 200ms debounce on product filtering to reduce churn
 * - Scroll-lock effect guarded to only fire on open→closed transitions
 * - Lazy-mount: the heavy list is only rendered when `open` is true (already
 *   handled by early-return on `!open`, but we now also reset search on close)
 */

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const router = useRouter();
  const { setIsOpen: setCartOpen } = useCart();
  const { navigate } = usePageTransition();
  const { stopScroll, startScroll } = useLenis();
  const wasOpenRef = useRef(false);

  // 200ms debounce on search text for product filtering
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  // Scroll lock: only call stop/start on actual open-state transitions
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      stopScroll('command-palette');
    } else if (!open && wasOpenRef.current) {
      startScroll('command-palette');
    }
    wasOpenRef.current = open;
  }, [open, stopScroll, startScroll]);

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearch('');
      setDebouncedSearch('');
    }
  }, [open]);

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

  const handleSelect = useCallback((callback: () => void) => {
    setOpen(false);
    callback();
  }, []);

  // Debounced product filtering
  const filteredProducts = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return FALLBACK_PRODUCTS.slice(0, 5);
    return FALLBACK_PRODUCTS.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      (p.tagline && p.tagline.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [debouncedSearch]);

  // Lazy-mount: don't render the heavy dialog at all when closed
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24 select-none animate-in fade-in duration-150"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[var(--surface)] text-[var(--text)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* P0-3 FIX: No value/onValueChange on Command root — let cmdk manage selection */}
        <Command
          className="w-full font-sans"
        >
          {/* Input Header */}
          <div className="flex items-center gap-3 px-4 border-b border-[var(--border)]">
            <Search className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder="Search products, pages, guides, actions... (ESC to close)"
              className="w-full py-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] bg-transparent focus:outline-none"
            />
            <span className="text-[10px] font-mono text-[var(--muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)]">
              ESC
            </span>
          </div>

          {/* Results List */}
          <Command.List data-lenis-prevent className="max-h-80 overflow-y-auto p-2 divide-y divide-[var(--border)] text-xs">
            <Command.Empty className="py-8 text-center text-[var(--muted)]">
              No results found for &ldquo;{search}&rdquo;.
            </Command.Empty>

            {/* Group 1: Products (uses debounced filter) */}
            <Command.Group heading="Digital Products" className="py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)] px-2">
              {filteredProducts.map((p) => (
                <Command.Item
                  key={p.id}
                  onSelect={() => handleSelect(() => navigate(`/products/${p.slug}`))}
                  className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors aria-selected:bg-[var(--surface-2)] text-[var(--text)] font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-deep-green" />
                    <div>
                      <span className="block font-bold">{p.title}</span>
                      <span className="text-[10px] text-[var(--muted)] font-normal line-clamp-1">{p.tagline}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-deep-green">
                    {p.is_free ? 'Free' : `₹${Math.round(p.price_inr / 100)}`}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Group 2: Core Pages */}
            <Command.Group heading="Navigation" className="py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)] px-2">
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/marketplace'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors aria-selected:bg-[var(--surface-2)] text-[var(--text)] font-semibold"
              >
                <Layers className="w-4 h-4 text-[var(--muted)]" />
                <span>Marketplace Catalog</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/wordpress-themes'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors aria-selected:bg-[var(--surface-2)] text-[var(--text)] font-semibold"
              >
                <FileCode className="w-4 h-4 text-[var(--muted)]" />
                <span>WordPress Themes (Gutenberg FSE)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/wordpress-plugins'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors aria-selected:bg-[var(--surface-2)] text-[var(--text)] font-semibold"
              >
                <Package className="w-4 h-4 text-[var(--muted)]" />
                <span>WordPress Plugins (High Performance)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/bundles'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors aria-selected:bg-[var(--surface-2)] text-[var(--text)] font-semibold"
              >
                <Tag className="w-4 h-4 text-amber-500" />
                <span>Curated Bundles (Save 60%)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/freebies'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors aria-selected:bg-[var(--surface-2)] text-[var(--text)] font-semibold"
              >
                <Sparkles className="w-4 h-4 text-deep-green" />
                <span>100% Free Templates & Code</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/pricing'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors aria-selected:bg-[var(--surface-2)] text-[var(--text)] font-semibold"
              >
                <CreditCard className="w-4 h-4 text-[var(--muted)]" />
                <span>All-Access Membership Pricing</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/blog'))}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors aria-selected:bg-[var(--surface-2)] text-[var(--text)] font-semibold"
              >
                <BookOpen className="w-4 h-4 text-[var(--muted)]" />
                <span>Engineering Blog & Guides</span>
              </Command.Item>
            </Command.Group>

            {/* Group 3: Quick Actions */}
            <Command.Group heading="Quick Actions" className="py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)] px-2">
              <Command.Item
                onSelect={() => handleSelect(() => setCartOpen(true))}
                className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors aria-selected:bg-[var(--surface-2)] text-[var(--text)] font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-[var(--muted)]" />
                  <span>Open Shopping Cart</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)]" />
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/dashboard/licenses'))}
                className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors aria-selected:bg-[var(--surface-2)] text-[var(--text)] font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-[var(--muted)]" />
                  <span>View My License Keys</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)]" />
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/dashboard/downloads'))}
                className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors aria-selected:bg-[var(--surface-2)] text-[var(--text)] font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-[var(--muted)]" />
                  <span>Download Product ZIPs</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)]" />
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/admin'))}
                className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-[var(--surface-2)] transition-colors aria-selected:bg-[var(--surface-2)] text-[var(--text)] font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Admin Console</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)]" />
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer Guide */}
          <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface-2)] border-t border-[var(--border)] text-[10px] text-[var(--muted)] font-mono">
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
