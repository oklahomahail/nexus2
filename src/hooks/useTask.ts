/**
 * useTask Hook
 *
 * Manages long-running async tasks with progress tracking and cancellation
 * Uses AbortController for clean cancellation
 *
 * Based on Inkwell's task management pattern
 */

import { useState, useCallback, useRef, useEffect } from "react";

export interface TaskState<T = unknown> {
  /** Whether task is currently running */
  isRunning: boolean;

  /** Progress value (0-100) or undefined for indeterminate */
  progress?: number;

  /** Task result (when completed successfully) */
  result?: T;

  /** Error (when task failed) */
  error?: Error;

  /** Current status message */
  status?: string;
}

export interface TaskControl {
  /** Cancel the running task */
  cancel: () => void;

  /** Whether the task was cancelled */
  wasCancelled: boolean;
}

export interface UseTaskOptions {
  /** Initial status message */
  initialStatus?: string;

  /** Callback when task completes */
  onComplete?: () => void;

  /** Callback when task fails */
  onError?: (error: Error) => void;

  /** Callback when task is cancelled */
  onCancel?: () => void;
}

/**
 * Hook for managing cancellable async tasks
 *
 * @example
 * const { state, run, cancel } = useTask();
 *
 * const importCorpus = async (signal: AbortSignal) => {
 *   for (let i = 0; i < files.length; i++) {
 *     if (signal.aborted) throw new Error('Cancelled');
 *     await processFile(files[i]);
 *     run.updateProgress((i / files.length) * 100);
 *   }
 * };
 *
 * <button onClick={() => run(importCorpus)}>Import</button>
 * {state.isRunning && <TaskProgress {...state} onCancel={cancel} />}
 */
export function useTask<T = unknown>(options: UseTaskOptions = {}) {
  const { initialStatus, onComplete, onError, onCancel } = options;

  const [state, setState] = useState<TaskState<T>>({
    isRunning: false,
    progress: undefined,
    result: undefined,
    error: undefined,
    status: initialStatus,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const wasCancelledRef = useRef(false);

  /**
   * Update progress during task execution
   */
  const updateProgress = useCallback((progress: number, status?: string) => {
    setState((prev) => ({
      ...prev,
      progress,
      status: status ?? prev.status,
    }));
  }, []);

  /**
   * Update status message during task execution
   */
  const updateStatus = useCallback((status: string) => {
    setState((prev) => ({
      ...prev,
      status,
    }));
  }, []);

  /**
   * Run an async task with cancellation support
   *
   * @param task - Async function that receives AbortSignal and task controls
   */
  const run = useCallback(
    async (
      task: (
        signal: AbortSignal,
        controls: {
          updateProgress: typeof updateProgress;
          updateStatus: typeof updateStatus;
        },
      ) => Promise<T>,
    ) => {
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      wasCancelledRef.current = false;

      setState({
        isRunning: true,
        progress: undefined,
        result: undefined,
        error: undefined,
        status: initialStatus,
      });

      try {
        const result = await task(abortControllerRef.current.signal, {
          updateProgress,
          updateStatus,
        });

        // Only update state if not cancelled
        if (!wasCancelledRef.current) {
          setState({
            isRunning: false,
            progress: 100,
            result,
            error: undefined,
            status: "Completed",
          });
          onComplete?.();
        }

        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error");

        // Check if error is due to cancellation
        if (err.name === "AbortError" || err.message === "Cancelled") {
          setState({
            isRunning: false,
            progress: undefined,
            result: undefined,
            error: undefined,
            status: "Cancelled",
          });
          onCancel?.();
        } else {
          setState({
            isRunning: false,
            progress: undefined,
            result: undefined,
            error: err,
            status: "Failed",
          });
          onError?.(err);
        }

        throw error;
      }
    },
    [
      updateProgress,
      updateStatus,
      initialStatus,
      onComplete,
      onError,
      onCancel,
    ],
  );

  /**
   * Cancel the running task
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      wasCancelledRef.current = true;
      abortControllerRef.current.abort();
      setState((prev) => ({
        ...prev,
        isRunning: false,
        status: "Cancelled",
      }));
      onCancel?.();
    }
  }, [onCancel]);

  /**
   * Reset task state
   */
  const reset = useCallback(() => {
    setState({
      isRunning: false,
      progress: undefined,
      result: undefined,
      error: undefined,
      status: initialStatus,
    });
    wasCancelledRef.current = false;
    abortControllerRef.current = null;
  }, [initialStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    state,
    run,
    cancel,
    reset,
    updateProgress,
    updateStatus,
    wasCancelled: wasCancelledRef.current,
  };
}

/**
 * Simpler version for tasks that don't need progress tracking
 *
 * @example
 * const { isRunning, error, run, cancel } = useSimpleTask({
 *   onComplete: () => toast.success('Done!'),
 * });
 *
 * const deleteClient = async (signal: AbortSignal) => {
 *   await api.delete(`/clients/${id}`, { signal });
 * };
 */
export function useSimpleTask<T = unknown>(options: UseTaskOptions = {}) {
  const { state, run, cancel, reset } = useTask<T>(options);

  return {
    isRunning: state.isRunning,
    result: state.result,
    error: state.error,
    run,
    cancel,
    reset,
  };
}
