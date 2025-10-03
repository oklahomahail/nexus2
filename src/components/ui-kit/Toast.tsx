// src/components/ui-kit/Toast.tsx
// Toast notification component

import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";

import type { Toast } from "@/types/toast";

interface ToastComponentProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, handleRemove]);

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300); // Wait for exit animation
  }, [onRemove, toast.id]);

  const getIcon = () => {
    const iconClass = "w-5 h-5";
    switch (toast.type) {
      case "success":
        return <CheckCircle className={`${iconClass} text-green-400`} />;
      case "error":
        return <XCircle className={`${iconClass} text-red-400`} />;
      case "warning":
        return <AlertCircle className={`${iconClass} text-yellow-400`} />;
      case "info":
        return <Info className={`${iconClass} text-blue-400`} />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-900/20 border-green-800/50";
      case "error":
        return "bg-red-900/20 border-red-800/50";
      case "warning":
        return "bg-yellow-900/20 border-yellow-800/50";
      case "info":
        return "bg-blue-900/20 border-blue-800/50";
    }
  };

  const getTitleColor = () => {
    switch (toast.type) {
      case "success":
        return "text-green-300";
      case "error":
        return "text-red-300";
      case "warning":
        return "text-yellow-300";
      case "info":
        return "text-blue-300";
    }
  };

  const getDescriptionColor = () => {
    switch (toast.type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
    }
  };

  const transformClass =
    isVisible && !isExiting
      ? "translate-x-0 opacity-100"
      : isExiting
        ? "translate-x-full opacity-0"
        : "translate-x-full opacity-0";

  return (
    <div
      className={`
        max-w-md w-full ${getBackgroundColor()} border rounded-lg shadow-lg backdrop-blur-sm
        transform transition-all duration-300 ease-in-out
        ${transformClass}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>

          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${getTitleColor()}`}>
              {toast.title}
            </p>
            {toast.description && (
              <p className={`mt-1 text-sm ${getDescriptionColor()}`}>
                {toast.description}
              </p>
            )}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className={`mt-2 text-sm font-medium underline ${getTitleColor()} hover:no-underline`}
              >
                {toast.action.label}
              </button>
            )}
          </div>

          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleRemove}
              className="inline-flex text-slate-400 hover:text-white focus:outline-none transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastComponent;
