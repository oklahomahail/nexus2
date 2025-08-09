// src/models/campaign.ts - Clean Campaign interface
import { DateRange } from "./analytics";

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  goal: number;
  raised: number;
  startDate: string;
  endDate: string;
  deadline?: string;
  status: "Planned" | "Active" | "Completed" | "Cancelled";
  category:
    | "General"
    | "Emergency"
    | "Education"
    | "Healthcare"
    | "Environment"
    | "Community"
    | "Other";
  targetAudience: string;
  donorCount: number;
  averageGift: number;
  lastUpdated: Date;
  createdAt: Date;
  emailsSent: number;
  clickThroughRate: number;
  conversionRate: number;
  // Additional properties used in components
  createdBy?: string;
  tags?: string[];
  notes?: string;
  // Computed/optional properties
  progress?: number;
  daysLeft?: number;
  totalRevenue?: number;
  totalDonors?: number;
  roi?: number;
}

export interface CampaignCreateRequest {
  name: string;
  description?: string;
  goal: number;
  startDate: string;
  endDate: string;
  status?: Campaign["status"];
  category: Campaign["category"];
  targetAudience: string;
  tags?: string[];
  notes?: string;
}

export interface CampaignUpdateRequest extends CampaignCreateRequest {
  id: string;
}

export interface CampaignFilters {
  status?: Campaign["status"][];
  category?: Campaign["category"][];
  dateRange?: DateRange;
  search?: string;
  tags?: string[];
}

export {};
