import React, { createContext, useContext, useReducer, ReactNode } from "react";

import { AnalyticsProvider } from "./analytics/AnalyticsContext";
import {
  appReducer,
  initialUIState,
  AppUIState,
  AppUIAction,
} from "./appReducer"; // Changed AppAction to AppUIAction
import { AuthProvider } from "./AuthContext";

// Define the app context type
interface AppContextType {
  state: AppUIState;
  dispatch: React.Dispatch<AppUIAction>; // Changed AppAction to AppUIAction
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// Main app provider that combines all providers
export const AppProviders: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialUIState); // Changed from initialState

  const value: AppContextType = {
    state,
    dispatch,
  };

  return (
    <AuthProvider>
      <AppContext.Provider value={value}>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </AppContext.Provider>
    </AuthProvider>
  );
};
