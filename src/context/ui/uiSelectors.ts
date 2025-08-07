// src/hooks/selectors.ts

import { AppState, InternalCampaignFilters } from './ui/uiTypes';
import { CampaignFilters } from '../models/campaign';

// Allowable enums
const allowedStatuses = ['Planned', 'Active', 'Completed', 'Cancelled'] as const;
type AllowedStatus = (typeof allowedStatuses)[number];

const allowedCategories = [
  'General',
  'Emergency',
  'Education',
  'Healthcare',
  'Environment',
  'Community',
  'Other',
] as const;
type AllowedCategory = (typeof allowedCategories)[number];

// Type-safe filter functions
const filterAllowedStatuses = (statuses: string[]): AllowedStatus[] => {
  return statuses.filter((s): s is AllowedStatus => allowedStatuses.includes(s as AllowedStatus));
};

const filterAllowedCategories = (categories: string[]): AllowedCategory[] => {
  return categories.filter((c): c is AllowedCategory =>
    allowedCategories.includes(c as AllowedCategory)
  );
};

// Convert internal filters to campaign filters
const convertToCampaignFilters = (internal: InternalCampaignFilters): CampaignFilters => {
  const external: CampaignFilters = {};

  if (internal.status?.length) {
    external.status = filterAllowedStatuses(internal.status);
  }

  if (internal.category?.length) {
    external.category = filterAllowedCategories(internal.category);
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

// State selectors
export const selectors = {
  getCurrentUser: (state: AppState) => state.user,
  isAuthenticated: (state: AppState) => !!state.user?.id,
  getUserRole: (state: AppState) => state.user?.role,
  getAllCampaigns: (state: AppState) => state.campaigns,
  getActiveCampaigns: (state: AppState) =>
    state.campaigns?.filter((c: { status: string }) => c.status === 'Active') ?? [],
  getCampaignById: (id: string) => (state: AppState) =>
    state.campaigns?.find((c: { id: string }) => c.id === id),
  getCampaignStats: (state: AppState) => {
    const campaigns = state.campaigns ?? [];
    return {
      total: campaigns.length,
      active: campaigns.filter((c: { status: string }) => c.status === 'Active').length,
      completed: campaigns.filter((c: { status: string }) => c.status === 'Completed').length,
      totalRaised: campaigns.reduce((sum: number, c: { raised: number }) => sum + c.raised, 0),
    };
  },
  getAllDonors: (state: AppState) => state.donors ?? [],
  getDonorCount: (state: AppState) => (state.donors ?? []).length,
  getTotalDonated: (state: AppState) =>
    (state.donors ?? []).reduce((sum: number, d: { totalGiven: number }) => sum + d.totalGiven, 0),
  getOrganizationAnalytics: (state: AppState) => state.analytics?.organization,
  getDonorInsights: (state: AppState) => state.analytics?.donorInsights,
  getAnalyticsLastUpdated: (state: AppState) => state.analytics?.lastUpdated,
  getActiveView: (state: AppState) => state.ui.activeView,
  isLoading: (state: AppState) => state.ui.loading,
  getError: (state: AppState) => state.ui.error,
  isSidebarCollapsed: (state: AppState) => state.ui.sidebarCollapsed,
  getNotifications: (state: AppState) => state.notifications.items,
  getUnreadNotificationCount: (state: AppState) =>
    state.notifications.items.filter((n) => !n.read).length,
  getCampaignFilters: (state: AppState) => convertToCampaignFilters(state.filters.campaigns),
  getDonorFilters: (state: AppState) => state.filters.donors,
  hasActiveFilters: (state: AppState) =>
    Object.values(state.filters.campaigns).some((v) => !!v) ||
    Object.values(state.filters.donors).some((v) => !!v),
};
