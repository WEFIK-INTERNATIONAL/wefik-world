'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { classifyAuthError } from '@/lib/auth/error-mapper';
import { sanitizeNextPath } from '@/lib/auth/redirects';

function CallbackErrorInspector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const cid = searchParams.get('cid') || '';
    const safeNext = sanitizeNextPath(
      searchParams.get('next'),
      typeof window !== 'undefined' ? window.location.origin : undefined
    );
    const queryError = searchParams.get('error');

    let hashError: string | null = null;
    let hashErrorCode: string | null = null;
    let hashErrorDesc: string | null = null;

    if (typeof window !== 'undefined' && window.location.hash) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        hashError = hashParams.get('error');
        hashErrorCode = hashParams.get('error_code');
        hashErrorDesc = hashParams.get('error_description');
        // Clear hash immediately so tokens/fragments are never retained in history
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {
        // Ignore malformed hash
      }
    }

    const mapped = classifyAuthError({
      error: hashError || queryError,
      errorCode: hashErrorCode,
      errorDescription: hashErrorDesc,
    });

    const params = new URLSearchParams();
    params.set('error', mapped);
    if (cid) params.set('cid', cid);
    params.set('next', safeNext);

    router.replace(`/login?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text-secondary)] text-sm">
      Completing sign-in...
    </div>
  );
}

export default function AuthCallbackErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text-secondary)] text-sm">
          Completing sign-in...
        </div>
      }
    >
      <CallbackErrorInspector />
    </Suspense>
  );
}
