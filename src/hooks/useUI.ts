// src/hooks/useUI.ts

import { useContext } from 'react';
import { UIContext } from '../context/ui/UIContext';
import { UIContextType } from '../context/ui/uiTypes';

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }

  const {
    activeView,
    loading,
    error,
    setActiveView,
    setLoading,
    setError
  } = context;

  return {
    activeView,
    loading,
    error,
    setActiveView,
    setLoading,
    setError
  };
};
