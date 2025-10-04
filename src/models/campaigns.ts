// src/models/campaigns.ts

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: "email" | "direct_mail" | "social_media" | "multichannel";
  status:
    | "draft"
    | "scheduled"
    | "active"
    | "completed"
    | "paused"
    | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  launchDate?: Date;
  endDate?: Date;
  createdBy: string;
  tags: string[];
  budget?: {
    total: number;
    spent: number;
    currency: string;
  };
  targetAudience: {
    segmentIds: string[];
    totalRecipients: number;
    criteria?: Record<string, any>;
  };
  goals: {
    primary: "donations" | "engagement" | "awareness" | "retention";
    targetAmount?: number;
    targetMetric?: number;
    kpis: string[];
  };
  performance?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
    cost: number;
    roi: number;
    metrics: Record<string, number>;
  };
  metadata: Record<string, any>;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  type: Campaign["type"];
  category: "fundraising" | "stewardship" | "acquisition" | "retention";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedSetupTime: number; // minutes
  config: {
    channels: string[];
    requiredFields: string[];
    optionalFields: string[];
    defaultSettings: Record<string, any>;
  };
  content: {
    subject?: string;
    title?: string;
    body: string;
    callToAction: string;
    customFields?: Record<string, any>;
  };
  metadata: {
    isPublic: boolean;
    tags: string[];
    previewImage?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    usageCount: number;
  };
}

export interface CampaignAnalytics {
  campaignId: string;
  timeframe: {
    start: Date;
    end: Date;
  };
  overview: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalConverted: number;
    totalRevenue: number;
    totalCost: number;
    roi: number;
    conversionRate: number;
    engagementRate: number;
  };
  channels: {
    channelType: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
    cost: number;
  }[];
  timeline: {
    date: string;
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  }[];
  segments: {
    segmentId: string;
    segmentName: string;
    sent: number;
    conversionRate: number;
    revenue: number;
    avgDonation: number;
  }[];
  geolocation?: {
    country: string;
    region: string;
    opens: number;
    clicks: number;
    conversions: number;
  }[];
  devices?: {
    device: "desktop" | "mobile" | "tablet";
    opens: number;
    clicks: number;
    conversions: number;
  }[];
}

export interface CampaignInsight {
  campaignId: string;
  type: "performance" | "audience" | "timing" | "content";
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  recommendation: string;
  impact: {
    metric: string;
    expectedImprovement: number;
    confidence: number;
  };
  actionable: boolean;
  generatedAt: Date;
}
