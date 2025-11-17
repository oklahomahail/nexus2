/**
 * Segmentation Service
 *
 * Smart donor targeting combining industry best practices with client-specific reality.
 * Generates segment-based message variants and ask calculations.
 */

import type { DonorSegment } from "@/types/track15.types";

// ============================================================================
// Types
// ============================================================================

export interface SegmentCriteria {
  industryStandard: {
    recency?: RecencyBucket;
    frequency?: FrequencyBucket;
    monetary?: MonetaryBucket;
    engagement?: EngagementLevel;
    loyaltyScore?: number; // Consecutive years giving (0-10+)
  };
  clientSpecific: {
    averageGift?: number;
    medianGift?: number;
    giftRange?: { min: number; max: number };
    typicalUpgradePath?: string;
    conversionRate?: string;
    pipelineStatus?: PipelineStatus;
  };
  customRules?: Array<{ rule: string; value: string }>;
}

export type RecencyBucket =
  | "0-90_days" // Recent active
  | "91-365_days" // Active
  | "366-730_days" // Lapsed recent
  | "731+_days"; // Lapsed long-term

export type FrequencyBucket =
  | "first_time" // Never given before
  | "1-2_gifts_year" // Low frequency
  | "3-5_gifts_year" // Medium frequency
  | "6+_gifts_year" // High frequency
  | "monthly_sustainer"; // Recurring donor

export type MonetaryBucket =
  | "under_100" // <$100 lifetime
  | "100-999" // $100-999 lifetime
  | "1000-4999" // $1K-4.9K lifetime
  | "5000-24999" // $5K-24.9K major donor
  | "25000+"; // $25K+ major donor

export type EngagementLevel = "high" | "medium" | "low" | "none";

export type PipelineStatus =
  | "active"
  | "cultivation"
  | "lapsed_recent"
  | "lapsed_long"
  | "prospect"
  | "major_gift_qualified";

export interface SegmentDefinition {
  segmentName: string;
  segmentType: DonorSegment;
  priority:
    | "primary"
    | "secondary"
    | "tertiary"
    | "reactivation"
    | "cultivation";
  criteria: SegmentCriteria;
  estimatedSize?: number;
  estimatedRevenue?: {
    conservative: number;
    moderate: number;
    optimistic: number;
  };
}

export interface MessageVariant {
  variantName: string;
  targetSegments: string[];
  messagingApproach: {
    primaryTheme: string;
    emotionalTrigger: string;
    voiceTone: string;
    keyMessages: string[];
  };
  askStrategy: AskStrategy;
  contentAdjustments?: {
    directMail?: string;
    email?: string;
    social?: string;
  };
}

export interface AskStrategy {
  askType:
    | "upgrade"
    | "renewal"
    | "reactivation"
    | "acquisition"
    | "monthly_conversion"
    | "major_gift";
  askCalculation: {
    method:
      | "last_gift_plus"
      | "highest_gift_plus"
      | "average_times"
      | "fixed_ladder"
      | "custom";
    formula: string;
    minimumAsk?: number;
    maximumAsk?: number;
  };
  askAmountOptions: string[];
  monthlyAskVariant?: string;
  ctaLanguage: string;
}

export interface SegmentationPlan {
  planName: string;
  segments: SegmentDefinition[];
  messageVariants: MessageVariant[];
  totalEstimatedRevenue?: number;
  totalEstimatedCost?: number;
  projectedROI?: string;
}

// ============================================================================
// Industry Best Practice Rules
// ============================================================================

/**
 * Standard fundraising segmentation logic based on RFM (Recency, Frequency, Monetary)
 */
