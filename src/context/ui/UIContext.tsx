// src/context/ui/UIContext.tsx

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppContextType } from './uiTypes';

// ------------------------------------
// State & Action Types
// ------------------------------------

interface UIState {
  activeView: string;
  loading: boolean;
  error: string | null;
}

type UIAction =
  | { type: 'SET_ACTIVE_VIEW'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// ------------------------------------
// Initial State
// ------------------------------------

const initialState: UIState = {
  activeView: 'dashboard',
  loading: false,
  error: null,
};

// ------------------------------------
// Reducer
// ------------------------------------

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// ------------------------------------
// Context
// ------------------------------------

export const AppContext = createContext<AppContextType | undefined>(undefined);

// ------------------------------------
// Provider
// ------------------------------------

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const setActiveView = (view: string) => dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });

  const value: AppContextType = {
    ...state,
    setActiveView,
    setLoading,
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ------------------------------------
// Hook
// ------------------------------------

export const useUI = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};
