/**
 * Track15 Campaign Methodology Types
 *
 * Types for Track15-specific campaign fields and structures
 * Aligned with database schema and API layer
 */

// ============================================================================
// CAMPAIGN SEASONS
// ============================================================================

export type Track15Season = "spring" | "summer" | "fall" | "winter";

// Alias for backwards compatibility
export type CampaignSeason = Track15Season;

export const TRACK15_SEASONS = {
  spring: {
    name: "Spring Cultivation",
    timing: "March - May",
    focus: "Donor renewal and spring giving",
    description: "March-May renewal and engagement campaigns",
    defaultDuration: 84, // days
  },
  summer: {
    name: "Summer Emergency",
    timing: "June - August",
    focus: "Urgent needs and emergency response",
    description: "June-August emergency and need-based appeals",
    defaultDuration: 28,
  },
  fall: {
    name: "Fall Engagement",
    timing: "September - October",
    focus: "Community building and engagement",
    description: "Fall donor cultivation and engagement",
    defaultDuration: 60,
  },
  winter: {
    name: "Year-End Appeal",
    timing: "November - December",
    focus: "Tax benefits and year-end appeals",
    description: "November-December year-end giving campaigns",
    defaultDuration: 56,
  },
} as const;

// Alias for backwards compatibility
export const CAMPAIGN_SEASONS = TRACK15_SEASONS;

// ============================================================================
// WORKFLOW STAGES
// ============================================================================

export type Track15Stage =
  | "not_started"
  | "core_story_draft"
  | "arc_drafted"
  | "ready_for_launch"
  | "active"
  | "completed";

export type Track15NarrativeStage =
  | "awareness"
  | "engagement"
  | "consideration"
  | "conversion"
  | "gratitude";

export const NARRATIVE_STAGES = {
  awareness: {
    name: "Awareness",
    description: "Introduce the need and your organization's role",
    order: 1,
  },
  engagement: {
    name: "Engagement",
    description: "Deepen donor understanding and connection",
    order: 2,
  },
  consideration: {
    name: "Consideration",
    description: "Present specific giving opportunities",
    order: 3,
  },
  conversion: {
    name: "Conversion",
    description: "Make the ask and facilitate giving",
    order: 4,
  },
  gratitude: {
    name: "Gratitude",
    description: "Thank donors and report impact",
    order: 5,
  },
} as const;

// ============================================================================
// CHANNELS
// ============================================================================

export type Track15Channel =
  | "email"
  | "social"
  | "direct_mail"
  | "sms"
  | "phone"
  | "events"
  | "web";

export const TRACK15_CHANNELS = {
  email: { name: "Email", icon: "Mail" },
  social: { name: "Social Media", icon: "Share2" },
  direct_mail: { name: "Direct Mail", icon: "Mailbox" },
  sms: { name: "SMS", icon: "MessageSquare" },
  phone: { name: "Phone", icon: "Phone" },
  events: { name: "Events", icon: "Calendar" },
  web: { name: "Website", icon: "Globe" },
} as const;

// ============================================================================
// CORE STORY
// ============================================================================

export interface Track15CoreStory {
  headline: string; // Central narrative hook
  summary: string; // Brief campaign summary
  valueProposition: string; // What donors accomplish
  donorMotivation: string; // Primary emotional driver
}

export const DONOR_MOTIVATIONS = [
  "hope",
  "urgency",
  "gratitude",
  "belonging",
  "empowerment",
  "compassion",
  "justice",
  "celebration",
  "legacy",
  "impact",
] as const;

export type DonorMotivation = (typeof DONOR_MOTIVATIONS)[number];

// ============================================================================
// NARRATIVE ARC & STEPS
// ============================================================================

export interface Track15NarrativeStep {
  id: string;
  campaignId: string;

  stage: Track15NarrativeStage;
  title: string;
  body: string;

  sequence: number; // Order within the arc
  channels: Track15Channel[]; // Which channels to use

  primarySegment?: string; // Target segment
  callToAction?: string; // CTA text

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DONOR SEGMENTS
// ============================================================================

export const DONOR_SEGMENTS = [
  "current_donors",
  "lapsed_donors",
  "high_value_donors",
  "prospects",
  "monthly_supporters",
  "major_gift_prospects",
  "planned_giving_prospects",
] as const;

export type DonorSegment = (typeof DONOR_SEGMENTS)[number];

export const SEGMENT_DEFINITIONS = {
  current_donors: {
    name: "Current Donors",
    description: "Donors who gave in the last 12 months",
  },
  lapsed_donors: {
    name: "Lapsed Donors",
    description: "Previously active donors who haven't given in 12+ months",
  },
  high_value_donors: {
    name: "High Value Donors",
    description: "Donors with cumulative or single gifts above threshold",
  },
  prospects: {
    name: "Prospects",
    description: "Never-donors who have shown interest",
  },
  monthly_supporters: {
    name: "Monthly Supporters",
    description: "Active recurring monthly donors",
  },
  major_gift_prospects: {
    name: "Major Gift Prospects",
    description: "Qualified prospects for major gifts",
  },
  planned_giving_prospects: {
    name: "Planned Giving Prospects",
    description: "Prospects for planned giving programs",
  },
} as const;

// ============================================================================
// LIFT METRICS
// ============================================================================

export interface Track15LiftMetrics {
  engagementLift: number; // Percent lift in engagement
  responseRateLift: number; // Percent lift in response rate
  velocityLift: number; // Percent lift in giving velocity

