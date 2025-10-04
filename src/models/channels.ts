// src/models/channels.ts

// Base Channel Types
export type ChannelType =
  | "email"
  | "social_media"
  | "direct_mail"
  | "website"
  | "phone"
  | "sms";
export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

export interface BaseChannel {
  id: string;
  type: ChannelType;
  name: string;
  description?: string;
  campaignId: string;
  clientId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Email Components for dynamic content
export interface EmailComponent {
  id: string;
  type: "text" | "image" | "button" | "personalization" | "dynamic_content";
  content: {
    text?: string;
    html?: string;
    imageUrl?: string;
    buttonText?: string;
    buttonUrl?: string;
    dynamicField?: string;
  };
  styling?: {
    fontSize?: string;
    color?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
  };
  conditions?: {
    field: string;
    operator:
      | "equals"
      | "not_equals"
      | "contains"
      | "greater_than"
      | "less_than";
    value: any;
  }[];
}

// Email Campaign Models
export interface EmailCampaign extends BaseChannel {
  type: "email";

  // Email Configuration
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;

  // Content
  subject: string;
  preheader?: string;
  htmlContent: string;
  textContent?: string;
  hashtags?: string[]; // For social media integration

  // Template & Design
  templateId?: string;
  customCSS?: string;

  // Targeting
  segmentIds: string[];
  excludeSegments?: string[];

  // Scheduling
  sendType: "immediate" | "scheduled" | "automated";
  scheduledAt?: Date;
  timezone?: string;

  // A/B Testing
  abTestConfig?: {
    enabled: boolean;
    testType: "subject" | "content" | "sender" | "send_time";
    variantA: {
      subject?: string;
      content?: string;
      fromName?: string;
      sendTime?: string;
    };
    variantB: {
      subject?: string;
      content?: string;
      fromName?: string;
      sendTime?: string;
    };
    splitRatio: number; // 0.5 = 50/50 split
    winnerCriteria?: "open_rate" | "click_rate" | "conversion_rate";
    testDuration: number; // hours
  };

  // Performance Metrics
  metrics: {
    sent: number;
    delivered: number;
    bounced: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    complained: number;
    converted: number;
    revenue: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    unsubscribeRate: number;
    bounceRate: number;
  };

  // Status
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled";
}

// Social Media Campaign Models
export type SocialPlatform =
  | "facebook"
  | "twitter"
  | "instagram"
  | "linkedin"
  | "youtube"
  | "tiktok";

export interface SocialMediaPost extends BaseChannel {
  type: "social_media";

  // Platform Configuration
  platforms: SocialPlatform[];

  // Content
  message: string;
  imageUrls?: string[];
  videoUrl?: string;
  linkUrl?: string;
  linkPreview?: {
    title: string;
    description: string;
    imageUrl: string;
  };

  // Platform-specific content
  platformContent?: {
    [K in SocialPlatform]?: {
      message?: string;
      hashtags?: string[];
      mentions?: string[];
      customFields?: Record<string, any>;
    };
  };

  // Scheduling
  publishType: "immediate" | "scheduled" | "recurring";
  scheduledAt?: Date;
  timezone?: string;
  recurringConfig?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number; // every N days/weeks/months
    daysOfWeek?: number[]; // 0-6, Sunday=0
    endDate?: Date;
    maxPosts?: number;
  };

  // Hashtags & Mentions
  hashtags: string[];
  mentions: string[];

  // Performance Metrics
  metrics: {
    [K in SocialPlatform]?: {
      likes: number;
      shares: number;
      comments: number;
      clicks: number;
      impressions: number;
      reach: number;
      engagement: number;
      engagementRate: number;
      clickThroughRate: number;
    };
  };

  // Status
  status: "draft" | "scheduled" | "published" | "failed" | "paused";
}

// Direct Mail Campaign Models
export interface DirectMailCampaign extends BaseChannel {
  type: "direct_mail";

  // Mail Piece Configuration
  mailType: "postcard" | "letter" | "brochure" | "catalog";
  size: "standard" | "oversized" | "custom";
  paperType: "standard" | "glossy" | "premium";

  // Content
  frontSideContent: string; // HTML/template
  backSideContent?: string; // HTML/template (for postcards)
  content?: {
    customFields?: Record<string, any>;
  };

  // Audience
  audience?: {
    totalRecipients: number;
    segments?: string[];
  };

  // Template & Design
  templateId?: string;
  customCSS?: string;

