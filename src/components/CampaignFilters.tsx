// src/models/campaign.ts - Updated CampaignFilters interface

// Campaign status and category types
export type CampaignStatus = 'Planned' | 'Active' | 'Completed' | 'Cancelled';
export type CampaignCategory = 'General' | 'Emergency' | 'Education' | 'Healthcare' | 'Environment' | 'Community' | 'Other';

// Updated CampaignFilters interface
export interface CampaignFilters {
  status?: CampaignStatus[];
  category?: CampaignCategory[];
  dateRange?: { start: string; end: string };
  search?: string;
  tags?: string[];
}

// Make sure your Campaign interface also uses these types
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  goal: number;
  raised: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;  // Use the strict type here
  category: CampaignCategory;  // Use the strict type here
  targetAudience?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  lastUpdated: string;
  createdBy?: string;
  donorCount: number;
  averageGift: number;
  emailsSent?: number;
  clickThroughRate?: number;
  conversionRate?: number;
}

// Create and Update request types
export interface CampaignCreateRequest {
  name: string;
  description?: string;
  goal: number;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active';  // Only allow these for new campaigns
  category: CampaignCategory;
  targetAudience?: string;
  tags?: string[];
  notes?: string;
}

export interface CampaignUpdateRequest {
  id: string;
  name: string;
  description?: string;
  goal: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;  // Allow all statuses for updates
  category: CampaignCategory;
  targetAudience?: string;
  tags?: string[];
  notes?: string;
}