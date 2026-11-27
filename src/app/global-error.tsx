'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg,#ffffff)] text-[var(--text-primary,#202124)] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full rounded-2xl border border-[var(--border,#e8eaed)] bg-[var(--surface,#f8f9fa)] p-8 text-center space-y-4 shadow-xs">
          <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-[var(--text-secondary,#5f6368)]">
            An unexpected error occurred while rendering this page.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 rounded-xl bg-[var(--brand,#4f741b)] text-white text-sm font-semibold cursor-pointer"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl border border-[var(--border,#e8eaed)] bg-[var(--bg,#ffffff)] text-sm font-semibold"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

