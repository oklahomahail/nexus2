export interface _DonorSegment {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Criteria for auto-assignment (optional)
  criteria?: {
    minGiftAmount?: number;
    maxGiftAmount?: number;
    giftFrequency?: "one-time" | "monthly" | "quarterly" | "annually";
    totalLifetimeGiving?: number;
    monthsSinceLastGift?: number;
    engagementLevel?: "high" | "medium" | "low";
  };
}

export interface _DonorSegmentData {
  segmentId: string;
  segmentName: string;
  donorCount: number;
  totalContributed: number;
  averageGiftSize: number;
  lastGiftDate?: Date;
  retentionRate: number;
  growthRate: number; // vs previous period
  conversionRate?: number; // for prospects
  engagementScore: number; // 0-100
  // Gift patterns
  giftPatterns: {
    frequency: "one-time" | "monthly" | "quarterly" | "annually" | "irregular";
    seasonalTrends: {
      season: "Spring" | "Summer" | "Fall" | "Winter";
      donorCount: number;
      totalGifts: number;
    }[];
    channelPreferences: {
      channel:
        | "Online"
        | "Direct Mail"
        | "Events"
        | "Phone"
        | "Email"
        | "Mobile";
      percentage: number;
      averageGift: number;
    }[];
  };
  // Campaign performance
  campaignPerformance: {
    campaignId: string;
    campaignName: string;
    participationRate: number;
    totalRaised: number;
    averageGift: number;
    responseRate: number;
  }[];
}

export interface _DonorSegmentAnalytics {
  segmentData: DonorSegmentData[];
  totalDonors: number;
  totalContributed: number;
  crossSegmentInsights: {
    topPerformingSegments: {
      segmentId: string;
      segmentName: string;
      metric:
        | "total_revenue"
        | "donor_count"
        | "retention_rate"
        | "growth_rate";
      value: number;
      rank: number;
    }[];
    segmentMigration: {
      fromSegmentId: string;
      toSegmentId: string;
      donorCount: number;
      timeframe: string;
    }[];
    opportunityAnalysis: {
      segmentId: string;
      opportunity:
        | "upgrade_potential"
        | "retention_risk"
        | "engagement_opportunity";
      description: string;
      estimatedImpact: number;
      actionRecommendation: string;
    }[];
  };
  benchmarkData: {
    industryAverages: {
      segmentType: string;
      averageRetentionRate: number;
      averageGiftSize: number;
      typicalGrowthRate: number;
    }[];
  };
}

export interface SegmentFilter {
  segmentIds?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  minGiftAmount?: number;
  maxGiftAmount?: number;
  giftFrequency?: ("one-time" | "monthly" | "quarterly" | "annually")[];
  engagementLevel?: ("high" | "medium" | "low")[];
  campaignIds?: string[];
}

export interface SegmentComparison {
  baseSegmentId: string;
  compareSegmentId: string;
  metrics: {
    donorCount: {
      base: number;
      compare: number;
      difference: number;
      percentageDifference: number;
    };
    averageGift: {
      base: number;
      compare: number;
      difference: number;
      percentageDifference: number;
    };
    retentionRate: {
      base: number;
      compare: number;
      difference: number;
      percentageDifference: number;
    };
    engagementScore: {
      base: number;
      compare: number;
      difference: number;
      percentageDifference: number;
    };
  };
  insights: string[];
  recommendations: string[];
}

// Predefined segment templates that users can customize
export {};

export interface SegmentMetricsTrend {
  segmentId: string;
  timeSeriesData: {
    date: string;
    donorCount: number;
    totalContributed: number;
    averageGift: number;
    retentionRate: number;
    newDonors: number;
    lapsedDonors: number;
  }[];
}

export interface SegmentGoal {
  id: string;
  segmentId: string;
  goalType:
    | "donor_count"
    | "total_revenue"
    | "retention_rate"
    | "average_gift"
    | "engagement_score";
  currentValue: number;
  targetValue: number;
  targetDate: string;
  description?: string;
  isActive: boolean;
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}
