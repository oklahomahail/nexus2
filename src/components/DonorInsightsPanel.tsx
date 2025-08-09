import React from "react";

import { DonorInsights } from "../models/analytics";

interface _DonorInsightsPanelProps {
  insights: DonorInsights | null;
}

const DonorInsightsPanel: React.FC<DonorInsightsPanelProps> = ({
  insights,
}) => {
  if (!insights) {
    return <div className="p-4 text-gray-500">No donor insights available</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Donor Insights</h3>
      <p className="text-gray-600">
        Donor insights panel will be implemented here.
      </p>
    </div>
  );
};

export default DonorInsightsPanel;
