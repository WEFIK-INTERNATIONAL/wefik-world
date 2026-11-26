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
  Heart,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

const PRIMARY_NAV_LINKS = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/bundles', label: 'Bundles' },
  { href: '/pricing', label: 'Memberships' },
  { href: '/blog', label: 'Blog' },
];

const MORE_NAV_LINKS = [
  { href: '/license', label: 'Commercial License' },
  { href: '/about', label: 'About Wefik' },
  { href: '/contact', label: 'Support & Contact' },
];

function isMarketplaceRoute(pathname: string): boolean {
  return (
    pathname === '/marketplace' ||
    pathname.startsWith('/products/') ||
    pathname.startsWith('/wordpress-themes') ||
    pathname.startsWith('/wordpress-plugins') ||
    pathname.startsWith('/html-templates') ||
    pathname.startsWith('/nextjs-templates')
  );
}

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
  // Platform-neutral initial render on server; resolves to ⌘K on Mac after mount
  const shortcutLabel = React.useSyncExternalStore(
    () => () => {},
    () =>
      typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)
        ? '⌘K'
        : 'Ctrl K',
    () => 'Ctrl K'
  );
  const headerRef = useRef<HTMLElement | null>(null);

  // Measure real header height into CSS variable --header-height
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

  // Sticky header border and blur on scroll (>8px)
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

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 inset-x-0 z-40 w-full transition-colors duration-200 ${
          scrolled
            ? 'border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md'
            : 'border-b border-transparent bg-[var(--bg)]/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[var(--header-height)] flex items-center justify-between gap-6">
          {/* Left: Single Brand Lockup */}
          <TransitionLink href="/" className="flex items-center group shrink-0">
            <Logo size="md" showWordmark={true} />
          </TransitionLink>

          {/* Centre: Primary Navigation (>= lg) */}
          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-1">
            {PRIMARY_NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/marketplace'
                  ? isMarketplaceRoute(pathname)
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <TransitionLink
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center whitespace-nowrap ${
                    isActive
                      ? 'text-[var(--text-primary)] font-semibold after:absolute after:inset-x-3 after:bottom-0.5 after:h-[2px] after:bg-[var(--brand)] after:rounded-full'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]/70'
                  }`}
                >
                  {link.label}
                </TransitionLink>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]/70 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>More</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-[var(--surface)] border-[var(--border)]">
                {MORE_NAV_LINKS.map((item) => (
                  <DropdownMenuItem key={item.href} asChild className="text-sm font-medium cursor-pointer">
                    <TransitionLink href={item.href}>{item.label}</TransitionLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right: Search, Wishlist, Cart, Divider, Theme, Account */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Desktop Search Trigger (min 280px at lg+) */}
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Search themes, plugins, templates"
              className="hidden lg:flex items-center justify-between gap-3 min-w-[280px] max-w-[320px] px-3 py-2 text-sm bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] transition-colors group cursor-pointer"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Search className="w-[18px] h-[18px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] shrink-0" />
                <span className="truncate text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                  Search themes, plugins, templates
                </span>
              </span>
              <kbd className="hidden [@media(hover:hover)_and_(pointer:fine)]:inline-flex items-center shrink-0 px-1.5 py-0.5 text-[11px] font-mono font-medium bg-[var(--surface-2)] text-[var(--text-primary)] rounded border border-[var(--border)]">
                {shortcutLabel}
              </kbd>
            </button>

            {/* Mobile / Tablet Search Icon (< lg) */}
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Search themes, plugins, templates"
              title="Search"
              className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Trigger (desktop/tablet) */}
            <TransitionLink
              href="/dashboard/wishlist"
              aria-label="Saved wishlist"
              title="Wishlist"
              className="relative hidden sm:inline-flex p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[var(--surface-inverted)] text-[var(--text-inverted)] text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[var(--bg)]">
                  {wishlistCount}
                </span>
              )}
            </TransitionLink>

            {/* Cart Trigger (prominent commerce action) */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Shopping cart"
              title="Shopping cart"
              className="relative inline-flex items-center justify-center p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--border)] text-[var(--text-primary)] border border-[var(--border)] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[var(--brand)] text-[var(--text-inverted)] text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[var(--bg)]">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Thin divider between commerce and utility/account */}
            <span aria-hidden="true" className="hidden sm:block h-5 w-px bg-[var(--border)] mx-0.5" />

            {/* Quiet Theme Toggle (hidden on small mobile; accessible inside menu) */}
            <ThemeToggle className="hidden sm:inline-flex" />

            {/* Account Controls */}
            {loading ? (
              <div className="hidden sm:block w-8 h-8 rounded-lg bg-[var(--surface-2)] animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="hidden sm:flex items-center gap-2 p-0.5 rounded-lg hover:ring-2 hover:ring-[var(--brand)] transition-shadow cursor-pointer"
                  >
                    <Avatar className="w-8 h-8 rounded-lg border border-[var(--border)]">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="rounded-lg bg-[var(--surface-inverted)] text-[var(--text-inverted)] text-xs font-semibold">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1 bg-[var(--surface)] border-[var(--border)] shadow-xl">
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {user.user_metadata?.full_name || 'My Account'}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate font-mono">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                    <TransitionLink href="/account" className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      <span>Account</span>
                    </TransitionLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                    <TransitionLink href="/account/orders" className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      <span>Orders</span>
                    </TransitionLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                    <TransitionLink href="/account/library" className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      <span>Downloads</span>
                    </TransitionLink>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="text-xs font-bold text-[var(--brand)] cursor-pointer">
                        <TransitionLink href="/admin" className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-[var(--brand)]" />
                          <span>Admin Console</span>
                        </TransitionLink>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-xs font-semibold text-error focus:text-error cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <TransitionLink
                  href="/login"
                  className="px-2.5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
                >
                  Sign in
                </TransitionLink>
                <Button
                  asChild
                  variant="primary"
                  size="sm"
                  className="h-9 px-4 rounded-full font-semibold text-xs whitespace-nowrap"
                >
                  <TransitionLink href="/signup">Create account</TransitionLink>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button (< lg) */}
            <button
              type="button"
              onClick={() => setFullscreenOpen(!fullscreenOpen)}
              aria-expanded={fullscreenOpen}
              aria-label={fullscreenOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden w-9 h-9 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              {fullscreenOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / Tablet Navigation Overlay */}
      <FullscreenMenu
        isOpen={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        user={user}
        onSignOut={handleSignOut}
      />
    </>
  );
}
