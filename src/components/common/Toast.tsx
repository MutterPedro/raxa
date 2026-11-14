/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  message: string;
  duration: number; // 0 = sticky
  action?: ToastAction;
}

interface ToastContextValue {
  notify: (message: string, options?: { duration?: number; action?: ToastAction }) => void;
}

const MAX_VISIBLE = 4;
const DEFAULT_DURATION = 4000;

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

/**
 * Renders a persistent status live region (present before any toast appears,
 * so screen readers announce newcomers) plus the queue itself: newest last,
 * capped at MAX_VISIBLE with oldest evicted, each toast auto-dismissing after
 * its duration unless that duration is 0 (sticky).
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, options?: { duration?: number; action?: ToastAction }) => {
      const duration = options?.duration ?? DEFAULT_DURATION;
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, message, duration, action: options?.action }].slice(-MAX_VISIBLE));
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
    },
    [dismiss],
  );

  // Clear timers of toasts that left the queue (evicted or dismissed).
  useEffect(() => {
    const alive = new Set(toasts.map((t) => t.id));
    for (const [id, timer] of timers.current) {
      if (!alive.has(id)) {
        clearTimeout(timer);
        timers.current.delete(id);
      }
    }
  }, [toasts]);

  // No timer outlives the provider.
  useEffect(() => {
    const map = timers.current;
    return () => {
      for (const timer of map.values()) clearTimeout(timer);
      map.clear();
    };
  }, []);

  // Test-only bridge, same pattern as init.ts's __seedVisualDemo: lets the visual suite
  // render a real toast without a flow that emits one — e.g. the plain variant.
  useEffect(() => {
    window.__notifyToast = notify;
    return () => {
      delete window.__notifyToast;
    };
  }, [notify]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end z-50"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="rounded-[var(--radius-card)] bg-surface-raised text-ink shadow-card px-4 py-3 text-sm border border-line animate-fade-in motion-reduce:animate-none flex items-center justify-between"
          >
            <span>{t.message}</span>
            {t.action && (
              <button
                onClick={() => {
                  dismiss(t.id);
                  t.action?.onClick();
                }}
                className="ml-3 font-semibold text-brand-700 hover:underline dark:text-brand-400"
              >
                {t.action.label}
              </button>
            )}
            <button aria-label="Fechar" onClick={() => dismiss(t.id)} className="ml-2 text-ink-muted">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
