/**
 * useDataQuality Hook
 *
 * Provides data quality metrics and refresh functionality for a client
 */

import { useEffect, useState } from "react";

import {
  type DataQualityScore,
  type DuplicateDonor,
  type MissingField,
  type Outlier,
  getDataQualityMetrics,
} from "@/services/dataQuality";

interface DataQualityMetrics {
  score: DataQualityScore;
  duplicates: DuplicateDonor[];
  missingFields: MissingField[];
  outliers: Outlier[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
  };
}

interface UseDataQualityResult {
  metrics: DataQualityMetrics | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useDataQuality(clientId: string): UseDataQualityResult {
  const [metrics, setMetrics] = useState<DataQualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDataQualityMetrics(clientId);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      console.error("Error fetching data quality metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      void fetchMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return {
    metrics,
    loading,
    error,
    refresh: fetchMetrics,
  };
}
