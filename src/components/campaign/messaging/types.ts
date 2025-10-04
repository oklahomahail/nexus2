// Messaging Framework Types and Interfaces

export type MessageTone =
  | "urgent"
  | "hopeful"
  | "celebratory"
  | "inspiring"
  | "conversational"
  | "professional";

export type AudienceSegment =
  | "major-donors"
  | "recurring-donors"
  | "lapsed-donors"
  | "new-prospects"
  | "volunteers"
  | "community"
  | "corporate";

export type MessageChannel =
  | "email"
  | "social-media"
  | "direct-mail"
  | "website"
  | "phone"
  | "in-person"
  | "press";

export type TalkingPointCategory =
  | "impact"
  | "urgency"
  | "statistics"
  | "testimonial"
  | "financial"
  | "timeline"
  | "solution";

// Core Story Structure
export interface CampaignStory {
  id: string;
  campaignId: string;

  // Core Narrative Elements
  problemStatement: string;
  solution: string;
  impact: string;
  callToAction: string;

  // Supporting Elements
  vision: string;
  mission: string;
  urgency: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Individual Talking Point
export interface TalkingPoint {
  id: string;
  title: string;
  content: string;
  category: TalkingPointCategory;
  tags: string[];

  // Context and Usage
  statistic?: {
    value: string;
    source: string;
    date?: Date;
  };

  quote?: {
    text: string;
    author: string;
    title?: string;
    context?: string;
  };

  // Targeting
  audiences: AudienceSegment[];
  channels: MessageChannel[];

  // Validation
  isVerified: boolean;
  verificationSource?: string;

  // Metadata
  priority: "high" | "medium" | "low";
  createdAt: Date;
  updatedAt: Date;
}

// Message Variation for Different Contexts
export interface MessageVariation {
  id: string;
  baseMessageId: string;

  // Targeting
  audience: AudienceSegment;
  channel: MessageChannel;

  // Content
  subject?: string; // For email/letters
  headline?: string; // For social/web
  body: string;
  callToAction: string;

  // Constraints
  characterLimit?: number;
  wordLimit?: number;

  // Performance
  openRate?: number;
  clickRate?: number;
  conversionRate?: number;

  // Status
  status: "draft" | "review" | "approved" | "active" | "archived";

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}

// Voice and Tone Configuration
export interface VoiceSettings {
  // Organizational Voice
  brandPersonality: string[];
  writingStyle: "formal" | "conversational" | "friendly" | "professional";
  vocabularyLevel: "simple" | "moderate" | "advanced";

  // Tone Preferences
  primaryTone: MessageTone;
  allowedTones: MessageTone[];

  // Voice Attributes
  attributes: {
    warmth: number; // 1-5 scale
    authority: number; // 1-5 scale
    enthusiasm: number; // 1-5 scale
    urgency: number; // 1-5 scale
  };

  // Guidelines
  dosList: string[];
  dontsList: string[];

  // Examples
  goodExamples: string[];
  badExamples: string[];
}

// Complete Messaging Framework
export interface MessagingFramework {
  id: string;
  campaignId: string;

  // Core Components
  story: CampaignStory;
  talkingPoints: TalkingPoint[];
  variations: MessageVariation[];
  voiceSettings: VoiceSettings;

  // Templates
  templates: MessageTemplate[];

  // Analytics
  performance: MessagingPerformance;

  // Metadata
  status: "draft" | "review" | "approved" | "active";
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

// Message Templates
export interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  channel: MessageChannel;
  audience: AudienceSegment;

  // Template Structure
  structure: {
    sections: TemplateSection[];
    variables: TemplateVariable[];
  };

  // Content
  subject?: string;
  body: string;
  footer?: string;

  // Usage
  isDefault: boolean;
  usageCount: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateSection {
  id: string;
  name: string;
  order: number;
  required: boolean;
  content: string;
  placeholder?: string;
}

export interface TemplateVariable {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "currency" | "percentage";
  defaultValue?: string;
  required: boolean;
}

// Performance Analytics
export interface MessagingPerformance {
  // Overall Metrics
  totalMessages: number;
  totalSent: number;
  totalEngagement: number;

  // Channel Performance
  channelMetrics: Record<MessageChannel, ChannelMetrics>;

  // Audience Performance
  audienceMetrics: Record<AudienceSegment, AudienceMetrics>;

  // Talking Point Performance
  talkingPointMetrics: Record<string, TalkingPointMetrics>;

  // A/B Testing Results
  abTests: ABTestResult[];

  // Trends
  trends: {
    engagement: TimeSeriesData[];
    conversion: TimeSeriesData[];
    reach: TimeSeriesData[];
  };
}

export interface ChannelMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;

  rates: {
    delivery: number;
    open: number;
    click: number;
    conversion: number;
  };
}

export interface AudienceMetrics {
  size: number;
  engaged: number;
  converted: number;

  engagement: {
    high: number;
    medium: number;
    low: number;
  };

  preferences: {
    channels: Record<MessageChannel, number>;
    tones: Record<MessageTone, number>;
    topics: Record<TalkingPointCategory, number>;
  };
}

export interface TalkingPointMetrics {
  usage: number;
  engagement: number;
  conversion: number;
  effectiveness: number; // 1-10 score

  bestPerformingChannels: MessageChannel[];
  bestPerformingAudiences: AudienceSegment[];
}

export interface ABTestResult {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;

  variants: {
    control: MessageVariation;
    test: MessageVariation;
  };

  results: {
    control: VariantResults;
    test: VariantResults;
    winner?: "control" | "test";
    confidence: number; // 0-1
  };

  status: "running" | "completed" | "stopped";
}

export interface VariantResults {
  sent: number;
  opened: number;
  clicked: number;
  converted: number;

  rates: {
    open: number;
    click: number;
    conversion: number;
  };
}

export interface TimeSeriesData {
  date: Date;
  value: number;
}

// Message Builder Utilities
export interface MessageBuilder {
  story: CampaignStory;
  talkingPoints: TalkingPoint[];
  voiceSettings: VoiceSettings;

  // Builder Methods (would be implemented in service)
  generateVariation(
    audience: AudienceSegment,
    channel: MessageChannel,
  ): MessageVariation;
  validateMessage(message: string): ValidationResult;
  suggestImprovements(message: string): Suggestion[];
  checkToneConsistency(message: string): ToneAnalysis;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: Suggestion[];
}

export interface ValidationError {
  type: "length" | "tone" | "content" | "format";
  message: string;
  field?: string;
}

export interface ValidationWarning {
  type: "tone" | "readability" | "engagement" | "accessibility";
  message: string;
  severity: "low" | "medium" | "high";
}

export interface Suggestion {
  type: "improvement" | "alternative" | "addition";
  message: string;
  originalText?: string;
  suggestedText?: string;
  confidence: number; // 0-1
}

export interface ToneAnalysis {
  detectedTone: MessageTone;
  confidence: number;
  isConsistent: boolean;
  recommendations: string[];

  attributes: {
    warmth: number;
    authority: number;
    enthusiasm: number;
    urgency: number;
  };
}
