import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

import { appReducer, initialState } from './reducer';
import { AppContextType, ViewKey } from './types';
import { getInitialData } from './utils';
import { useCampaigns as useCampaignsHook } from '../hooks/useCampaigns';
import { useAnalytics as useAnalyticsHook } from '../hooks/useAnalytics';

// Create the main app context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    getInitialData(dispatch);
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
    actions: undefined
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to access full app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// Hook for UI state
export const useUI = () => {
  const { state, dispatch } = useAppContext();
  return {
    activeView: state.ui.activeView,
    sidebarCollapsed: state.ui.sidebarCollapsed,
    loading: state.ui.loading,
    error: state.ui.error,
    actions: {
      setActiveView: (view: ViewKey) => dispatch({ type: 'SET_ACTIVE_VIEW', payload: view }),
      toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
      setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    },
  };
};

// Hook for Notifications
export const useNotifications = () => {
  const { state, dispatch } = useAppContext();

  const toggle = useCallback(() => {
    dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
  }, [dispatch]);

  return {
    notifications: state.notifications.items,
    unreadCount: state.notifications.items.filter((n: { read: any; }) => !n.read).length,
    actions: {
      toggle,
      markRead: (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }),
      clear: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
    },
  };
};

// Re-exported hooks for unified access
export const useCampaigns = () => useCampaignsHook();
export const useAnalytics = () => useAnalyticsHook();
