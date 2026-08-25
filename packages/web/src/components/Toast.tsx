import { useState, useEffect } from 'react';
import { setToastCallback } from '../utils/toast';
import type { ToastType } from '../utils/toast';
import '../styles/toast.css';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: () => void;
  actionLabel?: string;
}

export default function Toast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    setToastCallback((message, type, options) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newToast: Toast = { id, message, type, ...options };

      setToasts(prev => [...prev, newToast]);

      const duration = options?.duration ?? 3000;
      const timer = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);

      return () => clearTimeout(timer);
    });
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            <span className="toast-message">{toast.message}</span>
            {toast.action && (
              <button className="toast-action" onClick={() => {
                toast.action?.();
                removeToast(toast.id);
              }}>
                {toast.actionLabel || 'Undo'}
              </button>
            )}
          </div>
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
