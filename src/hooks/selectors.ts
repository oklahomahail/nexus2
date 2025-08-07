// src/hooks/selectors.ts
// Optional: Common selectors that can be used with useSelector hook
import { AppState, InternalCampaignFilters } from '../context/ui/uiTypes';
import { CampaignFilters } from '../models/campaign';

// Helper function for conversion
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

// Common selectors that can be used with useSelector
export const selectors = {
  // User selectors
  getCurrentUser: (state: AppState) => state.user,
  isAuthenticated: (state: AppState) => !!state.user.id,
  getUserRole: (state: AppState) => state.user.role,
  
  // Campaign selectors
  getAllCampaigns: (state: AppState) => state.campaigns,
  getActiveCampaigns: (state: AppState) => 
    state.campaigns.filter((c: { status: string; }) => c.status === 'Active'),
  getCampaignById: (id: string) => (state: AppState) => 
    state.campaigns.find((c: { id: string; }) => c.id === id),
  getCampaignStats: (state: AppState) => ({
    total: state.campaigns.length,
    active: state.campaigns.filter((c: { status: string; }) => c.status === 'Active').length,
    completed: state.campaigns.filter((c: { status: string; }) => c.status === 'Completed').length,
    totalRaised: state.campaigns.reduce((sum: any, c: { raised: any; }) => sum + c.raised, 0)
  }),
  
  // Donor selectors
  getAllDonors: (state: AppState) => state.donors,
  getDonorCount: (state: AppState) => state.donors.length,
  getTotalDonated: (state: AppState) => 
    state.donors.reduce((sum: any, d: { totalGiven: any; }) => sum + d.totalGiven, 0),
  
  // Analytics selectors
  getOrganizationAnalytics: (state: AppState) => state.analytics.organization,
  getDonorInsights: (state: AppState) => state.analytics.donorInsights,
  getAnalyticsLastUpdated: (state: AppState) => state.analytics.lastUpdated,
  
  // UI selectors
  getActiveView: (state: AppState) => state.ui.activeView,
  isLoading: (state: AppState) => state.ui.loading,
  getError: (state: AppState) => state.ui.error,
  isSidebarCollapsed: (state: AppState) => state.ui.sidebarCollapsed,
  getNotifications: (state: AppState) => state.ui.notifications,
  getUnreadNotificationCount: (state: AppState) => 
    state.ui.notifications.filter((n: { read: any; }) => !n.read).length,
  
  // Filter selectors
  getCampaignFilters: (state: AppState) => convertToCampaignFilters(state.filters.campaigns),
  getDonorFilters: (state: AppState) => state.filters.donors,
  hasActiveFilters: (state: AppState) => 
    Object.keys(state.filters.campaigns).length > 0 || 
    Object.keys(state.filters.donors).length > 0
};

// Example usage with useSelector:
// const campaigns = useSelector(selectors.getAllCampaigns);
// const isAuth = useSelector(selectors.isAuthenticated);
// const stats = useSelector(selectors.getCampaignStats);