// src/context/analytics/AnalyticsContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { AnalyticsContextType } from './analyticsTypes';

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const value: AnalyticsContextType = {
    user: {
      id: 'user123',
      name: 'Dave Hail',
      organizationName: 'Nexus Consulting',
    },
    organization: {
      overallMetrics: {
        totalDonors: 128,
        totalRevenue: 56000,
      },
    },
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error('useAnalytics must be used within an AnalyticsProvider');
  return context;
};
