'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog } from '@/lib/posthog';
import posthog from 'posthog-js';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);

  // Defer PostHog initialization until first user interaction or idle timeout
  useEffect(() => {
    const start = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;
      initPostHog();
      if (pathname) {
        const qs = searchParams?.toString();
        posthog.capture('$pageview', {
          $current_url: `${window.origin}${pathname}${qs ? `?${qs}` : ''}`,
        });
      }
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      window.removeEventListener('scroll', start);
    };

    window.addEventListener('pointerdown', start, { once: true, passive: true });
    window.addEventListener('keydown', start, { once: true, passive: true });
    window.addEventListener('scroll', start, { once: true, passive: true });
    const timer = window.setTimeout(start, 3500);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      window.removeEventListener('scroll', start);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!initializedRef.current || !pathname) return;
    const qs = searchParams?.toString();
    posthog.capture('$pageview', {
      $current_url: `${window.origin}${pathname}${qs ? `?${qs}` : ''}`,
    });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}
