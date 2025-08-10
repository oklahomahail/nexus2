import { Campaign } from "../models/campaign";

export interface CampaignView {
  id: string;
  title: string;
  subtitle: string;
  progressPercentage: number;
  daysRemaining: number;
  status: string;
  category: string;
}

// Convert Campaign data to view format
export function toCampaignView(campaign: Campaign): CampaignView {
  const end = new Date(campaign.endDate);
  const _start = new Date(campaign.startDate);
  const now = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const progressPercentage = Math.min(
    100,
    Math.round((campaign.raised / campaign.goal) * 100),
  );

  return {
    id: campaign.id,
    title: campaign.name,
    subtitle: campaign.description ?? "",
    progressPercentage,
    daysRemaining,
    status: campaign.status,
    category: campaign.category,
  };
}
