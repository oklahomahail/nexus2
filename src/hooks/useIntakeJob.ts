// useIntakeJob Hook
// Real-time subscription to intake job status updates

import { useEffect, useState, useCallback } from "react";

import { clientIntakeService } from "@/services/clientIntakeService";
import type { ClientIntakeJob } from "@/types/clientIntake";

export function useIntakeJob(jobId: string | null) {
  const [job, setJob] = useState<ClientIntakeJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial job data
  const fetchJob = useCallback(async () => {
    if (!jobId) {
      setJob(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedJob = await clientIntakeService.getIntakeJob(jobId);
      if (fetchedJob) {
        setJob(fetchedJob);
      } else {
        setError("Job not found");
      }
    } catch (err) {
      console.error("Error fetching intake job:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch job");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!jobId) return;

    // Initial fetch
    void fetchJob();

    // Set up real-time subscription
    const unsubscribe = clientIntakeService.subscribeToIntakeJob(
      jobId,
      (updatedJob) => {
        console.log("Job updated via realtime:", updatedJob);
        setJob(updatedJob);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [jobId, fetchJob]);

  // Helper computed values
  const isProcessing =
    job?.status === "pending" || job?.status === "processing";
  const isComplete = job?.status === "completed";
  const isFailed = job?.status === "failed";
  const needsReview = job?.status === "review_required";
  const extractedData = job?.extracted_data;

  return {
    job,
    loading,
    error,
    isProcessing,
    isComplete,
    isFailed,
    needsReview,
    extractedData,
    refetch: fetchJob,
  };
}
