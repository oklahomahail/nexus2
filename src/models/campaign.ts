// src/models/campaign.ts
export interface Campaign {
  theme: any;
  type: string;
  id: string;
  name: string;
  clientId: string;
  description?: string;
  goal: number;
  raised: number;
  progress: number;
  daysLeft: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Draft" | "Completed" | "Paused";
  category:
    | "General"
    | "Education"
    | "Healthcare"
    | "Environment"
    | "Emergency";
  targetAudience?: string;
  donorCount: number;
  averageGift: number;
  totalRevenue: number;
  totalDonors: number;
  roi: number;
  lastUpdated: Date;
  createdAt: Date;
  createdBy: string;
  tags: string[];
  emailsSent?: number;
  clickThroughRate?: number;
  conversionRate?: number;

  // Optional client-specific fields
  clientBrnoyeanding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
  notes?: string;
}

export interface CreateCampaignData {
  name: string;
  clientId: string; // NEW: Required for campaign creation
  description?: string;
  goal: number;
  startDate: string;
  endDate: string;
  category: Campaign["category"];
  targetAudience?: string;
  tags?: string[];
  notes?: string; //
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {
  status?: Campaign["status"];
  raised?: number;
  donorCount?: number;
  averageGift?: number;
  emailsSent?: number;
  clickThroughRate?: number;
  conversionRate?: number;
}
