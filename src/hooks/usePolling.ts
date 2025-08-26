// src/hooks/usePolling.ts
import { useEffect, useRef, useCallback } from "react";

interface UsePollingOptions {
  /** Interval when tab is visible (ms) */
  visibleInterval: number;
  /** Interval when tab is hidden (ms) */
  hiddenInterval: number;
  /** Whether to start polling immediately */
  enabled?: boolean;
}

export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions,
) {
  const { visibleInterval, hiddenInterval, enabled = true } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const isVisibleRef = useRef(true);

  // Update callback ref
  callbackRef.current = callback;

  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (interval: number) => {
      clearCurrentInterval();
      intervalRef.current = setInterval(async () => {
        try {
          await callbackRef.current();
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, interval);
    },
    [clearCurrentInterval],
  );

  const updatePollingInterval = useCallback(() => {
    if (!enabled) return;

    const interval = isVisibleRef.current ? visibleInterval : hiddenInterval;
    startPolling(interval);
  }, [enabled, visibleInterval, hiddenInterval, startPolling]);

  useEffect(() => {
    if (!enabled) {
      clearCurrentInterval();
      return;
    }

    // Handle visibility change
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      updatePollingInterval();
    };

    // Start initial polling
    updatePollingInterval();

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearCurrentInterval();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, updatePollingInterval, clearCurrentInterval]);

  return {
    isVisible: isVisibleRef.current,
    currentInterval: isVisibleRef.current ? visibleInterval : hiddenInterval,
    restart: updatePollingInterval,
    stop: clearCurrentInterval,
  };
}