  // Targeting
  segmentIds: string[];
  excludeSegments?: string[];
  addressList?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }[];

  // Production & Mailing
  printVendor?: string;
  mailClass: "first_class" | "standard" | "priority";
  expectedDelivery?: Date;
  trackingEnabled: boolean;

  // Cost Calculation
  costs: {
    printing: number;
    postage: number;
    processing: number;
    total: number;
    costPerPiece: number;
  };

  // Performance Metrics
  metrics: {
    printed: number;
    mailed: number;
    delivered: number;
    returned: number;
    responses: number;
    responseRate: number;
    costPerResponse: number;
    revenue: number;
    roi: number;
  };

  // Status
  status:
    | "draft"
    | "approved"
    | "printing"
    | "mailed"
    | "delivered"
    | "cancelled";
}

// Cross-Channel Campaign Orchestration
export interface MultiChannelCampaign {
  id: string;
  name: string;
  description?: string;
  type: "multichannel";
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
  launchDate?: Date;
  endDate?: Date;
  startDate?: Date;
  frequency?: {
    maxContactsPerDay: number;
    maxContactsPerWeek: number;
    minHoursBetweenContacts: number;
    preferredContactTimes?: {
      start: string;
      end: string;
      timezone: string;
    };
  };
  content?: {
    customFields?: Record<string, any>;
  };
  budget: {
    total: number;
    allocated: Record<string, number>; // channel -> budget
    spent: Record<string, number>;
  };
  audience: {
    totalSize: number;
    segments: string[];
    channelDistribution: Record<string, number>;
    personalizedFor?: string;
    totalRecipients?: number;
  };
  channels: {
    email?: EmailCampaign;
    social?: SocialMediaPost;
    directMail?: DirectMailCampaign;
  };
  sequence: WorkflowAction[];
  performance: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalConverted: number;
    totalRevenue: number;
    channelBreakdown: Record<string, any>;
  };
  settings: {
    coordinateDelivery: boolean;
    respectFrequencyCaps: boolean;
    enableCrosschannelOptimization: boolean;
  };
}

// Alias for backward compatibility
export type ChannelCampaign = MultiChannelCampaign;

export interface OriginalMultiChannelCampaign {
  id: string;
  name: string;
  description?: string;
  campaignId: string;
  clientId: string;

  // Channel Coordination
  channels: (EmailCampaign | SocialMediaPost | DirectMailCampaign)[];

  // Sequencing & Timing
  sequence: {
    channelId: string;
    delay: number; // minutes after previous step or campaign start
    conditions?: {
      type: "engagement" | "time" | "custom";
      rules: Record<string, any>;
    }[];
  }[];

  // Cross-Channel Rules
  frequency: {
    maxContactsPerDay: number;
    maxContactsPerWeek: number;
    minHoursBetweenContacts: number;
    preferredContactTimes?: {
      start: string; // "09:00"
      end: string; // "17:00"
      timezone: string;
    };
  };

  // Unified Analytics
  aggregatedMetrics: {
    totalReach: number;
    totalEngagements: number;
    totalConversions: number;
    totalRevenue: number;
    crossChannelConversions: number;
    channelAttribution: {
      [channelId: string]: {
        firstTouch: number;
        lastTouch: number;
        multiTouch: number;
        revenue: number;
      };
    };
  };

  // Status & Lifecycle
  status:
    | "draft"
    | "scheduled"
    | "active"
    | "paused"
    | "completed"
    | "cancelled";
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Workflow Actions for multi-channel campaigns
export interface WorkflowAction {
  id: string;
  type:
    | "send_email"
    | "post_social"
    | "send_direct_mail"
    | "add_to_segment"
    | "update_field"
    | "wait";
  parameters?: Record<string, any>; // Optional for wait actions
  delay?: number; // in minutes
}

// Automation & Triggers
export interface AutomationRule {
  id: string;
  name: string;
  campaignId: string;
  clientId: string;

  // Trigger Configuration
  trigger: {
    type: "time_based" | "engagement_based" | "behavior_based" | "data_based";
    conditions: {
      field: string;
      operator:
        | "equals"
        | "not_equals"
        | "greater_than"
        | "less_than"
        | "contains"
        | "exists";
      value: any;
    }[];
    schedule?: {
      frequency: "once" | "daily" | "weekly" | "monthly";
      time?: string; // "14:30"
      daysOfWeek?: number[];
      timezone?: string;
    };
  };

