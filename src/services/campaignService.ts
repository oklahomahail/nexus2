// src/services/campaignService.ts
import type {
  Campaign,
  CreateCampaignData,
  UpdateCampaignData,
} from "../models/campaign";

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: number;
  successRate: number;
  // Client-specific stats
  clientCampaigns?: number;
  clientActiveCount?: number;
  clientTotalRaised?: number;
}

// Mock data store - replace with IndexedDB adapter later
const mockCampaigns: Campaign[] = [
  {
    id: "campaign_1",
    clientId: "acme", // Associated with Acme Nonprofit
    name: "End of Year Giving Campaign",
    description: "Annual fundraising campaign to support our programs",
    goal: 50000,
    raised: 32500,
    progress: 65,
    daysLeft: 45,
    startDate: "2024-11-01",
    endDate: "2024-12-31",
    status: "Active",
    category: "General",
    targetAudience: "Individual donors and families",
    donorCount: 127,
    averageGift: 255,
    totalRevenue: 32500,
    totalDonors: 127,
    roi: 30,
    lastUpdated: new Date(),
    createdAt: new Date("2024-10-15"),
    createdBy: "Dave Hail",
    tags: ["year-end", "annual"],
    emailsSent: 450,
    clickThroughRate: 12.5,
    conversionRate: 8.2,
  },
  {
    id: "campaign_2",
    clientId: "acme",
    name: "Spring Education Fund",
    description: "Supporting educational initiatives this spring",
    goal: 25000,
    raised: 8500,
    progress: 34,
    daysLeft: 60,
    startDate: "2024-03-01",
    endDate: "2024-05-31",
    status: "Active",
    category: "Education",
    targetAudience: "Parents and educators",
    donorCount: 45,
    averageGift: 189,
    totalRevenue: 8500,
    totalDonors: 45,
    roi: 15,
    lastUpdated: new Date(),
    createdAt: new Date("2024-02-15"),
    createdBy: "Jane Smith",
    tags: ["education", "spring"],
    emailsSent: 200,
    clickThroughRate: 8.3,
    conversionRate: 6.1,
  },
  {
    id: "campaign_3",
    clientId: "green-future", // Associated with Green Future Foundation
    name: "Clean Water Initiative",
    description: "Providing clean water access to rural communities",
    goal: 75000,
    raised: 42000,
    progress: 56,
    daysLeft: 30,
    startDate: "2024-10-01",
    endDate: "2024-12-15",
    status: "Active",
    category: "Environment",
    targetAudience: "Environmental advocates",
    donorCount: 89,
    averageGift: 472,
    totalRevenue: 42000,
    totalDonors: 89,
    roi: 25,
    lastUpdated: new Date(),
    createdAt: new Date("2024-09-15"),
    createdBy: "Mike Johnson",
    tags: ["water", "environment", "rural"],
    emailsSent: 350,
    clickThroughRate: 15.2,
    conversionRate: 12.4,
  },
];

// Helper function to simulate API delay
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Helper function to calculate days left
const calculateDaysLeft = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

// Get all campaigns (optionally filtered by client)
export const getAllCampaigns = async (
  clientId?: string,
): Promise<Campaign[]> => {
  await delay(500);
  if (clientId) {
    return mockCampaigns.filter((campaign) => campaign.clientId === clientId);
  }
  return [...mockCampaigns];
};

// Get campaigns for specific client
export const getCampaignsByClient = async (
  clientId: string,
): Promise<Campaign[]> => {
  await delay(300);
  return mockCampaigns.filter((campaign) => campaign.clientId === clientId);
};

export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  await delay(300);
  return mockCampaigns.find((campaign) => campaign.id === id) || null;
};

export const createCampaign = async (
  data: CreateCampaignData,
): Promise<Campaign> => {
  await delay(500);

  const newCampaign: Campaign = {
    id: `campaign_${Date.now()}`,
    ...data,
    raised: 0,
    progress: 0,
    daysLeft: calculateDaysLeft(data.endDate),
    donorCount: 0,
    averageGift: 0,
    totalRevenue: 0,
    totalDonors: 0,
    roi: 0,
    status: "Draft",
    lastUpdated: new Date(),
    createdAt: new Date(),
    createdBy: "Current User", // Replace with actual user context
    tags: data.tags || [],
  };

  mockCampaigns.push(newCampaign);
  return newCampaign;
};

