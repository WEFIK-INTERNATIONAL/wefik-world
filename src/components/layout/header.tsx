'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useLenis } from '@/components/providers/smooth-scroll-provider';
import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/transitions/transition-link';
import { FullscreenMenu } from './fullscreen-menu';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { openCommandPalette } from '@/components/search/command-palette';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Shield,
  KeyRound,
  Download,
  LogOut,
  Sparkles,
  Heart,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalCount, setIsOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { lenis } = useLenis();
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef<HTMLElement | null>(null);

  // Measure real header height into CSS variable --header-height (FIX B)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        if (height > 0) {
          document.documentElement.style.setProperty('--header-height', `${height}px`);
        }
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  const supabase = createClient();

  // Sticky header with backdrop blur and subtle border/shadow appearing after 8px scroll
  // Driven by Lenis scroll events with native window scroll fallback
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateScrollState = (currentScrollY: number) => {
      setScrolled(currentScrollY > 8);
    };

    if (lenis) {
      const onLenisScroll = (e: { scroll: number }) => {
        updateScrollState(e.scroll);
      };
      lenis.on('scroll', onLenisScroll);
      return () => {
        lenis.off('scroll', onLenisScroll);
      };
    } else {
      const handleWindowScroll = () => {
        updateScrollState(window.scrollY);
      };
      window.addEventListener('scroll', handleWindowScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleWindowScroll);
    }
  }, [lenis]);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single<{ role: string }>();

        setIsAdmin(profile?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/bundles', label: 'Bundles', badge: 'Save 60%' },
    { href: '/freebies', label: 'Freebies' },
    { href: '/pricing', label: 'Memberships' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 inset-x-0 z-40 w-full transition-all duration-200 ${
          scrolled
            ? 'border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md shadow-xs'
            : 'border-b border-transparent bg-[var(--bg)]/60 backdrop-blur-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <TransitionLink href="/" className="flex items-center group">
                <Logo size="md" showWordmark={true} />
              </TransitionLink>
              <a
                href="https://wefik.in"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center whitespace-nowrap text-[10px] font-mono tracking-wider text-[var(--muted)] hover:text-deep-green dark:hover:text-lime transition-colors px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)]"
                title="Wefik Digital Agency (wefik.in)"
              >
                by Wefik
              </a>
            </div>

            {/* Desktop Navigation: visible at >= 1024px */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <TransitionLink
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors inline-flex items-center ${
                      isActive
                        ? 'text-deep-green bg-soft font-bold'
                        : 'text-slate hover:text-ink hover:bg-soft/60'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="ml-1.5 inline-flex items-center whitespace-nowrap px-1.5 py-0.5 text-[9px] font-bold bg-lime/20 text-[#2d5208] dark:text-lime rounded-full border border-lime/40">
                        {link.badge}
                      </span>
                    )}
                  </TransitionLink>
                );
              })}
            </nav>
          </div>

          {/* Search Button (Triggers ⌘K Command Palette) */}
          <div className="hidden lg:block flex-1 max-w-xs">
            <button
              onClick={openCommandPalette}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs bg-soft hover:bg-soft/90 border border-border rounded-xl text-slate transition-all group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate/70 group-hover:text-ink" />
                <span className="text-slate/70 group-hover:text-ink">Search marketplace...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--surface-2)] rounded border border-border text-slate shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Controls: Cart + ⌘K mobile + Auth + Hamburger (<1024px) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick ⌘K trigger icon for mobile/tablet */}
            <button
              onClick={openCommandPalette}
              aria-label="Open search command palette"
              className="lg:hidden p-2 rounded-xl text-slate hover:text-ink hover:bg-soft transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Trigger */}
            <TransitionLink
              href="/dashboard/wishlist"
              aria-label="View Saved Wishlist"
              className="relative p-2 rounded-xl text-ink hover:bg-soft border border-transparent hover:border-border transition-all hidden sm:inline-flex"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[var(--bg)]">
                  {wishlistCount}
                </span>
              )}
            </TransitionLink>

            {/* Cart Icon Trigger */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open Shopping Cart"
              className="relative p-2 rounded-xl text-ink hover:bg-soft border border-transparent hover:border-border transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-deep-green text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[var(--bg)]">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Auth Controls */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-soft animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-lime transition-all">
                    <Avatar className="w-8 h-8 border border-border">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-ink text-white text-xs font-semibold">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1 bg-[var(--surface)] border-border shadow-xl">
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-xs font-bold text-ink truncate">
                        {user.user_metadata?.full_name || 'My Account'}
                      </p>
                      <p className="text-[10px] text-slate truncate font-mono">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                    <TransitionLink href="/account" className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-slate" />
                      <span>Account Overview</span>
                    </TransitionLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                    <TransitionLink href="/account/library" className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-slate" />
                      <span>My Library &amp; Licenses</span>
                    </TransitionLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                    <TransitionLink href="/account/orders" className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-slate" />
                      <span>Orders &amp; Receipts</span>
                    </TransitionLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                    <TransitionLink href="/account/membership" className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-deep-green" />
                      <span>Membership Plan</span>
                    </TransitionLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                    <TransitionLink href="/account/settings" className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-slate" />
                      <span>Profile &amp; Security</span>
                    </TransitionLink>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="text-xs font-bold text-deep-green cursor-pointer">
                        <TransitionLink href="/admin" className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-deep-green" />
                          <span>Admin Console</span>
                        </TransitionLink>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-xs font-semibold text-red-600 focus:text-red-700 cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  className="hidden sm:inline-flex text-xs font-semibold text-slate hover:text-ink h-9 px-3"
                >
                  <TransitionLink href="/login">Sign In</TransitionLink>
                </Button>
                <Button
                  asChild
                  variant="primary"
                  size="sm"
                  className="h-9 px-3.5 rounded-xl font-semibold text-xs shadow-sm"
                >
                  <TransitionLink href="/signup">Get Started</TransitionLink>
                </Button>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle className="ml-1" />

            {/* Fullscreen Hamburger Menu Morph Trigger — ONLY on screens <1024px per Fix Pack 03 A3 */}
            <button
              onClick={() => setFullscreenOpen(!fullscreenOpen)}
              aria-expanded={fullscreenOpen}
              aria-label={fullscreenOpen ? 'Close Navigation Takeover' : 'Open Navigation Takeover'}
              className="lg:hidden relative w-10 h-10 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] flex flex-col items-center justify-center gap-1.5 transition-colors group z-50 cursor-pointer"
            >
              <span
                className={`w-4 h-0.5 bg-[var(--text)] rounded-full transition-all duration-300 ease-out ${
                  fullscreenOpen ? 'rotate-45 translate-y-2 !bg-[var(--text)]' : ''
                }`}
              />
              <span
                className={`w-4 h-0.5 bg-[var(--text)] rounded-full transition-all duration-300 ease-out ${
                  fullscreenOpen ? '-rotate-45 -translate-y-0 !bg-[var(--text)]' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Hamburger Menu Takeover (Section 4) */}
      <FullscreenMenu
        isOpen={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
      />
    </>
  );
}
