import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
}

export interface PushToastParams {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

const TOAST_LIMIT = 4;
const DEFAULT_DURATION_MS = 4000;

interface ToastState {
  toasts: ToastItem[];
  pushToast: (params: PushToastParams) => string;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  pushToast: ({ message, variant = 'info', durationMs = DEFAULT_DURATION_MS }) => {
    const id = crypto.randomUUID();
    set((state) => ({
      // Newest last; cap the stack so a burst of events can't flood the screen
      toasts: [...state.toasts, { id, variant, message }].slice(-TOAST_LIMIT),
    }));
    setTimeout(() => get().dismissToast(id), durationMs);
    return id;
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

/** Imperative helper for pushing a toast from outside React components. */
export function pushToast(params: PushToastParams): string {
  return useToastStore.getState().pushToast(params);
}
