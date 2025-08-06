// src/context/actions.ts
import { useCallback } from 'react';
import { Campaign, CampaignFilters } from '../models/campaign';
import { Donor } from '../models/donor';
import { campaignService } from '../services/campaignService';
import { analyticsService } from '../services/analyticsService';
import { AppState, AppAction, AppActions, InternalCampaignFilters } from './types';

// Helper functions for type conversion
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

const convertFromCampaignFilters = (external: CampaignFilters): InternalCampaignFilters => {
  const internal: InternalCampaignFilters = {};
  
  if (external.status?.length) {
    internal.status = external.status.map(s => String(s));
  }
  
  if (external.category?.length) {
    internal.category = external.category.map(c => String(c));
  }
  
  if (external.dateRange) {
    internal.dateRange = external.dateRange;
  }
  
  if (external.search) {
    internal.search = external.search;
  }
  
  if (external.tags?.length) {
    internal.tags = external.tags;
  }
  
  return internal;
};

// Actions factory function
export const createActions = (
  state: AppState, 
  dispatch: React.Dispatch<AppAction>
): AppActions => ({
  // User Actions
  setUser: useCallback((user) => dispatch({ type: 'SET_USER', payload: user }), [dispatch]),
  logout: useCallback(() => dispatch({ type: 'LOGOUT' }), [dispatch]),
  
  // Data Actions
  loadCampaigns: useCallback(async () => {
    try {
      const externalFilters = convertToCampaignFilters(state.filters.campaigns);
      const campaigns = await campaignService.getAllCampaigns(externalFilters);
      dispatch({ type: 'SET_CAMPAIGNS', payload: campaigns });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load campaigns' 
      });
    }
  }, [state.filters.campaigns, dispatch]),

  createCampaign: useCallback(async (campaignData) => {
    try {
      const newCampaign = await campaignService.createCampaign(campaignData);
      dispatch({ type: 'ADD_CAMPAIGN', payload: newCampaign });
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: {
          type: 'success',
          title: 'Campaign Created',
          message: `"${newCampaign.name}" has been created successfully.`
        }
      });
    } catch (error) {
      throw error;
    }
  }, [dispatch]),

  updateCampaign: useCallback(async (campaignData) => {
    try {
      const updatedCampaign = await campaignService.updateCampaign(campaignData);
      dispatch({ type: 'UPDATE_CAMPAIGN', payload: updatedCampaign });
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: {
          type: 'success',
          title: 'Campaign Updated',
          message: `"${updatedCampaign.name}" has been updated successfully.`
        }
      });
    } catch (error) {
      throw error;
    }
  }, [dispatch]),

  deleteCampaign: useCallback(async (id) => {
    try {
      await campaignService.deleteCampaign(id);
      dispatch({ type: 'DELETE_CAMPAIGN', payload: id });
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: {
          type: 'success',
          title: 'Campaign Deleted',
          message: 'Campaign has been deleted successfully.'
        }
      });
    } catch (error) {
      throw error;
    }
  }, [dispatch]),

  loadDonors: useCallback(async () => {
    try {
      const mockDonors: Donor[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john@example.com',
          totalGiven: 2500,
          lastGiftDate: new Date('2024-07-15')
        }
      ];
      dispatch({ type: 'SET_DONORS', payload: mockDonors });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load donors' 
      });
    }
  }, [dispatch]),

  loadAnalytics: useCallback(async () => {
    try {
      const [orgAnalytics, donorInsights] = await Promise.all([
        analyticsService.getOrganizationAnalytics(),
        analyticsService.getDonorInsights()
      ]);
      dispatch({ 
        type: 'SET_ANALYTICS', 
        payload: { organization: orgAnalytics, donorInsights } 
      });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load analytics' 
      });
    }
  }, [dispatch]),
  
  // UI Actions
  setActiveView: useCallback((view) => dispatch({ type: 'SET_ACTIVE_VIEW', payload: view }), [dispatch]),
  toggleSidebar: useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), [dispatch]),
  showNotification: useCallback((notification) => dispatch({ type: 'ADD_NOTIFICATION', payload: notification }), [dispatch]),
  markNotificationRead: useCallback((id) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }), [dispatch]),
  clearNotifications: useCallback(() => dispatch({ type: 'CLEAR_NOTIFICATIONS' }), [dispatch]),
  
  // Filter Actions
  setCampaignFilters: useCallback((filters: CampaignFilters) => {
    const internalFilters = convertFromCampaignFilters(filters);
    dispatch({ type: 'SET_CAMPAIGN_FILTERS', payload: internalFilters });
  }, [dispatch]),
  setDonorFilters: useCallback((filters) => dispatch({ type: 'SET_DONOR_FILTERS', payload: filters }), [dispatch]),
  clearFilters: useCallback(() => dispatch({ type: 'CLEAR_FILTERS' }), [dispatch])
});