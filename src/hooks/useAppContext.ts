// src/hooks/useAppContext.ts
import { useContext } from 'react';
import { AppContext } from '../context/ui/UIContext';
import { AppContextType } from '../context/ui/uiTypes';

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};