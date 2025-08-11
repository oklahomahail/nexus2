import React from "react";

import { KPIWidget } from "./AnalyticsWidgets";

interface MetricsOverviewProps {
  className?: string;
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ className }) => {
  const root = ["space-y-6", className].filter(Boolean).join(" ");

  return (
    <div className={root}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Metrics Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <KPIWidget
            title="Total Donors"
            value={1245}
            format="number"
            color="blue"
          />
          <KPIWidget
            title="Monthly Revenue"
            value={45230}
            format="currency"
            color="green"
          />
          <KPIWidget
            title="Conversion Rate"
            value={23.4}
            format="percentage"
            color="purple"
          />
          <KPIWidget
            title="Active Campaigns"
            value={8}
            format="number"
            color="yellow"
          />
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;
