'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Mail, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
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
      // Safe fallback
    }
    console.error('App runtime error captured by Sentry:', error);
  }, [error]);

  const errorId = error.digest || 'wfk_err_' + Math.random().toString(36).substring(2, 9);

  return (
    <main className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-border shadow-xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-slate bg-soft px-3 py-1 rounded-full border border-border">
          Error Encountered
        </span>

        <h1 className="text-2xl font-extrabold text-ink tracking-tight mt-3 mb-2">
          Something broke on our end.
        </h1>

        <p className="text-slate text-sm mb-6 leading-relaxed">
          We&apos;ve dispatched this event to Sentry for rapid investigation. Your session and account data remain completely secure.
        </p>

        {/* Error Reference ID Card */}
        <div className="bg-soft p-3 rounded-xl border border-border/80 text-left mb-6">
          <p className="text-[10px] font-mono uppercase text-slate tracking-wider mb-0.5">
            Sentry Reference ID
          </p>
          <p className="text-xs font-mono font-bold text-ink select-all break-all">
            {errorId}
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ink hover:bg-black text-white text-xs font-bold transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-soft hover:bg-slate-100 text-ink border border-border text-xs font-bold transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>

        {/* Contact Support */}
        <a
          href={`mailto:hello@wefik.world?subject=Error%20Report%20${errorId}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate hover:text-deep-green transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Need direct help? Contact Support with ID</span>
        </a>
      </div>
    </main>
  );
}
