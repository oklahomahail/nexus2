// src/services/personalizationService.ts

import type { ChannelCampaign } from "@/models/channels";
import type { Donor } from "@/models/donors";
import type {
  PersonalizationContext,
  DonorPrediction,
  AudienceSegment,
} from "@/models/segmentation";
import { logger } from "@/utils/logger";

// Personalization Configuration Types
export interface PersonalizationRules {
  id: string;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: "equals" | "greater_than" | "less_than" | "contains" | "in_range";
    value: any;
    weight: number;
  }>;
  actions: Array<{
    type:
      | "content_replacement"
      | "amount_suggestion"
      | "timing_adjustment"
      | "channel_preference";
    target: string;
    value: any;
    confidence: number;
  }>;
  priority: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DonorJourneyStage {
  id: string;
  name: string;
  description: string;
  criteria: {
    donationHistory: "new" | "returning" | "lapsed" | "major";
    engagementLevel: "low" | "medium" | "high";
    timeWithOrganization: "new" | "established" | "longterm";
  };
  personalizations: {
    messaging: string[];
    suggestedAmounts: number[];
    preferredChannels: string[];
    contentTone: "formal" | "casual" | "urgent" | "grateful";
    frequency: "high" | "medium" | "low";
  };
  nextStages: string[];
  averageDuration: number; // days
}

export interface PersonalizationInsight {
  donorId: string;
  type:
    | "content_preference"
    | "timing_preference"
    | "amount_preference"
    | "channel_preference";
  insight: string;
  confidence: number;
  evidence: Array<{
    metric: string;
    value: number;
    source: string;
  }>;
  recommendations: string[];
  lastUpdated: Date;
}

export interface DynamicContent {
  id: string;
  name: string;
  type: "text" | "image" | "video" | "call_to_action" | "amount_suggestion";
  variants: Array<{
    id: string;
    content: any;
    conditions: Array<{
      segmentId?: string;
      behaviorPattern?: string;
      donorAttribute?: string;
      operator: string;
      value: any;
    }>;
    performance: {
      impressions: number;
      interactions: number;
      conversions: number;
      revenue: number;
    };
  }>;
  defaultVariant: string;
  isActive: boolean;
}

class PersonalizationService {
  private static instance: PersonalizationService;
  private personalizationRules: Map<string, PersonalizationRules> = new Map();
  private journeyStages: Map<string, DonorJourneyStage> = new Map();
  private dynamicContent: Map<string, DynamicContent> = new Map();
  private donorContexts: Map<string, PersonalizationContext> = new Map();
  private insights: Map<string, PersonalizationInsight[]> = new Map();

  private constructor() {
    this.initializeDefaultJourneyStages();
    this.initializeDefaultPersonalizationRules();
    this.initializeDynamicContent();
    logger.info("Personalization Service initialized");
  }

  static getInstance(): PersonalizationService {
    if (!PersonalizationService.instance) {
      PersonalizationService.instance = new PersonalizationService();
    }
    return PersonalizationService.instance;
  }

  // ============================================================================
  // DONOR JOURNEY MAPPING
  // ============================================================================

  async getDonorJourneyStage(donor: Donor): Promise<DonorJourneyStage> {
    const criteria = this.analyzeDonorCriteria(donor);

    // Find matching journey stage
    for (const stage of this.journeyStages.values()) {
      if (this.matchesJourneyCriteria(criteria, stage.criteria)) {
        logger.info(
          `Donor ${donor.id} matched to journey stage: ${stage.name}`,
        );
        return stage;
      }
    }

    // Default to new donor stage
    return (
      this.journeyStages.get("new_donor") || this.createDefaultJourneyStage()
    );
  }

  private analyzeDonorCriteria(donor: Donor): DonorJourneyStage["criteria"] {
    const donations = donor.donations || [];
    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    const daysSinceFirstDonation =
      donations.length > 0
        ? Math.floor(
            (Date.now() - Math.min(...donations.map((d) => d.date.getTime()))) /
              (1000 * 60 * 60 * 24),
          )
        : 0;
    const daysSinceLastDonation =
      donations.length > 0
        ? Math.floor(
            (Date.now() - Math.max(...donations.map((d) => d.date.getTime()))) /
              (1000 * 60 * 60 * 24),
          )
        : 9999;

    // Determine donation history
    let donationHistory: DonorJourneyStage["criteria"]["donationHistory"];
    if (donations.length === 0) {
      donationHistory = "new";
    } else if (totalDonated >= 1000) {
      donationHistory = "major";
    } else if (daysSinceLastDonation > 365) {
      donationHistory = "lapsed";
    } else {
      donationHistory = "returning";
    }

    // Determine engagement level (mock calculation)
    let engagementLevel: DonorJourneyStage["criteria"]["engagementLevel"] =
      "medium";
    const mockEngagementScore = Math.random() * 100;
    if (mockEngagementScore > 70) engagementLevel = "high";
    else if (mockEngagementScore < 30) engagementLevel = "low";

    // Determine time with organization
    let timeWithOrganization: DonorJourneyStage["criteria"]["timeWithOrganization"];
    if (daysSinceFirstDonation === 0) {
      timeWithOrganization = "new";
    } else if (daysSinceFirstDonation > 730) {
      // 2 years
      timeWithOrganization = "longterm";
    } else {
      timeWithOrganization = "established";
    }

    return {
      donationHistory,
      engagementLevel,
      timeWithOrganization,
    };
  }

