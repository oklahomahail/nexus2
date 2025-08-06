// src/hooks/selectors.ts
import { AppState, InternalCampaignFilters } from '../context/types';
import { CampaignFilters } from '../models/campaign';

// Helper function for conversion (moved from utils since it's specific to selectors)
const convertToCampaignFilters = (internal: InternalCampaignFilters): CampaignFilters => {
  const external: CampaignFilters = {};
  
  if (internal.status?.length) {
    external.status = internal.status as any[];
  }
  
  if (internal.category?.length) {
    external.category = internal.category as any[];
  }
  
  if (internal.dateRange) {
    external.dateRange = internal.dateRange;
  }
  
  if (internal.search) {
    external.search = internal.search;
  }
  
  if (internal.tags?.length) {
    external.tags = internal.tags;
  }
  
  return external;
};

export const selectors = {
  getCurrentUser: (state: AppState) => state.user,
  isAuthenticated: (state: AppState) => !!state.user.id,
  getUserRole: (state: AppState) => state.user.role,
  getAllCampaigns: (state: AppState) => state.campaigns,
  getActiveCampaigns: (state: AppState) => 
    state.campaigns.filter(c => c.status === 'Active'),
  getCampaignById: (id: string) => (state: AppState) => 
    state.campaigns.find(c => c.id === id),
  getCampaignStats: (state: AppState) => ({
    total: state.campaigns.length,
    active: state.campaigns.filter(c => c.status === 'Active').length,
    completed: state.campaigns.filter(c => c.status === 'Completed').length,
    totalRaised: state.campaigns.reduce((sum, c) => sum + c.raised, 0)
  }),
  getAllDonors: (state: AppState) => state.donors,
  getDonorCount: (state: AppState) => state.donors.length,
  getTotalDonated: (state: AppState) => 
    state.donors.reduce((sum, d) => sum + d.totalGiven, 0),
  getOrganizationAnalytics: (state: AppState) => state.analytics.organization,
  getDonorInsights: (state: AppState) => state.analytics.donorInsights,
  getAnalyticsLastUpdated: (state: AppState) => state.analytics.lastUpdated,
  getActiveView: (state: AppState) => state.ui.activeView,
  isLoading: (state: AppState) => state.ui.loading,
  getError: (state: AppState) => state.ui.error,
  isSidebarCollapsed: (state: AppState) => state.ui.sidebarCollapsed,
  getNotifications: (state: AppState) => state.ui.notifications,
  getUnreadNotificationCount: (state: AppState) => 
    state.ui.notifications.filter(n => !n.read).length,
  getCampaignFilters: (state: AppState) => convertToCampaignFilters(state.filters.campaigns),
  getDonorFilters: (state: AppState) => state.filters.donors,
  hasActiveFilters: (state: AppState) => 
    Object.keys(state.filters.campaigns).length > 0 || 
    Object.keys(state.filters.donors).length > 0
};