// ---------- SHARED TYPES ----------

export interface DateRange {
  startDate: string; // ISO format: '2025-01-01'
  endDate: string;
}

export interface AnalyticsFilters {
  dateRange: DateRange;
  campaignIds?: string[];
  donorSegmentIds?: string[];
  channel?: "email" | "social" | "direct" | "event" | "other";
}

export interface AnalyticsMetrics {
  totalDonors: number;
  totalRevenue: number;
  newDonors: number;
  recurringDonors: number;
  averageGift: number;
  donorRetentionRate: number; // 0–1
  conversionRate: number; // 0–1
}

export interface AnalyticsTrend {
  label: string; // e.g. "Week of Jan 1"
  totalRevenue: number;
  donorCount: number;
}
export interface GoalAlert {
  goalId: string;
  met: boolean;
  actual: number;
  target: number;
  metric: string;
  goalName?: string;
}
// ---------- ORGANIZATION DASHBOARD ----------

export interface OrganizationAnalytics {
  clientPerformance: any;
  performanceComparisons: ComparisonData | CampaignSuccessData;
  topPerformingCampaigns: any;
  currentPeriod: {
    startDate: string;
    endDate: string;
    totalRaised: number;
    donorCount: number;
    campaignCount: number;
  };
  previousPeriod: {
    startDate: string;
    endDate: string;
    totalRaised: number;
    donorCount: number;
    campaignCount: number;
  };
  growthMetrics: {
    raisedChange: number;
    donorsChange: number;
    campaignsChange: number;
  };
}

// ---------- DONOR INSIGHTS ----------
export interface ComparisonData {
  label: string;
  current: number;
  previous: number;
}
export interface CampaignSuccessData {
  name: string;
  successRate: number;
  totalRaised: number;
  goal: number;
  roi: number;
}
export interface _DonorInsights {
  topDonors: {
    id: string;
    name: string;
    totalGiven: number;
  }[];
  donorRetention: {
    current: number;
    previous: number;
    change: number;
  };
  acquisition: {
    newDonors: number;
    returningDonors: number;
  };
}

export interface _DonorSegmentInsight {
  segmentId: string;
  name: string;
  metrics: AnalyticsMetrics;
}

// ---------- MAIN ANALYTICS PAYLOAD ----------

export interface AnalyticsData {
  organizationId: string;
  filtersApplied: AnalyticsFilters;
  metrics: AnalyticsMetrics;
  trendData?: AnalyticsTrend[];
  donorInsights?: _DonorSegmentInsight[];
  lastUpdated: string;
}

// ---------- CAMPAIGN ANALYTICS ----------

export interface CampaignAnalytics {
  campaignId: string;
  campaignName: string;
  timeframe: {
    startDate: string;
    endDate: string;
  };
  fundraisingMetrics: {
    totalRaised: number;
    goalAmount: number;
    completionRate: number; // percent
    donorCount: number;
    averageGiftSize: number;
    largestGift: number;
    smallestGift: number;
    repeatDonorRate: number; // percent
  };
  outreachMetrics: {
    emailsSent: number;
    emailsOpened: number;
    emailsClicked: number;
    openRate: number; // percent
    clickThroughRate: number; // percent
    unsubscribeRate: number; // percent
    bounceRate: number; // percent
  };
  conversionMetrics: {
    websiteVisits: number;
    donationPageViews: number;
    conversionRate: number; // percent
    abandonmentRate: number; // percent
    averageTimeOnPage: number; // seconds
  };
  donorSegmentation: {
    firstTimeDonors: number;
    returningDonors: number;
    majorGiftDonors: number;
    midLevelDonors: number;
    smallGiftDonors: number;
  };
  timeSeriesData: {
    date: string;
    dailyRaised: number;
    dailyDonors: number;
    cumulativeRaised: number;
    cumulativeDonors: number;
  }[];
  channelPerformance: {
    channel: string;
    donorCount: number;
    totalRaised: number;
    averageGift: number;
    conversionRate: number; // percent
  }[];
}