  private matchesJourneyCriteria(
    donor: DonorJourneyStage["criteria"],
    stage: DonorJourneyStage["criteria"],
  ): boolean {
    return (
      donor.donationHistory === stage.donationHistory &&
      donor.engagementLevel === stage.engagementLevel &&
      donor.timeWithOrganization === stage.timeWithOrganization
    );
  }

  // ============================================================================
  // PERSONALIZATION CONTEXT BUILDING
  // ============================================================================

  async buildPersonalizationContext(
    donor: Donor,
    segments: AudienceSegment[] = [],
    predictions: DonorPrediction[] = [],
  ): Promise<PersonalizationContext> {
    logger.info(`Building personalization context for donor: ${donor.id}`);

    // Get donor's journey stage
    const _journeyStage = this.identifyJourneyStage(donor);

    // Analyze behavioral patterns (mock implementation)
    const behaviorProfile = await this.buildBehaviorProfile(donor);

    // Build personalization context
    const context: PersonalizationContext = {
      donorId: donor.id,
      segments: segments.map((s) => s.id),
      predictions,
      behaviorProfile,
      currentCampaign: undefined, // Will be set when used in campaign context
    };

    // Cache the context
    this.donorContexts.set(donor.id, context);

    logger.info(`Built personalization context for donor ${donor.id}`, {
      segmentCount: context.segments.length,
      predictionsCount: context.predictions.length,
      behaviorPatterns: context.behaviorProfile.patterns.length,
    });

    return context;
  }

  private async buildBehaviorProfile(
    donor: Donor,
  ): Promise<PersonalizationContext["behaviorProfile"]> {
    // Mock behavior profile building
    const donations = donor.donations || [];
    const avgDonation =
      donations.length > 0
        ? donations.reduce((sum, d) => sum + d.amount, 0) / donations.length
        : 0;

    // Determine preferred communication channel
    const channels = ["email", "direct_mail", "phone", "social_media"];
    const communicationChannel =
      channels[Math.floor(Math.random() * channels.length)];

    // Determine donation frequency pattern
    const donationFrequency =
      donations.length > 3
        ? "frequent"
        : donations.length > 0
          ? "occasional"
          : "new";

    // Calculate preferred ask amounts based on donation history
    const preferredAskAmounts =
      donations.length > 0
        ? [
            Math.floor(avgDonation * 0.8),
            Math.floor(avgDonation * 1.0),
            Math.floor(avgDonation * 1.2),
            Math.floor(avgDonation * 1.5),
          ].filter((amount) => amount > 0)
        : [25, 50, 100, 250];

    // Mock best contact time
    const bestContactTime = {
      dayOfWeek: Math.floor(Math.random() * 7), // 0 = Sunday
      hour: Math.floor(Math.random() * 12) + 9, // 9 AM - 9 PM
    };

    return {
      patterns: [], // Would be populated with actual behavioral patterns
      preferences: {
        communicationChannel,
        donationFrequency,
        preferredAskAmounts,
        bestContactTime,
        contentPreferences: ["impact_stories", "statistics", "testimonials"],
      },
      riskFactors: [
        {
          factor: "engagement_decline",
          score: Math.random() * 100,
          trend: Math.random() > 0.5 ? "stable" : "declining",
        },
        {
          factor: "churn_risk",
          score: Math.random() * 50,
          trend: "stable",
        },
      ],
    };
  }

  // ============================================================================
  // DYNAMIC CONTENT PERSONALIZATION
  // ============================================================================

