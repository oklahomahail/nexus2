// src/services/analyticsService.ts
import {
  AnalyticsFilters,
  CampaignAnalytics,
  _DonorInsights,
  OrganizationAnalytics,
} from "../models/analytics";

/**
 * Deterministic RNG based on a string seed (mulberry32-ish).
 */
function createRng(seedKey: string) {
  // Simple 32-bit hash
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedKey.length; i++) {
    h ^= seedKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Mulberry32
  return function rng() {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Local type for convenience if other code wants it */
export type AnalyticsTimeRange = { start: Date; end: Date; label: string };

/** Helpers */
function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

class AnalyticsService {
  // --------------------------
  // Public helpers
  // --------------------------
  getTimeRanges(): AnalyticsTimeRange[] {
    const now = new Date();
    return [
      {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
        label: "This Month",
      },
      {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0),
        label: "Last Month",
      },
      {
        start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0),
        label: "Last 3 Months",
      },
      {
        start: new Date(now.getFullYear(), 0, 1),
        end: now,
        label: "Year to Date",
      },
    ];
  }

  /**
   * Optional client rollup (kept for compatibility).
   * Returns a lightweight aggregate; you can enrich later.
   */
  async getClientAnalytics(
    clientId: string,
    arg?: AnalyticsFilters | AnalyticsTimeRange,
  ): Promise<{
    clientId: string;
    metrics: Record<string, number>;
    revenueOverTime: Array<{
      date: string;
      revenue: number;
      donors: number;
      campaigns: number;
    }>;
    campaigns: Array<{
      id: string;
      name: string;
      raised: number;
      donorCount: number;
      status: "Active" | "Paused" | "Ended";
      progress: number;
    }>;
    donorSegments: Array<{
      segment: string;
      count: number;
      revenue: number;
      averageGift: number;
      retentionRate: number;
    }>;
  }> {
    // Normalize to filters (so it’s deterministic with the rest of the service)
    const filters: AnalyticsFilters | undefined = isTimeRange(arg)
      ? {
          dateRange: {
            startDate: arg.start.toISOString().split("T")[0],
            endDate: arg.end.toISOString().split("T")[0],
          },
        }
      : arg;

    // Reuse campaign/org generators to keep consistency
    const seed = `${this.makeSeed(filters)}|client|${clientId}`;
    const rng = createRng(seed);

    const startDate = filters?.dateRange?.startDate ?? "2024-07-01";
    const endDate = filters?.dateRange?.endDate ?? "2024-08-31";
    const totalRaised = clamp(
      Math.round(180000 + rng() * 90000),
      90000,
      350000,
    );
    const donors = clamp(Math.round(1800 + rng() * 700), 900, 4000);
    const campaigns = clamp(Math.round(4 + rng() * 4), 2, 12);

    const revenueOverTime = this.generateTimeSeriesData(
      startDate,
      endDate,
      totalRaised,
      donors,
      `${seed}|ts`,
    ).map((d) => ({
      date: d.date,
      revenue: d.dailyRaised,
      donors: d.dailyDonors,
      campaigns: Math.max(1, Math.round((campaigns / 30) * (1 + rng()))),
    }));

    const campaignsList = Array.from(
      { length: Math.min(campaigns, 8) },
      (_, i) => {
        const raised = clamp(
          Math.round(totalRaised * (0.12 + rng() * 0.1)),
          5000,
          80000,
        );
        const donorCount = clamp(
          Math.round(donors * (0.05 + rng() * 0.08)),
          20,
          800,
        );
        const status: "Active" | "Paused" | "Ended" =
          rng() > 0.1 ? "Active" : rng() > 0.5 ? "Paused" : "Ended";
        const progress = clamp(
          Math.round((raised / (raised * (1.1 + rng() * 0.9))) * 100),
          10,
          100,
        );
        return {
          id: `${clientId}-c${i + 1}`,
          name: `Campaign ${i + 1}`,
          raised,
          donorCount,
          status,
          progress,
        };
      },
    );

    const segments = ["Major", "Mid", "Small", "First-time"].map((segment) => ({
      segment,
      count: clamp(Math.round(donors * (0.05 + rng() * 0.35)), 10, donors),
      revenue: clamp(
        Math.round(totalRaised * (0.05 + rng() * 0.35)),
        1000,
        totalRaised,
      ),
      averageGift: clamp(Math.round(100 + rng() * 900), 20, 6000),
      retentionRate: clamp(Math.round(40 + rng() * 40), 15, 95),
    }));

    return {
      clientId,
      metrics: {
        totalRaised,
        donors,
        campaigns,
      },
      revenueOverTime,
      campaigns: campaignsList,
      donorSegments: segments,
    };
  }

  async exportClientAnalytics(
    clientId: string,
    format: "csv" | "json",
  ): Promise<string | Blob> {
    const rollup = await this.getClientAnalytics(clientId);
    if (format === "json") {
      return new Blob([JSON.stringify(rollup, null, 2)], {
        type: "application/json",
      });
    }
    const rows = [
      "metric,value",
      `totalRaised,${rollup.metrics.totalRaised}`,
      `donors,${rollup.metrics.donors}`,
      `campaigns,${rollup.metrics.campaigns}`,
    ];
    return rows.join("\n");
  }

  // --------------------------
  // Campaign Analytics
  // --------------------------
  async getCampaignAnalytics(
    campaignId: string,
    filters?: AnalyticsFilters,
  ): Promise<CampaignAnalytics> {
    await delay(300);

    const seed = `${this.makeSeed(filters)}|campaign|${campaignId}`;
    const rng = createRng(seed);

    const campaignName = "Back to School Drive";
    const startDate = filters?.dateRange?.startDate ?? "2024-07-01";
    const endDate = filters?.dateRange?.endDate ?? "2024-08-31";

    const totalRaised = clamp(Math.round(28000 + rng() * 12000), 20000, 60000);
    const goalAmount = 50000;
    const donorCount = clamp(Math.round(110 + rng() * 60), 80, 220);
    const averageGiftSize = Math.round(totalRaised / Math.max(1, donorCount));
    const largestGift = clamp(Math.round(1500 + rng() * 4000), 1200, 6000);
    const smallestGift = clamp(Math.round(15 + rng() * 50), 10, 100);
    const completionRate = Math.round((totalRaised / goalAmount) * 100);

    const repeatDonorRate = Math.round(25 + rng() * 30) + rng() * 0.5; // %
    const emailsSent = clamp(Math.round(2500 + rng() * 2000), 1000, 8000);
    const emailsOpened = Math.round(emailsSent * (0.35 + rng() * 0.2));
    const emailsClicked = Math.round(emailsOpened * (0.22 + rng() * 0.2));
    const openRate = Math.round((emailsOpened / emailsSent) * 1000) / 10;
    const clickThroughRate =
      Math.round((emailsClicked / emailsSent) * 1000) / 10;
    const unsubscribeRate = Math.round((0.5 + rng() * 1.8) * 10) / 10;
    const bounceRate = Math.round((1 + rng() * 2.5) * 10) / 10;

    const websiteVisits = clamp(Math.round(1500 + rng() * 2200), 800, 6000);
    const donationPageViews = clamp(
      Math.round(websiteVisits * (0.2 + rng() * 0.2)),
      100,
      websiteVisits,
    );
    const conversions = clamp(
      Math.round(donationPageViews * (0.18 + rng() * 0.2)),
      10,
      donationPageViews,
    );
    const conversionRate =
      Math.round((conversions / Math.max(1, donationPageViews)) * 1000) / 10;
    const abandonmentRate = Math.round((20 + rng() * 25) * 10) / 10;
    const averageTimeOnPage = clamp(Math.round(120 + rng() * 90), 45, 300);

    const firstTimeDonors = clamp(
      Math.round(donorCount * (0.6 + rng() * 0.2)),
      0,
      donorCount,
    );
    const returningDonors = clamp(donorCount - firstTimeDonors, 0, donorCount);
    const majorGiftDonors = clamp(
      Math.round(donorCount * (0.03 + rng() * 0.04)),
      0,
      donorCount,
    );
    const midLevelDonors = clamp(
      Math.round(donorCount * (0.12 + rng() * 0.15)),
      0,
      donorCount,
    );
    const smallGiftDonors = clamp(
      donorCount - majorGiftDonors - midLevelDonors,
      0,
      donorCount,
    );

    const timeSeriesData = this.generateTimeSeriesData(
      startDate,
      endDate,
      totalRaised,
      donorCount,
      `${seed}|ts`,
    );

    const channelPerformance = [
      {
        channel: "Email",
        donorCount: clamp(
          Math.round(donorCount * (0.35 + rng() * 0.15)),
          10,
          donorCount,
        ),
        totalRaised: clamp(
          Math.round(totalRaised * (0.35 + rng() * 0.2)),
          1000,
          totalRaised,
        ),
        averageGift: clamp(
          Math.round(averageGiftSize * (0.9 + rng() * 0.25)),
          20,
          5000,
        ),
        conversionRate: Math.round((18 + rng() * 18) * 10) / 10,
      },
      {
        channel: "Social Media",
        donorCount: clamp(
          Math.round(donorCount * (0.22 + rng() * 0.12)),
          5,
          donorCount,
        ),
        totalRaised: clamp(
          Math.round(totalRaised * (0.18 + rng() * 0.15)),
          500,
          totalRaised,
        ),
        averageGift: clamp(
          Math.round(averageGiftSize * (0.7 + rng() * 0.3)),
          10,
          3000,
        ),
        conversionRate: Math.round((12 + rng() * 12) * 10) / 10,
      },
      {
        channel: "Website",
        donorCount: clamp(
          Math.round(donorCount * (0.2 + rng() * 0.15)),
          5,
          donorCount,
        ),
        totalRaised: clamp(
          Math.round(totalRaised * (0.22 + rng() * 0.18)),
          500,
          totalRaised,
        ),
        averageGift: clamp(
          Math.round(averageGiftSize * (0.9 + rng() * 0.3)),
          10,
          4000,
        ),
        conversionRate: Math.round((20 + rng() * 15) * 10) / 10,
      },
      {
        channel: "Events",
        donorCount: clamp(
          Math.round(donorCount * (0.05 + rng() * 0.08)),
          3,
          donorCount,
        ),
        totalRaised: clamp(
          Math.round(totalRaised * (0.1 + rng() * 0.12)),
          200,
          totalRaised,
        ),
        averageGift: clamp(
          Math.round(averageGiftSize * (1.1 + rng() * 0.6)),
          20,
          6000,
        ),
        conversionRate: Math.round((35 + rng() * 20) * 10) / 10,
      },
    ];

    return {
      campaignId,
      campaignName,
      timeframe: { startDate, endDate },
      fundraisingMetrics: {
        totalRaised,
        goalAmount,
        completionRate,
        donorCount,
        averageGiftSize,
        largestGift,
        smallestGift,
        repeatDonorRate,
      },
      outreachMetrics: {
        emailsSent,
        emailsOpened,
        emailsClicked,
        openRate,
        clickThroughRate,
        unsubscribeRate,
        bounceRate,
      },
      conversionMetrics: {
        websiteVisits,
        donationPageViews,
        conversionRate,
        abandonmentRate,
        averageTimeOnPage,
      },
      donorSegmentation: {
        firstTimeDonors,
        returningDonors,
        majorGiftDonors,
        midLevelDonors,
        smallGiftDonors,
      },
      timeSeriesData,
      channelPerformance,
    };
  }

  // --------------------------
  // Donor Insights
  // --------------------------
  async getDonorInsights(filters?: AnalyticsFilters): Promise<_DonorInsights> {
    await delay(250);

    const seed = `${this.makeSeed(filters)}|donors`;
    const rng = createRng(seed);

    const topDonors = [
      {
        id: "d1",
        name: "Alice M.",
        totalGiven: 10000 + randInt(rng, 500, 4000),
      },
      { id: "d2", name: "Bob H.", totalGiven: 9000 + randInt(rng, 500, 4000) },
      {
        id: "d3",
        name: "Samantha P.",
        totalGiven: 8000 + randInt(rng, 500, 4000),
      },
    ];

    const previous = clamp(Math.round(48 + rng() * 15), 35, 70);
    const current = clamp(previous + randInt(rng, 5, 18), 40, 90);
    const change = current - previous;

    const newDonors = clamp(Math.round(70 + rng() * 40), 30, 200);
    const returningDonors = clamp(Math.round(35 + rng() * 35), 10, 140);

    return {
      topDonors,
      donorRetention: { current, previous, change },
      acquisition: { newDonors, returningDonors },
    };
  }

  // --------------------------
  // Organization Analytics
  // --------------------------
  async getOrganizationAnalytics(
    filters?: AnalyticsFilters,
  ): Promise<OrganizationAnalytics> {
    await delay(280);

    const seed = `${this.makeSeed(filters)}|org`;
    const rng = createRng(seed);

    const currentStart = filters?.dateRange?.startDate ?? "2024-01-01";
    const currentEnd = filters?.dateRange?.endDate ?? "2024-08-31";
    const previousStart = "2023-01-01";
    const previousEnd = "2023-08-31";

    const previousTotal = clamp(
      Math.round(360000 + rng() * 120000),
      250000,
      600000,
    );
    const currentTotal = clamp(
      Math.round(previousTotal * (1.05 + rng() * 0.25)),
      previousTotal * 0.9,
      previousTotal * 1.5,
    );

    const previousDonors = clamp(Math.round(950 + rng() * 250), 700, 2000);
    const currentDonors = clamp(
      Math.round(previousDonors * (1.05 + rng() * 0.25)),
      600,
      3000,
    );

    const previousCampaigns = clamp(Math.round(9 + rng() * 4), 6, 16);
    const currentCampaigns = clamp(
      Math.round(previousCampaigns + rng() * 4),
      previousCampaigns,
      20,
    );

    const growthRaised =
      Math.round(((currentTotal - previousTotal) / previousTotal) * 1000) / 10;
    const growthDonors =
      Math.round(((currentDonors - previousDonors) / previousDonors) * 1000) /
      10;
    const growthCampaigns =
      Math.round(
        ((currentCampaigns - previousCampaigns) / previousCampaigns) * 1000,
      ) / 10;

    const topPerformingCampaigns = [
      {
        id: "1",
        name: "Youth Sports Program",
        raised: clamp(Math.round(currentTotal * 0.07), 15000, 90000),
        goal: 35000,
      },
      {
        id: "2",
        name: "Back to School Drive",
        raised: clamp(Math.round(currentTotal * 0.065), 12000, 80000),
        goal: 50000,
      },
      {
        id: "3",
        name: "Emergency Food Relief",
        raised: clamp(Math.round(currentTotal * 0.04), 8000, 60000),
        goal: 25000,
      },
    ];

    // Add clientPerformance to satisfy OrganizationAnalytics contract
    const clientPerformance = Array.from({ length: 6 }, (_, i) => {
      const revenue = clamp(
        Math.round(currentTotal * (0.04 + rng() * 0.08)),
        8000,
        120000,
      );
      const donors = clamp(
        Math.round(currentDonors * (0.04 + rng() * 0.08)),
        60,
        900,
      );
      const campaigns = clamp(Math.round(1 + rng() * 4), 1, 8);
      const growth = Math.round((-3 + rng() * 10) * 10) / 10; // -3%..+7%
      return {
        clientId: `client-${i + 1}`,
        clientName: `Client ${i + 1}`,
        revenue,
        donors,
        campaigns,
        growth,
      };
    });

    return {
      currentPeriod: {
        startDate: currentStart,
        endDate: currentEnd,
        totalRaised: currentTotal,
        donorCount: currentDonors,
        campaignCount: currentCampaigns,
      },
      previousPeriod: {
        startDate: previousStart,
        endDate: previousEnd,
        totalRaised: previousTotal,
        donorCount: previousDonors,
        campaignCount: previousCampaigns,
      },
      growthMetrics: {
        raisedChange: growthRaised,
        donorsChange: growthDonors,
        campaignsChange: growthCampaigns,
      },
      performanceComparisons: {
        current: currentTotal,
        previous: previousTotal,
        label: "Fundraising Performance",
      },
      topPerformingCampaigns,
      clientPerformance, // <-- required by your interface
    };
  }

  // --------------------------
  // CSV Export
  // --------------------------
  async exportAnalyticsData(
    type: "campaign" | "donor" | "organization",
    filters?: AnalyticsFilters,
  ): Promise<string> {
    await delay(150);

    if (type === "organization") {
      const org = await this.getOrganizationAnalytics(filters);
      const rows = [
        "metric,value",
        `current_total,${org.currentPeriod.totalRaised}`,
        `previous_total,${org.previousPeriod.totalRaised}`,
        ...org.topPerformingCampaigns.map(
          (c: { name: string; raised: any }) =>
            `campaign_${slug(c.name)}_raised,${c.raised}`,
        ),
      ];
      return `data:text/csv;charset=utf-8,${encodeURIComponent(rows.join("\n"))}`;
    }

    if (type === "campaign") {
      const id = "export-demo";
      const c = await this.getCampaignAnalytics(id, filters);
      const rows = [
        "field,value",
        `campaign,${c.campaignName}`,
        `totalRaised,${c.fundraisingMetrics.totalRaised}`,
        `goal,${c.fundraisingMetrics.goalAmount}`,
        `donorCount,${c.fundraisingMetrics.donorCount}`,
        `avgGift,${c.fundraisingMetrics.averageGiftSize}`,
      ];
      return `data:text/csv;charset=utf-8,${encodeURIComponent(rows.join("\n"))}`;
    }

    // donor
    const d = await this.getDonorInsights(filters);
    const rows = [
      "rank,name,totalGiven",
      ...d.topDonors.map((td, i) => `${i + 1},${td.name},${td.totalGiven}`),
    ];
    return `data:text/csv;charset=utf-8,${encodeURIComponent(rows.join("\n"))}`;
  }

  // --------------------------
  // Internal helpers
  // --------------------------
  private makeSeed(filters?: AnalyticsFilters) {
    const dr = filters?.dateRange;
    return `seed|${dr?.startDate ?? "start"}|${dr?.endDate ?? "end"}`;
  }

  /**
   * Deterministic time-series using a seeded RNG.
   * Ensures cumulative totals do not exceed provided caps.
   */
  private generateTimeSeriesData(
    startDate: string,
    endDate: string,
    totalRaised: number,
    totalDonors: number,
    seedKey?: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1,
    );

    const rng = createRng(
      seedKey ?? `ts|${startDate}|${endDate}|${totalRaised}|${totalDonors}|v1`,
    );

    const data: Array<{
      date: string;
      dailyRaised: number;
      dailyDonors: number;
      cumulativeRaised: number;
      cumulativeDonors: number;
    }> = [];
    let cumulativeRaised = 0;
    let cumulativeDonors = 0;

    // bell-ish curve centered mid-period
    const weights = Array.from({ length: days }, (_, i) => {
      const x = i / Math.max(1, days - 1); // 0..1
      return 0.6 * Math.exp(-12 * Math.pow(x - 0.5, 2)) + 0.4;
    });
    const weightSum = weights.reduce((a, b) => a + b, 0);

    const raisedAlloc = weights.map((w) => w / weightSum);
    const donorsAlloc = weights.map((w) => w / weightSum);

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);

      const jitterRaised = 0.8 + rng() * 0.4;
      const jitterDonors = 0.8 + rng() * 0.4;

      const dailyRaised = Math.max(
        0,
        Math.round(totalRaised * raisedAlloc[i] * jitterRaised),
      );
      const dailyDonors = Math.max(
        0,
        Math.round(totalDonors * donorsAlloc[i] * jitterDonors),
      );

      cumulativeRaised = Math.min(cumulativeRaised + dailyRaised, totalRaised);
      cumulativeDonors = Math.min(cumulativeDonors + dailyDonors, totalDonors);

      data.push({
        date: currentDate.toISOString().split("T")[0],
        dailyRaised,
        dailyDonors,
        cumulativeRaised,
        cumulativeDonors,
      });
    }

    // Top off to exact totals
    const last = data[data.length - 1];
    if (last) {
      last.cumulativeRaised = totalRaised;
      last.cumulativeDonors = totalDonors;
      last.dailyRaised = Math.max(
        0,
        totalRaised - (data[data.length - 2]?.cumulativeRaised ?? 0),
      );
      last.dailyDonors = Math.max(
        0,
        totalDonors - (data[data.length - 2]?.cumulativeDonors ?? 0),
      );
    }

    return data;
  }
}

// Small util
function isTimeRange(x: any): x is AnalyticsTimeRange {
  return (
    x &&
    x.start instanceof Date &&
    x.end instanceof Date &&
    typeof x.label === "string"
  );
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const analyticsService = new AnalyticsService();
export default analyticsService;
