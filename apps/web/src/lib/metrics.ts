import * as Sentry from '@sentry/react';

/**
 * Central metrics reporter. The rest of the app reports custom measurements
 * through these helpers so that only this module depends on `@sentry/react`.
 */

/** Record a WebSocket ping→pong round-trip time as a custom measurement (ms). */
export function reportWsLatency(ms: number): void {
  Sentry.startSpan({ name: 'ws.ping-pong', op: 'ws.latency' }, (span) => {
    span.setAttribute('ws_latency_ms', ms);
    Sentry.setMeasurement('ws_latency', ms, 'millisecond', span);
  });
}

/** Report a single Web Vital sample to Sentry Performance as a custom measurement. */
export function reportWebVital(name: string, value: number): void {
  Sentry.startSpan({ name: `web-vital.${name}`, op: 'web.vital' }, (span) => {
    // CLS is unitless; the other vitals are durations in milliseconds.
    Sentry.setMeasurement(name, value, name === 'CLS' ? 'none' : 'millisecond', span);
  });
}
