/**
 * useTrack15Metrics Hook
 *
 * Fetches Track15 lift metrics for a campaign
 */

import { useEffect, useState, useCallback } from "react";

import { getLiftMetrics } from "@/services/track15Service";
import { Track15LiftMetrics } from "@/types/track15.types";

interface UseTrack15MetricsReturn {
  metrics: Track15LiftMetrics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTrack15Metrics(
  campaignId: string | null,
): UseTrack15MetricsReturn {
  const [metrics, setMetrics] = useState<Track15LiftMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!campaignId) {
      setMetrics(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getLiftMetrics(campaignId);
      setMetrics(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unknown error loading lift metrics";
      setError(errorMessage);
      setMetrics(null);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    void fetchMetrics();
  }, [campaignId, fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics,
  };
}
