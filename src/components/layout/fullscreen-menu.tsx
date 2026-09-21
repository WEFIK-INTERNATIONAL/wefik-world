'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Search, ArrowUpRight, X, Sparkles, Mail } from 'lucide-react';
import { useLenis } from '@/components/providers/smooth-scroll-provider';
import { usePageTransition } from '@/components/transitions/transition-provider';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Input } from '@/components/ui/input';

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { index: '01', title: 'Home', href: '/', hint: 'Marketplace overview & catalog' },
  { index: '02', title: 'Marketplace', href: '/marketplace', hint: 'Browse all production themes & plugins' },
  { index: '03', title: 'WordPress Themes', href: '/wordpress-themes', hint: 'Gutenberg FSE block patterns' },
  { index: '04', title: 'WordPress Plugins', href: '/wordpress-plugins', hint: 'Lightweight caching & utilities' },
  { index: '05', title: 'HTML Templates', href: '/html-templates', hint: 'Tailwind CSS & modern starters' },
  { index: '06', title: 'Curated Bundles', href: '/bundles', hint: 'Save up to 60% on all-in-one packs' },
  { index: '07', title: 'Free Products', href: '/freebies', hint: '100% free with genuine license keys' },
  { index: '08', title: 'All-Access Pricing', href: '/pricing', hint: 'Monthly & Lifetime deals from ₹999' },
  { index: '09', title: 'Engineering Blog', href: '/blog', hint: 'WordPress speed & web development' },
  { index: '10', title: 'ThemeForest Alternative', href: '/themeforest-alternative', hint: 'Why builders switch to Wefik' },
];

export function FullscreenMenu({ isOpen, onClose }: FullscreenMenuProps) {
  const { stopScroll, startScroll } = useLenis();
  const { navigate } = usePageTransition();
  const prefersReducedMotion = useReducedMotion();

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const linksContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);

  // Focus trap and ESC key handling
  useEffect(() => {
    if (!isOpen) return;

    // Scroll lock via Lenis
    stopScroll();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus search input on open
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);

    return () => {
      startScroll();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, stopScroll, startScroll, onClose]);

  // GSAP Entrance & Exit Animations
  useEffect(() => {
    if (typeof window === 'undefined' || !overlayRef.current) return;

    if (isOpen) {
      if (prefersReducedMotion) {
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.15, display: 'flex' });
        return;
      }

      // Slide-up panel with staggered nav link reveals
      const tl = gsap.timeline();
      tl.set(overlayRef.current, { display: 'flex', yPercent: -100, opacity: 1 })
        .to(overlayRef.current, {
          yPercent: 0,
          duration: 0.55,
          ease: 'expo.out',
        })
        .fromTo(
          '.fs-menu-item',
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.04,
            ease: 'expo.out',
          },
          '-=0.25'
        );
    } else {
      if (prefersReducedMotion) {
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
        duration: 0.4,
        ease: 'expo.in',
        onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.display = 'none';
        },
      });
    }
  }, [isOpen, prefersReducedMotion]);

  const handleLinkClick = (href: string) => {
    onClose();
    // Chain with page transition
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
      className="fixed inset-0 z-[9990] bg-[#202124] text-white flex flex-col justify-between overflow-y-auto px-6 sm:px-12 lg:px-20 py-8 lg:py-12 select-none"
    >
      {/* Top Header Row inside overlay */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-lime text-ink flex items-center justify-center font-black text-sm shadow-md">
            W
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">wefik.world</span>
          <span className="text-[11px] font-mono text-lime bg-lime/10 px-2 py-0.5 rounded-full hidden sm:inline-block">
            Esc to close
          </span>
        </div>

        {/* Search Bar in Menu */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs sm:max-w-sm hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search themes, plugins, guides..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-400 text-xs focus:ring-1 focus:ring-lime"
          />
        </form>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Nav Links Grid */}
      <div ref={linksContainerRef} className="py-8 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-1 sm:space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.index}
              className="fs-menu-item group flex items-baseline gap-4 cursor-pointer py-1.5 transition-transform duration-200 hover:translate-x-3"
              onMouseEnter={() => setHoveredIndex(item.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleLinkClick(item.href)}
            >
              <span className="font-mono text-xs text-lime font-bold tracking-wider">
                {item.index}
              </span>
              <div className="flex-1">
                <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-white group-hover:text-lime transition-colors tracking-tight">
                  {item.title}
                </span>
                <span className="block text-xs text-slate-400 mt-0.5 group-hover:text-slate-300 transition-colors">
                  {item.hint}
                </span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-lime transition-all" />
            </div>
          ))}
        </div>

        {/* Right Info Box on Desktop */}
        <div className="hidden lg:flex lg:col-span-4 flex-col justify-center p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-lime">
              Why Wefik World?
            </span>
            <h4 className="text-base font-extrabold text-white">Zero Bloat. Native FSE Blocks.</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We engineer clean WordPress themes and templates that achieve 100/100 Core Web Vitals right out of the box with zero heavy visual page builder dependencies.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-ink border border-lime/30 space-y-2">
            <div className="flex items-center gap-2 text-lime text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>All-Access Pass Deal</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Get every theme, plugin, and future release with unlimited commercial licenses from ₹999/month.
            </p>
            <button
              onClick={() => handleLinkClick('/pricing')}
              className="text-xs font-bold text-lime hover:underline flex items-center gap-1 pt-1"
            >
              View Membership Plans <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Row */}
      <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-4">
          <a
            href="mailto:hello@wefik.world"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-lime" />
            <span>hello@wefik.world</span>
          </a>
          <span className="text-white/20">•</span>
          <span>Kolkata, India</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://twitter.com/wefik"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-lime transition-colors"
          >
            X / Twitter
          </a>
          <a
            href="https://github.com/WEFIK-INTERNATIONAL"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-lime transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://wefik.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-lime transition-colors"
          >
            Wefik Agency
          </a>
        </div>
      </div>
    </div>
  );
}
