import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const TOAST_EVENT = 'app-express-toast';

export const toast = {
  success: (message: string, duration = 4000) => {
    dispatchToast({ type: 'success', message, duration });
  },
  error: (message: string, duration = 5000) => {
    dispatchToast({ type: 'error', message, duration });
  },
  warning: (message: string, duration = 4500) => {
    dispatchToast({ type: 'warning', message, duration });
  },
  info: (message: string, duration = 4000) => {
    dispatchToast({ type: 'info', message, duration });
  },
};

function dispatchToast(data: Omit<ToastItem, 'id'>) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(TOAST_EVENT, {
      detail: { ...data, id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` },
    });
    window.dispatchEvent(event);
  }
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastItem>;
      if (!customEvent.detail) return;
      const newToast = customEvent.detail;

      setToasts((prev) => [...prev, newToast]);

      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration || 4500);

      return () => clearTimeout(timer);
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[99999] space-y-2 pointer-events-none">
      {toasts.map((t) => {
        const isError = t.type === 'error';
        const isSuccess = t.type === 'success';
        const isWarning = t.type === 'warning';

        return (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-top-3 fade-in duration-200 ${
              isError
                ? 'bg-rose-50/95 dark:bg-[#1E1215]/95 border-rose-300 dark:border-rose-900/60 text-rose-950 dark:text-rose-100'
                : isSuccess
                ? 'bg-emerald-50/95 dark:bg-[#0E1F18]/95 border-emerald-300 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-100'
                : isWarning
                ? 'bg-amber-50/95 dark:bg-[#20180B]/95 border-amber-300 dark:border-amber-900/60 text-amber-950 dark:text-amber-100'
                : 'bg-slate-50/95 dark:bg-[#151D2A]/95 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isError && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              {!isError && !isSuccess && !isWarning && <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
            </div>

            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {t.message}
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
