// src/models/segmentation.ts

// Base Segmentation Types
export type SegmentType = "dynamic" | "static" | "predictive" | "behavioral";
export type SegmentStatus = "active" | "inactive" | "archived" | "testing";
export type UpdateFrequency =
  | "real_time"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly";

// Behavioral Pattern Types
export type BehaviorType =
  | "donation_frequency"
  | "donation_amount"
  | "engagement_level"
  | "channel_preference"
  | "campaign_response"
  | "event_attendance"
  | "communication_opens"
  | "website_activity"
  | "social_engagement"
  | "volunteer_activity";

export type PredictionType =
  | "lifetime_value"
  | "churn_risk"
  | "next_donation_amount"
  | "next_donation_timing"
  | "channel_preference"
  | "campaign_response_likelihood"
  | "upgrade_probability"
  | "event_attendance_likelihood";

// Clustering Algorithm Types
export type ClusteringAlgorithm =
  | "k_means"
  | "hierarchical"
  | "dbscan"
  | "gaussian_mixture";

// Segmentation Rule Interface
export interface SegmentRule {
  id: string;
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "greater_equal"
    | "less_equal"
    | "contains"
    | "not_contains"
    | "in"
    | "not_in"
    | "between"
    | "is_null"
    | "is_not_null";
  value: any;
  logicalOperator?: "AND" | "OR";
  weight?: number; // For ML-based rules
  parentGroup?: string;
}

// Rule Group for Complex Logic
export interface RuleGroup {
  id: string;
  name: string;
  rules: SegmentRule[];
  subGroups?: RuleGroup[];
  logicalOperator: "AND" | "OR";
}

// Behavioral Pattern Definition
export interface BehavioralPattern {
  id: string;
  name: string;
  description: string;
  type: BehaviorType;
  timeframe: {
    start: Date;
    end?: Date;
    period: "days" | "weeks" | "months" | "years";
    value: number;
  };
  metrics: {
    frequency?: number;
    recency?: number; // days since last activity
    monetary?: number; // total value
    trend?: "increasing" | "decreasing" | "stable";
    consistency?: number; // 0-1 score
  };
  thresholds: {
    high: number;
    medium: number;
    low: number;
  };
  weight: number; // Importance in segmentation
  createdAt: Date;
  updatedAt: Date;
}

// Donor Cluster Definition
export interface DonorCluster {
  id: string;
  name: string;
  description: string;
  algorithm: ClusteringAlgorithm;
  features: string[]; // Feature names used for clustering
  centroid: Record<string, number>; // Cluster center point
  size: number; // Number of donors in cluster
  characteristics: {
    avgDonationAmount: number;
    avgDonationFrequency: number;
    avgEngagementScore: number;
    avgLifetimeValue: number;
    primaryChannels: string[];
    commonTags: string[];
    demographicProfile: {
      avgAge?: number;
      primaryLocations: string[];
      incomeRange?: string;
      genderDistribution?: Record<string, number>;
    };
  };
  performance: {
    conversionRate: number;
    retentionRate: number;
    averageGiftSize: number;
    totalRevenue: number;
    engagementScore: number;
  };
  insights: string[];
  recommendedActions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Prediction Model Interface
export interface PredictionModel {
  id: string;
  name: string;
  type: PredictionType;
  algorithm:
    | "linear_regression"
    | "random_forest"
    | "gradient_boosting"
    | "neural_network"
    | "logistic_regression";
  features: string[];
  performance: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    rmse?: number; // For regression models
    mae?: number; // Mean Absolute Error
    r2Score?: number; // R-squared for regression
  };
  trainingData: {
    sampleSize: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    featureImportance: Record<string, number>;
  };
  status: "training" | "active" | "inactive" | "needs_retraining";
  lastTrainedAt: Date;
  nextTrainingDue: Date;
  version: string;
}

