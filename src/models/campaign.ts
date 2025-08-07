// src/models/campaign.ts - Clean types without React components
import { DateRange } from "./analytics";

export interface Campaign {
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
  
  // Fixed types - these should be numbers, not ReactNode/any
  progress: number; // Percentage (0-100)
  daysLeft: number; // Number of days
  totalRevenue: number; // Same as raised
  totalDonors: number; // Same as donorCount
  roi: number; // Return on investment percentage
}

// Helper function to calculate derived properties
export const calculateCampaignMetrics = (campaign: Partial<Campaign>) => {
  const progress = campaign.goal && campaign.raised ? 
    Math.round((campaign.raised / campaign.goal) * 100) : 0;
    
  const daysLeft = campaign.endDate ? 
    Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
    
  const totalRevenue = campaign.raised || 0;
  const totalDonors = campaign.donorCount || 0;
  
  // ROI calculation - you might want to adjust this based on your business logic
  const roi = campaign.goal ? Math.round((totalRevenue / campaign.goal) * 100) : 0;
  
  return {
    progress,
    daysLeft, 
    totalRevenue,
    totalDonors,
    roi
  };
};

// Keep existing interfaces unchanged
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
  status?: Campaign['status']; 
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
  dateRange?: DateRange;
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