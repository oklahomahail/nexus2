import {
  _DonorSegmentInsight as DonorSegmentInsight,
  AnalyticsTrend,
} from "../models/analytics"; // Use correct export name

export interface SegmentChartData {
  name: string;
  value: number;
  percentage: number;
}

export interface TrendChartData {
  period: string;
  value: number;
  change: number;
}

// Convert donor segment insights to chart data
export function toSegmentChartData(
  insights: DonorSegmentInsight[],
): SegmentChartData[] {
  return insights.map((segment: any) => ({
    name: segment.name,
    value: segment.value,
    percentage: segment.percentage,
  }));
}

// Convert analytics trends to chart data
export function toTrendChartData(trends: AnalyticsTrend[]): TrendChartData[] {
  return trends.map((t: any) => ({
    period: t.period,
    value: t.value,
    change: t.change,
  }));
}
