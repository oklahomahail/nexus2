/**
 * useTrack15Segments Hook
 *
 * Fetches Track15 segment performance data for a campaign
 */

import { useEffect, useState } from "react";

import {
  getSegmentPerformance,
  type SegmentPerformanceData,
} from "@/services/track15Service";

interface UseTrack15SegmentsReturn {
  segments: SegmentPerformanceData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTrack15Segments(
  campaignId: string | null,
): UseTrack15SegmentsReturn {
  const [segments, setSegments] = useState<SegmentPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSegments = async () => {
    if (!campaignId) {
      setSegments([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getSegmentPerformance(campaignId);
      setSegments(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unknown error loading segment performance";
      setError(errorMessage);
      setSegments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchSegments();
  }, [campaignId, fetchSegments]);

  return {
    segments,
    isLoading,
    error,
    refetch: fetchSegments,
  };
}