  async personalizeContent(
    baseContent: any,
    donor: Donor,
    context?: PersonalizationContext,
  ): Promise<any> {
    const personalizationContext =
      context || (await this.buildPersonalizationContext(donor));

    logger.info(`Personalizing content for donor: ${donor.id}`);

    // Apply personalization rules
    let personalizedContent = { ...baseContent };

    // Apply dynamic content variations
    personalizedContent = await this.applyDynamicContent(
      personalizedContent,
      personalizationContext,
    );

    // Apply personalization rules
    personalizedContent = await this.applyPersonalizationRules(
      personalizedContent,
      donor,
      personalizationContext,
    );

    // Replace template variables with personalized values
    personalizedContent = this.replaceTemplateVariables(
      personalizedContent,
      donor,
      personalizationContext,
    );

    logger.info(`Content personalized for donor ${donor.id}`);
    return personalizedContent;
  }

  private async applyDynamicContent(
    content: any,
    context: PersonalizationContext,
  ): Promise<any> {
    let updatedContent = { ...content };

    // Apply dynamic content based on segments and behavior
    for (const dynamicContent of this.dynamicContent.values()) {
      if (!dynamicContent.isActive) continue;

      const selectedVariant = this.selectContentVariant(
        dynamicContent,
        context,
      );
      if (
        selectedVariant &&
        selectedVariant.id !== dynamicContent.defaultVariant
      ) {
        // Apply the selected variant
        updatedContent = this.mergeContentVariant(
          updatedContent,
          selectedVariant,
        );
      }
    }

    return updatedContent;
  }

  private selectContentVariant(
    dynamicContent: DynamicContent,
    context: PersonalizationContext,
  ): DynamicContent["variants"][0] | null {
    // Sort variants by how well they match the context
    const scoredVariants = dynamicContent.variants.map((variant) => ({
      variant,
      score: this.calculateVariantScore(variant, context),
    }));

    scoredVariants.sort((a, b) => b.score - a.score);

    return scoredVariants.length > 0 ? scoredVariants[0].variant : null;
  }

  private calculateVariantScore(
    variant: DynamicContent["variants"][0],
    context: PersonalizationContext,
  ): number {
    let score = 0;

    for (const condition of variant.conditions) {
      if (
        condition.segmentId &&
        context.segments.includes(condition.segmentId)
      ) {
        score += 10;
      }
      if (condition.behaviorPattern) {
        const hasPattern = context.behaviorProfile.patterns.some(
          (p) => p.id === condition.behaviorPattern,
        );
        if (hasPattern) score += 8;
      }
      // Add more condition matching logic...
    }

    // Factor in performance metrics
    if (variant.performance.conversions > 0) {
      const conversionRate =
        variant.performance.conversions / variant.performance.impressions;
      score += conversionRate * 5;
    }

    return score;
  }

  private mergeContentVariant(
    content: any,
    variant: DynamicContent["variants"][0],
  ): any {
    // Merge variant content with base content
    return {
      ...content,
      ...variant.content,
    };
  }

  private async applyPersonalizationRules(
    content: any,
    donor: Donor,
    context: PersonalizationContext,
  ): Promise<any> {
    let updatedContent = { ...content };

    // Sort rules by priority
    const sortedRules = Array.from(this.personalizationRules.values())
      .filter((rule) => rule.active)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (this.evaluateRuleConditions(rule, donor, context)) {
        updatedContent = this.applyRuleActions(
          updatedContent,
          rule,
          donor,
          context,
        );
      }
    }

