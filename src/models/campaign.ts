import { ReactNode } from "react";

export interface Campaign {
  progress: ReactNode;
  id: string;
  name: string;
  description?: string;
  goal: number;
  raised: number;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed' | 'Cancelled';
  category: 'General' | 'Emergency' | 'Education' | 'Healthcare' | 'Environment' | 'Community' | 'Other';
  targetAudience?: string;
  donorCount: number;
  averageGift: number;
  lastUpdated: Date;
  createdAt: Date;
  createdBy?: string;
  tags?: string[];
  notes?: string;
  emailsSent?: number;
  clickThroughRate?: number;
  conversionRate?: number;
}

export interface CampaignCreateRequest {
  name: string;
  description?: string;
  goal: number;
  startDate: string;
  endDate: string;
  status?: 'Planned' | 'Active';
  category: Campaign['category'];
  targetAudience?: string;
  tags?: string[];
  notes?: string;
}

export interface CampaignUpdateRequest {
  id: string;
  name?: string;
  description?: string;
  goal?: number;
  startDate?: string;
  endDate?: string;
  status?: Campaign['status']; // Allow all status types for updates
  category?: Campaign['category'];
  targetAudience?: string;
  tags?: string[];
  notes?: string;
  raised?: number;
  donorCount?: number;
  averageGift?: number;
  emailsSent?: number;
  clickThroughRate?: number;
  conversionRate?: number;
}

export interface CampaignFilters {
  status?: Campaign['status'][];
  category?: Campaign['category'][];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  tags?: string[];
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalRaised: number;
  averageGoal: number;
  successRate: number;
  totalDonors: number;
}