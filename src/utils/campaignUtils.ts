// src/utils/campaignUtils.ts - Helper functions for Campaign objects
import { Campaign, calculateCampaignMetrics } from "@/models/campaign";

/**
 * Create a complete Campaign object with calculated fields
 */
export const createCampaignWithMetrics = (
  baseCampaign: Omit<
    Campaign,
    "progress" | "daysLeft" | "totalRevenue" | "totalDonors" | "roi"
  >,
): Campaign => {
  const metrics = calculateCampaignMetrics(baseCampaign);

  return {
    ...baseCampaign,
    ...metrics,
  };
};

/**
 * Update a campaign with recalculated metrics
 */
export {};

/**
 * Mock campaign data for testing - replace with real data
 */
export {};

/**
 * Format campaign data for display
 */
export {};

/**
 * Determine campaign urgency level
 */
export {};

/**
 * Get campaign status color for UI
 */
export {};

/**
 * Get progress bar color based on progress
 */
export {};
