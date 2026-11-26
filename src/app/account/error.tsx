'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Account Error]', error);
  }, [error]);

  return (
    <div className="bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] text-center space-y-4">
      <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center mx-auto">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h2 className="text-lg font-bold text-[var(--text)]">Unable to load account details</h2>
      <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
        Something went wrong while loading your account data. Please try again.
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Button onClick={reset} size="sm" className="rounded-xl text-xs">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
          <Link href="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    </div>
  );
}

