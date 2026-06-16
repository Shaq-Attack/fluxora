import { onCLS, onINP, onLCP } from 'web-vitals';
import { reportWebVital } from './metrics';

/**
 * Subscribe to Core Web Vitals and forward each sample to Sentry.
 *
 * Note: the ticket lists FID, but `web-vitals` v5 removed `onFID` in favour of
 * INP (Interaction to Next Paint), its official successor metric. We report
 * CLS, LCP, and INP.
 */
export function startWebVitals(): void {
  onCLS((metric) => reportWebVital('CLS', metric.value));
  onLCP((metric) => reportWebVital('LCP', metric.value));
  onINP((metric) => reportWebVital('INP', metric.value));
}
