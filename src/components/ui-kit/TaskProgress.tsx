/**
 * TaskProgress Component
 *
 * Shows progress for long-running operations with cancel support
 * Displays determinate or indeterminate progress
 *
 * Based on Inkwell's task progress pattern
 */

import { X } from 'lucide-react';

export interface TaskProgressProps {
  /**
   * Task description shown to user
   */
  label: string;

  /**
   * Progress value (0-100) or undefined for indeterminate
   */
  progress?: number;

  /**
   * Whether the task can be cancelled
   */
  cancellable?: boolean;

  /**
   * Cancel callback
   */
  onCancel?: () => void;

  /**
   * Additional status message
   */
  status?: string;

  /**
   * Visual variant
   */
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function TaskProgress({
  label,
  progress,
  cancellable = false,
  onCancel,
  status,
  variant = 'default',
}: TaskProgressProps) {
  const isDeterminate = typeof progress === 'number';

  const variantStyles = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const bgColor = variantStyles[variant];

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900 dark:text-white">{label}</span>
        {cancellable && onCancel && (
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Cancel task"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {isDeterminate ? (
          // Determinate progress
          <div
            className={`absolute inset-y-0 left-0 ${bgColor} transition-all duration-300 ease-out`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        ) : (
          // Indeterminate progress
          <div
            className={`absolute inset-y-0 w-1/3 ${bgColor} animate-progress-indeterminate`}
            role="progressbar"
            aria-label="Loading"
          />
        )}
      </div>

      {/* Status Text */}
      {(status || isDeterminate) && (
        <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{status}</span>
          {isDeterminate && <span>{Math.round(progress)}%</span>}
        </div>
      )}

      {/* Add animation styles */}
      <style>{`
        @keyframes progress-indeterminate {
          0% { left: -33.33%; }
          100% { left: 100%; }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Compact inline variant for smaller spaces
 */
export function TaskProgressInline({
  label,
  progress,
  cancellable = false,
  onCancel,
}: Omit<TaskProgressProps, 'status' | 'variant'>) {
  const isDeterminate = typeof progress === 'number';

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>

      <div className="flex-1 relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {isDeterminate ? (
          <div
            className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        ) : (
          <div className="absolute inset-y-0 w-1/3 bg-blue-500 animate-progress-indeterminate" />
        )}
      </div>

      {isDeterminate && (
        <span className="text-xs text-gray-600 dark:text-gray-400 w-10 text-right">
          {Math.round(progress)}%
        </span>
      )}

      {cancellable && onCancel && (
        <button
          onClick={onCancel}
          className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          aria-label="Cancel"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
