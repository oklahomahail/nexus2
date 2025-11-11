// src/services/donorAnalyticsService.ts

/**
 * Privacy-First Donor Analytics API Service
 * All endpoints return aggregated, anonymized data only
 */

import {
  BehavioralSegment,
  DonorCohort,
  PredictiveScoring,
  SegmentAnalyticsResponse,
  CampaignInsightsResponse,
  EngagementTrendsResponse,
} from "@/models/donorAnalytics";

// API Endpoints - all client-scoped and privacy-compliant

/**
 * GET /api/analytics/segments
 * Returns all behavioral segments with anonymous donor counts
 */
export async function getSegmentAnalytics(
  clientId: string,
): Promise<SegmentAnalyticsResponse> {
  // Returns aggregated segment data without any individual identification
  const response = await fetch(`/api/analytics/segments?client=${clientId}`);
  return response.json();
}

/**
 * POST /api/analytics/segments
 * Creates a new behavioral segment based on criteria
 */
export async function createSegment(
  clientId: string,
  segmentData: Omit<
    BehavioralSegment,
    "segmentId" | "donorCount" | "lastUpdated"
  >,
): Promise<BehavioralSegment> {
  const response = await fetch(`/api/analytics/segments?client=${clientId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(segmentData),
  });
  return response.json();
}

/**
 * GET /api/analytics/campaigns/{campaignId}/insights
 * Returns campaign performance with anonymous response analytics
 */
export async function getCampaignInsights(
  clientId: string,
  campaignId: string,
): Promise<CampaignInsightsResponse> {
  const response = await fetch(
    `/api/analytics/campaigns/${campaignId}/insights?client=${clientId}`,
  );
  return response.json();
}

/**
 * GET /api/analytics/engagement/trends
 * Returns engagement trends over time (no individual data)
 */
export async function getEngagementTrends(
  clientId: string,
  params: {
    startDate: string;
    endDate: string;
    granularity: "daily" | "weekly" | "monthly" | "quarterly";
    segmentId?: string;
  },
): Promise<EngagementTrendsResponse> {
  const queryParams = new URLSearchParams({
    client: clientId,
    ...params,
  });

  const response = await fetch(
    `/api/analytics/engagement/trends?${queryParams}`,
  );
  return response.json();
}

/**
 * GET /api/analytics/cohorts
 * Returns donor cohort analysis for retention tracking
 */
export async function getCohortAnalysis(
  clientId: string,
  params: {
    cohortType: "monthly" | "quarterly" | "campaign";
    startPeriod: string;
    endPeriod: string;
  },
): Promise<DonorCohort[]> {
  const queryParams = new URLSearchParams({
    client: clientId,
    ...params,
  });

  const response = await fetch(`/api/analytics/cohorts?${queryParams}`);
  return response.json();
}

/**
 * GET /api/analytics/predictions
 * Returns predictive scoring results (anonymous donor behavior predictions)
 */
export async function getPredictiveScoring(
  clientId: string,
  scoringModel: string = "retention",
): Promise<PredictiveScoring> {
  const response = await fetch(
    `/api/analytics/predictions?client=${clientId}&model=${scoringModel}`,
  );
  return response.json();
}

/**
 * POST /api/analytics/behavioral-patterns/sync
 * Processes new behavioral data (anonymizes and stores patterns only)
 */
export async function syncBehavioralPatterns(
  clientId: string,
  interactions: {
    // Input format - PII is hashed immediately and not stored
    email_hash: string; // One-way hash, cannot be reversed
    interaction_type:
      | "email_open"
      | "email_click"
      | "donation"
      | "event_signup"
      | "survey_response";
    campaign_id: string;
    timestamp: Date;
    channel: string;
    // Note: No amounts, names, or identifying information
  }[],
): Promise<{ processed: number; anonymous_patterns_updated: number }> {
  const response = await fetch(
    `/api/analytics/behavioral-patterns/sync?client=${clientId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interactions }),
    },
  );
  return response.json();
}

/**
 * GET /api/analytics/segment/{segmentId}/profile
 * Returns anonymous profile for a behavioral segment
 */
export async function getSegmentProfile(
  clientId: string,
  segmentId: string,
): Promise<{
  segment: BehavioralSegment;
  characteristics: {
    avgEngagementScore: number;
    avgResponseTime: number;
    topCampaignTypes: string[];
    channelPreferences: { channel: string; percentage: number }[];
    seasonalityPattern: string;
  };
  comparisons: {
    vsOtherSegments: {
      metric: string;
      segmentValue: number;
      averageValue: number;
      percentageDifference: number;
    }[];
  };
}> {
  const response = await fetch(
    `/api/analytics/segment/${segmentId}/profile?client=${clientId}`,
  );
  return response.json();
}

/**
 * POST /api/analytics/campaign/targeting-recommendations
 * Get targeting recommendations based on campaign type and behavioral segments
 */
export async function getCampaignTargetingRecommendations(
  clientId: string,
  campaignData: {
    campaign_type: string;
    target_audience_size?: number;
    preferred_channels?: string[];
    goals: ("retention" | "acquisition" | "engagement" | "reactivation")[];
  },
): Promise<{
  recommended_segments: {
    segmentId: string;
    segmentName: string;
    targetSize: number;
    expectedResponseRate: number;
    confidence: number;
    reasoning: string;
  }[];
  channel_recommendations: {
    channel: string;
    effectiveness_score: number;
    estimated_reach: number;
  }[];
  timing_recommendations: {
    optimal_send_times: string[];
    seasonal_considerations: string[];
  };
}> {
  const response = await fetch(
    `/api/analytics/campaign/targeting-recommendations?client=${clientId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campaignData),
    },
  );
  return response.json();
}

// Privacy compliance utilities
export const PrivacyUtils = {
  /**
   * Generate anonymous donor ID from email (one-way hash)
   */
  generateAnonymousId(email: string): string {
    // Implementation would use crypto.createHash('sha256')
    // This is irreversible - no way to get email back from hash
    return `anon_${email.length}_${Date.now()}`; // Placeholder
  },

  /**
   * Validate that no PII is being stored
   */
  validatePrivacyCompliance(data: any): boolean {
    const bannedFields = [
      "email",
      "name",
      "address",
      "phone",
      "ssn",
      "donation_amount",
      "specific_amount",
      "salary",
    ];

    const dataStr = JSON.stringify(data).toLowerCase();
    return !bannedFields.some((field) => dataStr.includes(field));
  },

  /**
   * Anonymize dataset before storage
   */
  anonymizeDataset(rawData: any[]): any[] {
    return rawData.map((record) => ({
      // Remove all PII, keep only behavioral patterns
      anonymous_id: this.generateAnonymousId(record.email || "unknown"),
      interaction_patterns: record.interactions?.length || 0,
      engagement_level:
        record.engagement_score > 70
          ? "high"
          : record.engagement_score > 40
            ? "medium"
            : "low",
      frequency_category: this.categorizeFrequency(
        record.interaction_frequency,
      ),
      channel_preferences: record.preferred_channels || [],
      temporal_patterns: record.interaction_times || [],
      // All PII removed, only behavioral signatures remain
    }));
  },

  categorizeFrequency(frequency: number): string {
    if (frequency >= 12) return "monthly";
    if (frequency >= 4) return "quarterly";
    if (frequency >= 1) return "annual";
    return "sporadic";
  },
};
