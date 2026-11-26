'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Search, X, LogOut, User as UserIcon, KeyRound, Download } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useLenis } from '@/components/providers/smooth-scroll-provider';
import { usePageTransition } from '@/components/transitions/transition-provider';
import { useMotionGates } from '@/hooks/use-reduced-motion';
import { MOTION_DURATION, MOTION_EASE } from '@/lib/motion';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSignOut?: () => void;
}

const MENU_ITEMS = [
  { index: '01', title: 'Marketplace', href: '/marketplace', hint: 'Browse themes, plugins, and starters' },
  { index: '02', title: 'Bundles', href: '/bundles', hint: 'Curated agency toolkits' },
  { index: '03', title: 'Memberships', href: '/pricing', hint: 'All-access monthly and lifetime plans' },
  { index: '04', title: 'Free Products', href: '/freebies', hint: 'Free themes and plugins with license keys' },
  { index: '05', title: 'Blog', href: '/blog', hint: 'Engineering guides and benchmarks' },
  { index: '06', title: 'Commercial License', href: '/license', hint: 'Single and unlimited site rights' },
];

export function FullscreenMenu({ isOpen, onClose, user, onSignOut }: FullscreenMenuProps) {
  const { stopScroll, startScroll } = useLenis();
  const { navigate } = usePageTransition();
  const { disableHeavyMotion } = useMotionGates();

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Body scroll lock while overlay is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  // Focus trap, Escape to close, and Lenis scroll lock
  useEffect(() => {
    if (!isOpen) return;

    stopScroll('fullscreen-menu');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const focusTimer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 120);

    return () => {
      startScroll('fullscreen-menu');
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [isOpen, stopScroll, startScroll, onClose]);

  // GSAP Entrance & Exit Animations (transform + opacity only, shared motion tokens)
  useEffect(() => {
    if (typeof window === 'undefined' || !overlayRef.current) return;

    if (isOpen) {
      if (disableHeavyMotion) {
        gsap.set(overlayRef.current, { display: 'flex', yPercent: 0, opacity: 1 });
        return;
      }

      const tl = gsap.timeline();
      tl.set(overlayRef.current, { display: 'flex', yPercent: -100, opacity: 1 })
        .to(overlayRef.current, {
          yPercent: 0,
          duration: MOTION_DURATION.base,
          ease: MOTION_EASE.out,
        })
        .fromTo(
          '.fs-menu-item',
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: MOTION_DURATION.base,
            stagger: 0.03,
            ease: MOTION_EASE.out,
          },
          '-=0.18'
        );
    } else {
      if (disableHeavyMotion) {
        gsap.set(overlayRef.current, { opacity: 0, display: 'none' });
        return;
      }

      gsap.to(overlayRef.current, {
        yPercent: -100,
        duration: MOTION_DURATION.base,
        ease: MOTION_EASE.in,
        onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.display = 'none';
        },
      });
    }
  }, [isOpen, disableHeavyMotion]);

  const handleLinkClick = (href: string) => {
    onClose();
    setTimeout(() => {
      navigate(href);
    }, 50);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleLinkClick(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filteredItems = searchQuery.trim()
    ? MENU_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.hint.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MENU_ITEMS;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      style={{ display: 'none' }}
      data-lenis-prevent
      className="fixed inset-0 z-[9990] h-[100dvh] max-h-[100dvh] bg-[var(--bg)] text-[var(--text-primary)] flex flex-col justify-between overflow-y-auto px-6 sm:px-10 pt-[calc(1.25rem+env(safe-area-inset-top,0px))] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] select-none transition-colors"
    >
      {/* Top Row */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 gap-4">
        <Logo size="md" showWordmark={true} />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="w-10 h-10 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--border)] border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-full mt-5">
        <Search className="w-[18px] h-[18px] text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <Input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search themes, plugins, templates"
          className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm"
        />
      </form>

      {/* Navigation Links */}
      <nav aria-label="Mobile Navigation" className="py-6 my-auto space-y-2">
        {filteredItems.map((item) => (
          <button
            key={item.index}
            type="button"
            onClick={() => handleLinkClick(item.href)}
            className="fs-menu-item w-full text-left group flex items-baseline gap-4 py-2 rounded-lg hover:bg-[var(--surface)] px-2 transition-colors cursor-pointer"
          >
            <span className="font-mono text-xs text-[var(--brand)] font-semibold shrink-0">
              {item.index}
            </span>
            <div>
              <span className="text-2xl sm:text-3xl font-display font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors block">
                {item.title}
              </span>
              <span className="text-xs text-[var(--text-secondary)] block mt-0.5">
                {item.hint}
              </span>
            </div>
          </button>
        ))}
      </nav>

      {/* Account Actions & Theme Toggle */}
      <div className="border-t border-[var(--border)] pt-5 space-y-4">
        {user ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleLinkClick('/account')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Account</span>
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('/account/orders')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Orders</span>
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('/account/library')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] cursor-pointer"
            >
              <Download className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Downloads</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut?.();
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm font-medium text-error cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleLinkClick('/login')}
              className="flex-1 h-10 rounded-lg text-sm font-medium"
            >
              Sign in
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => handleLinkClick('/signup')}
              className="flex-1 h-10 rounded-full text-sm font-semibold"
            >
              Create account
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
