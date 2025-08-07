// src/context/useUI.ts
import { useAppContext } from './AppProviders';

export const useUI = () => {
  const { state, dispatch } = useAppContext();

  return {
    activeView: state.ui.activeView,
    loading: state.ui.loading,
    error: state.ui.error,
    sidebarCollapsed: state.ui.sidebarCollapsed,
    isSidebarOpen: state.ui.isSidebarOpen,
    showNotifications: state.ui.showNotifications,

    setActiveView: (view: string) =>
      dispatch({ type: 'SET_ACTIVE_VIEW', payload: view }),

    setLoading: (loading: boolean) =>
      dispatch({ type: 'SET_LOADING', payload: loading }),

    setError: (error: string | null) =>
      dispatch({ type: 'SET_ERROR', payload: error }),

    toggleSidebar: () =>
      dispatch({ type: 'TOGGLE_SIDEBAR' }),

    toggleNotifications: () =>
      dispatch({ type: 'TOGGLE_NOTIFICATIONS' }),
  };
};
