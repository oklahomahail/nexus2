// src/viewModels/donorSegmentChartView.ts

import { DonorSegmentInsight, AnalyticsTrend } from "../models/analytics";

export interface SegmentBarChartDataPoint {
  segment: string;
  totalRevenue: number;
  donorCount: number;
  averageGift: number;
}

export function getSegmentBarChartData(
  _insights: DonorSegmentInsight[],
): SegmentBarChartDataPoint[] {
  return insights.map((segment) => ({
    segment: segment.name,
    totalRevenue: segment.metrics.totalRevenue,
    donorCount: segment.metrics.totalDonors,
    averageGift: segment.metrics.averageGift,
  }));
}

// ---------- TREND CHARTS ----------

export interface TrendChartDataPoint {
  label: string;
  totalRevenue: number;
  donorCount: number;
}

export function getTrendChartData(
  _trends: AnalyticsTrend[],
): TrendChartDataPoint[] {
  return trends.map((t) => ({
    label: t.label,
    totalRevenue: t.totalRevenue,
    donorCount: t.donorCount,
  }));
}
