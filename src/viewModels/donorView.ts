import { DonorInsights as DonorInsights } from "../models/analytics"; // Use correct export name

export interface DonorView {
  name: string;
  totalDonated: number;
  donationsCount: number;
  lastDonationDate: string;
}

export interface RetentionView {
  current: string;
  previous: string;
  change: string;
}

export interface AcquisitionView {
  newDonors: number;
  returningDonors: number;
}

export interface DonorInsightsView {
  topDonors: DonorView[];
  retention: RetentionView;
  acquisition: AcquisitionView;
}

// Convert donor insights data to view format
export function toDonorInsightsView(data: DonorInsights): DonorInsightsView {
  return {
    topDonors: data.topDonors.map((d: any) => ({
      name: d.name,
      totalDonated: d.totalDonated,
      donationsCount: d.donationsCount,
      lastDonationDate: d.lastDonationDate,
    })),
    retention: {
      current: `${data.donorRetention.current}%`,
      previous: `${data.donorRetention.previous}%`,
      change: `${data.donorRetention.change >= 0 ? "+" : ""}${data.donorRetention.change}%`,
    },
    acquisition: {
      newDonors: data.acquisition.newDonors,
      returningDonors: data.acquisition.returningDonors,
    },
  };
}
