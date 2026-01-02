import { ref, readonly } from 'vue';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  timeout: number;
  closable: boolean;
}

export interface ToastOptions {
  timeout?: number;
  closable?: boolean;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

const DEFAULT_TIMEOUTS: Record<ToastType, number> = {
  success: 2500,
  error: 4000,
  info: 3000,
};

function addToast(
  message: string,
  type: ToastType,
  options: ToastOptions = {},
) {
  const id = nextId++;
  const timeout = options.timeout ?? DEFAULT_TIMEOUTS[type];
  const closable = options.closable ?? type === 'error';

  const toast: Toast = {
    id,
    message,
    type,
    timeout,
    closable,
  };

  toasts.value.push(toast);

  if (timeout > 0) {
    setTimeout(() => {
      removeToast(id);
    }, timeout);
  }

  return id;
}

function removeToast(id: number) {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
}

export function useToast() {
  const success = (message: string, options?: ToastOptions) =>
    addToast(message, 'success', options);

  const error = (message: string, options?: ToastOptions) =>
    addToast(message, 'error', options);

  const info = (message: string, options?: ToastOptions) =>
    addToast(message, 'info', options);

  return {
    toasts: readonly(toasts),
    success,
    error,
    info,
    remove: removeToast,
  };
}
