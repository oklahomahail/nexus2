/**
 * useTrack15Retention Hook
 *
 * Fetches retention series data for Track15 campaigns
 */

import { useEffect, useState, useCallback } from "react";

import { getRetentionSeries } from "@/services/track15Service";
import { Track15RetentionSeries } from "@/types/track15.types";

interface UseTrack15RetentionReturn {
  data: Track15RetentionSeries | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTrack15Retention(
  campaignId: string | null,
): UseTrack15RetentionReturn {
  const [data, setData] = useState<Track15RetentionSeries | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRetention = useCallback(async () => {
    if (!campaignId) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const series = await getRetentionSeries(campaignId);
      setData(series);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unknown error loading retention data";
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    void fetchRetention();
  }, [campaignId, fetchRetention]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRetention,
  };
}
