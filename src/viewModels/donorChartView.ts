// src/viewModels/donorChartView.ts

import { DonorInsights } from "../models/analytics";

export interface RetentionChartDataPoint {
  label: string;
  value: number;
}

export interface AcquisitionChartDataPoint {
  type: "New" | "Returning";
  count: number;
}

export interface TopDonorsChartDataPoint {
  name: string;
  totalGiven: number;
}

export function getRetentionChartData(
  _insights: DonorInsights,
): RetentionChartDataPoint[] {
  return [
    { label: "Previous Period", value: insights.donorRetention.previous },
    { label: "Current Period", value: insights.donorRetention.current },
  ];
}

export function getAcquisitionChartData(
  _insights: DonorInsights,
): AcquisitionChartDataPoint[] {
  return [
    { type: "New", count: insights.acquisition.newDonors },
    { type: "Returning", count: insights.acquisition.returningDonors },
  ];
}

export function getTopDonorsChartData(
  _insights: DonorInsights,
): TopDonorsChartDataPoint[] {
  return insights.topDonors.map((d) => ({
    name: d.name,
    totalGiven: d.totalGiven,
  }));
}