export const INDUSTRY_STANDARD_RULES = {
  recency: {
    "0-90_days": {
      priority: "high",
      description: "Highly engaged, recent donors",
      askType: "upgrade" as const,
      expectedResponseRate: "3-5%",
    },
    "91-365_days": {
      priority: "medium",
      description: "Active donors within 12 months",
      askType: "renewal" as const,
      expectedResponseRate: "2-4%",
    },
    "366-730_days": {
      priority: "medium",
      description: "Lapsed within last 2 years",
      askType: "reactivation" as const,
      expectedResponseRate: "1-2%",
    },
    "731+_days": {
      priority: "low",
      description: "Long-term lapsed donors",
      askType: "reactivation" as const,
      expectedResponseRate: "0.5-1%",
    },
  },

  frequency: {
    first_time: {
      askType: "acquisition" as const,
      suggestedFollowUp: "Welcome series + retention focus",
    },
    "1-2_gifts_year": {
      askType: "renewal" as const,
      suggestedFollowUp: "Frequency upgrade (move to 3+)",
    },
    "3-5_gifts_year": {
      askType: "upgrade" as const,
      suggestedFollowUp: "Monthly conversion opportunity",
    },
    "6+_gifts_year": {
      askType: "monthly_conversion" as const,
      suggestedFollowUp: "Retain and deepen relationship",
    },
    monthly_sustainer: {
      askType: "upgrade" as const,
      suggestedFollowUp: "Retain at all costs, occasional upgrade",
    },
  },

  monetary: {
    under_100: {
      askMultiplier: 1.5, // Suggest 50% increase
      typicalAskLadder: [25, 50, 100, 250],
    },
    "100-999": {
      askMultiplier: 1.25, // Suggest 25% increase
      typicalAskLadder: [100, 250, 500, 1000],
    },
    "1000-4999": {
      askMultiplier: 1.2, // Suggest 20% increase
      typicalAskLadder: [500, 1000, 2500, 5000],
    },
    "5000-24999": {
      askMultiplier: 1.15, // Suggest 15% increase
      typicalAskLadder: [2500, 5000, 10000, 25000],
      requiresPersonalOutreach: true,
    },
    "25000+": {
      askMultiplier: 1.1, // Suggest 10% increase
      typicalAskLadder: [], // Custom for each donor
      requiresPersonalOutreach: true,
      majorGiftOfficerRequired: true,
    },
  },
};

// ============================================================================
// Segment Generation Functions
// ============================================================================

/**
 * Generate comprehensive segmentation plan combining industry best practices
 * with client-specific donor data
 */
