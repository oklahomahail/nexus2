import type { Campaign, CreateCampaignData } from "@/models/campaign";

// Base campaign data for creation (what gets filled in during tutorial)
export const demoCampaignData: CreateCampaignData = {
  name: "End-of-Year Holiday Campaign",
  clientId: "client_regional_food_bank",
  description:
    "Holiday giving campaign to provide warm meals and food boxes to families in need during the winter season. Focus on community generosity and the spirit of giving.",
  goal: 10000,
  startDate: "2025-11-15",
  endDate: "2025-12-31",
  category: "General",
  targetAudience:
    "Existing donors, volunteers, local businesses, community supporters",
  tags: ["End-of-Year", "Holiday", "Food Security", "Community", "Winter"],
  notes:
    "Coordinate with local businesses for matching gifts. Plan volunteer events for food box packing.",
};

// Full campaign object (after creation with analytics data)
export const demoCampaign: Campaign = {
  ...demoCampaignData,
  tags: demoCampaignData.tags || [],
  id: "cmp_eoy_holiday_2025",
  raised: 2450,
  progress: 24.5, // 2450/10000 * 100
  daysLeft: 31,
  status: "Active",
  donorCount: 36,
  averageGift: 68.06,
  totalRevenue: 2450,
  totalDonors: 36,
  roi: 4.9, // Simple calculation
  marketingCost: 500,
  emailsSent: 1250,
  clickThroughRate: 0.18,
  conversionRate: 0.029,
  type: "End-of-Year",
  lastUpdated: new Date(),
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  createdBy: "user_tutorial_demo",
  theme: {
    name: "Holiday Warmth & Community Generosity",
    colors: {
      primary: "#B91C1C", // Holiday Red
      secondary: "#059669", // Holiday Green
      accent: "#F59E0B", // Gold
    },
    messaging: {
      primary: "Bringing warmth to tables and hearts this holiday season",
      secondary: "Every dollar provides 4 nutritious meals to a family in need",
      cta: "Share the warmth - donate today",
    },
  },
  clientBrnoyeanding: {
    primaryColor: "#2E8B57",
    secondaryColor: "#F4A460",
    logoUrl: "/assets/demo/regional-food-bank-logo.svg",
  },
};

// Campaign milestones and timeline data
export const demoCampaignMilestones = [
  {
    id: "milestone_launch",
    campaignId: "cmp_eoy_holiday_2025",
    title: "Campaign Launched",
    description: "End-of-Year Holiday Campaign officially launched",
    targetAmount: 0,
    actualAmount: 0,
    achievedAt: new Date("2025-11-15T10:00:00Z"),
    type: "launch" as const,
  },
  {
    id: "milestone_10_percent",
    campaignId: "cmp_eoy_holiday_2025",
    title: "10% Goal Reached",
    description: "First $1,000 raised - 400 meals secured!",
    targetAmount: 1000,
    actualAmount: 1000,
    achievedAt: new Date("2025-11-20T14:30:00Z"),
    type: "goal_percentage" as const,
  },
  {
    id: "milestone_25_percent",
    campaignId: "cmp_eoy_holiday_2025",
    title: "Quarter Way There",
    description: "25% of goal reached - community response has been amazing!",
    targetAmount: 2500,
    actualAmount: 2450,
    achievedAt: new Date("2025-12-05T16:15:00Z"),
    type: "goal_percentage" as const,
  },
];

// Audience segments for the campaign
export const demoCampaignSegments = [
  {
    id: "segment_current_donors",
    name: "Current Donors",
    description: "Donors who have given in the past 12 months",
    size: 485,
    criteria: {
      lastDonation: "within_12_months",
      totalGifts: "any",
    },
  },
  {
    id: "segment_lapsed_donors",
    name: "Lapsed Donors",
    description: "Previous donors who haven't given in 12+ months",
    size: 320,
    criteria: {
      lastDonation: "12_months_plus",
      totalGifts: "1_or_more",
    },
  },
  {
    id: "segment_volunteers",
    name: "Volunteers",
    description: "Active volunteers and volunteer coordinators",
    size: 145,
    criteria: {
      volunteerHours: "any",
      engagement: "high",
    },
  },
  {
    id: "segment_prospects",
    name: "New Prospects",
    description: "Community members interested in food security causes",
    size: 750,
    criteria: {
      engagement: "newsletter_subscriber",
      donationHistory: "none",
    },
  },
];
