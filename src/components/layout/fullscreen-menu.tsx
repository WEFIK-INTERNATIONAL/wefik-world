'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, LogOut, User as UserIcon, KeyRound, Download, Heart } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useLenis } from '@/components/providers/smooth-scroll-provider';
import { usePageTransition } from '@/components/transitions/transition-provider';
import { useMotionGates } from '@/hooks/use-reduced-motion';
import { MOTION_DURATION, MOTION_EASE } from '@/lib/motion';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSignOut?: () => void;
}

const MENU_ITEMS = [
  { title: 'Marketplace', href: '/marketplace', hint: 'Browse themes, plugins, and starters' },
  { title: 'Bundles', href: '/bundles', hint: 'Curated agency toolkits' },
  { title: 'Freebies', href: '/freebies', hint: 'Free themes and plugins' },
  { title: 'Blog', href: '/blog', hint: 'Engineering guides and benchmarks' },
  { title: 'Commercial License', href: '/license', hint: 'Single and unlimited site rights' },
  { title: 'Support', href: '/contact', hint: 'Help and contact' },
];

export function FullscreenMenu({ isOpen, onClose, user, onSignOut }: FullscreenMenuProps) {
  const { stopScroll, startScroll } = useLenis();
  const { navigate } = usePageTransition();
  const { disableHeavyMotion } = useMotionGates();

  const overlayRef = useRef<HTMLDivElement | null>(null);

  /* Body scroll lock */
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

  /* Focus trap, Escape, Lenis lock */
  useEffect(() => {
    if (!isOpen) return;
    stopScroll('fullscreen-menu');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => overlayRef.current?.querySelector<HTMLElement>('button, a')?.focus(), 120);
    return () => {
      startScroll('fullscreen-menu');
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, stopScroll, startScroll, onClose]);

  /* GSAP entrance / exit */
  useEffect(() => {
    if (typeof window === 'undefined' || !overlayRef.current) return;

    if (isOpen) {
      if (disableHeavyMotion) {
        gsap.set(overlayRef.current, { display: 'flex', yPercent: 0, opacity: 1 });
        return;
      }
      const tl = gsap.timeline();
      tl.set(overlayRef.current, { display: 'flex', yPercent: -100, opacity: 1 })
        .to(overlayRef.current, { yPercent: 0, duration: MOTION_DURATION.base, ease: MOTION_EASE.out })
        .fromTo(
          '.fs-menu-item',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: MOTION_DURATION.base, stagger: 0.03, ease: MOTION_EASE.out },
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
        onComplete: () => { if (overlayRef.current) overlayRef.current.style.display = 'none'; },
      });
    }
  }, [isOpen, disableHeavyMotion]);

  const handleLinkClick = (href: string) => {
    onClose();
    setTimeout(() => navigate(href), 50);
  };

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
          className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--surface-2)] hover:bg-[var(--border)] border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Mobile Navigation" className="py-6 my-auto space-y-1">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => handleLinkClick(item.href)}
            className="fs-menu-item w-full text-left group flex flex-col py-3 rounded-[var(--radius-sm)] hover:bg-[var(--surface)] px-3 transition-colors cursor-pointer"
          >
            <span className="text-2xl sm:text-3xl font-display font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">
              {item.title}
            </span>
            <span className="text-xs text-[var(--text-secondary)] mt-0.5">
              {item.hint}
            </span>
          </button>
        ))}
      </nav>

      {/* Account Actions, Wishlist, Theme */}
      <div className="border-t border-[var(--border)] pt-5 space-y-4">
        {/* Wishlist + Orders + Downloads row */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleLinkClick('/dashboard/wishlist')}
            className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] cursor-pointer"
          >
            <Heart className="w-4 h-4 text-[var(--text-secondary)]" />
            <span>Wishlist</span>
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/account/orders')}
            className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-[var(--text-secondary)]" />
            <span>Orders</span>
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/account/library')}
            className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] cursor-pointer"
          >
            <Download className="w-4 h-4 text-[var(--text-secondary)]" />
            <span>Downloads</span>
          </button>
        </div>

        {user ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleLinkClick('/account')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Account</span>
            </button>
            <button
              type="button"
              onClick={() => { onClose(); onSignOut?.(); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)] text-sm font-medium text-error cursor-pointer"
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
              className="flex-1 h-10 rounded-[var(--radius-sm)] text-sm font-medium"
            >
              Sign in
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => handleLinkClick('/signup')}
              className="flex-1 h-10 rounded-[var(--radius-sm)] text-sm font-semibold"
            >
              Create account
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Theme</span>
          <ThemeToggle variant="segmented" />
        </div>
      </div>
    </div>
  );
}
