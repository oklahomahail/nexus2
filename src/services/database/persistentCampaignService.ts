// src/services/database/persistentCampaignService.ts
// Campaign service with IndexedDB persistence

import { v4 as uuidv4 } from "uuid";

import type {
  Campaign,
  CreateCampaignData,
  UpdateCampaignData,
} from "@/models/campaign";

import { indexedDbService, STORES, DatabaseError } from "./indexedDbService";

// Stats interface (same as original)
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

// Helper function to simulate API delay (can be removed later)
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to calculate days left
const calculateDaysLeft = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

// Mock data for initial seeding
const getMockCampaigns = (): Campaign[] => [
  {
    id: "campaign_1",
    type: "annual",
    clientId: "acme",
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
    marketingCost: 2600,
    theme: null,
  },
  {
    id: "campaign_2",
    type: "program",
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
    marketingCost: 1275,
    theme: null,
  },
  {
    id: "campaign_3",
    type: "emergency",
    clientId: "green-future",
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
    marketingCost: 1680,
    theme: null,
  },
];

// Initialize database with mock data if empty
let initialized = false;

const ensureInitialized = async (): Promise<void> => {
  if (initialized) return;

  try {
    await indexedDbService.init();

    // Check if we have any campaigns, if not seed with mock data
    const existingCampaigns = await indexedDbService.getAll(STORES.CAMPAIGNS);
    if (existingCampaigns.length === 0) {
      console.log("Seeding database with mock campaigns...");
      await indexedDbService.putMany(STORES.CAMPAIGNS, getMockCampaigns());
    }

    initialized = true;
  } catch (error) {
    console.error("Failed to initialize campaign database:", error);
    throw new DatabaseError("Campaign database initialization failed");
  }
};

// Persistent Campaign Service Implementation
export const getAllCampaigns = async (
  clientId?: string,
): Promise<Campaign[]> => {
  await delay(500); // Simulate API delay
  await ensureInitialized();

  try {
    if (clientId) {
      return await indexedDbService.query(
        STORES.CAMPAIGNS,
        "clientId",
        IDBKeyRange.only(clientId),
      );
    }
    return await indexedDbService.getAll(STORES.CAMPAIGNS);
  } catch (error) {
    console.error("Error getting campaigns:", error);
    throw new DatabaseError("Failed to retrieve campaigns");
  }
};

export const getCampaignsByClient = async (
  clientId: string,
): Promise<Campaign[]> => {
  await delay(300);
  await ensureInitialized();

  try {
    return await indexedDbService.query(
      STORES.CAMPAIGNS,
      "clientId",
      IDBKeyRange.only(clientId),
    );
  } catch (error) {
    console.error("Error getting campaigns by client:", error);
    throw new DatabaseError("Failed to retrieve client campaigns");
  }
};

export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  await delay(300);
  await ensureInitialized();

  try {
    const campaign = await indexedDbService.get(STORES.CAMPAIGNS, id);
    return campaign || null;
  } catch (error) {
    console.error("Error getting campaign by ID:", error);
    throw new DatabaseError("Failed to retrieve campaign");
  }
};

export const createCampaign = async (
  data: CreateCampaignData,
): Promise<Campaign> => {
  await delay(500);
  await ensureInitialized();

  const newCampaign: Campaign = {
    type: "annual",
    id: uuidv4(),
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
    createdBy: "Current User", // Replace with actual user context later
    tags: data.tags || [],
    marketingCost: 0,
    theme: null,
  };

  try {
    await indexedDbService.put(STORES.CAMPAIGNS, newCampaign);
    return newCampaign;
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw new DatabaseError("Failed to create campaign");
  }
};

