// src/models/analytics.ts

export interface OrganizationAnalytics {
  currentPeriod: {
    startDate: string;
    endDate: string;
    totalRaised: number;
    donorCount: number;
    campaignCount: number;
  };
  previousPeriod: {
    startDate: string;
    endDate: string;
    totalRaised: number;
    donorCount: number;
    campaignCount: number;
  };
  growthMetrics: {
    raisedChange: number;
    donorsChange: number;
    campaignsChange: number;
  };
}

export interface DonorInsights {
  topDonors: {
    id: string;
    name: string;
    totalGiven: number;
  }[];
  donorRetention: {
    current: number;
    previous: number;
    change: number;
  };
  acquisition: {
    newDonors: number;
    returningDonors: number;
  };
}
