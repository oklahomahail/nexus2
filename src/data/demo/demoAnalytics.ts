// Demo analytics data for the End-of-Year Holiday Campaign
export const demoAnalytics = {
  campaignId: "cmp_eoy_holiday_2025",

  // Overview totals
  totals: {
    raised: 2450,
    goal: 10000,
    donors: 36,
    gifts: 41,
    averageGift: 59.76,
    progressPercent: 24.5,
    daysRemaining: 31,
    daysActive: 16,
    projectedTotal: 9800, // Based on current trajectory
  },

  // Channel performance
  channels: [
    {
      channel: "Email",
      gifts: 24,
      amount: 1430,
      donors: 21,
      averageGift: 59.58,
      conversionRate: 0.034,
      revenuePercent: 58.4,
    },
    {
      channel: "Social Media",
      gifts: 12,
      amount: 760,
      donors: 10,
      averageGift: 63.33,
      conversionRate: 0.018,
      revenuePercent: 31.0,
    },
    {
      channel: "Direct Mail",
      gifts: 5,
      amount: 260,
      donors: 5,
      averageGift: 52.0,
      conversionRate: 0.025,
      revenuePercent: 10.6,
    },
  ],

  // Daily giving timeline
  timeline: [
    { date: "2025-11-15", amount: 145, donors: 3, gifts: 3 }, // Launch day
    { date: "2025-11-16", amount: 280, donors: 4, gifts: 4 },
    { date: "2025-11-17", amount: 125, donors: 2, gifts: 2 },
    { date: "2025-11-18", amount: 190, donors: 3, gifts: 3 },
    { date: "2025-11-19", amount: 95, donors: 1, gifts: 1 },
    { date: "2025-11-20", amount: 385, donors: 5, gifts: 6 }, // Email campaign
    { date: "2025-11-21", amount: 220, donors: 3, gifts: 3 },
    { date: "2025-11-22", amount: 175, donors: 2, gifts: 2 },
    { date: "2025-11-23", amount: 90, donors: 1, gifts: 1 },
    { date: "2025-11-24", amount: 160, donors: 2, gifts: 2 },
    { date: "2025-11-25", amount: 205, donors: 3, gifts: 3 },
    { date: "2025-12-01", amount: 145, donors: 2, gifts: 2 },
    { date: "2025-12-02", amount: 95, donors: 1, gifts: 1 },
    { date: "2025-12-03", amount: 165, donors: 2, gifts: 2 },
    { date: "2025-12-04", amount: 85, donors: 1, gifts: 1 },
    { date: "2025-12-05", amount: 310, donors: 4, gifts: 5 }, // Social media push
  ],

  // Donor segment performance
  segments: [
    {
      segment: "Current Donors",
      donors: 18,
      gifts: 22,
      amount: 1350,
      averageGift: 61.36,
      conversionRate: 0.037,
      retentionRate: 0.85,
    },
    {
      segment: "Lapsed Donors",
      donors: 8,
      gifts: 9,
      amount: 485,
      averageGift: 53.89,
      conversionRate: 0.025,
      reactivationRate: 0.15,
    },
    {
      segment: "Volunteers",
      donors: 7,
      gifts: 8,
      amount: 420,
      averageGift: 52.5,
      conversionRate: 0.048,
      engagementScore: 0.92,
    },
    {
      segment: "New Prospects",
      donors: 3,
      gifts: 2,
      amount: 195,
      averageGift: 65.0,
      conversionRate: 0.004,
      acquisitionCost: 35,
    },
  ],

  // Gift size distribution
  giftSizes: [
    { range: "$1-$25", count: 8, amount: 145 },
    { range: "$26-$50", count: 12, amount: 485 },
    { range: "$51-$100", count: 15, amount: 1125 },
    { range: "$101-$250", count: 5, amount: 570 },
    { range: "$250+", count: 1, amount: 125 },
  ],

  // Geographic distribution (simplified)
  geography: [
    { region: "Metro Area", donors: 24, amount: 1680, percent: 68.6 },
    { region: "Rural Counties", donors: 8, amount: 485, percent: 19.8 },
    { region: "Adjacent Cities", donors: 4, amount: 285, percent: 11.6 },
  ],

  // Key metrics trends (7-day rolling averages)
  trends: {
    donorAcquisition: [
      { week: "Week 1", newDonors: 12, retentionRate: 0.83 },
      { week: "Week 2", newDonors: 18, retentionRate: 0.78 },
      { week: "Week 3", newDonors: 6, retentionRate: 0.85 },
    ],
    engagement: {
      emailOpenRate: 0.24,
      emailClickRate: 0.06,
      socialEngagementRate: 0.035,
      websiteConversion: 0.028,
    },
  },

  // Performance insights
  insights: [
    {
      type: "positive",
      metric: "Email Performance",
      message:
        "Email campaigns are driving 58% of total revenue with strong conversion rates",
    },
    {
      type: "opportunity",
      metric: "Social Media",
      message:
        "Social media has the highest average gift size - consider increasing investment",
    },
    {
      type: "warning",
      metric: "Lapsed Donors",
      message: "Lapsed donor reactivation is below target (15% vs 20% goal)",
    },
    {
      type: "positive",
      metric: "Volunteer Engagement",
      message: "Volunteers have the highest conversion rate at 4.8%",
    },
  ],

  // Projections
  projections: {
    endOfCampaign: {
      estimatedTotal: 9800,
      confidence: 0.75,
      estimatedDonors: 85,
      daysToGoal: 42, // May extend beyond campaign end
      recommendedActions: [
        "Launch matching gift challenge",
        "Activate peer-to-peer fundraising",
        "Target lapsed donor segment with personalized outreach",
      ],
    },
  },
};

// Sample report data structure
export const demoReportData = {
  campaignId: "cmp_eoy_holiday_2025",
  generatedAt: new Date().toISOString(),
  reportType: "campaign_summary",

  executive_summary: {
    performance: "Strong start with 24.5% of goal reached in first 16 days",
    topChannel: "Email driving 58% of revenue",
    keyInsight: "Volunteer segment shows highest engagement and conversion",
    recommendation:
      "Focus on expanding email campaigns and volunteer-to-donor conversion",
  },

  financial_overview: {
    totalRaised: 2450,
    goalProgress: "24.5%",
    averageGift: "$59.76",
    totalDonors: 36,
    roi: "4.9x",
    costPerDollarRaised: "$0.20",
  },

  channel_analysis: {
    best_performing: "Email",
    growth_opportunity: "Social Media",
    needs_attention: "Direct Mail",
  },

  donor_insights: {
    retention_rate: "85%",
    reactivation_success: "15%",
    new_donor_acquisition: "8%",
    volunteer_conversion: "4.8%",
  },

  recommendations: [
    "Implement matching gift campaign to accelerate progress",
    "Expand successful email campaigns to lapsed donors",
    "Leverage volunteer network for peer-to-peer fundraising",
    "Create urgency messaging as end-of-year approaches",
  ],
};