export function generateSegmentationPlan(
  campaignGoal: number,
  clientDonorData?: {
    totalDonors: number;
    averageGift: number;
    medianGift: number;
    retentionRate: number;
    recentDonors: number; // Last 90 days
    lapsedDonors: number; // 366+ days
    monthlyGivers: number;
    majorDonors: number; // $5K+ lifetime
  },
): SegmentationPlan {
  const segments: SegmentDefinition[] = [];
  const messageVariants: MessageVariant[] = [];

  // === PRIMARY SEGMENTS ===

  // 1. Recent High-Engagement Donors
  if (clientDonorData && clientDonorData.recentDonors > 0) {
    segments.push({
      segmentName: "Primary: Recent High-Engagement",
      segmentType: "current_donors",
      priority: "primary",
      criteria: {
        industryStandard: {
          recency: "0-90_days",
          frequency: "3-5_gifts_year",
          engagement: "high",
        },
        clientSpecific: {
          averageGift: clientDonorData.averageGift,
          medianGift: clientDonorData.medianGift,
          conversionRate: "3-5%",
          pipelineStatus: "active",
        },
      },
      estimatedSize: Math.floor(clientDonorData.recentDonors * 0.4), // 40% of recent donors
      estimatedRevenue: {
        conservative: Math.floor(
          clientDonorData.recentDonors *
            0.4 *
            clientDonorData.averageGift *
            1.1,
        ),
        moderate: Math.floor(
          clientDonorData.recentDonors *
            0.4 *
            clientDonorData.averageGift *
            1.25,
        ),
        optimistic: Math.floor(
          clientDonorData.recentDonors *
            0.4 *
            clientDonorData.averageGift *
            1.5,
        ),
      },
    });

    messageVariants.push({
      variantName: "upgrade_impact",
      targetSegments: ["Primary: Recent High-Engagement"],
      messagingApproach: {
        primaryTheme: "Impact amplification",
        emotionalTrigger: "impact",
        voiceTone: "inspiring",
        keyMessages: [
          "Your consistent support has created measurable change",
          "This year, your increased gift can expand that impact even further",
          "Join other committed donors in making 2024 our most impactful year yet",
        ],
      },
      askStrategy: {
        askType: "upgrade",
        askCalculation: {
          method: "last_gift_plus",
          formula: "Last gift × 1.25, 1.5, 2.0",
          minimumAsk: 25,
          maximumAsk: undefined,
        },
        askAmountOptions: ["3 ascending options based on last gift"],
        monthlyAskVariant:
          "Highlight: '$X/month = $Y/year impact' with upgrade benefits",
        ctaLanguage: "Increase your impact this year",
      },
      contentAdjustments: {
        directMail:
          "Lead with past impact stats, emphasize upgrade opportunity in P.S.",
        email: "Include impact infographic, clear upgrade ladder in CTA",
        social:
          "Celebrate donor commitment, invite community to join at higher levels",
      },
    });
  }

  // 2. Monthly Sustainers
  if (clientDonorData && clientDonorData.monthlyGivers > 0) {
    segments.push({
      segmentName: "Primary: Monthly Sustainers",
      segmentType: "monthly_supporters",
      priority: "primary",
      criteria: {
        industryStandard: {
          recency: "0-90_days",
          frequency: "monthly_sustainer",
          engagement: "high",
        },
        clientSpecific: {
          averageGift: clientDonorData.averageGift * 0.5, // Monthly gifts typically smaller
          conversionRate: "1-2% upgrade rate",
          pipelineStatus: "active",
        },
      },
      estimatedSize: clientDonorData.monthlyGivers,
      estimatedRevenue: {
        conservative: Math.floor(
          clientDonorData.monthlyGivers *
            clientDonorData.averageGift *
            0.5 *
            0.01,
        ),
        moderate: Math.floor(
          clientDonorData.monthlyGivers *
            clientDonorData.averageGift *
            0.5 *
            0.015,
        ),
        optimistic: Math.floor(
          clientDonorData.monthlyGivers *
            clientDonorData.averageGift *
            0.5 *
            0.02,
        ),
      },
    });

    messageVariants.push({
      variantName: "gratitude_sustainer",
      targetSegments: ["Primary: Monthly Sustainers"],
      messagingApproach: {
        primaryTheme: "Deep gratitude and community belonging",
        emotionalTrigger: "gratitude",
        voiceTone: "warm",
        keyMessages: [
          "Your monthly partnership provides the steady foundation for our work",
          "You're part of an exclusive community making year-round impact",
          "Consider a small increase to your monthly gift to expand your impact",
        ],
      },
      askStrategy: {
        askType: "upgrade",
        askCalculation: {
          method: "average_times",
          formula: "Current monthly × 1.1, 1.25, 1.5 (suggest $5-10 increase)",
          minimumAsk: 5,
        },
        askAmountOptions: [
          "Increase by $5",
          "Increase by $10",
          "Custom amount",
        ],
        monthlyAskVariant: "Soft ask - emphasize gratitude over upgrade",
        ctaLanguage: "Update your monthly gift",
      },
      contentAdjustments: {
        directMail: "Lead with gratitude, soft ask in P.S. only",
        email: "Focus on impact reporting, upgrade as secondary CTA",
        social: "Celebrate monthly donor community, no direct ask",
      },
    });
  }

  // === SECONDARY SEGMENTS ===

  // 3. Lapsed Reactivation
  if (clientDonorData && clientDonorData.lapsedDonors > 0) {
    segments.push({
      segmentName: "Secondary: Lapsed Reactivation",
      segmentType: "lapsed_donors",
      priority: "secondary",
      criteria: {
        industryStandard: {
          recency: "366-730_days",
          engagement: "low",
        },
        clientSpecific: {
          averageGift: clientDonorData.averageGift * 0.8, // Expect slightly lower
          conversionRate: "1-2%",
          pipelineStatus: "lapsed_recent",
        },
      },
      estimatedSize: clientDonorData.lapsedDonors,
      estimatedRevenue: {
        conservative: Math.floor(
          clientDonorData.lapsedDonors *
            clientDonorData.averageGift *
            0.8 *
            0.01,
        ),
        moderate: Math.floor(
          clientDonorData.lapsedDonors *
            clientDonorData.averageGift *
            0.8 *
            0.015,
        ),
        optimistic: Math.floor(
          clientDonorData.lapsedDonors *
            clientDonorData.averageGift *
            0.8 *
            0.02,
        ),
      },
    });

    messageVariants.push({
      variantName: "reactivation_wemissyou",
      targetSegments: ["Secondary: Lapsed Reactivation"],
      messagingApproach: {
        primaryTheme: "We miss you - come back",
        emotionalTrigger: "belonging",
        voiceTone: "warm",
        keyMessages: [
          "You were an important part of our community",
          "So much has changed since you last gave - let us share the impact",
          "Your support is needed now more than ever",
        ],
      },
      askStrategy: {
        askType: "reactivation",
        askCalculation: {
          method: "last_gift_plus",
          formula: "Last gift, Last gift × 1.1, Last gift × 1.25",
          minimumAsk: 25,
        },
        askAmountOptions: [
          "Match last gift",
          "Increase by 10%",
          "Custom amount",
        ],
        monthlyAskVariant:
          "Offer monthly as 'easy way to rejoin' - emphasize convenience",
        ctaLanguage: "Welcome back - renew your support",
      },
      contentAdjustments: {
        directMail:
          "Warm, personal tone. Emphasize 'we miss you' in opening and P.S.",
        email:
          "Share recent impact stories, make giving easy (1-click if possible)",
        social: "Not recommended for lapsed donors (focus on DM + email)",
      },
    });
  }

  // 4. Major Gift Prospects
  if (clientDonorData && clientDonorData.majorDonors > 0) {
    segments.push({
      segmentName: "Cultivation: Major Gift Prospects",
      segmentType: "major_gift_prospects",
      priority: "cultivation",
      criteria: {
        industryStandard: {
          monetary: "5000-24999",
          engagement: "medium",
        },
        clientSpecific: {
          averageGift: 5000,
          pipelineStatus: "major_gift_qualified",
        },
        customRules: [
          { rule: "Requires personal outreach", value: "true" },
          { rule: "Not part of general mail campaign", value: "true" },
        ],
      },
      estimatedSize: clientDonorData.majorDonors,
      estimatedRevenue: {
        conservative: Math.floor(clientDonorData.majorDonors * 5000 * 0.3),
        moderate: Math.floor(clientDonorData.majorDonors * 7500 * 0.5),
        optimistic: Math.floor(clientDonorData.majorDonors * 10000 * 0.7),
      },
    });

    messageVariants.push({
      variantName: "major_gift_cultivation",
      targetSegments: ["Cultivation: Major Gift Prospects"],
      messagingApproach: {
        primaryTheme: "Transformational partnership opportunity",
        emotionalTrigger: "legacy",
        voiceTone: "professional",
        keyMessages: [
          "Your leadership gift can create transformational change",
          "Join a select group of partners making outsized impact",
          "Let's discuss how your philanthropic goals align with our mission",
        ],
      },
      askStrategy: {
        askType: "major_gift",
        askCalculation: {
          method: "custom",
          formula: "Customized per donor capacity and interests",
          minimumAsk: 5000,
        },
        askAmountOptions: ["Custom proposal per donor"],
        ctaLanguage: "Schedule a conversation about partnership",
      },
      contentAdjustments: {
        directMail: "Personalized letter from ED/Board Chair, no mass appeal",
        email: "Not recommended - use for scheduling only",
        social: "Not applicable",
      },
    });
  }

  // === CALCULATE TOTALS ===

  const totalEstimatedRevenue = segments.reduce((sum, seg) => {
    return sum + (seg.estimatedRevenue?.moderate || 0);
  }, 0);

  return {
    planName: `${new Date().getFullYear()} Campaign Segmentation Plan`,
    segments,
    messageVariants,
    totalEstimatedRevenue,
    projectedROI:
      campaignGoal > 0
        ? `${Math.round((totalEstimatedRevenue / campaignGoal) * 100)}%`
        : "N/A",
  };
}

