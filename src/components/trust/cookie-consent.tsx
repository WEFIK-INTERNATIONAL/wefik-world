'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie, Check, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const CONSENT_STORAGE_KEY = 'wefik_cookie_consent_v1';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
  }
}

function applyConsentMode(prefs: CookiePreferences) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: prefs.analytics ? 'granted' : 'denied',
      ad_storage: prefs.marketing ? 'granted' : 'denied',
      personalization_storage: prefs.functional ? 'granted' : 'denied',
      functionality_storage: prefs.functional ? 'granted' : 'denied',
    });
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('wefik_cookie_consent_updated', { detail: prefs })
    );
  }
}

const subscribe = () => () => {};

export function CookieConsent() {
  const isMounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const [hasConsented, setHasConsented] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      return Boolean(localStorage.getItem(CONSENT_STORAGE_KEY));
    } catch {
      return false;
    }
  });

  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    if (typeof window === 'undefined') {
      return { necessary: true, analytics: false, functional: false, marketing: false };
    }
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      return stored
        ? (JSON.parse(stored) as CookiePreferences)
        : { necessary: true, analytics: false, functional: false, marketing: false };
    } catch {
      return { necessary: true, analytics: false, functional: false, marketing: false };
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        applyConsentMode(JSON.parse(stored) as CookiePreferences);
      }
    } catch {
      // ignore
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    setPreferences(prefs);
    setHasConsented(true);
    setIsPreferencesOpen(false);
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
    applyConsentMode(prefs);
  };

  const handleAcceptAll = () => {
    const allIn: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    };
    savePreferences(allIn);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    };
    savePreferences(essentialOnly);
  };

  if (!isMounted || hasConsented) return null;

  return (
    <>
      {/* Floating Bottom Consent Banner */}
      <aside
        aria-label="Cookie Consent Banner"
        className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-[90] bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] rounded-2xl shadow-2xl p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-lime border border-[var(--border)] shrink-0 mt-0.5">
            <Cookie className="w-4 h-4" />
          </div>

          <div className="space-y-2 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-[var(--text)]">
              Privacy & Cookie Preferences (DPDP / GDPR)
            </h3>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              We use strictly necessary cookies to securely maintain your authentication sessions and shopping cart. We request your permission to load analytics and support widgets. Read our{' '}
              <Link href="/cookies" className="underline text-[var(--text)] hover:text-lime font-medium">
                Cookie Policy
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline text-[var(--text)] hover:text-lime font-medium">
                Privacy Policy
              </Link>
              .
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="h-8 px-3 rounded-xl bg-[var(--text)] text-[var(--surface)] font-bold text-xs shadow-xs"
              >
                Accept All
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectNonEssential}
                className="h-8 px-3 rounded-xl border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] text-xs font-semibold"
              >
                Reject Non-Essential
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreferencesOpen(true)}
                className="h-8 px-2 text-xs text-[var(--muted)] hover:text-[var(--text)] hover:bg-transparent"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                <span>Customize</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Preferences Dialog */}
      <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
        <DialogContent className="max-w-md bg-[var(--surface)] text-[var(--text)] border-[var(--border)] p-6 rounded-3xl">
          <DialogHeader className="pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-lime" />
              <div>
                <DialogTitle className="text-base font-bold text-[var(--text)]">
                  Cookie Categories
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--muted)]">
                  Control which third-party scripts and data processors can activate.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 pt-3 text-xs">
            {/* Essential */}
            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-[var(--text)]">
                  <span>Strictly Necessary</span>
                  <span className="text-[10px] text-lime font-mono">Required</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Supabase auth cookies, cart persistence, and CSRF protection tokens.
                </p>
              </div>
              <div className="w-4 h-4 rounded-full bg-lime/20 text-lime flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-lime" />
              </div>
            </div>

            {/* Analytics */}
            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-start justify-between gap-3">
              <div>
                <span className="font-bold text-[var(--text)]">Analytics & Performance</span>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  PostHog product analytics and anonymous error tracking to fix site bugs.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                }
                className="w-4 h-4 accent-lime rounded cursor-pointer mt-0.5"
              />
            </div>

            {/* Functional */}
            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-start justify-between gap-3">
              <div>
                <span className="font-bold text-[var(--text)]">Live Chat & Support</span>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Tawk.to pre-sales widget and interactive support agent ticketing.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, functional: e.target.checked }))
                }
                className="w-4 h-4 accent-lime rounded cursor-pointer mt-0.5"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreferencesOpen(false)}
              className="text-xs border-[var(--border)]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => savePreferences(preferences)}
              className="bg-[var(--text)] text-[var(--surface)] text-xs font-bold"
            >
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
