import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Campaign } from '../models/campaign';
import { Donor } from '../models/donor';
import { OrganizationAnalytics, DonorInsights } from '../models/analytics';
import { campaignService } from '../services/campaignService';
import { analyticsService } from '../services/analyticsService';

// State Types
interface AppState {
  // User & Organization
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    organizationName: string | null;
    role: 'admin' | 'manager' | 'viewer' | null;
  };
  
  // Data
  campaigns: Campaign[];
  donors: Donor[];
  analytics: {
    organization: OrganizationAnalytics | null;
    donorInsights: DonorInsights | null;
    lastUpdated: Date | null;
  };
  
  // UI State
  ui: {
    loading: boolean;
    error: string | null;
    activeView: 'dashboard' | 'campaigns' | 'donors' | 'analytics' | 'messaging';
    sidebarCollapsed: boolean;
    notifications: Notification[];
  };
  
  // Filters & Preferences
  filters: {
    campaigns: {
      status?: string[];
      category?: string[];
      dateRange?: { start: string; end: string };
      search?: string;
    };
    donors: {
      segment?: string[];
      giftRange?: { min: number; max: number };
      lastGiftDate?: { start: string; end: string };
    };
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Action Types
type AppAction =
  // User Actions
  | { type: 'SET_USER'; payload: AppState['user'] }
  | { type: 'LOGOUT' }
  
  // Data Actions
  | { type: 'SET_CAMPAIGNS'; payload: Campaign[] }
  | { type: 'ADD_CAMPAIGN'; payload: Campaign }
  | { type: 'UPDATE_CAMPAIGN'; payload: Campaign }
  | { type: 'DELETE_CAMPAIGN'; payload: string }
  | { type: 'SET_DONORS'; payload: Donor[] }
  | { type: 'SET_ANALYTICS'; payload: { organization?: OrganizationAnalytics; donorInsights?: DonorInsights } }
  
  // UI Actions
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_VIEW'; payload: AppState['ui']['activeView'] }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  
  // Filter Actions
  | { type: 'SET_CAMPAIGN_FILTERS'; payload: AppState['filters']['campaigns'] }
  | { type: 'SET_DONOR_FILTERS'; payload: AppState['filters']['donors'] }
  | { type: 'CLEAR_FILTERS' };

// Initial State
const initialState: AppState = {
  user: {
    id: null,
    name: null,
    email: null,
    organizationName: null,
    role: null
  },
  campaigns: [],
  donors: [],
  analytics: {
    organization: null,
    donorInsights: null,
    lastUpdated: null
  },
  ui: {
    loading: false,
    error: null,
    activeView: 'dashboard',
    sidebarCollapsed: false,
    notifications: []
  },
  filters: {
    campaigns: {},
    donors: {}
  }
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // User Actions
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'LOGOUT':
      return { ...initialState };
    
    // Data Actions
    case 'SET_CAMPAIGNS':
      return { ...state, campaigns: action.payload };
    
    case 'ADD_CAMPAIGN':
      return { ...state, campaigns: [...state.campaigns, action.payload] };
    
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map(c => 
          c.id === action.payload.id ? action.payload : c
        )
      };
    
    case 'DELETE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.filter(c => c.id !== action.payload)
      };
    
    case 'SET_DONORS':
      return { ...state, donors: action.payload };
    
    case 'SET_ANALYTICS':
      return {
        ...state,
        analytics: {
          ...state.analytics,
          ...action.payload,
          lastUpdated: new Date()
        }
      };
    
    // UI Actions
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, loading: action.payload } };
    
    case 'SET_ERROR':
      return { ...state, ui: { ...state.ui, error: action.payload } };
    
    case 'SET_ACTIVE_VIEW':
      return { ...state, ui: { ...state.ui, activeView: action.payload } };
    
    case 'TOGGLE_SIDEBAR':
      return { 
        ...state, 
        ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed } 
      };
    
    case 'ADD_NOTIFICATION':
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false
      };
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [newNotification, ...state.ui.notifications]
        }
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.map(n =>
            n.id === action.payload ? { ...n, read: true } : n
          )
        }
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        ui: { ...state.ui, notifications: [] }
      };
    
    // Filter Actions
    case 'SET_CAMPAIGN_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, campaigns: action.payload }
      };
    
    case 'SET_DONOR_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, donors: action.payload }
      };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: { campaigns: {}, donors: {} }
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: AppActions;
} | null>(null);

// Action Creators
interface AppActions {
  // User Actions
  setUser: (user: AppState['user']) => void;
  logout: () => void;
  
  // Data Actions
  loadCampaigns: () => Promise<void>;
  createCampaign: (campaign: any) => Promise<void>;
  updateCampaign: (campaign: any) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  loadDonors: () => Promise<void>;
  loadAnalytics: () => Promise<void>;
  
  // UI Actions
  setActiveView: (view: AppState['ui']['activeView']) => void;
  toggleSidebar: () => void;
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Filter Actions
  setCampaignFilters: (filters: AppState['filters']['campaigns']) => void;
  setDonorFilters: (filters: AppState['filters']['donors']) => void;
  clearFilters: () => void;
}

