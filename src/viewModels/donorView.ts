// src/viewModels/donorView.ts

import { DonorInsights } from '../models/analytics';

export interface TopDonorView {
  id: string;
  name: string;
  totalGiven: string;
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
  topDonors: TopDonorView[];
  retention: RetentionView;
  acquisition: AcquisitionView;
}

export function toDonorInsightsView(data: DonorInsights): DonorInsightsView {
  return {
    topDonors: data.topDonors.map(d => ({
      id: d.id,
      name: d.name,
      totalGiven: `$${d.totalGiven.toLocaleString()}`,
    })),
    retention: {
      current: `${data.donorRetention.current}%`,
      previous: `${data.donorRetention.previous}%`,
      change: `${data.donorRetention.change >= 0 ? '+' : ''}${data.donorRetention.change}%`,
    },
    acquisition: {
      newDonors: data.acquisition.newDonors,
      returningDonors: data.acquisition.returningDonors,
    },
  };
}
