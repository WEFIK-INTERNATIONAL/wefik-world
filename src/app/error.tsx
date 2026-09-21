'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Capture to Sentry
    Sentry.captureException(error);
    console.error('App runtime error captured by Sentry:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-error bg-error/10 px-3 py-1 rounded-full border border-error/20 mb-4">
        Something went wrong
      </span>
      <h1 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight mb-3">
        An unexpected error occurred
      </h1>
      <p className="text-slate max-w-md text-sm mb-8">
        We&apos;ve logged the error to Sentry and our engineering team is alerted.
        Please try refreshing the page or try again in a few moments.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-xl bg-ink text-white font-medium hover:bg-black transition-colors"
        >
          Try Again
        </button>
        <a
          href="/"
          className="px-6 py-3 rounded-xl bg-surface border border-border text-ink font-medium hover:bg-slate-100 transition-colors"
        >
          Return Home
        </a>
      </div>
    </main>
  );
}
