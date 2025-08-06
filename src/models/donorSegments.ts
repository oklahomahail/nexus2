export interface DonorSegment {
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
    giftFrequency?: 'one-time' | 'monthly' | 'quarterly' | 'annually';
    totalLifetimeGiving?: number;
    monthsSinceLastGift?: number;
    engagementLevel?: 'high' | 'medium' | 'low';
  };
}

export interface DonorSegmentData {
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
    frequency: 'one-time' | 'monthly' | 'quarterly' | 'annually' | 'irregular';
    seasonalTrends: {
      season: 'Spring' | 'Summer' | 'Fall' | 'Winter';
      donorCount: number;
      totalGifts: number;
    }[];
    channelPreferences: {
      channel: 'Online' | 'Direct Mail' | 'Events' | 'Phone' | 'Email' | 'Mobile';
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

export interface DonorSegmentAnalytics {
  segmentData: DonorSegmentData[];
  totalDonors: number;
  totalContributed: number;
  crossSegmentInsights: {
    topPerformingSegments: {
      segmentId: string;
      segmentName: string;
      metric: 'total_revenue' | 'donor_count' | 'retention_rate' | 'growth_rate';
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
      opportunity: 'upgrade_potential' | 'retention_risk' | 'engagement_opportunity';
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
  giftFrequency?: ('one-time' | 'monthly' | 'quarterly' | 'annually')[];
  engagementLevel?: ('high' | 'medium' | 'low')[];
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
export const DEFAULT_SEGMENT_TEMPLATES: Omit<DonorSegment, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Board Members',
    description: 'Organizational board members and leadership',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '👑',
    isDefault: true,
    isActive: true,
    criteria: {
      minGiftAmount: 1000,
      engagementLevel: 'high'
    }
  },
  {
    name: 'Major Gift Prospects',
    description: 'High-capacity donors and potential major gift supporters',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '💎',
    isDefault: true,
    isActive: true,
    criteria: {
      minGiftAmount: 1000,
      totalLifetimeGiving: 5000
    }
  },
  {
    name: 'Monthly Donors',
    description: 'Recurring monthly supporters',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🔄',
    isDefault: true,
    isActive: true,
    criteria: {
      giftFrequency: 'monthly'
    }
  },
  {
    name: 'Annual Donors',
    description: 'Regular annual contributors',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '📅',
    isDefault: true,
    isActive: true,
    criteria: {
      giftFrequency: 'annually',
      minGiftAmount: 50
    }
  },
  {
    name: 'Volunteers',
    description: 'Active volunteers and community supporters',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🤝',
    isDefault: true,
    isActive: true,
    criteria: {
      engagementLevel: 'high'
    }
  },
  {
    name: 'Event Participants',
    description: 'Supporters who engage through events',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    icon: '🎪',
    isDefault: true,
    isActive: true,
    criteria: {
      engagementLevel: 'medium'
    }
  },
  {
    name: 'Corporate Partners',
    description: 'Business and corporate supporters',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: '🏢',
    isDefault: true,
    isActive: true,
    criteria: {
      minGiftAmount: 500
    }
  },
  {
    name: 'Lapsed Donors',
    description: 'Previous donors who haven\'t given recently',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '⏰',
    isDefault: true,
    isActive: true,
    criteria: {
      monthsSinceLastGift: 12
    }
  },
  {
    name: 'First-Time Donors',
    description: 'New supporters in their first year',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    icon: '✨',
    isDefault: true,
    isActive: true,
    criteria: {
      totalLifetimeGiving: 1000,
      engagementLevel: 'medium'
    }
  },
  {
    name: 'Alumni',
    description: 'Program alumni and former beneficiaries',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '🎓',
    isDefault: false,
    isActive: true
  }
];

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
  goalType: 'donor_count' | 'total_revenue' | 'retention_rate' | 'average_gift' | 'engagement_score';
  currentValue: number;
  targetValue: number;
  targetDate: string;
  description?: string;
  isActive: boolean;
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}