export const updateCampaign = async (
  id: string,
  data: UpdateCampaignData,
): Promise<Campaign | null> => {
  await delay(500);

  const campaignIndex = mockCampaigns.findIndex(
    (campaign) => campaign.id === id,
  );
  if (campaignIndex === -1) {
    return null;
  }

  const updatedCampaign = {
    ...mockCampaigns[campaignIndex],
    ...data,
    lastUpdated: new Date(),
  };

  // Recalculate progress if goal or raised amount changed
  if (data.goal || data.raised !== undefined) {
    updatedCampaign.progress = Math.round(
      (updatedCampaign.raised / updatedCampaign.goal) * 100,
    );
  }

  mockCampaigns[campaignIndex] = updatedCampaign;
  return updatedCampaign;
};

export const deleteCampaign = async (id: string): Promise<boolean> => {
  await delay(500);

  const campaignIndex = mockCampaigns.findIndex(
    (campaign) => campaign.id === id,
  );
  if (campaignIndex === -1) {
    return false;
  }

  mockCampaigns.splice(campaignIndex, 1);
  return true;
};

// Get campaign statistics (optionally filtered by client)
export const getCampaignStats = async (
  clientId?: string,
): Promise<CampaignStats> => {
  await delay(300);

  const campaigns = clientId
    ? mockCampaigns.filter((c) => c.clientId === clientId)
    : mockCampaigns;

  const activeCampaigns = campaigns.filter((c) => c.status === "Active");
  const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);
  const successRate =
    campaigns.length > 0
      ? Math.round(
          (campaigns.filter((c) => c.progress >= 100).length /
            campaigns.length) *
            100,
        )
      : 0;

  return {
    totalCampaigns: campaigns.length,
    activeCampaigns: activeCampaigns.length,
    totalRaised,
    successRate,
    // Include client-specific stats if filtering by client
    ...(clientId && {
      clientCampaigns: campaigns.length,
      clientActiveCount: activeCampaigns.length,
      clientTotalRaised: totalRaised,
    }),
  };
};

// Search campaigns by name (optionally within a client)
export const searchCampaigns = async (
  query: string,
  clientId?: string,
): Promise<Campaign[]> => {
  await delay(300);

  let campaigns = clientId
    ? mockCampaigns.filter((c) => c.clientId === clientId)
    : mockCampaigns;

  const lowercaseQuery = query.toLowerCase();
  return campaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(lowercaseQuery) ||
      campaign.description?.toLowerCase().includes(lowercaseQuery) ||
      campaign.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  );
};

// Get campaigns by status (optionally within a client)
export const getCampaignsByStatus = async (
  status: Campaign["status"],
  clientId?: string,
): Promise<Campaign[]> => {
  await delay(300);

  let campaigns = clientId
    ? mockCampaigns.filter((c) => c.clientId === clientId)
    : mockCampaigns;

  return campaigns.filter((campaign) => campaign.status === status);
};

// Migration helper: add clientId to existing campaigns
export const migrateCampaignsToClient = async (
  defaultClientId: string,
): Promise<void> => {
  await delay(200);

  mockCampaigns.forEach((campaign) => {
    if (!campaign.clientId) {
      campaign.clientId = defaultClientId;
    }
  });
};

// Legacy class export for backward compatibility
class CampaignService {
  getAllCampaigns = getAllCampaigns;
  getCampaignsByClient = getCampaignsByClient;
  getCampaignById = getCampaignById;
  createCampaign = createCampaign;
  updateCampaign = updateCampaign;
  deleteCampaign = deleteCampaign;
  getCampaignStats = getCampaignStats;
  searchCampaigns = searchCampaigns;
  getCampaignsByStatus = getCampaignsByStatus;
  migrateCampaignsToClient = migrateCampaignsToClient;
}

// Export singleton instance
export const campaignService = new CampaignService();
export default campaignService;