    return updatedContent;
  }

  private evaluateRuleConditions(
    rule: PersonalizationRules,
    donor: Donor,
    context: PersonalizationContext,
  ): boolean {
    let totalWeight = 0;
    let matchedWeight = 0;

    for (const condition of rule.conditions) {
      totalWeight += condition.weight;

      if (this.evaluateCondition(condition, donor, context)) {
        matchedWeight += condition.weight;
      }
    }

    // Rule matches if 70% or more of weighted conditions are met
    return totalWeight > 0 && matchedWeight / totalWeight >= 0.7;
  }

  private evaluateCondition(
    condition: PersonalizationRules["conditions"][0],
    donor: Donor,
    context: PersonalizationContext,
  ): boolean {
    const fieldValue = this.extractFieldValue(condition.field, donor, context);

    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value;
      case "greater_than":
        return Number(fieldValue) > Number(condition.value);
      case "less_than":
        return Number(fieldValue) < Number(condition.value);
      case "contains":
        return String(fieldValue)
          .toLowerCase()
          .includes(String(condition.value).toLowerCase());
      case "in_range":
        if (Array.isArray(condition.value) && condition.value.length === 2) {
          const numValue = Number(fieldValue);
          return (
            numValue >= condition.value[0] && numValue <= condition.value[1]
          );
        }
        return false;
      default:
        return false;
    }
  }

  private extractFieldValue(
    field: string,
    donor: Donor,
    context: PersonalizationContext,
  ): any {
    // Extract values from donor data or context
    switch (field) {
      case "total_donated":
        return donor.donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
      case "donation_count":
        return donor.donations?.length || 0;
      case "segment_count":
        return context.segments.length;
      case "engagement_score":
        return Math.random() * 100; // Mock engagement score
      case "days_since_last_donation": {
        if (!donor.donations || donor.donations.length === 0) return 9999;
        const lastDonation = donor.donations.sort(
          (a, b) => b.date.getTime() - a.date.getTime(),
        )[0];
        return Math.floor(
          (Date.now() - lastDonation.date.getTime()) / (1000 * 60 * 60 * 24),
        );
      }
      default:
        return (donor as any)[field];
    }
  }

  private applyRuleActions(
    content: any,
    rule: PersonalizationRules,
    donor: Donor,
    context: PersonalizationContext,
  ): any {
    let updatedContent = { ...content };

    for (const action of rule.actions) {
      switch (action.type) {
        case "content_replacement":
          updatedContent = this.replaceContent(
            updatedContent,
            action.target,
            action.value,
          );
          break;
        case "amount_suggestion":
          updatedContent = this.addAmountSuggestion(
            updatedContent,
            action.value,
            donor,
            context,
          );
          break;
        case "timing_adjustment":
          // Would adjust optimal send timing
          break;
        case "channel_preference":
          updatedContent.preferredChannel = action.value;
          break;
      }
    }

    return updatedContent;
  }

  private replaceContent(content: any, target: string, replacement: any): any {
    // Simple content replacement logic
    const updated = { ...content };
    if (target in updated) {
      updated[target] = replacement;
    }
    return updated;
  }

  private addAmountSuggestion(
    content: any,
    baseAmount: number,
    donor: Donor,
    context: PersonalizationContext,
  ): any {
    const suggestions = this.calculatePersonalizedAmounts(
      donor,
      context,
      baseAmount,
    );
    return {
      ...content,
      suggestedAmounts: suggestions,
    };
  }

  // ============================================================================
  // PERSONALIZED DONATION AMOUNTS
  // ============================================================================

  calculatePersonalizedAmounts(
    donor: Donor,
    context: PersonalizationContext,
    baseAmount?: number,
  ): number[] {
    const donations = donor.donations || [];

    if (donations.length === 0) {
      // New donor - use standard progression
      return baseAmount
        ? [baseAmount, baseAmount * 1.5, baseAmount * 2, baseAmount * 3]
        : [25, 50, 100, 250];
    }

    // Calculate donor's historical giving pattern
    const avgDonation =
      donations.reduce((sum, d) => sum + d.amount, 0) / donations.length;
    const maxDonation = Math.max(...donations.map((d) => d.amount));
    const recentDonations = donations
      .filter((d) => Date.now() - d.date.getTime() < 90 * 24 * 60 * 60 * 1000) // Last 90 days
      .map((d) => d.amount);

    const recentAvg =
      recentDonations.length > 0
        ? recentDonations.reduce((sum, amount) => sum + amount, 0) /
          recentDonations.length
        : avgDonation;

    // Use the higher of recent average or historical average as base
    const baseForCalculation = Math.max(recentAvg, avgDonation);

    // Create personalized suggestions
    const suggestions = [
      Math.floor(baseForCalculation * 0.8), // Slightly less than usual
      Math.floor(baseForCalculation * 1.0), // Same as usual
      Math.floor(baseForCalculation * 1.2), // Slight upgrade
      Math.min(Math.floor(baseForCalculation * 1.5), maxDonation * 1.3), // Stretch goal
    ];

    // Ensure all amounts are positive and unique
    const uniqueSuggestions = [
      ...new Set(suggestions.filter((amount) => amount > 0)),
    ];

    // If we don't have enough unique suggestions, add some
    while (uniqueSuggestions.length < 4) {
      const lastAmount = uniqueSuggestions[uniqueSuggestions.length - 1];
      const nextAmount = Math.floor(lastAmount * 1.5);
      if (!uniqueSuggestions.includes(nextAmount)) {
        uniqueSuggestions.push(nextAmount);
      } else {
        break;
      }
    }

    logger.info(`Calculated personalized amounts for donor ${donor.id}`, {
      suggestions: uniqueSuggestions,
      avgDonation,
      maxDonation,
      recentAvg,
    });

    return uniqueSuggestions.slice(0, 4);
  }

  // ============================================================================
  // OPTIMAL TIMING PREDICTIONS
  // ============================================================================

  calculateOptimalTiming(
    donor: Donor,
    context: PersonalizationContext,
  ): {
    optimalSendTime: Date;
    followUpSchedule: Date[];
    confidence: number;
  } {
    const donations = donor.donations || [];
    const _now = new Date();

    // Analyze historical donation patterns for timing
    let optimalHour = context.behaviorProfile.preferences.bestContactTime.hour;
    let optimalDayOfWeek =
      context.behaviorProfile.preferences.bestContactTime.dayOfWeek;

    // If we have donation history, analyze timing patterns
    if (donations.length > 2) {
      // Calculate most common day of week and time from donation patterns
      const donationTimes = donations.map((d) => ({
        dayOfWeek: d.date.getDay(),
        hour: d.date.getHours(),
      }));

      // Find most common day of week
      const dayFrequency = donationTimes.reduce(
        (freq, time) => {
          freq[time.dayOfWeek] = (freq[time.dayOfWeek] || 0) + 1;
          return freq;
        },
        {} as Record<number, number>,
      );

      const mostCommonDay = Object.entries(dayFrequency).sort(
        ([, a], [, b]) => b - a,
      )[0];

      if (mostCommonDay) {
        optimalDayOfWeek = parseInt(mostCommonDay[0]);
      }

      // Find most common hour (rounded to nearest 2-hour block)
      const hourFrequency = donationTimes.reduce(
        (freq, time) => {
          const block = Math.floor(time.hour / 2) * 2;
          freq[block] = (freq[block] || 0) + 1;
          return freq;
        },
        {} as Record<number, number>,
      );

      const mostCommonHour = Object.entries(hourFrequency).sort(
        ([, a], [, b]) => b - a,
      )[0];

      if (mostCommonHour) {
        optimalHour = parseInt(mostCommonHour[0]);
      }
    }

    // Calculate next optimal send time
    const optimalSendTime = new Date(now);

    // Adjust to optimal day of week
    const daysUntilOptimal = (optimalDayOfWeek - now.getDay() + 7) % 7;
    optimalSendTime.setDate(
      now.getDate() + (daysUntilOptimal === 0 ? 7 : daysUntilOptimal),
    );

    // Set optimal hour
    optimalSendTime.setHours(optimalHour, 0, 0, 0);

    // If that time has already passed today, move to next week
    if (optimalSendTime <= now) {
      optimalSendTime.setDate(optimalSendTime.getDate() + 7);
    }

    // Create follow-up schedule (3 follow-ups over 2 weeks)
    const followUpSchedule = [
      new Date(optimalSendTime.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days later
      new Date(optimalSendTime.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week later
      new Date(optimalSendTime.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks later
    ];

    // Calculate confidence based on data quality
    let confidence = 0.5; // Base confidence
    if (donations.length > 5) confidence += 0.2;
    if (donations.length > 10) confidence += 0.2;
    if (context.segments.length > 0) confidence += 0.1;

    logger.info(`Calculated optimal timing for donor ${donor.id}`, {
      optimalSendTime,
      followUpSchedule,
      confidence,
    });

    return {
      optimalSendTime,
      followUpSchedule,
      confidence,
    };
  }

  // ============================================================================
  // TEMPLATE VARIABLE REPLACEMENT
  // ============================================================================

  private replaceTemplateVariables(
    content: any,
    donor: Donor,
    context: PersonalizationContext,
  ): any {
    if (typeof content === "string") {
      return this.replaceVariablesInString(content, donor, context);
    } else if (Array.isArray(content)) {
      return content.map((item) =>
        this.replaceTemplateVariables(item, donor, context),
      );
    } else if (content && typeof content === "object") {
      const result: any = {};
      for (const [key, value] of Object.entries(content)) {
        result[key] = this.replaceTemplateVariables(value, donor, context);
      }
      return result;
    }
    return content;
  }

  private replaceVariablesInString(
    text: string,
    donor: Donor,
    context: PersonalizationContext,
  ): string {
    const variables = {
      // Personal info
      first_name: donor.firstName,
      last_name: donor.lastName,
      full_name: `${donor.firstName} ${donor.lastName}`,
      email: donor.email,

      // Donation info
      last_donation_amount: this.getLastDonationAmount(donor),
      total_donated:
        donor.donations?.reduce((sum, d) => sum + d.amount, 0) || 0,
      donation_count: donor.donations?.length || 0,

      // Personalized amounts
      suggested_amount_1:
        context.behaviorProfile.preferences.preferredAskAmounts[0] || 25,
      suggested_amount_2:
        context.behaviorProfile.preferences.preferredAskAmounts[1] || 50,
      suggested_amount_3:
        context.behaviorProfile.preferences.preferredAskAmounts[2] || 100,
      suggested_amount_4:
        context.behaviorProfile.preferences.preferredAskAmounts[3] || 250,

      // Organization info
      organization_name: "Your Organization",
      current_year: new Date().getFullYear(),
      current_date: new Date().toLocaleDateString(),

      // Personalized content
      preferred_channel:
        context.behaviorProfile.preferences.communicationChannel,
      journey_stage: "valued supporter", // Would be derived from actual journey stage
    };

    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, String(value));
    });

    return result;
  }

  private getLastDonationAmount(donor: Donor): number {
    if (!donor.donations || donor.donations.length === 0) return 0;
    const sortedDonations = donor.donations.sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
    return sortedDonations[0].amount;
  }

  // ============================================================================
  // INSIGHTS GENERATION
  // ============================================================================

  async generatePersonalizationInsights(
    donor: Donor,
  ): Promise<PersonalizationInsight[]> {
    const context = await this.buildPersonalizationContext(donor);
    const insights: PersonalizationInsight[] = [];

    // Content preference insights
    const contentInsight = this.generateContentPreferenceInsight(
      donor,
      context,
    );
    if (contentInsight) insights.push(contentInsight);

    // Timing preference insights
    const timingInsight = this.generateTimingPreferenceInsight(donor, context);
    if (timingInsight) insights.push(timingInsight);

    // Amount preference insights
    const amountInsight = this.generateAmountPreferenceInsight(donor, context);
    if (amountInsight) insights.push(amountInsight);

    // Channel preference insights
    const channelInsight = this.generateChannelPreferenceInsight(
      donor,
      context,
    );
    if (channelInsight) insights.push(channelInsight);

    // Cache insights
    this.insights.set(donor.id, insights);

    return insights;
  }

  private generateContentPreferenceInsight(
    donor: Donor,
    context: PersonalizationContext,
  ): PersonalizationInsight | null {
    const preferences = context.behaviorProfile.preferences.contentPreferences;

    return {
      donorId: donor.id,
      type: "content_preference",
      insight: `This donor prefers ${preferences.join(", ")} in communications`,
      confidence: 0.75,
      evidence: [
        {
          metric: "content_engagement",
          value: Math.random() * 100,
          source: "behavioral_analysis",
        },
      ],
      recommendations: [
        "Include impact stories in communications",
        "Use statistics to support claims",
        "Share beneficiary testimonials",
      ],
      lastUpdated: new Date(),
    };
  }

  private generateTimingPreferenceInsight(
    donor: Donor,
    context: PersonalizationContext,
  ): PersonalizationInsight | null {
    const bestTime = context.behaviorProfile.preferences.bestContactTime;
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return {
      donorId: donor.id,
      type: "timing_preference",
      insight: `Best contact time is ${dayNames[bestTime.dayOfWeek]} at ${bestTime.hour}:00`,
      confidence: 0.65,
      evidence: [
        {
          metric: "response_rate",
          value: Math.random() * 50 + 25,
          source: "timing_analysis",
        },
      ],
      recommendations: [
        `Schedule communications for ${dayNames[bestTime.dayOfWeek]}s`,
        `Send messages around ${bestTime.hour}:00`,
        "Avoid weekend communications",
      ],
      lastUpdated: new Date(),
    };
  }

  private generateAmountPreferenceInsight(
    donor: Donor,
    context: PersonalizationContext,
  ): PersonalizationInsight | null {
    const amounts = context.behaviorProfile.preferences.preferredAskAmounts;

    return {
      donorId: donor.id,
      type: "amount_preference",
      insight: `Optimal ask amounts are $${amounts[1]} - $${amounts[2]} based on giving history`,
      confidence: 0.85,
      evidence: [
        {
          metric: "conversion_rate",
          value: Math.random() * 40 + 20,
          source: "donation_history",
        },
      ],
      recommendations: [
        `Lead with $${amounts[1]} ask amount`,
        "Provide upgrade option to $${amounts[2]}",
        "Include smaller $${amounts[0]} option for accessibility",
      ],
      lastUpdated: new Date(),
    };
  }

  private generateChannelPreferenceInsight(
    donor: Donor,
    context: PersonalizationContext,
  ): PersonalizationInsight | null {
    const channel = context.behaviorProfile.preferences.communicationChannel;

    return {
      donorId: donor.id,
      type: "channel_preference",
      insight: `${channel} is the preferred communication channel`,
      confidence: 0.7,
      evidence: [
        {
          metric: "engagement_rate",
          value: Math.random() * 60 + 30,
          source: "channel_analysis",
        },
      ],
      recommendations: [
        `Prioritize ${channel} for important communications`,
        "Use other channels sparingly",
        `Optimize ${channel} content for best engagement`,
      ],
      lastUpdated: new Date(),
    };
  }

  // ============================================================================
  // INITIALIZATION METHODS
  // ============================================================================

  private initializeDefaultJourneyStages(): void {
    const stages: Partial<DonorJourneyStage>[] = [
      {
        id: "new_donor",
        name: "New Donor",
        description: "Recently acquired donors with limited giving history",
        criteria: {
          donationHistory: "new",
          engagementLevel: "medium",
          timeWithOrganization: "new",
        },
        personalizations: {
          messaging: [
            "Welcome message",
            "Organization introduction",
            "Impact overview",
          ],
          suggestedAmounts: [25, 50, 100, 250],
          preferredChannels: ["email", "social_media"],
          contentTone: "casual",
          frequency: "medium",
        },
        nextStages: ["engaged_donor", "lapsed_prospect"],
        averageDuration: 90,
      },
      {
        id: "engaged_donor",
        name: "Engaged Donor",
        description: "Active donors with regular giving and high engagement",
        criteria: {
          donationHistory: "returning",
          engagementLevel: "high",
          timeWithOrganization: "established",
        },
        personalizations: {
          messaging: [
            "Impact updates",
            "Exclusive content",
            "Volunteer opportunities",
          ],
          suggestedAmounts: [100, 250, 500, 1000],
          preferredChannels: ["email", "direct_mail", "phone"],
          contentTone: "grateful",
          frequency: "high",
        },
        nextStages: ["major_donor", "lapsed_donor"],
        averageDuration: 365,
      },
      {
        id: "major_donor",
        name: "Major Donor",
        description: "High-value donors requiring personalized attention",
        criteria: {
          donationHistory: "major",
          engagementLevel: "high",
          timeWithOrganization: "longterm",
        },
        personalizations: {
          messaging: [
            "Personal updates",
            "Exclusive events",
            "Leadership opportunities",
          ],
          suggestedAmounts: [1000, 2500, 5000, 10000],
          preferredChannels: ["phone", "direct_mail", "in_person"],
          contentTone: "formal",
          frequency: "low",
        },
        nextStages: ["legacy_donor"],
        averageDuration: 730,
      },
      {
        id: "lapsed_donor",
        name: "Lapsed Donor",
        description: "Previously active donors who need re-engagement",
        criteria: {
          donationHistory: "lapsed",
          engagementLevel: "low",
          timeWithOrganization: "established",
        },
        personalizations: {
          messaging: [
            "We miss you",
            "Recent achievements",
            "Easy re-engagement",
          ],
          suggestedAmounts: [25, 50, 100, 200],
          preferredChannels: ["email", "social_media"],
          contentTone: "urgent",
          frequency: "medium",
        },
        nextStages: ["engaged_donor", "lost_donor"],
        averageDuration: 120,
      },
    ];

    stages.forEach((stage) => {
      const ___now = new Date();
      const fullStage: DonorJourneyStage = {
        id: stage.id!,
        name: stage.name!,
        description: stage.description!,
        criteria: stage.criteria!,
        personalizations: stage.personalizations!,
        nextStages: stage.nextStages!,
        averageDuration: stage.averageDuration!,
      };

      this.journeyStages.set(fullStage.id, fullStage);
    });

    logger.info(`Initialized ${stages.length} donor journey stages`);
  }

  private initializeDefaultPersonalizationRules(): void {
    const rules: Partial<PersonalizationRules>[] = [
      {
        id: "high_value_messaging",
        name: "High-Value Donor Messaging",
        description:
          "Special messaging for donors who have given more than $1000",
        conditions: [
          {
            field: "total_donated",
            operator: "greater_than",
            value: 1000,
            weight: 1.0,
          },
        ],
        actions: [
          {
            type: "content_replacement",
            target: "greeting",
            value: "Dear valued supporter",
            confidence: 0.9,
          },
        ],
        priority: 10,
        active: true,
      },
      {
        id: "lapsed_donor_urgency",
        name: "Lapsed Donor Urgency",
        description: "Urgent tone for donors who haven't given in over a year",
        conditions: [
          {
            field: "days_since_last_donation",
            operator: "greater_than",
            value: 365,
            weight: 1.0,
          },
        ],
        actions: [
          {
            type: "content_replacement",
            target: "tone",
            value: "urgent",
            confidence: 0.8,
          },
        ],
        priority: 8,
        active: true,
      },
    ];

    rules.forEach((rule) => {
      const now = new Date();
      const fullRule: PersonalizationRules = {
        id: rule.id!,
        name: rule.name!,
        description: rule.description!,
        conditions: rule.conditions!,
        actions: rule.actions!,
        priority: rule.priority!,
        active: rule.active!,
        createdAt: now,
        updatedAt: now,
      };

      this.personalizationRules.set(fullRule.id, fullRule);
    });

    logger.info(`Initialized ${rules.length} personalization rules`);
  }

  private initializeDynamicContent(): void {
    const content: Partial<DynamicContent>[] = [
      {
        id: "hero_message",
        name: "Hero Message",
        type: "text",
        variants: [
          {
            id: "default",
            content: { text: "Your support makes a difference" },
            conditions: [],
            performance: {
              impressions: 1000,
              interactions: 100,
              conversions: 25,
              revenue: 5000,
            },
          },
          {
            id: "urgent",
            content: { text: "Help us reach our goal - time is running out!" },
            conditions: [{ operator: "equals", value: "urgent" }],
            performance: {
              impressions: 500,
              interactions: 75,
              conversions: 20,
              revenue: 4000,
            },
          },
        ],
        defaultVariant: "default",
        isActive: true,
      },
    ];

    content.forEach((item) => {
      if (item.id) {
        this.dynamicContent.set(item.id, item as DynamicContent);
      }
    });

    logger.info(`Initialized ${content.length} dynamic content items`);
  }

  private createDefaultJourneyStage(): DonorJourneyStage {
    return {
      id: "default",
      name: "Default Stage",
      description: "Default stage for unmatched donors",
      criteria: {
        donationHistory: "new",
        engagementLevel: "medium",
        timeWithOrganization: "new",
      },
      personalizations: {
        messaging: ["General message"],
        suggestedAmounts: [25, 50, 100, 250],
        preferredChannels: ["email"],
        contentTone: "casual",
        frequency: "medium",
      },
      nextStages: [],
      averageDuration: 90,
    };
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  async personalizeCampaign(
    campaign: ChannelCampaign,
    donor: Donor,
    segments: AudienceSegment[] = [],
  ): Promise<ChannelCampaign> {
    const context = await this.buildPersonalizationContext(donor, segments);

    // Add campaign-specific context
    const timing = this.calculateOptimalTiming(donor, context);
    context.currentCampaign = {
      campaignId: campaign.id,
      personalizedContent: {},
      recommendedActions: [],
      timing,
    };

    // Personalize campaign content
    const personalizedContent = await this.personalizeContent(
      campaign.content,
      donor,
      context,
    );

    return {
      ...campaign,
      content: personalizedContent,
      audience: {
        ...campaign.audience,
        personalizedFor: donor.id,
      },
    };
  }

  getPersonalizationInsights(donorId: string): PersonalizationInsight[] {
    return this.insights.get(donorId) || [];
  }

  getDonorContext(donorId: string): PersonalizationContext | null {
    return this.donorContexts.get(donorId) || null;
  }

  getJourneyStages(): DonorJourneyStage[] {
    return Array.from(this.journeyStages.values());
  }

  getPersonalizationRules(): PersonalizationRules[] {
    return Array.from(this.personalizationRules.values());
  }
}

