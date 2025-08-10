// Import what's available from analytics model - replace with actual exports
// import { _Analytics as Analytics } from "../models/analytics";

export interface AnalyticsView {
  campaignId: string;
  campaignName: string;
  raised: string;
  goal: string;
  donorCount: number;
  completionRate: string;
  repeatDonorRate: string;
  averageGift: string;
}

// Convert Analytics data to view format - using any for now until we know the correct type
export function toAnalyticsView(analytics: any): AnalyticsView {
  return {
    campaignId: analytics.campaignId,
    campaignName: analytics.campaignName,
    raised: `${analytics.fundraisingMetrics.totalRaised.toLocaleString()}`,
    goal: `${analytics.fundraisingMetrics.goalAmount.toLocaleString()}`,
    donorCount: analytics.fundraisingMetrics.donorCount,
    completionRate: `${analytics.fundraisingMetrics.completionRate}%`,
    repeatDonorRate: `${analytics.fundraisingMetrics.repeatDonorRate}%`,
    averageGift: `${analytics.fundraisingMetrics.averageGiftSize.toFixed(2)}`,
  };
}
