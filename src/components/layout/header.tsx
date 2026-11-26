'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useLenis } from '@/components/providers/smooth-scroll-provider';
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
  Menu,
  SlidersHorizontal,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

/* ─── Navigation ─── */

const NAV_LINKS = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/bundles', label: 'Bundles' },
  { href: '/freebies', label: 'Freebies' },
  { href: '/blog', label: 'Blog' },
] as const;

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

function isFreebiesRoute(pathname: string): boolean {
  return pathname === '/freebies' || pathname.startsWith('/freebies/');
}

function linkIsActive(href: string, pathname: string): boolean {
  if (href === '/marketplace') return isMarketplaceRoute(pathname);
  if (href === '/freebies') return isFreebiesRoute(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ─── Component ─── */

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

  /* Platform-neutral initial render; resolves to ⌘K on Mac after mount */
  const shortcutLabel = React.useSyncExternalStore(
    () => () => {},
    () =>
      typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)
        ? '⌘K'
        : 'Ctrl K',
    () => 'Ctrl K'
  );

  const headerRef = useRef<HTMLElement | null>(null);

  /* Scroll state for subtle border + blur */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateScrollState = (y: number) => setScrolled(y > 8);

    if (lenis) {
      const onScroll = (e: { scroll: number }) => updateScrollState(e.scroll);
      lenis.on('scroll', onScroll);
      return () => { lenis.off('scroll', onScroll); };
    }

    const onScroll = () => updateScrollState(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lenis]);

  /* Auth */
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }, [supabase, router]);

  /* ─── Shared icon-button class (40 px hit-area, consistent treatment) ─── */
  const iconBtnClass =
    'relative inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer';

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 inset-x-0 z-40 w-full h-16 transition-[border-color,background-color] duration-200 ${
          scrolled
            ? 'border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md'
            : 'border-b border-transparent bg-[var(--bg)]/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4 lg:gap-6">
          {/* ═══ LEFT: Logo lockup ═══ */}
          <TransitionLink href="/" className="flex items-center group shrink-0">
            <Logo size="md" showWordmark={true} />
          </TransitionLink>

          {/* ═══ CENTRE: Navigation (lg+) ═══ */}
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = linkIsActive(link.href, pathname);
              return (
                <TransitionLink
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-3 py-2 rounded-[var(--radius-sm)] text-[15px] font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'text-[var(--text-primary)] after:absolute after:inset-x-3 after:bottom-0.5 after:h-[2px] after:bg-[var(--brand)] after:rounded-full'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]/70'
                  }`}
                >
                  {link.label}
                </TransitionLink>
              );
            })}
          </nav>

          {/* ═══ RIGHT: Search · Cart · Account ═══ */}
          <div className="flex items-center gap-2 shrink-0">
            {pathname === '/marketplace' ? (
              /* On /marketplace, collapse to an icon that focuses the page search (single search scope) */
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('marketplace-search') as HTMLInputElement | null;
                  if (input) {
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  } else {
                    openCommandPalette();
                  }
                }}
                aria-label="Focus marketplace search"
                title="Search products"
                className={iconBtnClass}
              >
                <Search className="w-5 h-5" />
              </button>
            ) : (
              <>
                {/* Desktop search field (xl+) */}
                <button
                  type="button"
                  onClick={openCommandPalette}
                  aria-label="Search products"
                  className="hidden xl:flex items-center justify-between gap-3 min-w-[280px] max-w-[320px] px-3 py-2 text-sm bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] transition-colors group cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Search className="w-[18px] h-[18px] shrink-0" />
                    <span className="truncate">Search products</span>
                  </span>
                  <kbd className="hidden [@media(hover:hover)_and_(pointer:fine)]:inline-flex items-center shrink-0 px-1.5 py-0.5 text-[11px] font-mono font-medium bg-[var(--surface-2)] text-[var(--text-primary)] rounded border border-[var(--border)]">
                    {shortcutLabel}
                  </kbd>
                </button>

                {/* Search icon (< xl) */}
                <button
                  type="button"
                  onClick={openCommandPalette}
                  aria-label="Search products"
                  title="Search"
                  className={`xl:hidden ${iconBtnClass}`}
                >
                  <Search className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Cart (the one emphasized icon) */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Shopping cart"
              title="Cart"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[var(--brand)] text-[var(--text-on-brand)] text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[var(--bg)]">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Account / Sign in */}
            {loading ? (
              <div className="hidden sm:block w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--surface-2)] animate-pulse" />
            ) : user ? (
              /* ── Logged-in: avatar menu ── */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="hidden sm:flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] hover:ring-2 hover:ring-[var(--brand)] transition-shadow cursor-pointer"
                  >
                    <Avatar className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--border)]">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="rounded-[var(--radius-sm)] bg-[var(--surface-inverted)] text-[var(--text-inverted)] text-xs font-semibold">
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
                  <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                    <TransitionLink href="/dashboard/wishlist" className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      <span>Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</span>
                    </TransitionLink>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <div className="px-2 py-2 space-y-1.5">
                    <span className="text-[11px] font-medium text-[var(--text-secondary)] block">
                      Theme
                    </span>
                    <ThemeToggle variant="segmented" className="w-full justify-between" />
                  </div>

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
              /* ── Logged-out: preferences menu (Wishlist + Theme) + Sign in text ── */
              <div className="hidden sm:flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Wishlist and theme"
                      title="Wishlist and theme"
                      className={iconBtnClass}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[var(--surface-inverted)] text-[var(--text-inverted)] text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[var(--bg)]">
                          {wishlistCount}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 p-1.5 bg-[var(--surface)] border-[var(--border)] shadow-xl">
                    <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                      <TransitionLink href="/dashboard/wishlist" className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          <span>Wishlist</span>
                        </span>
                        {wishlistCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--surface-2)] text-[var(--text-primary)] tabular-nums">
                            {wishlistCount}
                          </span>
                        )}
                      </TransitionLink>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 space-y-1.5">
                      <span className="text-[11px] font-medium text-[var(--text-secondary)] block">
                        Theme
                      </span>
                      <ThemeToggle variant="segmented" className="w-full justify-between" />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <TransitionLink
                  href="/login"
                  className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
                >
                  Sign in
                </TransitionLink>
              </div>
            )}

            {/* Mobile menu button (< lg) */}
            <button
              type="button"
              onClick={() => setFullscreenOpen(!fullscreenOpen)}
              aria-expanded={fullscreenOpen}
              aria-label={fullscreenOpen ? 'Close menu' : 'Open menu'}
              className={`lg:hidden ${iconBtnClass} bg-[var(--surface)] border border-[var(--border)]`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <FullscreenMenu
        isOpen={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        user={user}
        onSignOut={handleSignOut}
      />
    </>
  );
}