// Export singleton instance
export const personalizationService = PersonalizationService.getInstance();

// Export utility functions
export const personalizeContent = (
  baseContent: any,
  donor: Donor,
  context?: PersonalizationContext,
) => {
  return personalizationService.personalizeContent(baseContent, donor, context);
};

export const calculatePersonalizedAmounts = (
  donor: Donor,
  context: PersonalizationContext,
  baseAmount?: number,
) => {
  return personalizationService.calculatePersonalizedAmounts(
    donor,
    context,
    baseAmount,
  );
};

export const calculateOptimalTiming = (
  donor: Donor,
  context: PersonalizationContext,
) => {
  return personalizationService.calculateOptimalTiming(donor, context);
};

export const buildPersonalizationContext = (
  donor: Donor,
  segments?: AudienceSegment[],
  predictions?: DonorPrediction[],
) => {
  return personalizationService.buildPersonalizationContext(
    donor,
    segments,
    predictions,
  );
};

export const generatePersonalizationInsights = (donor: Donor) => {
  return personalizationService.generatePersonalizationInsights(donor);
};

export const personalizeCampaign = (
  campaign: ChannelCampaign,
  donor: Donor,
  segments?: AudienceSegment[],
) => {
  return personalizationService.personalizeCampaign(campaign, donor, segments);
};

logger.info("Personalization Service exports ready");
