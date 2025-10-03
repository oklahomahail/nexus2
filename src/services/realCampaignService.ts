// src/services/realCampaignService.ts - Real backend campaign service

import type {
  Campaign,
  CreateCampaignData,
  UpdateCampaignData,
} from "@/models/campaign";
import { logger } from "@/utils/logger";

import { apiClient } from "./apiClient";

// API Response types to match backend
export interface ApiCampaign {
  id: string;
  name: string;
  description?: string;
  type: "FUNDRAISING" | "AWARENESS" | "EVENT" | "MEMBERSHIP";
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  startDate?: string;
  endDate?: string;
  goalAmount?: number;
  raisedAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
  };
  _count?: {
    donations: number;
  };
  donations?: Array<{
    id: string;
    amount: number;
    donatedAt: string;
    donor: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  analytics?: Array<{
    id: string;
    date: string;
    views: number;
    uniqueVisitors: number;
    conversions: number;
    donationCount: number;
    donationAmount: number;
  }>;
}

export interface CampaignListResponse {
  campaigns: ApiCampaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CampaignAnalyticsData {
  analytics: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
    conversions: number;
    donationCount: number;
    donationAmount: number;
  }>;
  donationStats: {
    totalAmount: number;
    totalDonations: number;
    averageDonation: number;
  };
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: number;
  successRate: number;
  clientCampaigns?: number;
  clientActiveCount?: number;
  clientTotalRaised?: number;
}

// Helper function to map API campaign to frontend model
function mapApiCampaignToFrontend(apiCampaign: ApiCampaign): Campaign {
  const progress =
    apiCampaign.goalAmount && apiCampaign.goalAmount > 0
      ? Math.round((apiCampaign.raisedAmount / apiCampaign.goalAmount) * 100)
      : 0;

  const calculateDaysLeft = (endDate?: string): number => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  // Map backend campaign type to frontend type
  const frontendType = (() => {
    switch (apiCampaign.type) {
      case "FUNDRAISING":
        return "annual";
      case "EVENT":
        return "event";
      case "AWARENESS":
        return "program";
      case "MEMBERSHIP":
        return "membership";
      default:
        return "annual";
    }
  })();

  // Map backend status to frontend status
  const frontendStatus = (() => {
    switch (apiCampaign.status) {
      case "ACTIVE":
        return "Active";
      case "DRAFT":
        return "Draft";
      case "PAUSED":
        return "Paused";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return "Draft";
    }
  })();

  return {
    id: apiCampaign.id,
    type: frontendType,
    clientId: apiCampaign.clientId,
    name: apiCampaign.name,
    description: apiCampaign.description || "",
    goal: apiCampaign.goalAmount || 0,
    raised: apiCampaign.raisedAmount,
    progress,
    daysLeft: calculateDaysLeft(apiCampaign.endDate),
    startDate: apiCampaign.startDate || new Date().toISOString().split("T")[0],
    endDate: apiCampaign.endDate || new Date().toISOString().split("T")[0],
    status: frontendStatus,
    category: "General", // Default category
    targetAudience: "General audience",
    donorCount: apiCampaign._count?.donations || 0,
    averageGift:
      apiCampaign._count?.donations && apiCampaign._count.donations > 0
        ? Math.round(apiCampaign.raisedAmount / apiCampaign._count.donations)
        : 0,
    totalRevenue: apiCampaign.raisedAmount,
    totalDonors: apiCampaign._count?.donations || 0,
    roi: 0, // Calculate if we have marketing cost data
    lastUpdated: new Date(apiCampaign.updatedAt),
    createdAt: new Date(apiCampaign.createdAt),
    createdBy: "User", // Use actual user data when available
    tags: [], // Add tags when backend supports them
    emailsSent: 0,
    clickThroughRate: 0,
    conversionRate: 0,
    marketingCost: 0,
    theme: null,
  };
}

// Helper function to map frontend campaign data to backend format
function mapFrontendToApiCampaign(
  data: CreateCampaignData | UpdateCampaignData,
) {
  const backendType = (() => {
    switch (data.type) {
      case "annual":
        return "FUNDRAISING";
      case "event":
        return "EVENT";
      case "program":
        return "AWARENESS";
      case "membership":
        return "MEMBERSHIP";
      default:
        return "FUNDRAISING";
    }
  })();

  return {
    name: data.name,
    description: data.description,
    type: backendType,
    startDate: data.startDate
      ? new Date(data.startDate).toISOString()
      : undefined,
    endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
    goalAmount: data.goal,
    clientId: data.clientId,
  };
}

