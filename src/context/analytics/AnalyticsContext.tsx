/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import {
  getPlatformMetrics,
  getClientMetrics,
  getRecentActivity,
  type PlatformMetrics,
  type ClientMetrics,
  type ActivityItem,
} from "@/services/analyticsService";

// Define analytics context type
interface AnalyticsContextType {
  // Platform metrics
  platformMetrics: PlatformMetrics | null;
  platformLoading: boolean;
  platformError: string | null;

  // Client metrics
  clientMetrics: ClientMetrics | null;
  clientLoading: boolean;
  clientError: string | null;

  // Recent activity
  recentActivity: ActivityItem[];
  activityLoading: boolean;
  activityError: string | null;

  // Actions
  refreshPlatformMetrics: () => Promise<void>;
  refreshClientMetrics: (clientId: string) => Promise<void>;
  refreshRecentActivity: (clientId?: string, limit?: number) => Promise<void>;
  clearClientMetrics: () => void;
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
  // Platform metrics state
  const [platformMetrics, setPlatformMetrics] =
    useState<PlatformMetrics | null>(null);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [platformError, setPlatformError] = useState<string | null>(null);

  // Client metrics state
  const [clientMetrics, setClientMetrics] = useState<ClientMetrics | null>(
    null,
  );
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  // Recent activity state
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  // Refresh platform metrics
  const refreshPlatformMetrics = useCallback(async () => {
    setPlatformLoading(true);
    setPlatformError(null);

    try {
      const metrics = await getPlatformMetrics();
      setPlatformMetrics(metrics);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch metrics";
      setPlatformError(message);
      console.error("Error fetching platform metrics:", error);
    } finally {
      setPlatformLoading(false);
    }
  }, []);

  // Refresh client metrics
  const refreshClientMetrics = useCallback(async (clientId: string) => {
    setClientLoading(true);
    setClientError(null);

    try {
      const metrics = await getClientMetrics(clientId);
      setClientMetrics(metrics);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch client metrics";
      setClientError(message);
      console.error("Error fetching client metrics:", error);
    } finally {
      setClientLoading(false);
    }
  }, []);

  // Refresh recent activity
  const refreshRecentActivity = useCallback(
    async (clientId?: string, limit: number = 10) => {
      setActivityLoading(true);
      setActivityError(null);

      try {
        const activity = await getRecentActivity(clientId, limit);
        setRecentActivity(activity);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch activity";
        setActivityError(message);
        console.error("Error fetching recent activity:", error);
      } finally {
        setActivityLoading(false);
      }
    },
    [],
  );

  // Clear client metrics
  const clearClientMetrics = useCallback(() => {
    setClientMetrics(null);
    setClientError(null);
  }, []);

  // Auto-refresh platform metrics on mount and every 5 minutes
  useEffect(() => {
    void refreshPlatformMetrics();

    const interval = setInterval(
      () => {
        void refreshPlatformMetrics();
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshPlatformMetrics]);

  // Auto-refresh recent activity every 30 seconds
  useEffect(() => {
    void refreshRecentActivity();

    const interval = setInterval(
      () => {
        void refreshRecentActivity();
      },
      30 * 1000,
    ); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshRecentActivity]);

  const value = useMemo(
    () => ({
      platformMetrics,
      platformLoading,
      platformError,
      clientMetrics,
      clientLoading,
      clientError,
      recentActivity,
      activityLoading,
      activityError,
      refreshPlatformMetrics,
      refreshClientMetrics,
      refreshRecentActivity,
      clearClientMetrics,
    }),
    [
      platformMetrics,
      platformLoading,
      platformError,
      clientMetrics,
      clientLoading,
      clientError,
      recentActivity,
      activityLoading,
      activityError,
      refreshPlatformMetrics,
      refreshClientMetrics,
      refreshRecentActivity,
      clearClientMetrics,
    ],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
