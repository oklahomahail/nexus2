// src/viewModels/donorChartView.ts
import { _DonorInsights as DonorInsights } from "../models/analytics";

export interface RetentionItem {
  label: string;
  value: number;
}

export function createRetentionComparison(
  insights: DonorInsights,
): RetentionItem[] {
  return [
    {
      label: "Previous Period",
      value: Number(insights.donorRetention?.previous ?? 0),
    },
    {
      label: "Current Period",
      value: Number(insights.donorRetention?.current ?? 0),
    },
  ];
}

export interface AcquisitionItem {
  type: "New" | "Returning";
  count: number;
}

export function buildAcquisitionBreakdown(
  insights: DonorInsights,
): AcquisitionItem[] {
  return [
    { type: "New", count: Number(insights.acquisition?.newDonors ?? 0) },
    {
      type: "Returning",
      count: Number(insights.acquisition?.returningDonors ?? 0),
    },
  ];
}

export interface TopDonorPoint {
  name: string;
  amount: number;
}

export function mapTopDonorsChart(insights: DonorInsights): TopDonorPoint[] {
  const list =
    (insights.topDonors as Array<{
      id: string;
      name: string;
      totalGiven: number;
    }>) ?? [];
  return list.map((d) => ({
    name: d.name,
    amount: Number(d.totalGiven ?? 0),
  }));
}
