// src/utils/campaignUtils.ts - Helper functions for Campaign objects
import { Campaign, calculateCampaignMetrics } from '@/models/campaign';

/**
 * Create a complete Campaign object with calculated fields
 */
export const createCampaignWithMetrics = (baseCampaign: Omit<Campaign, 'progress' | 'daysLeft' | 'totalRevenue' | 'totalDonors' | 'roi'>): Campaign => {
  const metrics = calculateCampaignMetrics(baseCampaign);
  
  return {
    ...baseCampaign,
    ...metrics
  };
};

/**
 * Update a campaign with recalculated metrics
 */
export const updateCampaignMetrics = (campaign: Campaign): Campaign => {
  const metrics = calculateCampaignMetrics(campaign);
  
  return {
    ...campaign,
    ...metrics
  };
};

/**
 * Mock campaign data for testing - replace with real data
 */
export const createMockCampaign = (): Campaign => {
  const baseCampaign = {
    id: 'campaign_1',
    name: 'End of Year Giving Campaign',
    description: 'Annual fundraising campaign to support our programs and expand our impact in the community',
    goal: 50000,
    raised: 15000,
    startDate: '2024-11-01',
    endDate: '2024-12-31',
    status: 'Active' as const,
    category: 'General' as const,
    targetAudience: 'Individual donors, families, and local businesses',
    donorCount: 125,
    averageGift: 120,
    lastUpdated: new Date(),
    createdAt: new Date('2024-10-15'),
    createdBy: 'Dave Hail',
    tags: ['year-end', 'annual', 'general-fund'],
    notes: 'Focus on impact stories and donor stewardship',
    emailsSent: 450,
    clickThroughRate: 12.5,
    conversionRate: 8.2,
  };

  return createCampaignWithMetrics(baseCampaign);
};

/**
 * Format campaign data for display
 */
export const formatCampaignSummary = (campaign: Campaign) => ({
  name: campaign.name,
  goalFormatted: `$${campaign.goal.toLocaleString()}`,
  raisedFormatted: `$${campaign.raised.toLocaleString()}`,
  progressText: `${campaign.progress}% complete`,
  daysLeftText: `${campaign.daysLeft || 0} days remaining`,
  donorText: `${campaign.donorCount} donors`,
  averageGiftText: `$${campaign.averageGift} avg gift`,
  status: campaign.status,
  category: campaign.category,
});

/**
 * Determine campaign urgency level
 */
export const getCampaignUrgency = (campaign: Campaign): 'low' | 'medium' | 'high' | 'critical' => {
  if (campaign.status !== 'Active') return 'low';
  
  if (campaign.daysLeft || 0 <= 3) return 'critical';
  if (campaign.daysLeft || 0 <= 7) return 'high';
  if (campaign.daysLeft || 0 <= 30) return 'medium';
  return 'low';
};

/**
 * Get campaign status color for UI
 */
export const getCampaignStatusColor = (campaign: Campaign) => {
  switch (campaign.status) {
    case 'Active': return 'green';
    case 'Planned': return 'blue';
    case 'Completed': return 'gray';
    case 'Cancelled': return 'red';
    default: return 'gray';
  }
};

/**
 * Get progress bar color based on progress
 */
export const getProgressColor = (progress: number) => {
  if (progress >= 90) return 'green';
  if (progress >= 75) return 'blue';
  if (progress >= 50) return 'yellow';
  if (progress >= 25) return 'orange';
  return 'red';
};
