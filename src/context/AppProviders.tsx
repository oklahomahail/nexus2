// src/context/AppProviders.tsx

import React, { createContext, useReducer } from "react";

import { AnalyticsProvider } from "./analytics/AnalyticsContext";
import { appReducer, initialState } from "./appReducer";
import { NotificationsProvider } from "./notifications/NotificationsContext";

const AppContext = createContext<
  | {
      state: AppState;
      dispatch: React.Dispatch<AppAction>;
    }
  | undefined
>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <AnalyticsProvider>
        <NotificationsProvider>{children}</NotificationsProvider>
      </AnalyticsProvider>
    </AppContext.Provider>
  );
};

export {};

// Re-exports
export { useUI } from "./useUI";
export { useNotifications } from "./notifications/NotificationsContext";
export { AppProvider as AppProviders };