  // Actions
  actions: {
    type:
      | "send_email"
      | "post_social"
      | "send_direct_mail"
      | "add_to_segment"
      | "update_field"
      | "wait";
    parameters?: Record<string, any>; // Optional for wait actions
    delay?: number; // minutes
  }[];

  // Performance
  executions: {
    triggered: number;
    successful: number;
    failed: number;
    lastTriggered?: Date;
  };

  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Channel Templates
export interface ChannelTemplate {
  id: string;
  name: string;
  description?: string;
  type: ChannelType;
  category: string;

  // Template Content
  content: {
    subject?: string; // For email
    htmlContent?: string;
    textContent?: string;
    message?: string; // For social media
    customFields?: Record<string, any>;
  };

  // Template Configuration
  config: {
    isPublic: boolean;
    tags: string[];
    previewImage?: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedSetupTime: number; // minutes
    customFields?: Record<string, any>;
  };

  // Usage Statistics
  usage: {
    timesUsed: number;
    avgPerformance?: Record<string, number>;
    rating?: number;
    reviews?: number;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  clientId?: string; // null for public templates
}

// Channel Analytics & Reporting
export interface ChannelAnalytics {
  campaignId: string;
  channelType: ChannelType;
  channelId: string;
  dateRange: {
    start: Date;
    end: Date;
  };

  // Core Metrics
  metrics: {
    reach: number;
    impressions: number;
    engagements: number;
    clicks: number;
    conversions: number;
    revenue: number;
    cost: number;

    // Calculated Metrics
    engagementRate: number;
    clickThroughRate: number;
    conversionRate: number;
    costPerClick: number;
    costPerConversion: number;
    returnOnAdSpend: number;
  };

  // Time Series Data
  dailyMetrics: {
    date: string;
    metrics: Record<string, number>;
  }[];

  // Audience Insights
  audienceInsights?: {
    demographics: Record<string, number>;
    geography: Record<string, number>;
    interests: Record<string, number>;
    devices: Record<string, number>;
  };
}

// Cross-Channel Attribution Models
export interface AttributionModel {
  id: string;
  name: string;
  type:
    | "first_touch"
    | "last_touch"
    | "linear"
    | "time_decay"
    | "position_based"
    | "custom";

  // Model Configuration
  config: {
    lookbackWindow: number; // days
    weights?: Record<string, number>; // for custom models
    decayRate?: number; // for time decay models
  };

  // Attribution Results
  results: {
    channelAttribution: {
      [channelId: string]: {
        touches: number;
        attributedRevenue: number;
        attributedConversions: number;
        percentage: number;
      };
    };
    customerJourneys: {
      totalJourneys: number;
      avgTouchpoints: number;
      avgJourneyLength: number; // days
      topPaths: {
        path: string[];
        count: number;
        conversionRate: number;
        avgRevenue: number;
      }[];
    };
  };

  // Metadata
  lastCalculated: Date;
  campaignId: string;
  clientId: string;
}

// API Request/Response Types
export interface CreateEmailCampaignData {
  name: string;
  campaignId: string;
  clientId: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  htmlContent: string;
  segmentIds: string[];
  sendType: EmailCampaign["sendType"];
  scheduledAt?: Date;
}

export interface CreateSocialMediaPostData {
  name: string;
  campaignId: string;
  clientId: string;
  platforms: SocialPlatform[];
  message: string;
  hashtags?: string[];
  publishType: SocialMediaPost["publishType"];
  scheduledAt?: Date;
}

export interface CreateDirectMailCampaignData {
  name: string;
  campaignId: string;
  clientId: string;
  mailType: DirectMailCampaign["mailType"];
  frontSideContent: string;
  segmentIds: string[];
  mailClass: DirectMailCampaign["mailClass"];
}

export interface UpdateChannelData {
  name?: string;
  status?:
    | "draft"
    | "scheduled"
    | "active"
    | "paused"
    | "completed"
    | "cancelled"
    | "sending"
    | "sent"
    | "published"
    | "failed";
  scheduledAt?: Date;
  // Email specific
  subject?: string;
  htmlContent?: string;
  fromName?: string;
  fromEmail?: string;
  segmentIds?: string[];
  // Social specific
  message?: string;
  platforms?: SocialPlatform[];
  hashtags?: string[];
  // Direct mail specific
  frontSideContent?: string;
  mailClass?: DirectMailCampaign["mailClass"];
}
