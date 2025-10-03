/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { BrowserRouter } from "react-router-dom";

import ErrorBoundary from "@/components/ErrorBoundary";
import { initDatabase } from "@/services/database";

import { AnalyticsProvider } from "./analytics/AnalyticsContext";
import {
  appReducer,
  initialUIState,
  AppUIState,
  AppUIAction,
} from "./appReducer"; // Changed AppAction to AppUIAction
import { AuthProvider } from "./AuthContext";
import { ToastProvider } from "./ToastContext";

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

  // Initialize database on app start
  useEffect(() => {
    const initDb = async () => {
      try {
        await initDatabase();
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Failed to initialize database:", error);
        // Note: We can't use toast here since ToastProvider isn't yet available
        // This error will be shown in the console and handled by error boundaries
      }
    };

    void initDb();
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <AppContext.Provider value={value}>
              <AnalyticsProvider>{children}</AnalyticsProvider>
            </AppContext.Provider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
