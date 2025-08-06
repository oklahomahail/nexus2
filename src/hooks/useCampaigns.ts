// src/hooks/useCampaigns.ts
import { useAppContext } from './useAppContext';
import { selectors } from './selectors';
import { AppState, InternalCampaignFilters } from '../context/types';
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

export const useCampaigns = () => {
  const { state, actions } = useAppContext();
  
  return {
    campaigns: state.campaigns,
    loading: state.ui.loading,
    error: state.ui.error,
    filters: convertToCampaignFilters(state.filters.campaigns),
    stats: selectors.getCampaignStats(state),
    actions: {
      load: actions.loadCampaigns,
      create: actions.createCampaign,
      update: actions.updateCampaign,
      delete: actions.deleteCampaign,
      setFilters: actions.setCampaignFilters
    }
  };
};