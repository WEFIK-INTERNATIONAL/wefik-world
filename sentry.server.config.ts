import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Sample rate for transactions in performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  debug: false,
});
