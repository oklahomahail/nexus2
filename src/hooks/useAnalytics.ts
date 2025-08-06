// src/hooks/useAnalytics.ts
import { useAppContext } from './useAppContext';
import { selectors } from './selectors';

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
