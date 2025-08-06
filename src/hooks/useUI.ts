// src/hooks/useUI.ts
import { useAppContext } from './useAppContext';

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
