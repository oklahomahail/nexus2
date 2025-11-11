import React, { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";

import ErrorBoundary from "@/components/ErrorBoundary";
// import { initDatabase } from "@/services/database"; // Removed - Supabase-first

import { AnalyticsProvider } from "./analytics/AnalyticsContext";
// Removed appReducer - simplified app state management
// import {
//   appReducer,
//   initialUIState,
//   AppUIState,
//   AppUIAction,
// } from "./appReducer";
import { AuthProvider } from "./AuthContext";
import { ToastProvider } from "./ToastContext";

// Main app provider that combines all providers
export const AppProviders: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <AnalyticsProvider>{children}</AnalyticsProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
