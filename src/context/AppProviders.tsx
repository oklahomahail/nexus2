// src/context/AppProviders.tsx

import React, { createContext, useContext, useReducer } from 'react';
import { appReducer, initialState } from './appReducer';
import { AppState, AppAction } from './uiTypes';
import { NotificationsProvider } from './notifications/NotificationsContext';
import { AnalyticsProvider } from './analytics/AnalyticsContext';

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <AnalyticsProvider>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </AnalyticsProvider>
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// Re-exports
export { useUI } from './useUI';
export { useNotifications } from './notifications/NotificationsContext';
export { AppProvider as AppProviders };