// Campaign Service Implementation
export const getAllCampaigns = async (
  clientId?: string,
): Promise<Campaign[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (clientId) queryParams.append("clientId", clientId);

    const endpoint = `/campaigns${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await apiClient.get<{
      success: boolean;
      data: CampaignListResponse;
    }>(endpoint);

    if (!response.success || !response.data) {
      throw new Error("Failed to fetch campaigns");
    }

    return response.data.campaigns.map(mapApiCampaignToFrontend);
  } catch (error) {
    logger.error("Error getting campaigns:", error);
    throw error;
  }
};

export const getCampaignsByClient = async (
  clientId: string,
): Promise<Campaign[]> => {
  return getAllCampaigns(clientId);
};

export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: { campaign: ApiCampaign };
    }>(`/campaigns/${id}`);

    if (!response.success || !response.data?.campaign) {
      return null;
    }

    return mapApiCampaignToFrontend(response.data.campaign);
  } catch (error) {
    logger.error("Error getting campaign by ID:", error);
    if ((error as any)?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createCampaign = async (
  data: CreateCampaignData,
): Promise<Campaign> => {
  try {
    const apiData = mapFrontendToApiCampaign(data);
    const response = await apiClient.post<{
      success: boolean;
      data: { campaign: ApiCampaign };
    }>("/campaigns", apiData);

    if (!response.success || !response.data?.campaign) {
      throw new Error("Failed to create campaign");
    }

    logger.info("Campaign created successfully:", response.data.campaign.id);
    return mapApiCampaignToFrontend(response.data.campaign);
  } catch (error) {
    logger.error("Error creating campaign:", error);
    throw error;
  }
};

export const updateCampaign = async (
  id: string,
  data: UpdateCampaignData,
): Promise<Campaign | null> => {
  try {
    const apiData = mapFrontendToApiCampaign(data);
    const response = await apiClient.put<{
      success: boolean;
      data: { campaign: ApiCampaign };
    }>(`/campaigns/${id}`, apiData);

    if (!response.success || !response.data?.campaign) {
      return null;
    }

    logger.info("Campaign updated successfully:", id);
    return mapApiCampaignToFrontend(response.data.campaign);
  } catch (error) {
    logger.error("Error updating campaign:", error);
    if ((error as any)?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const deleteCampaign = async (id: string): Promise<boolean> => {
  try {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/campaigns/${id}`);

    if (response.success) {
      logger.info("Campaign deleted successfully:", id);
      return true;
    }
    return false;
  } catch (error) {
    logger.error("Error deleting campaign:", error);
    if ((error as any)?.status === 404) {
      return false;
    }
    throw error;
  }
};

export const getCampaignStats = async (
  clientId?: string,
): Promise<CampaignStats> => {
  try {
    const campaigns = await getAllCampaigns(clientId);

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
    logger.error("Error getting campaign stats:", error);
    throw error;
  }
};

export const searchCampaigns = async (
  query: string,
  clientId?: string,
): Promise<Campaign[]> => {
  try {
    const campaigns = await getAllCampaigns(clientId);
    const lowercaseQuery = query.toLowerCase();

    return campaigns.filter(
      (campaign) =>
        campaign.name.toLowerCase().includes(lowercaseQuery) ||
        campaign.description?.toLowerCase().includes(lowercaseQuery) ||
        campaign.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
    );
  } catch (error) {
    logger.error("Error searching campaigns:", error);
    throw error;
  }
};

export const getCampaignsByStatus = async (
  status: Campaign["status"],
  clientId?: string,
): Promise<Campaign[]> => {
  try {
    const campaigns = await getAllCampaigns(clientId);
    return campaigns.filter((campaign) => campaign.status === status);
  } catch (error) {
    logger.error("Error getting campaigns by status:", error);
    throw error;
  }
};

export const getCampaignAnalytics = async (
  campaignId: string,
): Promise<CampaignAnalyticsData> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: CampaignAnalyticsData;
    }>(`/campaigns/${campaignId}/analytics`);

    if (!response.success || !response.data) {
      throw new Error("Failed to fetch campaign analytics");
    }

    return response.data;
  } catch (error) {
    logger.error("Error getting campaign analytics:", error);
    throw error;
  }
};

// Migration helper - not needed for real backend but keeping for compatibility
export const migrateCampaignsToClient = async (
  _defaultClientId: string,
): Promise<void> => {
  // This is a no-op for the real backend since client scoping is handled server-side
  logger.debug("Migration not needed for real backend service");
};

// Legacy class export for backward compatibility
class RealCampaignService {
  getAllCampaigns = getAllCampaigns;
  getCampaignsByClient = getCampaignsByClient;
  getCampaignById = getCampaignById;
  createCampaign = createCampaign;
  updateCampaign = updateCampaign;
  deleteCampaign = deleteCampaign;
  getCampaignStats = getCampaignStats;
  searchCampaigns = searchCampaigns;
  getCampaignsByStatus = getCampaignsByStatus;
  getCampaignAnalytics = getCampaignAnalytics;
  migrateCampaignsToClient = migrateCampaignsToClient;
}

export const campaignService = new RealCampaignService();
export default campaignService;
