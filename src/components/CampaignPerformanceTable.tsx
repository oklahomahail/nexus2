// src/components/DonorInsightsPanel.tsx
import React from 'react';
import { DonorInsights } from '../models/analytics';

interface Props {
  insights: DonorInsights;
}

const DonorInsightsPanel: React.FC<Props> = ({ insights }) => {
  return (
    <div className="grid grid-cols-2 gap-4 bg-white p-4 shadow rounded">
      <div>
        <h3 className="text-sm text-gray-500">Average Gift</h3>
        <p className="text-lg font-semibold">${insights.averageGift.toFixed(2)}</p>
      </div>
      <div>
        <h3 className="text-sm text-gray-500">Recurring Donors</h3>
        <p className="text-lg font-semibold">{insights.recurringDonors}</p>
      </div>
      <div>
        <h3 className="text-sm text-gray-500">New Donors</h3>
        <p className="text-lg font-semibold">{insights.newDonors}</p>
      </div>
      <div>
        <h3 className="text-sm text-gray-500">Lapsed Donors</h3>
        <p className="text-lg font-semibold">{insights.lapsedDonors}</p>
      </div>
    </div>
  );
};

export default DonorInsightsPanel;
