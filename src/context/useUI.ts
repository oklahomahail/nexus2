// src/context/useUI.ts - Updated to include setActiveView
import { useCallback } from 'react';
import { useAppContext } from './AppProviders';

export const useUI = () => {
  const { state, dispatch } = useAppContext();

  const setActiveView = useCallback((view: string) => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  }, [dispatch]);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, [dispatch]);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, [dispatch]);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, [dispatch]);

  const toggleNotifications = useCallback(() => {
    dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
  }, [dispatch]);

  return {
    // State
    activeView: state.ui.activeView,
    loading: state.ui.loading,
    error: state.ui.error,
    sidebarCollapsed: state.ui.sidebarCollapsed,
    isSidebarOpen: state.ui.isSidebarOpen,
    showNotifications: state.ui.showNotifications,

    // Actions
    setActiveView,
    setLoading,
    setError,
    toggleSidebar,
    toggleNotifications,
  };
};