// src/hooks/useDonors.ts
import { useAppContext } from './useAppContext';
import { selectors } from './selectors';

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
