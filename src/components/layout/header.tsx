'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/transitions/transition-link';
import { FullscreenMenu } from './fullscreen-menu';
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
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalCount, setIsOpen } = useCart();
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastScrollY = useRef(0);

  const supabase = createClient();

  // Hide on scroll down, show on scroll up with backdrop blur after 24px per Section 6.3
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 24);

      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY.current && !fullscreenOpen) {
          setShowHeader(false); // scrolling down
        } else {
          setShowHeader(true); // scrolling up
        }
      } else {
        setShowHeader(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fullscreenOpen]);

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
        className={`fixed top-0 inset-x-0 z-40 w-full transition-all duration-300 ${
          showHeader ? 'translate-y-0' : '-translate-y-full'
        } ${
          scrolled
            ? 'border-b border-border/80 bg-white/90 backdrop-blur-md shadow-xs'
            : 'border-b border-transparent bg-white/60 backdrop-blur-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <TransitionLink href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center text-lime shadow-sm group-hover:bg-black transition-colors">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6L8 18L12 9L16 18L20 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="5" r="1.5" fill="#A3E635" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-ink">
                  wefik<span className="text-deep-green">.world</span>
                </span>
              </div>
            </TransitionLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <TransitionLink
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                      isActive
                        ? 'text-deep-green bg-soft font-bold'
                        : 'text-slate hover:text-ink hover:bg-soft/60'
                    }`}
                  >
                    {link.label}
                    {link.badge && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-extrabold bg-lime/30 text-deep-green rounded-full border border-lime/50">
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
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-border text-slate shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Controls: Cart + ⌘K mobile + Auth + Fullscreen Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick ⌘K trigger icon for mobile/tablet */}
            <button
              onClick={openCommandPalette}
              aria-label="Open search command palette"
              className="lg:hidden p-2 rounded-xl text-slate hover:text-ink hover:bg-soft transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Icon Trigger */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open Shopping Cart"
              className="relative p-2 rounded-xl text-ink hover:bg-soft border border-transparent hover:border-border transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-deep-green text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
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
                <DropdownMenuContent align="end" className="w-56 p-1 bg-white border-border shadow-xl">
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
                    <TransitionLink href="/dashboard" className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-slate" />
                      <span>Dashboard Overview</span>
                    </TransitionLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                    <TransitionLink href="/dashboard/licenses" className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-slate" />
                      <span>My License Keys</span>
                    </TransitionLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                    <TransitionLink href="/dashboard/downloads" className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-slate" />
                      <span>Downloads & Updates</span>
                    </TransitionLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                    <TransitionLink href="/dashboard/membership" className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-deep-green" />
                      <span>Membership Plan</span>
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
                  className="bg-ink hover:bg-black text-white text-xs font-semibold h-9 px-3.5 rounded-xl"
                >
                  <TransitionLink href="/signup">Get Started</TransitionLink>
                </Button>
              </div>
            )}

            {/* Fullscreen Hamburger Menu Morph Trigger (Available on ALL breakpoints per Section 4) */}
            <button
              onClick={() => setFullscreenOpen(!fullscreenOpen)}
              aria-expanded={fullscreenOpen}
              aria-label={fullscreenOpen ? 'Close Navigation Takeover' : 'Open Navigation Takeover'}
              className="relative w-10 h-10 rounded-xl bg-soft hover:bg-soft/90 border border-border flex flex-col items-center justify-center gap-1.5 transition-colors group z-50"
            >
              <span
                className={`w-4 h-0.5 bg-ink rounded-full transition-all duration-300 ease-out ${
                  fullscreenOpen ? 'rotate-45 translate-y-2 bg-white' : ''
                }`}
              />
              <span
                className={`w-4 h-0.5 bg-ink rounded-full transition-all duration-300 ease-out ${
                  fullscreenOpen ? '-rotate-45 -translate-y-0 bg-white' : ''
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
