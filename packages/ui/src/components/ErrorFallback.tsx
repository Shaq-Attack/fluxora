interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorFallback({
  title = 'Something went wrong',
  message = 'This panel failed to render.',
  onRetry,
}: ErrorFallbackProps): JSX.Element {
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-border bg-surface-elevated p-4">
      <h2 className="text-sm font-semibold text-primary">{title}</h2>
      <p className="text-xs text-dim">{message}</p>
      {onRetry !== undefined && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded bg-surface-strong px-2 py-1 text-xs text-muted transition-colors hover:text-primary"
        >
          Retry
        </button>
      )}
    </div>
  );
}
