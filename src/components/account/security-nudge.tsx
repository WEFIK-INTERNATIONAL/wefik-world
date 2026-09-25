'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecurityNudgeProps {
  hasMfa: boolean;
}

export function SecurityNudge({ hasMfa }: SecurityNudgeProps) {
  const [visible, setVisible] = useState(() => {
    if (hasMfa) return false;
    if (typeof window === 'undefined') return false;
    try {
      const dismissedAt = window.localStorage.getItem('wefik_2fa_nudge_dismissed');
      if (dismissedAt) {
        const days = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
        if (days < 30) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  });

  if (hasMfa || !visible) return null;

  function dismiss() {
    localStorage.setItem('wefik_2fa_nudge_dismissed', Date.now().toString());
    setVisible(false);
  }

  return (
    <div className="relative p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-in fade-in-50">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[var(--text)]">Secure your account with 2FA</h4>
          <p className="text-xs text-slate mt-0.5 max-w-xl leading-relaxed">
            Protect your commercial licenses and downloads by enabling Two-Factor Authentication (TOTP). Authenticator apps like Google Authenticator, Authy, or 1Password are supported.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <Link href="/account/settings?tab=security">
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold">
            Enable 2FA <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
        <button
          onClick={dismiss}
          className="p-1.5 rounded-lg text-slate hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
          title="Dismiss for 30 days"
          aria-label="Dismiss 2FA notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
