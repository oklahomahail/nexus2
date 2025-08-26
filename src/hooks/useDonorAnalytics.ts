// src/hooks/useDonorAnalytics.ts

import { useState, useEffect, useCallback } from "react";

import { useClient } from "@/context/ClientContext";
import { BehavioralSegment } from "@/models/donorAnalytics";
import * as donorAnalyticsService from "@/services/donorAnalyticsService";

export function useDonorAnalytics() {
  const { currentClient } = useClient();
  const [segments, setSegments] = useState<BehavioralSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load segment analytics
  const loadSegmentAnalytics = useCallback(async () => {
    if (!currentClient?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await donorAnalyticsService.getSegmentAnalytics(
        currentClient.id,
      );
      setSegments(response.segments);
    } catch (err) {
      setError("Failed to load donor segments");
      console.error("Donor analytics error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentClient?.id]);

  // Get campaign insights
  const getCampaignInsights = useCallback(
    async (campaignId: string) => {
      if (!currentClient?.id) throw new Error("No client selected");

      return await donorAnalyticsService.getCampaignInsights(
        currentClient.id,
        campaignId,
      );
    },
    [currentClient?.id],
  );

  // Get engagement trends
  const getEngagementTrends = useCallback(
    async (params: {
      startDate: string;
      endDate: string;
      granularity: "daily" | "weekly" | "monthly" | "quarterly";
      segmentId?: string;
    }) => {
      if (!currentClient?.id) throw new Error("No client selected");

      return await donorAnalyticsService.getEngagementTrends(
        currentClient.id,
        params,
      );
    },
    [currentClient?.id],
  );

  // Create new segment
  const createSegment = useCallback(
    async (
      segmentData: Omit<
        BehavioralSegment,
        "segmentId" | "donorCount" | "lastUpdated"
      >,
    ) => {
      if (!currentClient?.id) throw new Error("No client selected");

      setLoading(true);
      try {
        const newSegment = await donorAnalyticsService.createSegment(
          currentClient.id,
          segmentData,
        );
        setSegments((prev) => [...prev, newSegment]);
        return newSegment;
      } catch (err) {
        setError("Failed to create segment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentClient?.id],
  );

  // Get targeting recommendations
  const getTargetingRecommendations = useCallback(
    async (campaignData: {
      campaign_type: string;
      target_audience_size?: number;
      preferred_channels?: string[];
      goals: ("retention" | "acquisition" | "engagement" | "reactivation")[];
    }) => {
      if (!currentClient?.id) throw new Error("No client selected");

      return await donorAnalyticsService.getCampaignTargetingRecommendations(
        currentClient.id,
        campaignData,
      );
    },
    [currentClient?.id],
  );

  // Load initial data
  useEffect(() => {
    loadSegmentAnalytics();
  }, [loadSegmentAnalytics]);

  // Privacy compliance helper
  const isPrivacyCompliant = useCallback((data: any) => {
    return donorAnalyticsService.PrivacyUtils.validatePrivacyCompliance(data);
  }, []);

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
    totalDonorCount: segments.reduce(
      (sum, segment) => sum + segment.donorCount,
      0,
    ),
    activeSegmentCount: segments.filter((s) => s.isActive).length,
  };
}
