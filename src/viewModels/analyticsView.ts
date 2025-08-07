// src/viewModels/analyticsView.ts

import { CampaignAnalytics } from '../models/analytics';

export interface FundraisingSummaryView {
  campaignId: string;
  campaignName: string;
  raised: string;
  goal: string;
  donorCount: number;
  completionRate: string;
  repeatDonorRate: string;
  averageGift: string;
}

export function toFundraisingSummary(analytics: CampaignAnalytics): FundraisingSummaryView {
  return {
    campaignId: analytics.campaignId,
    campaignName: analytics.campaignName,
    raised: `$${analytics.fundraisingMetrics.totalRaised.toLocaleString()}`,
    goal: `$${analytics.fundraisingMetrics.goalAmount.toLocaleString()}`,
    donorCount: analytics.fundraisingMetrics.donorCount,
    completionRate: `${analytics.fundraisingMetrics.completionRate}%`,
    repeatDonorRate: `${analytics.fundraisingMetrics.repeatDonorRate}%`,
    averageGift: `$${analytics.fundraisingMetrics.averageGiftSize.toFixed(2)}`,
  };
}