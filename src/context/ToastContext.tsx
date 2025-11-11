// src/context/ToastContext.tsx
// Context for managing toast notifications

import React, { createContext, useState, useCallback, type ReactNode } from "react";

import ToastContainer from "@/components/ui-kit/ToastContainer";
import type { Toast } from "@/types/toast";

export interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, description?: string, options?: Partial<Toast>) => string;
  error: (title: string, description?: string, options?: Partial<Toast>) => string;
  warning: (title: string, description?: string, options?: Partial<Toast>) => string;
  info: (title: string, description?: string, options?: Partial<Toast>) => string;
  promise: <T>(
    fn: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    }
  ) => Promise<T>;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = generateId();
      const newToast: Toast = {
        id,
        duration: 5000, // Default 5 seconds
        ...toast,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    [generateId],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) => {
      return addToast({
        type: "success",
        title,
        description,
        ...options,
      });
    },
    [addToast],
  );

  const error = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) => {
      return addToast({
        type: "error",
        title,
        description,
        duration: 0, // Don't auto-dismiss errors by default
        ...options,
      });
    },
    [addToast],
  );

  const warning = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) => {
      return addToast({
        type: "warning",
        title,
        description,
        ...options,
      });
    },
    [addToast],
  );

  const info = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) => {
      return addToast({
        type: "info",
        title,
        description,
        ...options,
      });
    },
    [addToast],
  );

  // Promise-aware toast for async operations
  const promise = useCallback(
    async <T,>(
      fn: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((err: any) => string);
      }
    ): Promise<T> => {
      const loadingId = addToast({
        type: "info",
        title: messages.loading,
        duration: 0, // Don't auto-dismiss loading
      });

      try {
        const result = await fn;
        removeToast(loadingId);

        const successMsg =
          typeof messages.success === "function"
            ? messages.success(result)
            : messages.success;
        success(successMsg);

        return result;
      } catch (err) {
        removeToast(loadingId);

        const errorMsg =
          typeof messages.error === "function" ? messages.error(err) : messages.error;
        error(errorMsg);

        throw err;
      }
    },
    [addToast, removeToast, success, error],
  );

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    promise,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// useToast hook moved to @/hooks/useToast.ts to fix Fast Refresh warnings
