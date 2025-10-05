import { clsx } from 'clsx';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useCallback, ReactNode, useState } from 'react';

import { ToastContext, type Toast, type ToastType, type ToastContextType } from '../../contexts/ToastContext';

// Toast Provider Component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration (default 3 seconds)
    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-96">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// Individual Toast Component
interface ToastItemProps {
  toast: Toast;
  onRemove: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[toast.type];

  const variants = {
    success: 'bg-green-500/10 border-green-500/20 text-green-400',
    error: 'bg-error/10 border-error/20 text-error',
    warning: 'bg-warn/10 border-warn/20 text-warn',
    info: 'bg-accent/10 border-accent/20 text-accent',
  };

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm transition-all duration-200',
        'bg-panel/90 border-border shadow-md',
        'animate-slide-up'
      )}
    >
      <Icon className={clsx('h-5 w-5 flex-shrink-0 mt-0.5', variants[toast.type])} />
      
      <div className="flex-1 min-w-0">
        <div className="text-body font-medium text-text">{toast.title}</div>
        {toast.message && (
          <div className="text-body-sm text-muted mt-1">{toast.message}</div>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-body-sm text-accent hover:text-accent-2 mt-2 font-medium"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={onRemove}
        className="flex-shrink-0 text-muted hover:text-text transition-colors p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};


// Re-export types for convenience
export type { Toast, ToastType } from '../../contexts/ToastContext';

export default ToastProvider;
