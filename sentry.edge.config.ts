import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    debug: false,
  });
} else if (process.env.NODE_ENV === 'development') {
  console.warn('[sentry] SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN is not set; edge error tracking is disabled.');
}
