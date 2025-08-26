// src/hooks/usePolling.ts
import { useEffect, useRef } from "react";

export type UsePollingOptions = {
  /** Interval in ms while the tab is visible */
  visibleInterval: number;
  /** Interval in ms while the tab is hidden (defaults to visibleInterval) */
  hiddenInterval?: number;
  /** Turn polling on/off (default: true) */
  enabled?: boolean;
  /** Run once immediately on mount/change (default: true) */
  immediate?: boolean;
  /** Extra deps that should restart polling when they change (default: []) */
  deps?: readonly unknown[];
  /** Optional error handler for fetcher failures */
  onError?: (error: unknown) => void;
};

/**
 * Polls the given async/sync callback on an interval, switching cadence based on
 * document visibility. The hook **returns void** and internally catches errors,
 * so it's safe with `@typescript-eslint/no-floating-promises`.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  {
    visibleInterval,
    hiddenInterval = visibleInterval,
    enabled = true,
    immediate = true,
    deps = [],
    onError,
  }: UsePollingOptions,
): void {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!enabled) return;

    let timer: number | undefined;

    const run = () => {
      try {
        const maybe = cbRef.current();
        if (maybe && typeof (maybe as any).then === "function") {
          // Explicitly catch to avoid unhandled rejections
          void (maybe as Promise<void>).catch((err) => {
            if (onErrorRef.current) onErrorRef.current(err);
            else if (process.env.NODE_ENV !== "production") {
              console.error("usePolling fetcher failed:", err);
            }
          });
        }
      } catch (err) {
        if (onErrorRef.current) onErrorRef.current(err);
        else if (process.env.NODE_ENV !== "production") {
          console.error("usePolling fetcher threw:", err);
        }
      }
    };

    const start = () => {
      const hidden =
        typeof document !== "undefined" &&
        document.visibilityState === "hidden";
      const interval = hidden ? hiddenInterval : visibleInterval;
      timer = window.setInterval(run, interval);
    };

    const onVisibility = () => {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
      start();
    };

    if (immediate) run();
    start();

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
      if (timer !== undefined) clearInterval(timer);
    };
    // Re-run when timing flags or deps change
  }, [visibleInterval, hiddenInterval, enabled, immediate, ...deps]);
}