// Provider Component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data
  useEffect(() => {
    const initializeApp = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Set mock user for development
        dispatch({
          type: 'SET_USER',
          payload: {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah@nonprofit.org',
            organizationName: 'Hope Foundation',
            role: 'admin'
          }
        });

        // Load initial data
        await Promise.all([
          actions.loadCampaigns(),
          actions.loadDonors(),
          actions.loadAnalytics()
        ]);
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Failed to initialize app' 
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, []);

  // Action creators
  const actions: AppActions = {
    // User Actions
    setUser: (user) => dispatch({ type: 'SET_USER', payload: user }),
    logout: () => dispatch({ type: 'LOGOUT' }),
    
    // Data Actions
    loadCampaigns: async () => {
      try {
        const campaigns = await campaignService.getAllCampaigns(state.filters.campaigns);
        dispatch({ type: 'SET_CAMPAIGNS', payload: campaigns });
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Failed to load campaigns' 
        });
      }
    },

    createCampaign: async (campaignData) => {
      try {
        const newCampaign = await campaignService.createCampaign(campaignData);
        dispatch({ type: 'ADD_CAMPAIGN', payload: newCampaign });
        actions.showNotification({
          type: 'success',
          title: 'Campaign Created',
          message: `"${newCampaign.name}" has been created successfully.`
        });
      } catch (error) {
        throw error; // Re-throw to handle in component
      }
    },

    updateCampaign: async (campaignData) => {
      try {
        const updatedCampaign = await campaignService.updateCampaign(campaignData);
        dispatch({ type: 'UPDATE_CAMPAIGN', payload: updatedCampaign });
        actions.showNotification({
          type: 'success',
          title: 'Campaign Updated',
          message: `"${updatedCampaign.name}" has been updated successfully.`
        });
      } catch (error) {
        throw error;
      }
    },

    deleteCampaign: async (id) => {
      try {
        await campaignService.deleteCampaign(id);
        dispatch({ type: 'DELETE_CAMPAIGN', payload: id });
        actions.showNotification({
          type: 'success',
          title: 'Campaign Deleted',
          message: 'Campaign has been deleted successfully.'
        });
      } catch (error) {
        throw error;
      }
    },

    loadDonors: async () => {
      try {
        // Mock donor loading - replace with actual service
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
    },

    loadAnalytics: async () => {
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
    },
    
    // UI Actions
    setActiveView: (view) => dispatch({ type: 'SET_ACTIVE_VIEW', payload: view }),
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    showNotification: (notification) => dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    markNotificationRead: (id) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }),
    clearNotifications: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
    
    // Filter Actions
    setCampaignFilters: (filters) => dispatch({ type: 'SET_CAMPAIGN_FILTERS', payload: filters }),
    setDonorFilters: (filters) => dispatch({ type: 'SET_DONOR_FILTERS', payload: filters }),
    clearFilters: () => dispatch({ type: 'CLEAR_FILTERS' })
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook for using context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Selectors for common data access patterns
export const useSelector = <T>(selector: (state: AppState) => T): T => {
  const { state } = useAppContext();
  return selector(state);
};

// Common selectors
export const selectors = {
  // User selectors
  getCurrentUser: (state: AppState) => state.user,
  isAuthenticated: (state: AppState) => !!state.user.id,
  getUserRole: (state: AppState) => state.user.role,
  
  // Campaign selectors
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
  
  // Donor selectors
  getAllDonors: (state: AppState) => state.donors,
  getDonorCount: (state: AppState) => state.donors.length,
  getTotalDonated: (state: AppState) => 
    state.donors.reduce((sum, d) => sum + d.totalGiven, 0),
  
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
    state.ui.notifications.filter(n => !n.read).length,
  
  // Filter selectors
  getCampaignFilters: (state: AppState) => state.filters.campaigns,
  getDonorFilters: (state: AppState) => state.filters.donors,
  hasActiveFilters: (state: AppState) => 
    Object.keys(state.filters.campaigns).length > 0 || 
    Object.keys(state.filters.donors).length > 0
};

// Custom hooks for specific functionality
export const useCampaigns = () => {
  const { state, actions } = useAppContext();
  
  return {
    campaigns: state.campaigns,
    loading: state.ui.loading,
    error: state.ui.error,
    filters: state.filters.campaigns,
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

export const useDonors = () => {
  const { state, actions } = useAppContext();
  
  return {
    donors: state.donors,
    loading: state.ui.loading,
    error: state.ui.error,
    filters: state.filters.donors,
    totalCount: state.donors.length,
    totalDonated: selectors.getTotalDonated(state),
    actions: {
      load: actions.loadDonors,
      setFilters: actions.setDonorFilters
    }
  };
};

export const useAnalytics = () => {
  const { state, actions } = useAppContext();
  
  return {
    organization: state.analytics.organization,
    donorInsights: state.analytics.donorInsights,
    lastUpdated: state.analytics.lastUpdated,
    loading: state.ui.loading,
    error: state.ui.error,
    actions: {
      load: actions.loadAnalytics
    }
  };
};

export const useNotifications = () => {
  const { state, actions } = useAppContext();
  
  return {
    notifications: state.ui.notifications,
    unreadCount: selectors.getUnreadNotificationCount(state),
    actions: {
      show: actions.showNotification,
      markRead: actions.markNotificationRead,
      clear: actions.clearNotifications
    }
  };
};

export const useUI = () => {
  const { state, actions } = useAppContext();
  
  return {
    activeView: state.ui.activeView,
    loading: state.ui.loading,
    error: state.ui.error,
    sidebarCollapsed: state.ui.sidebarCollapsed,
    actions: {
      setActiveView: actions.setActiveView,
      toggleSidebar: actions.toggleSidebar,
      showNotification: actions.showNotification
    }
  };
};

export default AppContext;