  // Baselines for comparison
  baselineResponseRate?: number;
  baselineEngagementScore?: number;
  baselineVelocity?: number;

  // Current values
  currentResponseRate?: number;
  currentEngagementScore?: number;
  currentVelocity?: number;

  calculatedAt: string;
}

// ============================================================================
// CAMPAIGN META
// ============================================================================

export interface Track15CampaignMeta {
  enabled: boolean;
  season?: Track15Season;
  templateKey?: string; // 'annual_fund' | 'year_end' | 'emergency' | ...

  stage: Track15Stage;

  coreStory?: Track15CoreStory;
  narrativeSteps?: Track15NarrativeStep[];

  // Optional derived analytics
  liftMetrics?: Track15LiftMetrics;
}

// ============================================================================
// EXTENDED CAMPAIGN INTERFACE
// ============================================================================

export interface Track15Campaign {
  // Standard campaign fields
  id: string;
  clientId: string;
  name: string;
  description?: string;
  status: string;
  goalAmount?: number;
  startDate?: string;
  endDate?: string;

  // Track15 meta
  track15?: Track15CampaignMeta;
}

// ============================================================================
// CAMPAIGN TEMPLATES
// ============================================================================

export interface Track15Template {
  key: string;
  season: Track15Season;
  name: string;
  description: string;
  defaultCoreStory: Partial<Track15CoreStory>;
  suggestedChannels: Track15Channel[];
  estimatedDuration: number; // days
  narrativeStages: Track15NarrativeStage[];
}

export const TRACK15_TEMPLATES: Record<string, Track15Template> = {
  annual_fund: {
    key: "annual_fund",
    season: "spring",
    name: "Annual Fund Campaign",
    description: "Donor renewal and spring engagement sequence",
    defaultCoreStory: {
      donorMotivation: "hope",
      valueProposition: "Continue the impact you started",
    },
    suggestedChannels: ["email", "direct_mail", "social"],
    estimatedDuration: 84,
    narrativeStages: [
      "awareness",
      "engagement",
      "consideration",
      "conversion",
      "gratitude",
    ],
  },
  year_end: {
    key: "year_end",
    season: "winter",
    name: "Year-End Appeal",
    description: "Year-end giving and tax benefit campaign",
    defaultCoreStory: {
      donorMotivation: "gratitude",
      valueProposition: "End the year with impact, maximize tax benefits",
    },
    suggestedChannels: ["email", "direct_mail", "social"],
    estimatedDuration: 56,
    narrativeStages: [
      "awareness",
      "engagement",
      "consideration",
      "conversion",
      "gratitude",
    ],
  },
  emergency: {
    key: "emergency",
    season: "summer",
    name: "Emergency Appeal",
    description: "Urgent need-based campaign",
    defaultCoreStory: {
      donorMotivation: "urgency",
      valueProposition: "Act now to address critical need",
    },
    suggestedChannels: ["email", "social", "sms"],
    estimatedDuration: 14,
    narrativeStages: ["awareness", "consideration", "conversion", "gratitude"],
  },
  fall_engagement: {
    key: "fall_engagement",
    season: "fall",
    name: "Fall Engagement Campaign",
    description: "Community building and donor cultivation",
    defaultCoreStory: {
      donorMotivation: "belonging",
      valueProposition: "Be part of our community of changemakers",
    },
    suggestedChannels: ["email", "social", "events"],
    estimatedDuration: 60,
    narrativeStages: [
      "awareness",
      "engagement",
      "consideration",
      "conversion",
      "gratitude",
    ],
  },
};

// ============================================================================
// RETENTION METRICS
// ============================================================================

export interface Track15RetentionPoint {
  period: string; // "2024-Q1" or "2024-01" etc.
  campaignRetention: number; // 0-1
  baselineRetention: number; // 0-1
}

export interface Track15RetentionSeries {
  campaignId: string;
  label: string; // e.g. "Track15 Year-End 2024"
  points: Track15RetentionPoint[];
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface Track15StepFormData {
  stage: Track15NarrativeStage;
  title: string;
  body: string;
  sequence: number;
  channels: Track15Channel[];
  primarySegment?: DonorSegment;
  callToAction?: string;
}
