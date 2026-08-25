export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  action?: () => void;
  actionLabel?: string;
}

let toastCallback: ((message: string, type: ToastType, options?: ToastOptions) => void) | null = null;

export function setToastCallback(callback: (message: string, type: ToastType, options?: ToastOptions) => void) {
  toastCallback = callback;
}

export function showToast(message: string, type: ToastType = 'info', options?: ToastOptions) {
  if (toastCallback) {
    toastCallback(message, type, options);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

export function success(message: string, options?: ToastOptions) {
  showToast(message, 'success', options);
}

export function error(message: string, options?: ToastOptions) {
  showToast(message, 'error', options);
}

export function info(message: string, options?: ToastOptions) {
  showToast(message, 'info', options);
}

export function warning(message: string, options?: ToastOptions) {
  showToast(message, 'warning', options);
}