export const updateCampaign = async (
  id: string,
  data: UpdateCampaignData,
): Promise<Campaign | null> => {
  await delay(500);
  await ensureInitialized();

  try {
    const existingCampaign = await indexedDbService.get(STORES.CAMPAIGNS, id);
    if (!existingCampaign) return null;

    const updatedCampaign: Campaign = {
      ...existingCampaign,
      ...data,
      lastUpdated: new Date(),
    };

    // Recalculate progress if goal or raised amount changed
    if (data.goal || data.raised !== undefined) {
      updatedCampaign.progress = Math.round(
        (updatedCampaign.raised / updatedCampaign.goal) * 100,
      );
    }

    // Update days left if end date changed
    if (data.endDate) {
      updatedCampaign.daysLeft = calculateDaysLeft(data.endDate);
    }

    await indexedDbService.put(STORES.CAMPAIGNS, updatedCampaign);
    return updatedCampaign;
  } catch (error) {
    console.error("Error updating campaign:", error);
    throw new DatabaseError("Failed to update campaign");
  }
};

export const deleteCampaign = async (id: string): Promise<boolean> => {
  await delay(500);
  await ensureInitialized();

  try {
    const existingCampaign = await indexedDbService.get(STORES.CAMPAIGNS, id);
    if (!existingCampaign) return false;

    await indexedDbService.delete(STORES.CAMPAIGNS, id);
    return true;
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw new DatabaseError("Failed to delete campaign");
  }
};

export const getCampaignStats = async (
  clientId?: string,
): Promise<CampaignStats> => {
  await delay(300);
  await ensureInitialized();

  try {
    const campaigns = clientId
      ? await getCampaignsByClient(clientId)
      : await getAllCampaigns();

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
      ...(clientId && {
        clientCampaigns: campaigns.length,
        clientActiveCount: activeCampaigns.length,
        clientTotalRaised: totalRaised,
      }),
    };
  } catch (error) {
    console.error("Error getting campaign stats:", error);
    throw new DatabaseError("Failed to retrieve campaign statistics");
  }
};

export const searchCampaigns = async (
  query: string,
  clientId?: string,
): Promise<Campaign[]> => {
  await delay(300);
  await ensureInitialized();

  try {
    const campaigns = clientId
      ? await getCampaignsByClient(clientId)
      : await getAllCampaigns();

    const lowercaseQuery = query.toLowerCase();
    return campaigns.filter(
      (campaign) =>
        campaign.name.toLowerCase().includes(lowercaseQuery) ||
        campaign.description?.toLowerCase().includes(lowercaseQuery) ||
        campaign.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
    );
  } catch (error) {
    console.error("Error searching campaigns:", error);
    throw new DatabaseError("Failed to search campaigns");
  }
};

export const getCampaignsByStatus = async (
  status: Campaign["status"],
  clientId?: string,
): Promise<Campaign[]> => {
  await delay(300);
  await ensureInitialized();

  try {
    const campaigns = clientId
      ? await getCampaignsByClient(clientId)
      : await getAllCampaigns();

    return campaigns.filter((campaign) => campaign.status === status);
  } catch (error) {
    console.error("Error getting campaigns by status:", error);
    throw new DatabaseError("Failed to retrieve campaigns by status");
  }
};

// Migration helper: add clientId to existing campaigns
export const migrateCampaignsToClient = async (
  defaultClientId: string,
): Promise<void> => {
  await delay(200);
  await ensureInitialized();

  try {
    const campaigns = await indexedDbService.getAll(STORES.CAMPAIGNS);
    const migratedCampaigns: Campaign[] = [];

    for (const campaign of campaigns) {
      if (!campaign.clientId) {
        migratedCampaigns.push({
          ...campaign,
          clientId: defaultClientId,
          lastUpdated: new Date(),
        });
      }
    }

    if (migratedCampaigns.length > 0) {
      await indexedDbService.putMany(STORES.CAMPAIGNS, migratedCampaigns);
    }
  } catch (error) {
    console.error("Error migrating campaigns:", error);
    throw new DatabaseError("Failed to migrate campaigns");
  }
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

export const campaignService = new CampaignService();
export default campaignService;
