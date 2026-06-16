import * as Sentry from '@sentry/react';
import type { ReactNode } from 'react';
import { ErrorFallback } from '@fluxora/ui';

interface PanelErrorBoundaryProps {
  name: string;
  children: ReactNode;
}

/**
 * Wraps a panel in a Sentry error boundary. A render crash in one panel is
 * captured and reported to Sentry, and a local fallback with a retry action is
 * shown without taking down the rest of the dashboard.
 */
export function PanelErrorBoundary({ name, children }: PanelErrorBoundaryProps): JSX.Element {
  return (
    <Sentry.ErrorBoundary
      fallback={(errorData) => (
        <ErrorFallback
          message={`The ${name} panel failed to render.`}
          onRetry={() => errorData.resetError()}
        />
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
