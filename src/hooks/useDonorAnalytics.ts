// src/hooks/useDonorAnalytics.ts
import { useCallback, useEffect, useMemo, useState } from "react";

import { useClient } from "@/context/ClientContext";
import type { BehavioralSegment } from "@/models/donorAnalytics";
import * as donorAnalyticsService from "@/services/donorAnalyticsService";

export function useDonorAnalytics() {
  const { currentClient } = useClient();
  const clientId = currentClient?.id;

  const [segments, setSegments] = useState<BehavioralSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load segment analytics
  const loadSegmentAnalytics = useCallback(async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    try {
      const response =
        await donorAnalyticsService.getSegmentAnalytics(clientId);
      setSegments(response.segments);
    } catch (err) {
      console.error("Donor analytics load failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load donor segments",
      );
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Get campaign insights
  const getCampaignInsights = useCallback(
    async (campaignId: string) => {
      if (!clientId) throw new Error("No client selected");
      return donorAnalyticsService.getCampaignInsights(clientId, campaignId);
    },
    [clientId],
  );

  // Get engagement trends
  const getEngagementTrends = useCallback(
    async (params: {
      startDate: string;
      endDate: string;
      granularity: "daily" | "weekly" | "monthly" | "quarterly";
      segmentId?: string;
    }) => {
      if (!clientId) throw new Error("No client selected");
      return donorAnalyticsService.getEngagementTrends(clientId, params);
    },
    [clientId],
  );

  // Create new segment
  const createSegment = useCallback(
    async (
      segmentData: Omit<
        BehavioralSegment,
        "segmentId" | "donorCount" | "lastUpdated"
      >,
    ) => {
      if (!clientId) throw new Error("No client selected");

      setLoading(true);
      try {
        const newSegment = await donorAnalyticsService.createSegment(
          clientId,
          segmentData,
        );
        setSegments((prev) => [...prev, newSegment]);
        return newSegment;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create segment",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clientId],
  );

  // Get targeting recommendations
  const getTargetingRecommendations = useCallback(
    async (campaignData: {
      campaign_type: string;
      target_audience_size?: number;
      preferred_channels?: string[];
      goals: ("retention" | "acquisition" | "engagement" | "reactivation")[];
    }) => {
      if (!clientId) throw new Error("No client selected");
      return donorAnalyticsService.getCampaignTargetingRecommendations(
        clientId,
        campaignData,
      );
    },
    [clientId],
  );

  // Initial load (fire-and-forget, errors handled inside)
  useEffect(() => {
    void loadSegmentAnalytics();
  }, [loadSegmentAnalytics]);

  // Privacy compliance helper
  const isPrivacyCompliant = useCallback((data: unknown) => {
    return donorAnalyticsService.PrivacyUtils.validatePrivacyCompliance(data);
  }, []);

  // Computed
  const totalDonorCount = useMemo(
    () => segments.reduce((sum, s) => sum + s.donorCount, 0),
    [segments],
  );

  const activeSegmentCount = useMemo(
    () => segments.filter((s) => s.isActive).length,
    [segments],
  );

  return {
    // State
    segments,
    loading,
    error,

    // Actions
    loadSegmentAnalytics,
    getCampaignInsights,
    getEngagementTrends,
    createSegment,
    getTargetingRecommendations,

    // Utilities
    isPrivacyCompliant,

    // Computed values
    totalDonorCount,
    activeSegmentCount,
  };
}