// Donor Prediction Interface
export interface DonorPrediction {
  donorId: string;
  modelId: string;
  type: PredictionType;
  prediction: any; // The actual prediction value
  confidence: number; // 0-1 confidence score
  reasoning: string[]; // Human-readable explanations
  factors: Array<{
    feature: string;
    impact: number; // -1 to 1, negative means decreases prediction
    value: any;
  }>;
  generatedAt: Date;
  validUntil: Date;
}

// Segment Definition
export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  type: SegmentType;
  status: SegmentStatus;

  // Rule-based segmentation
  rules?: RuleGroup;

  // ML-based segmentation
  clusterId?: string;
  behavioralPatterns?: string[]; // IDs of behavioral patterns
  predictionCriteria?: {
    modelId: string;
    threshold: number;
    operator: "greater_than" | "less_than" | "equals";
  }[];

  // Segment Configuration
  config: {
    updateFrequency: UpdateFrequency;
    autoUpdate: boolean;
    includeCriteria: RuleGroup;
    excludeCriteria?: RuleGroup;
    maxSize?: number;
    minSize?: number;
    duplicateHandling: "allow" | "prioritize_newest" | "prioritize_oldest";
  };

  // Segment Metadata
  metadata: {
    size: number;
    estimatedSize?: number; // For testing/preview
    lastUpdated: Date;
    createdBy: string;
    tags: string[];
    category?: string;
    priority: "low" | "medium" | "high" | "critical";
  };

  // Performance Tracking
  performance: {
    conversionRate: number;
    engagementRate: number;
    averageGiftSize: number;
    totalRevenue: number;
    revenuePerMember: number;
    growthRate: number; // Month-over-month
    churnRate: number;
    campaignResponseRate: number;
  };

  // Insights and Recommendations
  insights: {
    keyCharacteristics: string[];
    trends: Array<{
      metric: string;
      trend: "increasing" | "decreasing" | "stable";
      changePercent: number;
      period: string;
    }>;
    recommendations: Array<{
      type: "messaging" | "timing" | "channel" | "amount" | "frequency";
      suggestion: string;
      confidence: number;
      expectedImpact: string;
    }>;
    riskFactors: Array<{
      factor: string;
      severity: "low" | "medium" | "high";
      description: string;
      mitigation: string;
    }>;
  };

  // Personalization Settings
  personalization: {
    dynamicContent: boolean;
    personalizedAmounts: boolean;
    optimizedTiming: boolean;
    channelPreference: boolean;
    customVariables: Record<string, any>;
  };

  createdAt: Date;
  updatedAt: Date;
}

// Segment Performance Comparison
export interface SegmentComparison {
  segments: string[]; // Segment IDs
  metrics: Array<{
    name: string;
    values: Record<string, number>; // segmentId -> value
    winner?: string; // segmentId with best performance
    confidenceLevel: number;
  }>;
  timeframe: {
    start: Date;
    end: Date;
  };
  insights: string[];
}

// Segmentation Analytics
export interface SegmentationAnalytics {
  overview: {
    totalSegments: number;
    activeSegments: number;
    totalDonorsSegmented: number;
    segmentationCoverage: number; // % of donors in at least one segment
    avgSegmentSize: number;
    performanceImprovement: number; // % improvement over non-segmented
  };
  topPerformingSegments: Array<{
    segmentId: string;
    name: string;
    metric: string;
    value: number;
    improvement: number;
  }>;
  segmentHealth: Array<{
    segmentId: string;
    name: string;
    healthScore: number; // 0-100
    issues: string[];
    recommendations: string[];
  }>;
  trends: Array<{
    metric: string;
    timeframe: string;
    data: Array<{
      date: string;
      value: number;
      segments: Record<string, number>;
    }>;
  }>;
  predictions: Array<{
    segmentId: string;
    name: string;
    predictedGrowth: number;
    confidenceInterval: [number, number];
    keyDrivers: string[];
  }>;
}

