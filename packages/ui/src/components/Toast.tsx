type ToastVariant = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
}

type VariantConfig = {
  borderClassName: string;
  dotClassName: string;
};

const VARIANT_CONFIG: Record<ToastVariant, VariantConfig> = {
  success: {
    borderClassName: 'border-green-500/30',
    dotClassName: 'bg-green-400',
  },
  error: {
    borderClassName: 'border-red-500/30',
    dotClassName: 'bg-red-400',
  },
  info: {
    borderClassName: 'border-blue-500/30',
    dotClassName: 'bg-blue-400',
  },
};

export function Toast({ message, variant = 'info', onDismiss }: ToastProps): JSX.Element {
  const config = VARIANT_CONFIG[variant];
  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center gap-2 rounded-lg border bg-surface-elevated px-3 py-2 shadow-lg motion-safe:animate-toast-in ${config.borderClassName}`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${config.dotClassName}`} />
      <p className="flex-1 text-xs text-primary">{message}</p>
      {onDismiss !== undefined && (
        <button
          type="button"
          aria-label="Dismiss notification"
          className="text-xs text-subtle hover:text-primary"
          onClick={onDismiss}
        >
          ×
        </button>
      )}
    </div>
  );
}
