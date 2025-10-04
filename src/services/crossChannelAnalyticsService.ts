// src/services/crossChannelAnalyticsService.ts

import type {
  ChannelAnalytics,
  ChannelType,
  AttributionModel,
} from "@/models/channels";
import { logger } from "@/utils/logger";

import { getAllEmailCampaigns } from "./emailCampaignService";
import { getAllSocialMediaPosts } from "./socialMediaService";

// Cross-Channel Analytics Aggregator
export class CrossChannelAnalyticsAggregator {
  private static campaignAnalytics: Map<string, ChannelAnalytics[]> = new Map();

  static addChannelAnalytics(campaignId: string, analytics: ChannelAnalytics) {
    const existing = this.campaignAnalytics.get(campaignId) || [];
    existing.push(analytics);
    this.campaignAnalytics.set(campaignId, existing);
  }

  static getCampaignAnalytics(campaignId: string): ChannelAnalytics[] {
    return this.campaignAnalytics.get(campaignId) || [];
  }

  static getUnifiedMetrics(campaignId: string): {
    totalReach: number;
    totalImpressions: number;
    totalEngagements: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    totalCost: number;
    channelBreakdown: { [key in ChannelType]?: any };
    performanceByChannel: Array<{
      channelType: ChannelType;
      channelId: string;
      metrics: any;
      performance: number; // Overall performance score 0-100
    }>;
  } {
    const analytics = this.getCampaignAnalytics(campaignId);

    let totalReach = 0;
    let totalImpressions = 0;
    let totalEngagements = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    let totalCost = 0;

    const channelBreakdown: { [key in ChannelType]?: any } = {};
    const performanceByChannel: Array<{
      channelType: ChannelType;
      channelId: string;
      metrics: any;
      performance: number;
    }> = [];

    analytics.forEach((channelAnalytic) => {
      const { metrics, channelType, channelId } = channelAnalytic;

      totalReach += metrics.reach || 0;
      totalImpressions += metrics.impressions || 0;
      totalEngagements += metrics.engagements || 0;
      totalClicks += metrics.clicks || 0;
      totalConversions += metrics.conversions || 0;
      totalRevenue += metrics.revenue || 0;
      totalCost += metrics.cost || 0;

      // Aggregate by channel type
      if (!channelBreakdown[channelType]) {
        channelBreakdown[channelType] = {
          reach: 0,
          impressions: 0,
          engagements: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          cost: 0,
          count: 0,
        };
      }

      const breakdown = channelBreakdown[channelType];
      breakdown.reach += metrics.reach || 0;
      breakdown.impressions += metrics.impressions || 0;
      breakdown.engagements += metrics.engagements || 0;
      breakdown.clicks += metrics.clicks || 0;
      breakdown.conversions += metrics.conversions || 0;
      breakdown.revenue += metrics.revenue || 0;
      breakdown.cost += metrics.cost || 0;
      breakdown.count += 1;

      // Calculate performance score for each channel
      const performance = this.calculatePerformanceScore(metrics);
      performanceByChannel.push({
        channelType,
        channelId,
        metrics,
        performance,
      });
    });

    // Sort by performance
    performanceByChannel.sort((a, b) => b.performance - a.performance);

    return {
      totalReach,
      totalImpressions,
      totalEngagements,
      totalClicks,
      totalConversions,
      totalRevenue,
      totalCost,
      channelBreakdown,
      performanceByChannel,
    };
  }

  private static calculatePerformanceScore(metrics: any): number {
    // Calculate a composite performance score (0-100)
    let score = 0;
    let factors = 0;

    if (metrics.engagementRate !== undefined) {
      score += Math.min(metrics.engagementRate * 10, 30); // Max 30 points
      factors += 1;
    }

    if (metrics.conversionRate !== undefined) {
      score += Math.min(metrics.conversionRate * 5, 25); // Max 25 points
      factors += 1;
    }

    if (metrics.clickThroughRate !== undefined) {
      score += Math.min(metrics.clickThroughRate * 8, 20); // Max 20 points
      factors += 1;
    }

    if (metrics.returnOnAdSpend !== undefined) {
      score += Math.min(metrics.returnOnAdSpend * 2, 25); // Max 25 points
      factors += 1;
    }

    return factors > 0 ? Math.min(score, 100) : 50; // Default score if no metrics
  }

