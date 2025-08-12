/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, ReactNode } from "react";

// Define your analytics context type
interface AnalyticsContextType {
  // Add your analytics context properties here
}

// Create the context
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined,
);

// Custom hook to use the analytics context
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};

// Provider component
export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Add your analytics state and logic here
  const value: AnalyticsContextType = {
    // Initialize your analytics context value
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
