import React from "react";

import { AnalyticsFilters } from "../models/analytics";

interface AnalyticsFiltersComponentProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

const AnalyticsFiltersComponent: React.FC<AnalyticsFiltersComponentProps> = ({
  filters: _filters, // renamed to avoid unused var lint error
  onFiltersChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Analytics Filters</h3>
      <p className="text-gray-600">
        Active filters: {Object.keys(_filters).length}.
        <button
          onClick={() => onFiltersChange(_filters)}
          className="text-blue-600 ml-2"
        >
          Refresh Filters
        </button>
      </p>
    </div>
  );
};

export default AnalyticsFiltersComponent;