  static getChannelAttribution(
    campaignId: string,
    model: AttributionModel["type"] = "linear",
  ): {
    [channelType: string]: {
      touches: number;
      attributedRevenue: number;
      attributedConversions: number;
      percentage: number;
    };
  } {
    const analytics = this.getCampaignAnalytics(campaignId);
    const totalRevenue = analytics.reduce(
      (sum, a) => sum + (a.metrics.revenue || 0),
      0,
    );
    const totalConversions = analytics.reduce(
      (sum, a) => sum + (a.metrics.conversions || 0),
      0,
    );

    const attribution: { [key: string]: any } = {};

    if (model === "first_touch") {
      // First touch attribution - give all credit to the first channel
      if (analytics.length > 0) {
        const firstChannel = analytics[0];
        attribution[firstChannel.channelType] = {
          touches: 1,
          attributedRevenue: totalRevenue,
          attributedConversions: totalConversions,
          percentage: 100,
        };
      }
    } else if (model === "last_touch") {
      // Last touch attribution - give all credit to the last channel
      if (analytics.length > 0) {
        const lastChannel = analytics[analytics.length - 1];
        attribution[lastChannel.channelType] = {
          touches: 1,
          attributedRevenue: totalRevenue,
          attributedConversions: totalConversions,
          percentage: 100,
        };
      }
    } else if (model === "linear") {
      // Linear attribution - equal credit to all channels
      const channelCount = analytics.length;
      if (channelCount > 0) {
        const revenuePerChannel = totalRevenue / channelCount;
        const conversionsPerChannel = totalConversions / channelCount;
        const percentagePerChannel = 100 / channelCount;

        analytics.forEach((channelAnalytic) => {
          const { channelType } = channelAnalytic;
          if (!attribution[channelType]) {
            attribution[channelType] = {
              touches: 0,
              attributedRevenue: 0,
              attributedConversions: 0,
              percentage: 0,
            };
          }
          attribution[channelType].touches += 1;
          attribution[channelType].attributedRevenue += revenuePerChannel;
          attribution[channelType].attributedConversions +=
            conversionsPerChannel;
          attribution[channelType].percentage += percentagePerChannel;
        });
      }
    } else if (model === "position_based") {
      // Position-based attribution - 40% first, 40% last, 20% middle
      if (analytics.length === 1) {
        // Only one channel, give it all credit
        const channel = analytics[0];
        attribution[channel.channelType] = {
          touches: 1,
          attributedRevenue: totalRevenue,
          attributedConversions: totalConversions,
          percentage: 100,
        };
      } else if (analytics.length === 2) {
        // Two channels, split 50/50
        analytics.forEach((channelAnalytic) => {
          const { channelType } = channelAnalytic;
          attribution[channelType] = {
            touches: 1,
            attributedRevenue: totalRevenue * 0.5,
            attributedConversions: totalConversions * 0.5,
            percentage: 50,
          };
        });
      } else {
        // Multiple channels
        const middleCount = analytics.length - 2;
        const middleShare = 0.2 / middleCount;

        analytics.forEach((channelAnalytic, index) => {
          const { channelType } = channelAnalytic;
          let share: number;

          if (index === 0) {
            share = 0.4; // First touch
          } else if (index === analytics.length - 1) {
            share = 0.4; // Last touch
          } else {
            share = middleShare; // Middle touches
          }

          if (!attribution[channelType]) {
            attribution[channelType] = {
              touches: 0,
              attributedRevenue: 0,
              attributedConversions: 0,
              percentage: 0,
            };
          }

          attribution[channelType].touches += 1;
          attribution[channelType].attributedRevenue += totalRevenue * share;
          attribution[channelType].attributedConversions +=
            totalConversions * share;
          attribution[channelType].percentage += share * 100;
        });
      }
    }

    return attribution;
  }
}

