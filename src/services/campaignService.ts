// src/services/campaignService.ts
import { Campaign } from "../models/campaign";

// Define CampaignStats interface here since it's not exported from models
export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: string;
  successRate: string;
}

// Mock data for development - using 'any' to avoid type conflicts
const mockCampaigns: any[] = [
  {
    id: "1",
    name: "Annual Fundraiser 2024",
    description: "Our biggest fundraising event of the year",
    goal: 100000,
    raised: 75000,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "Active",
    category: "General",
  },
  {
    id: "2",
    name: "Emergency Relief Fund",
    description: "Supporting families in crisis",
    goal: 50000,
    raised: 32000,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    status: "Active",
    category: "Emergency",
  },
];

export async function getAllCampaigns(filters?: any): Promise<Campaign[]> {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real app, this would be:
    // const response = await fetch('/api/campaigns', {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' }
    // });
    // return await response.json();

    // For now, return mock data
    return mockCampaigns;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw new Error("Failed to fetch campaigns");
  }
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // In a real app:
    // const response = await fetch(`/api/campaigns/${id}`);
    // if (!response.ok) return null;
    // return await response.json();

    return mockCampaigns.find((campaign) => campaign.id === id) || null;
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return null;
  }
}

export async function createCampaign(
  campaignData: Partial<Campaign>,
): Promise<Campaign> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // In a real app:
    // const response = await fetch('/api/campaigns', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(campaignData)
    // });
    // return await response.json();

    const newCampaign: any = {
      id: Date.now().toString(),
      name: campaignData.name || "New Campaign",
      description: campaignData.description || "",
      goal: campaignData.goal || 0,
      raised: 0,
      startDate:
        campaignData.startDate || new Date().toISOString().split("T")[0],
      endDate: campaignData.endDate || new Date().toISOString().split("T")[0],
      status: "Active",
      category: campaignData.category || "General",
    };

    mockCampaigns.push(newCampaign);
    return newCampaign as Campaign;
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw new Error("Failed to create campaign");
  }
}

export async function updateCampaign(
  id: string,
  updates: Partial<Campaign>,
): Promise<Campaign> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 600));

    // In a real app:
    // const response = await fetch(`/api/campaigns/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updates)
    // });
    // return await response.json();

    const campaignIndex = mockCampaigns.findIndex((c) => c.id === id);
    if (campaignIndex === -1) {
      throw new Error("Campaign not found");
    }

    mockCampaigns[campaignIndex] = {
      ...mockCampaigns[campaignIndex],
      ...updates,
    };
    return mockCampaigns[campaignIndex];
  } catch (error) {
    console.error("Error updating campaign:", error);
    throw new Error("Failed to update campaign");
  }
}

export async function deleteCampaign(id: string): Promise<void> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 400));

    // In a real app:
    // await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });

    const campaignIndex = mockCampaigns.findIndex((c) => c.id === id);
    if (campaignIndex !== -1) {
      mockCampaigns.splice(campaignIndex, 1);
    }
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw new Error("Failed to delete campaign");
  }
}

export async function getCampaignStats(): Promise<CampaignStats> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 400));

    // In a real app:
    // const response = await fetch('/api/campaigns/stats');
    // return await response.json();

    const totalCampaigns = mockCampaigns.length;
    const activeCampaigns = mockCampaigns.filter(
      (c) => c.status === "Active",
    ).length;
    const totalRaised = mockCampaigns.reduce((sum, c) => sum + c.raised, 0);
    const successfulCampaigns = mockCampaigns.filter(
      (c) => c.raised >= c.goal,
    ).length;
    const successRate =
      totalCampaigns > 0
        ? ((successfulCampaigns / totalCampaigns) * 100).toFixed(1)
        : "0";

    return {
      totalCampaigns,
      activeCampaigns,
      totalRaised: `$${totalRaised.toLocaleString()}`,
      successRate: `${successRate}%`,
    };
  } catch (error) {
    console.error("Error fetching campaign stats:", error);
    throw new Error("Failed to fetch campaign stats");
  }
}
