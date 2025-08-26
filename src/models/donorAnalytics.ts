// src/models/donorAnalytics.ts

/**
 * Privacy-First Donor Analytics System
 *
 * Core principle: No PII stored, only behavioral patterns and anonymous cohorts
 * Compliance: GDPR, CCPA ready - no personal data retention
 */

// Anonymous donor identifier - one-way hash that cannot be reversed
export type AnonymousDonorId = string; // Format: "anon_" + hash

// Behavioral segmentation without storing amounts or personal data
export interface BehavioralSegment {
  segmentId: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  donorCount: number;
  lastUpdated: Date;
  isActive: boolean;
}

export interface SegmentCriteria {
  // Frequency patterns (no amounts stored)
  givingFrequency?: "monthly" | "quarterly" | "annual" | "sporadic";

  // Engagement levels based on interactions, not giving amounts
  engagementLevel?: "high" | "medium" | "low";

  // Campaign responsiveness
  campaignResponsiveness?: "highly_responsive" | "selective" | "low_response";

  // Recency categories (when they last engaged, not amounts)
  recencyCategory?: "recent" | "lapsed" | "dormant";

  // Channel preferences
  preferredChannel?: "email" | "direct_mail" | "online" | "events";
}

// Anonymous giving patterns - no specific amounts, only ranges/categories
export interface GivingPattern {
  anonymousId: AnonymousDonorId;

  // Behavioral metrics (no dollar amounts)
  frequencyScore: number; // 0-100, based on consistency
  engagementScore: number; // 0-100, based on interactions
  loyaltyScore: number; // 0-100, based on retention

  // Categorical data only
  givingSizeCategory: "small" | "medium" | "large" | "major"; // No actual amounts
  primaryCampaignTypes: string[]; // Types they respond to

  // Temporal patterns
  seasonalityPattern?:
    | "year_end"
    | "spring"
    | "fall"
    | "consistent"
    | "variable";
  averageResponseTime?: number; // Days to respond to campaigns

  lastEngagementDate: Date;
  createdAt: Date;
}

// Campaign response analytics - aggregated, anonymous
export interface CampaignResponseAnalytics {
  campaignId: string;
  campaignType: string;

  // Anonymous response metrics
  totalResponders: number;
  responseRate: number; // Percentage

  // Segment breakdown (no individual data)
  segmentPerformance: {
    segmentId: string;
    segmentName: string;
    responderCount: number;
    responseRate: number;
  }[];

  // Behavioral insights (aggregated)
  averageResponseTime: number; // Days
  channelPerformance: {
    channel: string;
    responseRate: number;
    responderCount: number;
  }[];

  generatedAt: Date;
}

// Cohort analysis for retention tracking
export interface DonorCohort {
  cohortId: string;
  name: string;
  definition: string;

  // Time-based cohort data
  cohortPeriod: string; // "2024-Q1", "2024-01", etc.
  initialSize: number;

  // Retention metrics (no amounts, just behavior)
  retentionRates: {
    period: string; // "30_days", "90_days", "1_year"
    retentionRate: number;
    activeCount: number;
  }[];

  // Behavioral progression
  engagementTrends: {
    period: string;
    averageEngagementScore: number;
  }[];

  createdAt: Date;
  lastUpdated: Date;
}

// Predictive scoring without personal data
export interface PredictiveScoring {
  scoreId: string;
  scoreName: string;
  description: string;

  // Model metadata
  modelVersion: string;
  trainedAt: Date;
  accuracy: number;

  // Anonymous predictions
  predictions: {
    anonymousId: AnonymousDonorId;

    // Behavioral predictions (no amounts)
    retentionProbability: number; // 0-1
    engagementProbability: number; // 0-1
    responsivenessProbability: number; // 0-1

    // Recommended actions
    recommendedSegment: string;
    recommendedCampaignTypes: string[];
    recommendedChannel: string;

    confidence: number; // 0-1
    lastUpdated: Date;
  }[];
}

// API Response Types
export interface SegmentAnalyticsResponse {
  segments: BehavioralSegment[];
  totalDonorCount: number;
  segmentOverlap: {
    segment1: string;
    segment2: string;
    overlapCount: number;
    overlapPercentage: number;
  }[];
}

export interface CampaignInsightsResponse {
  campaignAnalytics: CampaignResponseAnalytics;
  benchmarks: {
    industryAverage: number;
    organizationAverage: number;
    bestPerforming: number;
  };
  recommendations: {
    message: string;
    priority: "high" | "medium" | "low";
    category: "timing" | "targeting" | "channel" | "content";
  }[];
}

export interface EngagementTrendsResponse {
  trends: {
    period: string; // "2024-01", "2024-Q1", etc.
    engagementMetrics: {
      totalInteractions: number;
      uniqueDonors: number;
      averageEngagementScore: number;
    };
    channelBreakdown: {
      channel: string;
      interactionCount: number;
      uniqueDonors: number;
    }[];
  }[];

  insights: {
    trendDirection: "increasing" | "decreasing" | "stable";
    keyDrivers: string[];
    seasonalPatterns: string[];
  };
}