// Personalization Context
export interface PersonalizationContext {
  donorId: string;
  segments: string[]; // Current segment memberships
  predictions: DonorPrediction[];
  behaviorProfile: {
    patterns: BehavioralPattern[];
    preferences: {
      communicationChannel: string;
      donationFrequency: string;
      preferredAskAmounts: number[];
      bestContactTime: {
        dayOfWeek: number;
        hour: number;
      };
      contentPreferences: string[];
    };
    riskFactors: Array<{
      factor: string;
      score: number;
      trend: "improving" | "declining" | "stable";
    }>;
  };
  currentCampaign?: {
    campaignId: string;
    personalizedContent: Record<string, any>;
    recommendedActions: string[];
    timing: {
      optimalSendTime: Date;
      followUpSchedule: Date[];
    };
  };
}

// Segment Test Configuration
export interface SegmentTest {
  id: string;
  name: string;
  description: string;
  type: "ab_test" | "multivariate" | "champion_challenger";
  segments: Array<{
    segmentId: string;
    name: string;
    variant: string;
    allocation: number; // percentage
  }>;
  hypothesis: string;
  successMetrics: string[];
  config: {
    duration: number; // days
    confidenceLevel: number; // e.g., 0.95 for 95%
    minimumSampleSize: number;
    trafficAllocation: number; // percentage of segment to include
  };
  status: "draft" | "running" | "completed" | "paused" | "cancelled";
  results?: {
    winner?: string; // segmentId
    confidence: number;
    improvements: Record<string, number>; // metric -> improvement %
    statisticalSignificance: boolean;
    recommendations: string[];
  };
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ML Model Training Data
export interface TrainingDataSet {
  id: string;
  name: string;
  type: PredictionType;
  features: Array<{
    name: string;
    type: "numerical" | "categorical" | "boolean" | "date";
    importance?: number;
    description: string;
  }>;
  samples: Array<{
    donorId: string;
    features: Record<string, any>;
    target: any; // The value we're trying to predict
    weight?: number;
  }>;
  metadata: {
    size: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    qualityScore: number; // 0-100
    completeness: number; // 0-100 (% of non-null values)
    balance?: Record<string, number>; // For classification problems
  };
  preprocessing: {
    normalization: boolean;
    featureScaling: boolean;
    outlierRemoval: boolean;
    missingValueHandling:
      | "remove"
      | "mean"
      | "median"
      | "mode"
      | "interpolation";
  };
  createdAt: Date;
  updatedAt: Date;
}

// Export utility types
export type SegmentMembership = {
  donorId: string;
  segmentId: string;
  joinedAt: Date;
  confidence?: number;
  source: "rules" | "ml_clustering" | "manual" | "prediction";
};

export type SegmentUpdate = {
  segmentId: string;
  changeType: "added" | "removed" | "modified";
  donorIds: string[];
  reason: string;
  timestamp: Date;
};

export type SegmentAlert = {
  id: string;
  segmentId: string;
  type:
    | "size_change"
    | "performance_drop"
    | "anomaly_detected"
    | "update_failed";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  details: Record<string, any>;
  actionRequired: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
};

// Additional types for dashboard and performance tracking
export interface SegmentPerformance {
  segmentId?: string;
  timeframe: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalDonors: number;
    totalRevenue: number;
    conversionRate: number;
    avgDonation: number;
    engagementScore: number;
    retentionRate: number;
    churnRate: number;
  };
  channelPerformance: ChannelPerformance[];
  trends: {
    donorGrowth: number;
    revenueGrowth: number;
    engagementTrend: "up" | "down" | "stable";
  };
  campaigns: {
    campaignId: string;
    campaignName: string;
    sent: number;
    converted: number;
    revenue: number;
  }[];
}

export interface SegmentMetrics {
  segmentId: string;
  date: Date;
  size: number;
  activeMembers: number;
  newMembers: number;
  churnedMembers: number;
  totalRevenue: number;
  avgDonation: number;
  conversionRate: number;
  engagementScore: number;
  campaignsSent: number;
  campaignsOpened: number;
  campaignsClicked: number;
}

export interface ChannelPerformance {
  channel: "email" | "direct_mail" | "social_media" | "phone" | "website";
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  conversionRate: number;
  cost: number;
  roi: number;
}
