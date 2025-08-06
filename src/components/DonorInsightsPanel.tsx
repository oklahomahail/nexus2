// DonorInsightsPanel.tsx
import React from 'react';
import { DonorInsights } from '../models/analytics';

interface DonorInsightsPanelProps {
  insights: DonorInsights;
}

const DonorInsightsPanel: React.FC<DonorInsightsPanelProps> = ({ insights }) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Donor Insights</h2>
      <p><strong>Total Donors:</strong> {insights.totalDonors}</p>
      <p><strong>New Donors:</strong> {insights.newDonors}</p>
      <p><strong>Recurring Donors:</strong> {insights.recurringDonors}</p>
      <p><strong>Average Gift:</strong> ${insights.averageGift.toFixed(2)}</p>
    </div>
  );
};

export default DonorInsightsPanel;