/**
 * Calculate ask amounts for a specific donor based on their giving history
 */
export function calculateAskAmounts(
  donorHistory: {
    lastGift?: number;
    highestGift?: number;
    averageGift?: number;
    lifetimeValue?: number;
  },
  strategy: AskStrategy,
): number[] {
  const amounts: number[] = [];
  const { method, minimumAsk = 25, maximumAsk } = strategy.askCalculation;

  switch (method) {
    case "last_gift_plus":
      if (donorHistory.lastGift) {
        amounts.push(
          Math.max(donorHistory.lastGift, minimumAsk),
          Math.max(Math.round(donorHistory.lastGift * 1.25), minimumAsk),
          Math.max(Math.round(donorHistory.lastGift * 1.5), minimumAsk),
          Math.max(Math.round(donorHistory.lastGift * 2), minimumAsk),
        );
      }
      break;

    case "highest_gift_plus":
      if (donorHistory.highestGift) {
        amounts.push(
          Math.max(donorHistory.highestGift, minimumAsk),
          Math.max(donorHistory.highestGift + 50, minimumAsk),
          Math.max(donorHistory.highestGift + 100, minimumAsk),
          Math.max(donorHistory.highestGift + 250, minimumAsk),
        );
      }
      break;

    case "average_times":
      if (donorHistory.averageGift) {
        amounts.push(
          Math.max(Math.round(donorHistory.averageGift * 1.5), minimumAsk),
          Math.max(Math.round(donorHistory.averageGift * 2), minimumAsk),
          Math.max(Math.round(donorHistory.averageGift * 3), minimumAsk),
        );
      }
      break;

    case "fixed_ladder":
      // Use industry-standard ladder based on lifetime value
      if (donorHistory.lifetimeValue) {
        if (donorHistory.lifetimeValue < 100) {
          amounts.push(25, 50, 100, 250);
        } else if (donorHistory.lifetimeValue < 1000) {
          amounts.push(100, 250, 500, 1000);
        } else if (donorHistory.lifetimeValue < 5000) {
          amounts.push(500, 1000, 2500, 5000);
        } else {
          amounts.push(2500, 5000, 10000, 25000);
        }
      }
      break;
  }

  // Apply maximum if specified
  const filtered = maximumAsk
    ? amounts.filter((amt) => amt <= maximumAsk)
    : amounts;

  // Deduplicate and sort
  return [...new Set(filtered)].sort((a, b) => a - b).slice(0, 4); // Max 4 options
}

