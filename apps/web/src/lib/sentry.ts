import * as Sentry from '@sentry/react';

/**
 * Initialise the Sentry SDK once at app startup. The DSN is read from the
 * `VITE_SENTRY_DSN` environment variable — never hardcoded. When no DSN is
 * configured (local/dev), initialisation is a graceful no-op so the app still
 * runs without an account.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (dsn === undefined || dsn.length === 0) {
    console.info('[sentry] VITE_SENTRY_DSN not set — Sentry disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    // Portfolio app: capture every transaction. Lower this for real production traffic.
    tracesSampleRate: 1.0,
  });
}
