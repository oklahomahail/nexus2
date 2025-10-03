// src/hooks/useNotifications.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { POLLING } from "@/config/runtime";
import { usePolling } from "@/hooks/usePolling";
import type { NotificationDTO } from "@/services/notificationService";
import { fetchNotifications } from "@/services/notificationService";

type ISO8601 = string;

// Guard for any possible timestamp type we might get from DTOs.
const toMillis = (t: string | number | Date) => new Date(t).getTime();
const toIso = (t: string | number | Date): ISO8601 => new Date(t).toISOString();

export function useNotifications() {
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Cursor for incremental fetches; undefined until first load completes.
  const sinceRef = useRef<ISO8601 | undefined>(undefined);

  // Use functional state updates inside `load` so it has NO deps (no stale or TS complaints).
  const load = useCallback(async () => {
    try {
      setError(null);

      const data = await fetchNotifications(sinceRef.current);

      if (data.length > 0) {
        setItems((prev) => {
          // Dedup by id (newest payload wins)
          const map = new Map<string, NotificationDTO>();
          // Put incoming first so it overwrites any prev dupes
          [...data, ...prev].forEach((n) => map.set(n.id, n));

          const merged = [...map.values()].sort(
            (a, b) => toMillis(b.timestamp) - toMillis(a.timestamp),
          );

          // Advance cursor to newest known item
          sinceRef.current = toIso(merged[0].timestamp);
          return merged;
        });
      } else if (!sinceRef.current) {
        // Establish a baseline cursor so future polls ask for deltas
        sinceRef.current = toIso(Date.now());
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    void load();
  }, [load]);

  // Polling (tab-aware cadence)
  usePolling(load, {
    visibleInterval: POLLING.notifications.visibleMs,
    hiddenInterval: POLLING.notifications.hiddenMs,
    enabled: true,
    immediate: false,
    // keep this primitive to avoid unnecessary restarts
    deps: [items.length],
    onError: (e: unknown) =>
      setError(e instanceof Error ? e : new Error("Unknown error")),
  });

  const markAsRead = useCallback(
    (id: string) =>
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      ),
    [],
  );

  const markAllAsRead = useCallback(
    () => setItems((prev) => prev.map((n) => ({ ...n, read: true }))),
    [],
  );

  return useMemo(
    () => ({ items, loading, error, reload: load, markAsRead, markAllAsRead }),
    [items, loading, error, load, markAsRead, markAllAsRead],
  );
}
