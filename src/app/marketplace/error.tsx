'use client';

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, RefreshCw, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MarketplaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      Sentry.captureException(error);
    } catch {
      // safe fallback
    }
    console.error('Marketplace runtime error captured:', error);
  }, [error]);

  const errorId = error.digest || 'mkt_' + Math.random().toString(36).substring(2, 8);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] px-3 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)]">
            Marketplace Notice
          </span>
          <h2 className="text-2xl font-display font-bold text-[var(--text)] mt-3">
            Products temporarily unavailable
          </h2>
          <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed">
            We encountered a data synchronization issue while cataloging items. Our engineers have been alerted.
          </p>
        </div>

        <div className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] text-left">
          <p className="text-[10px] font-mono uppercase text-[var(--muted)] tracking-wider">
            Diagnostic ID
          </p>
          <p className="text-xs font-mono font-bold text-[var(--text)] select-all break-all">
            {errorId}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--text)] text-[var(--surface)] hover:opacity-90 text-xs font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Marketplace</span>
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