// Customer Journey Analytics
export class CustomerJourneyAnalyzer {
  private static journeys: Map<
    string,
    Array<{
      channelType: ChannelType;
      channelId: string;
      timestamp: Date;
      action: string;
      userId?: string;
    }>
  > = new Map();

  static addTouchpoint(
    userId: string,
    channelType: ChannelType,
    channelId: string,
    action: string,
    timestamp: Date = new Date(),
  ) {
    const journey = this.journeys.get(userId) || [];
    journey.push({
      channelType,
      channelId,
      timestamp,
      action,
      userId,
    });
    journey.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    this.journeys.set(userId, journey);
  }

  static getJourney(userId: string): Array<{
    channelType: ChannelType;
    channelId: string;
    timestamp: Date;
    action: string;
  }> {
    return this.journeys.get(userId) || [];
  }

  static getJourneyAnalytics(): {
    totalJourneys: number;
    avgTouchpoints: number;
    avgJourneyLength: number; // days
    topPaths: Array<{
      path: string[];
      count: number;
      conversionRate: number;
      avgRevenue: number;
    }>;
    channelSequenceAnalysis: {
      [sequence: string]: {
        count: number;
        conversionRate: number;
        avgRevenue: number;
      };
    };
  } {
    const journeys = Array.from(this.journeys.values());
    const totalJourneys = journeys.length;

    if (totalJourneys === 0) {
      return {
        totalJourneys: 0,
        avgTouchpoints: 0,
        avgJourneyLength: 0,
        topPaths: [],
        channelSequenceAnalysis: {},
      };
    }

    let totalTouchpoints = 0;
    let totalJourneyDays = 0;
    const pathCounts: Map<
      string,
      { count: number; conversions: number; revenue: number }
    > = new Map();
    const sequenceCounts: Map<
      string,
      { count: number; conversions: number; revenue: number }
    > = new Map();

    journeys.forEach((journey) => {
      totalTouchpoints += journey.length;

      if (journey.length > 1) {
        const journeyStart = journey[0].timestamp;
        const journeyEnd = journey[journey.length - 1].timestamp;
        const daysDiff = Math.ceil(
          (journeyEnd.getTime() - journeyStart.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        totalJourneyDays += daysDiff;
      }

      // Analyze paths (full journey)
      const path = journey.map((touch) => touch.channelType);
      const pathKey = path.join(" → ");
      const pathData = pathCounts.get(pathKey) || {
        count: 0,
        conversions: 0,
        revenue: 0,
      };
      pathData.count += 1;

      // Simulate conversion data (in real implementation, this would come from actual data)
      const hasConversion = Math.random() < 0.15; // 15% conversion rate
      if (hasConversion) {
        pathData.conversions += 1;
        pathData.revenue += Math.random() * 200 + 50; // Random revenue $50-250
      }
      pathCounts.set(pathKey, pathData);

      // Analyze channel sequences (2-step sequences)
      for (let i = 0; i < journey.length - 1; i++) {
        const sequence = `${journey[i].channelType} → ${journey[i + 1].channelType}`;
        const seqData = sequenceCounts.get(sequence) || {
          count: 0,
          conversions: 0,
          revenue: 0,
        };
        seqData.count += 1;
        if (hasConversion && i === journey.length - 2) {
          // Last sequence gets the conversion
          seqData.conversions += 1;
          seqData.revenue += Math.random() * 200 + 50;
        }
        sequenceCounts.set(sequence, seqData);
      }
    });

    const avgTouchpoints = totalTouchpoints / totalJourneys;
    const avgJourneyLength =
      totalJourneyDays /
      Math.max(journeys.filter((j) => j.length > 1).length, 1);

    // Top paths
    const topPaths = Array.from(pathCounts.entries())
      .map(([path, data]) => ({
        path: path.split(" → "),
        count: data.count,
        conversionRate: (data.conversions / data.count) * 100,
        avgRevenue: data.revenue / Math.max(data.conversions, 1),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Channel sequence analysis
    const channelSequenceAnalysis: { [sequence: string]: any } = {};
    sequenceCounts.forEach((data, sequence) => {
      channelSequenceAnalysis[sequence] = {
        count: data.count,
        conversionRate: (data.conversions / data.count) * 100,
        avgRevenue: data.revenue / Math.max(data.conversions, 1),
      };
    });

    return {
      totalJourneys,
      avgTouchpoints: Math.round(avgTouchpoints * 10) / 10,
      avgJourneyLength: Math.round(avgJourneyLength * 10) / 10,
      topPaths,
      channelSequenceAnalysis,
    };
  }
}

// Main Cross-Channel Analytics Service Functions
export const generateChannelAnalytics = async (
  channelType: ChannelType,
  channelId: string,
  campaignId: string,
  dateRange: { start: Date; end: Date },
): Promise<ChannelAnalytics> => {
  try {
    // In a real implementation, this would fetch actual analytics data
    // For now, we'll generate mock analytics based on channel type

    const baseMetrics = generateMockMetrics(channelType);

    const analytics: ChannelAnalytics = {
      campaignId,
      channelType,
      channelId,
      dateRange,
      metrics: baseMetrics,
      dailyMetrics: generateDailyMetrics(dateRange, baseMetrics),
      audienceInsights: generateAudienceInsights(channelType),
    };

    // Store analytics for aggregation
    CrossChannelAnalyticsAggregator.addChannelAnalytics(campaignId, analytics);

    return analytics;
  } catch (error) {
    logger.error("Error generating channel analytics:", error);
    throw error;
  }
};

export const getCrossChannelAnalytics = async (
  campaignId: string,
): Promise<{
  unifiedMetrics: any;
  channelPerformance: any[];
  attribution: any;
  journeyAnalytics: any;
}> => {
  try {
    const unifiedMetrics =
      CrossChannelAnalyticsAggregator.getUnifiedMetrics(campaignId);
    const attribution = CrossChannelAnalyticsAggregator.getChannelAttribution(
      campaignId,
      "linear",
    );
    const journeyAnalytics = CustomerJourneyAnalyzer.getJourneyAnalytics();

    return {
      unifiedMetrics,
      channelPerformance: unifiedMetrics.performanceByChannel,
      attribution,
      journeyAnalytics,
    };
  } catch (error) {
    logger.error("Error getting cross-channel analytics:", error);
    throw error;
  }
};

export const generateCampaignReport = async (
  campaignId: string,
  dateRange: { start: Date; end: Date },
): Promise<{
  summary: any;
  channelBreakdown: any;
  insights: string[];
  recommendations: string[];
}> => {
  try {
    const analytics = await getCrossChannelAnalytics(campaignId);
    const { unifiedMetrics, attribution, journeyAnalytics } = analytics;

    const insights: string[] = [];
    const recommendations: string[] = [];

    // Generate insights
    const bestPerformingChannel = unifiedMetrics.performanceByChannel[0];
    if (bestPerformingChannel) {
      insights.push(
        `${bestPerformingChannel.channelType} is your top-performing channel with a ${bestPerformingChannel.performance.toFixed(1)} performance score.`,
      );
    }

    if (unifiedMetrics.totalRevenue > 0 && unifiedMetrics.totalCost > 0) {
      const roi =
        ((unifiedMetrics.totalRevenue - unifiedMetrics.totalCost) /
          unifiedMetrics.totalCost) *
        100;
      insights.push(`Overall ROI is ${roi.toFixed(1)}%.`);
    }

    if (journeyAnalytics.avgTouchpoints > 3) {
      insights.push(
        `Customers interact with an average of ${journeyAnalytics.avgTouchpoints} touchpoints before converting.`,
      );
    }

    // Generate recommendations
    if (unifiedMetrics.performanceByChannel.length > 1) {
      const worstChannel =
        unifiedMetrics.performanceByChannel[
          unifiedMetrics.performanceByChannel.length - 1
        ];
      recommendations.push(
        `Consider optimizing or reducing spend on ${worstChannel.channelType} (lowest performing channel).`,
      );
    }

    const topAttributedChannel = Object.entries(attribution).sort(
      ([, a]: any, [, b]: any) => b.percentage - a.percentage,
    )[0];

    if (topAttributedChannel) {
      recommendations.push(
        `${topAttributedChannel[0]} drives ${(topAttributedChannel[1] as any).percentage.toFixed(1)}% of attributed revenue - consider increasing investment.`,
      );
    }

    if (journeyAnalytics.avgJourneyLength > 14) {
      recommendations.push(
        "Customer journeys are taking longer than 2 weeks - consider implementing retargeting campaigns.",
      );
    }

    return {
      summary: {
        totalReach: unifiedMetrics.totalReach,
        totalRevenue: unifiedMetrics.totalRevenue,
        totalConversions: unifiedMetrics.totalConversions,
        averageConversionRate:
          (unifiedMetrics.totalConversions /
            Math.max(unifiedMetrics.totalReach, 1)) *
          100,
        roi:
          unifiedMetrics.totalCost > 0
            ? ((unifiedMetrics.totalRevenue - unifiedMetrics.totalCost) /
                unifiedMetrics.totalCost) *
              100
            : 0,
        activeChannels: unifiedMetrics.performanceByChannel.length,
      },
      channelBreakdown: unifiedMetrics.channelBreakdown,
      insights,
      recommendations,
    };
  } catch (error) {
    logger.error("Error generating campaign report:", error);
    throw error;
  }
};

export const syncChannelData = async (
  campaignId: string,
  clientId: string,
): Promise<void> => {
  try {
    // Sync email campaign data
    const emailCampaigns = await getAllEmailCampaigns(clientId);
    const campaignEmails = emailCampaigns.filter(
      (email) => email.campaignId === campaignId,
    );

    for (const email of campaignEmails) {
      const analytics = await generateChannelAnalytics(
        "email",
        email.id,
        campaignId,
        {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
      );
      CrossChannelAnalyticsAggregator.addChannelAnalytics(
        campaignId,
        analytics,
      );
    }

    // Sync social media data
    const socialPosts = await getAllSocialMediaPosts(clientId);
    const campaignPosts = socialPosts.filter(
      (post) => post.campaignId === campaignId,
    );

    for (const post of campaignPosts) {
      const analytics = await generateChannelAnalytics(
        "social_media",
        post.id,
        campaignId,
        {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
      );
      CrossChannelAnalyticsAggregator.addChannelAnalytics(
        campaignId,
        analytics,
      );
    }

    logger.info("Channel data synced successfully:", { campaignId, clientId });
  } catch (error) {
    logger.error("Error syncing channel data:", error);
    throw error;
  }
};

// Helper functions for mock data generation
function generateMockMetrics(channelType: ChannelType): any {
  const baseReach = Math.floor(Math.random() * 10000) + 1000;

  switch (channelType) {
    case "email":
      return {
        reach: baseReach,
        impressions: baseReach * 1.1, // Some people might see it multiple times
        engagements: Math.floor(baseReach * (0.15 + Math.random() * 0.25)), // 15-40% engagement
        clicks: Math.floor(baseReach * (0.02 + Math.random() * 0.08)), // 2-10% CTR
        conversions: Math.floor(baseReach * (0.005 + Math.random() * 0.015)), // 0.5-2% conversion
        revenue: Math.floor(
          baseReach *
            (0.005 + Math.random() * 0.015) *
            (50 + Math.random() * 150),
        ),
        cost: Math.floor(baseReach * (0.1 + Math.random() * 0.3)),
        engagementRate: 15 + Math.random() * 25,
        clickThroughRate: 2 + Math.random() * 8,
        conversionRate: 0.5 + Math.random() * 1.5,
        costPerClick: 1 + Math.random() * 4,
        costPerConversion: 20 + Math.random() * 80,
        returnOnAdSpend: 2 + Math.random() * 6,
      };

    case "social_media":
      return {
        reach: baseReach,
        impressions: Math.floor(baseReach * (2 + Math.random() * 3)), // Higher impression to reach ratio
        engagements: Math.floor(baseReach * (0.05 + Math.random() * 0.15)), // 5-20% engagement
        clicks: Math.floor(baseReach * (0.01 + Math.random() * 0.04)), // 1-5% CTR
        conversions: Math.floor(baseReach * (0.002 + Math.random() * 0.008)), // 0.2-1% conversion
        revenue: Math.floor(
          baseReach *
            (0.002 + Math.random() * 0.008) *
            (30 + Math.random() * 120),
        ),
        cost: Math.floor(baseReach * (0.2 + Math.random() * 0.5)),
        engagementRate: 5 + Math.random() * 15,
        clickThroughRate: 1 + Math.random() * 4,
        conversionRate: 0.2 + Math.random() * 0.8,
        costPerClick: 0.5 + Math.random() * 2,
        costPerConversion: 30 + Math.random() * 100,
        returnOnAdSpend: 1.5 + Math.random() * 4,
      };

    default:
      return {
        reach: baseReach,
        impressions: baseReach,
        engagements: Math.floor(baseReach * 0.1),
        clicks: Math.floor(baseReach * 0.05),
        conversions: Math.floor(baseReach * 0.01),
        revenue: Math.floor(baseReach * 0.01 * 100),
        cost: Math.floor(baseReach * 0.2),
        engagementRate: 10,
        clickThroughRate: 5,
        conversionRate: 1,
        costPerClick: 2,
        costPerConversion: 50,
        returnOnAdSpend: 3,
      };
  }
}

function generateDailyMetrics(
  dateRange: { start: Date; end: Date },
  baseMetrics: any,
): { date: string; metrics: Record<string, number> }[] {
  const dailyMetrics: { date: string; metrics: Record<string, number> }[] = [];
  const days = Math.ceil(
    (dateRange.end.getTime() - dateRange.start.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  for (let i = 0; i < days; i++) {
    const date = new Date(dateRange.start.getTime() + i * 24 * 60 * 60 * 1000);
    const dayMetrics: Record<string, number> = {};

    // Distribute base metrics across days with some randomness
    Object.keys(baseMetrics).forEach((key) => {
      const baseValue = baseMetrics[key];
      const dailyValue = Math.floor((baseValue / days) * (0.5 + Math.random()));
      dayMetrics[key] = dailyValue;
    });

    dailyMetrics.push({
      date: date.toISOString().split("T")[0],
      metrics: dayMetrics,
    });
  }

  return dailyMetrics;
}

function generateAudienceInsights(channelType: ChannelType): {
  demographics: Record<string, number>;
  geography: Record<string, number>;
  interests: Record<string, number>;
  devices: Record<string, number>;
} {
  return {
    demographics: {
      "18-24": Math.random() * 20 + 5,
      "25-34": Math.random() * 30 + 20,
      "35-44": Math.random() * 25 + 15,
      "45-54": Math.random() * 20 + 10,
      "55+": Math.random() * 15 + 5,
    },
    geography: {
      "United States": Math.random() * 40 + 30,
      Canada: Math.random() * 15 + 5,
      "United Kingdom": Math.random() * 15 + 5,
      Germany: Math.random() * 10 + 3,
      Other: Math.random() * 20 + 10,
    },
    interests: {
      Nonprofit: Math.random() * 50 + 25,
      "Social Causes": Math.random() * 40 + 20,
      Community: Math.random() * 35 + 15,
      Volunteering: Math.random() * 30 + 10,
      Charity: Math.random() * 45 + 20,
    },
    devices: {
      Desktop: Math.random() * 40 + 20,
      Mobile: Math.random() * 50 + 30,
      Tablet: Math.random() * 15 + 5,
    },
  };
}

// Initialize some mock journey data
const initializeMockJourneyData = () => {
  // Generate some sample customer journeys
  const channels: ChannelType[] = ["email", "social_media", "website"];
  const actions = ["view", "click", "engage", "convert"];

  for (let i = 0; i < 50; i++) {
    const userId = `user_${i}`;
    const journeyLength = Math.floor(Math.random() * 5) + 2; // 2-6 touchpoints

    for (let j = 0; j < journeyLength; j++) {
      const channelType = channels[Math.floor(Math.random() * channels.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ); // Last 30 days

      CustomerJourneyAnalyzer.addTouchpoint(
        userId,
        channelType,
        `${channelType}_${Date.now()}_${Math.random()}`,
        action,
        timestamp,
      );
    }
  }

  logger.info("Initialized mock customer journey data");
};

// Initialize on service load
initializeMockJourneyData();
