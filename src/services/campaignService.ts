// src/services/campaignService.ts
import { apiClient } from "./apiClient";
import { Campaign } from "../models/campaign";

// Define CampaignStats interface here since it's not exported from models
export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: string;
  successRate: string;
}

const BASE_PATH = "/campaigns";

export async function getAllCampaigns(
  filters: Record<string, unknown> = {},
): Promise<Campaign[]> {
  const params = new URLSearchParams(filters as Record<string, string>);
  const endpoint = `${BASE_PATH}${params.toString() ? `?${params.toString()}` : ""}`;
  return apiClient.get<Campaign[]>(endpoint);
}

export function getCampaignById(id: string): Promise<Campaign> {
  return apiClient.get<Campaign>(`${BASE_PATH}/${id}`);
}

export function createCampaign(
  campaignData: Partial<Campaign>,
): Promise<Campaign> {
  return apiClient.post<Campaign>(BASE_PATH, campaignData);
}

export function updateCampaign(
  id: string,
  updates: Partial<Campaign>,
): Promise<Campaign> {
  return apiClient.put<Campaign>(`${BASE_PATH}/${id}`, updates);
}

export function deleteCampaign(id: string): Promise<void> {
  return apiClient.delete<void>(`${BASE_PATH}/${id}`);
}

export function getCampaignStats(): Promise<CampaignStats> {
  return apiClient.get<CampaignStats>(`${BASE_PATH}/stats`);
}
