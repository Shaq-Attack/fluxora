import { Toast } from '@fluxora/ui';
import { useToastStore } from '../store/toastStore';

/** Fixed bottom-right stack of transient notifications. Sits above fullscreen panels (z-50). */
export function ToastViewport(): JSX.Element | null {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </div>
  );
}
