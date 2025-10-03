// src/components/ui-kit/ToastContainer.tsx
// Container for toast notifications

import React from "react";
import { createPortal } from "react-dom";

import type { Toast } from "@/types/toast";

import ToastComponent from "./Toast";

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  // Create portal to render toasts outside the main app flow
  const portalRoot = document.getElementById("toast-root") || document.body;

  if (toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      style={{ maxHeight: "calc(100vh - 2rem)" }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>,
    portalRoot,
  );
};

export default ToastContainer;
