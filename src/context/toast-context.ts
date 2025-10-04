// src/context/toast-context.ts - Toast context definition

import { createContext } from "react";

import type { Toast } from "@/types/toast";

export interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Convenience methods
  success: (
    title: string,
    description?: string,
    options?: Partial<Toast>,
  ) => string;
  error: (
    title: string,
    description?: string,
    options?: Partial<Toast>,
  ) => string;
  warning: (
    title: string,
    description?: string,
    options?: Partial<Toast>,
  ) => string;
  info: (
    title: string,
    description?: string,
    options?: Partial<Toast>,
  ) => string;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined,
);
