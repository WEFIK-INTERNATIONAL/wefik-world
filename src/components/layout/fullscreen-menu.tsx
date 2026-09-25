'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Search, ArrowUpRight, X, Sparkles, Mail } from 'lucide-react';
import { useLenis } from '@/components/providers/smooth-scroll-provider';
import { usePageTransition } from '@/components/transitions/transition-provider';
import { useMotionGates } from '@/hooks/use-reduced-motion';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Input } from '@/components/ui/input';

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { index: '01', title: 'Marketplace', href: '/marketplace', hint: 'Browse all production themes & plugins' },
  { index: '02', title: 'WordPress Themes', href: '/wordpress-themes', hint: 'Gutenberg FSE block patterns' },
  { index: '03', title: 'WordPress Plugins', href: '/wordpress-plugins', hint: 'Lightweight caching & utilities' },
  { index: '04', title: 'HTML Templates', href: '/html-templates', hint: 'Tailwind CSS & modern starters' },
  { index: '05', title: 'Curated Bundles', href: '/bundles', hint: 'Save up to 60% on all-in-one packs' },
  { index: '06', title: 'Free Products', href: '/freebies', hint: '100% free with genuine license keys' },
  { index: '07', title: 'All-Access Pricing', href: '/pricing', hint: 'Monthly & Lifetime deals from ₹999' },
  { index: '08', title: 'Engineering Blog', href: '/blog', hint: 'WordPress speed & web development' },
  { index: '09', title: 'ThemeForest Alternative', href: '/themeforest-alternative', hint: 'Why builders switch to Wefik' },
];

export function FullscreenMenu({ isOpen, onClose }: FullscreenMenuProps) {
  const { stopScroll, startScroll } = useLenis();
  const { navigate } = usePageTransition();
  const { disableHeavyMotion } = useMotionGates();

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const linksContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Body scroll lock on mobile (iOS Safari + Android Chrome)
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  // Focus trap and ESC key handling + Lenis lock
  useEffect(() => {
    if (!isOpen) return;

    // Stop Lenis smooth scrolling
    stopScroll('fullscreen-menu');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const focusTimer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);

    return () => {
      startScroll('fullscreen-menu');
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [isOpen, stopScroll, startScroll, onClose]);

  // GSAP Entrance & Exit Animations with Reduced-Motion Support
  useEffect(() => {
    if (typeof window === 'undefined' || !overlayRef.current) return;

    if (isOpen) {
      if (disableHeavyMotion) {
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.1, display: 'flex' });
        return;
      }

      // Slide-up panel with staggered nav link reveals (<400ms total)
      const tl = gsap.timeline();
      tl.set(overlayRef.current, { display: 'flex', yPercent: -100, opacity: 1 })
        .to(overlayRef.current, {
          yPercent: 0,
          duration: 0.45,
          ease: 'power3.out',
        })
        .fromTo(
          '.fs-menu-item',
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            stagger: 0.035,
            ease: 'power2.out',
          },
          '-=0.2'
        );
    } else {
      if (disableHeavyMotion) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.1,
          onComplete: () => {
            if (overlayRef.current) overlayRef.current.style.display = 'none';
          },
        });
        return;
      }

      gsap.to(overlayRef.current, {
        yPercent: -100,
        duration: 0.3,
        ease: 'power3.in',
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
    ? MENU_ITEMS.filter((item) =>
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
      className="fixed inset-0 z-[9990] h-[100dvh] max-h-[100dvh] bg-[var(--bg)] text-[var(--text-primary)] flex flex-col justify-between overflow-y-auto px-6 sm:px-12 lg:px-20 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pl-[calc(1.5rem+env(safe-area-inset-left,0px))] pr-[calc(1.5rem+env(safe-area-inset-right,0px))] select-none transition-colors"
    >
      {/* Top Header Row inside overlay */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-6 gap-4">
        <div className="flex items-center gap-3">
          <Logo size="md" showWordmark={true} />
          <span className="text-[11px] font-mono text-[#2d5208] dark:text-lime bg-lime/20 px-2 py-0.5 rounded-full border border-lime/30 hidden sm:inline-block">
            ESC to close
          </span>
        </div>

        {/* Live Search Bar in Menu */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs sm:max-w-md hidden md:block">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog: themes, plugins, guides..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-xs focus:ring-1 focus:ring-lime"
          />
        </form>

        {/* Controls: Theme Toggle + Close Button */}
        <div className="flex items-center gap-3">
          <ThemeToggle className="text-[var(--text-primary)] border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--border)]" />
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="w-10 h-10 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--border)] border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Nav Links Grid */}
      <div ref={linksContainerRef} className="py-6 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-1 sm:space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.index}
              className="fs-menu-item group flex items-baseline gap-4 cursor-pointer py-1.5 transition-transform duration-200 hover:translate-x-2 active:scale-[0.97]"
              onClick={() => handleLinkClick(item.href)}
            >
              <span className="font-mono text-xs text-[#2d5208] dark:text-lime font-bold tracking-wider shrink-0">
                {item.index} —
              </span>
              <div className="flex-1">
                <span className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold text-[var(--text-primary)] group-hover:text-deep-green dark:group-hover:text-lime transition-colors tracking-tight link-sweep">
                  {item.title}
                </span>
                <span className="block text-xs text-[var(--text-secondary)] mt-0.5 group-hover:text-[var(--text-primary)] transition-colors">
                  {item.hint}
                </span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 group-hover:text-deep-green dark:group-hover:text-lime transition-all shrink-0" />
            </div>
          ))}
        </div>

        {/* Right Info / Live Preview Box on Desktop */}
        <div className="hidden lg:flex lg:col-span-4 flex-col justify-center p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-6">
          <div className="space-y-2">
            <span className="eyebrow text-[#2d5208] dark:text-lime">
              Why Wefik World?
            </span>
            <h4 className="heading-3 text-[var(--text-primary)]">Zero Bloat. Native FSE Blocks.</h4>
            <p className="body-small text-[var(--text-secondary)]">
              Clean WordPress themes and templates achieving 100/100 Core Web Vitals right out of the box with zero heavy page builders.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-lime/30 space-y-3">
            <div className="flex items-center gap-2 text-deep-green dark:text-lime text-xs font-bold">
              <Sparkles className="w-4 h-4 text-lime" />
              <span className="font-display">All-Access Pass Deal</span>
            </div>
            <p className="body-small text-[var(--text-secondary)]">
              Get every theme, plugin, and future release with unlimited commercial licenses from ₹999/month.
            </p>
            <button
              onClick={() => handleLinkClick('/pricing')}
              className="text-xs font-bold text-deep-green dark:text-lime hover:underline flex items-center gap-1.5 pt-1 cursor-pointer"
            >
              <span>View Membership Plans</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Row */}
      <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)] font-medium">
        <div className="flex items-center gap-4">
          <a
            href="mailto:hello@wefik.world"
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-lime" />
            <span>hello@wefik.world</span>
          </a>
          <span className="text-[var(--border)]">•</span>
          <span>Kolkata, India</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://twitter.com/wefik"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-deep-green dark:hover:text-lime transition-colors"
          >
            X / Twitter
          </a>
          <a
            href="https://github.com/WEFIK-INTERNATIONAL"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-deep-green dark:hover:text-lime transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://wefik.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-deep-green dark:hover:text-lime transition-colors"
          >
            Wefik Agency
          </a>
        </div>
      </div>
    </div>
  );
}
