// src/context/analytics/analyticsTypes.ts

export interface User {
  id: string;
  name: string;
  organizationName: string;
}

export interface OrganizationMetrics {
  totalDonors: number;
  totalRevenue: number;
}

export interface OrganizationAnalytics {
  overallMetrics: OrganizationMetrics;
}

export interface AnalyticsContextType {
  user: User;
  organization: OrganizationAnalytics;
}
