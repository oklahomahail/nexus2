import { Campaign } from "../models/campaign";

export interface CampaignCardProps {
  id: string;
  title: string;
  subtitle: string;
  progressPercent: number;
  daysLeft: number;
  status: Campaign["status"];
  category: Campaign["category"];
  highlight?: boolean;
}

export function toCampaignCard(_campaign: Campaign): CampaignCardProps {
  const now = new Date();
  const end = new Date(campaign.endDate);
  const _start = new Date(campaign.startDate);
  const progressPercent = Math.min(
    100,
    Math.round((campaign.raised / campaign.goal) * 100),
  );
  const daysLeft = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return {
    id: campaign.id,
    title: campaign.name,
    subtitle: campaign.description ?? "",
    progressPercent,
    daysLeft,
    status: campaign.status,
    category: campaign.category,
    highlight: progressPercent >= 90,
  };
}
