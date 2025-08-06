import React from 'react';
import { AnalyticsFilters } from '../models/analytics';

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

const AnalyticsFiltersComponent: React.FC<AnalyticsFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'startDate' | 'endDate') => {
    const newDate = e.target.value;
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: newDate
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Start Date</label>
        <input
          type="date"
          value={filters.dateRange.startDate}
          onChange={(e) => handleDateChange(e, 'startDate')}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">End Date</label>
        <input
          type="date"
          value={filters.dateRange.endDate}
          onChange={(e) => handleDateChange(e, 'endDate')}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
};

export default AnalyticsFiltersComponent;