/**
 * Generate message variant recommendations based on segment characteristics
 */
export function generateMessageVariant(
  segmentType: DonorSegment,
  criteria: SegmentCriteria,
): Partial<MessageVariant> {
  const recency = criteria.industryStandard.recency;
  const frequency = criteria.industryStandard.frequency;

  // Determine primary theme
  let primaryTheme = "Impact and gratitude";
  let emotionalTrigger = "impact";
  let voiceTone = "warm";

  if (recency === "0-90_days") {
    primaryTheme = "Impact amplification";
    emotionalTrigger = "impact";
    voiceTone = "inspiring";
  } else if (recency && recency.includes("730")) {
    primaryTheme = "We miss you - reconnect";
    emotionalTrigger = "belonging";
    voiceTone = "warm";
  }

  if (frequency === "monthly_sustainer") {
    primaryTheme = "Deep gratitude and community belonging";
    emotionalTrigger = "gratitude";
  }

  if (segmentType === "major_gift_prospects") {
    primaryTheme = "Transformational partnership opportunity";
    emotionalTrigger = "legacy";
    voiceTone = "professional";
  }

  return {
    messagingApproach: {
      primaryTheme,
      emotionalTrigger,
      voiceTone,
      keyMessages: [], // To be filled by campaign generation
    },
  };
}

/**
 * Validate segmentation plan for completeness and best practices
 */
export function validateSegmentationPlan(plan: SegmentationPlan): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for at least one primary segment
  const primarySegments = plan.segments.filter((s) => s.priority === "primary");
  if (primarySegments.length === 0) {
    errors.push("Plan must include at least one primary segment");
  }

  // Check that all segments have matching message variants
  // Note: This validation could be extended to verify segment → variant mappings
  // when that field is added to the segment schema
  // const _variantNames = new Set(plan.messageVariants.map((v) => v.variantName));

  // Check for revenue estimates
  if (!plan.totalEstimatedRevenue || plan.totalEstimatedRevenue === 0) {
    warnings.push("No revenue estimates provided for segments");
  }

  // Check for balanced ask strategies
  const askTypes = plan.messageVariants.map((v) => v.askStrategy.askType);
  if (
    askTypes.filter((t) => t === "upgrade").length === 0 &&
    primarySegments.length > 0
  ) {
    warnings.push(
      "No upgrade strategy defined for active donors - consider adding upgrade variant",
    );
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}
