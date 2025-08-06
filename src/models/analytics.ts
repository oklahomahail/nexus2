import { ReactNode } from "react";

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
    completionRate: number;
    donorCount: number;
    averageGiftSize: number;
    largestGift: number;
    smallestGift: number;
    repeatDonorRate: number;
  };
  outreachMetrics: {
    emailsSent: number;
    emailsOpened: number;
    emailsClicked: number;
    openRate: number;
    clickThroughRate: number;
    unsubscribeRate: number;
    bounceRate: number;
  };
  conversionMetrics: {
    websiteVisits: number;
    donationPageViews: number;
    conversionRate: number;
    abandonmentRate: number;
    averageTimeOnPage: number;
  };
  donorSegmentation: {
    firstTimeDonors: number;
    returningDonors: number;
    majorGiftDonors: number; // $1000+
    midLevelDonors: number;  // $250-$999
    smallGiftDonors: number; // <$250
  };
  timeSeriesData: {
    date: string;
    dailyRaised: number;
    dailyDonors: number;
    cumulativeRaised: number;
    cumulativeDonors: number;
  }[];
  channelPerformance: {
    channel: 'Email' | 'Social Media' | 'Direct Mail' | 'Website' | 'Events' | 'Other';
    donorCount: number;
    totalRaised: number;
    averageGift: number;
    conversionRate: number;
  }[];
}

export interface DonorInsights {
  averageGift: any;
  recurringDonors: ReactNode;
  newDonors: ReactNode;
  lapsedDonors: ReactNode;
  totalDonors: number;
  newDonorsThisMonth: number;
  retentionRate: number;
  averageLifetimeValue: number;
  donorGrowthRate: number;
  topDonorSegments: {
    segment: string;
    count: number;
    percentage: number;
    totalContributed: number;
  }[];
  demographicBreakdown: {
    ageGroups: {
      range: string;
      count: number;
      percentage: number;
      averageGift: number;
    }[];
    geography: {
      location: string;
      donorCount: number;
      totalRaised: number;
    }[];
    donorTenure: {
      category: '0-1 years' | '1-3 years' | '3-5 years' | '5+ years';
      count: number;
      percentage: number;
      averageAnnualGiving: number;
    }[];
  };
  givingPatterns: {
    monthlyTrends: {
      month: string;
      donorCount: number;
      averageGift: number;
      totalRaised: number;
    }[];
    seasonalTrends: {
      season: 'Spring' | 'Summer' | 'Fall' | 'Winter';
      donorCount: number;
      totalRaised: number;
    }[];
    recurringVsOneTime: {
      recurring: {
        count: number;
        percentage: number;
        totalValue: number;
      };
      oneTime: {
        count: number;
        percentage: number;
        totalValue: number;
      };
    };
  };
}

export interface OrganizationAnalytics {
  overallMetrics: {
    totalFundsRaised: number;
    totalDonors: number;
    totalCampaigns: number;
    averageCampaignSuccess: number;
    donorRetentionRate: number;
    costPerDollarRaised: number;
  };
  performanceComparisons: {
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
      fundsRaisedGrowth: number;
      donorGrowth: number;
      campaignGrowth: number;
    };
  };
  topPerformingCampaigns: {
    campaignId: string;
    name: string;
    totalRaised: number;
    goalAchievement: number;
    donorCount: number;
    roi: number;
  }[];
  benchmarkData: {
    industryAverage: {
      donorRetentionRate: number;
      averageGiftSize: number;
      emailOpenRate: number;
      conversionRate: number;
    };
    organizationPerformance: {
      donorRetentionRate: number;
      averageGiftSize: number;
      emailOpenRate: number;
      conversionRate: number;
    };
    performanceRatings: {
      retentionRating: 'Excellent' | 'Good' | 'Average' | 'Below Average';
      giftSizeRating: 'Excellent' | 'Good' | 'Average' | 'Below Average';
      engagementRating: 'Excellent' | 'Good' | 'Average' | 'Below Average';
      conversionRating: 'Excellent' | 'Good' | 'Average' | 'Below Average';
    };
  };
}

export interface AnalyticsFilters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  campaignIds?: string[];
  donorSegments?: string[];
  channels?: string[];
  minimumGiftAmount?: number;
  maximumGiftAmount?: number;
  includeRecurring?: boolean;
  includeOneTime?: boolean;
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format: 'currency' | 'number' | 'percentage' | 'string';
  description?: string;
  target?: number;
  status?: 'on-track' | 'behind' | 'exceeded';
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut';
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      borderWidth?: number;
      fill?: boolean;
    }[];
  };
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    scales?: any;
    plugins?: any;
  };
}