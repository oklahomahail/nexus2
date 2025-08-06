import React, { useState, useEffect } from 'react';
import { CampaignFilters } from '../models/campaign';
import { campaignService } from '../services/campaignService';

interface CampaignFiltersComponentProps {
  filters: CampaignFilters;
  onFiltersChange: (filters: CampaignFilters) => void;
  campaignCount: number;
}

export const CampaignFiltersComponent: React.FC<CampaignFiltersComponentProps> = ({
  filters,
  onFiltersChange,
  campaignCount
}) => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadAvailableTags();
  }, []);

  const loadAvailableTags = async () => {
    try {
      const tags = await campaignService.getAvailableTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleFilterChange = (key: keyof CampaignFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value
    };

    // Remove empty filters
    Object.keys(newFilters).forEach(k => {
      const filterKey = k as keyof CampaignFilters;
      const filterValue = newFilters[filterKey];
      
      if (
        filterValue === '' ||
        filterValue === null ||
        filterValue === undefined ||
        (Array.isArray(filterValue) && filterValue.length === 0) ||
        (typeof filterValue === 'object' && 
         filterValue !== null && 
         'start' in filterValue && 
         'end' in filterValue && 
         (!filterValue.start || !filterValue.end))
      ) {
        delete newFilters[filterKey];
      }
    });

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof CampaignFilters];
    return value !== undefined && value !== null && 
           (!Array.isArray(value) || value.length > 0) &&
           (typeof value !== 'object' || (value as any).start || (value as any).end);
  });

  const statusOptions = [
    { value: 'Planned', label: 'Planned', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'Completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  const categoryOptions = [
    { value: 'General', label: 'General', icon: '📋' },
    { value: 'Emergency', label: 'Emergency', icon: '🚨' },
    { value: 'Education', label: 'Education', icon: '🎓' },
    { value: 'Healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'Environment', label: 'Environment', icon: '🌱' },
    { value: 'Community', label: 'Community', icon: '🏘️' },
    { value: 'Other', label: 'Other', icon: '📌' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showAdvanced
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Advanced Filters
            <svg
              className={`inline ml-1 h-4 w-4 transition-transform ${
                showAdvanced ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((status) => (
          <button
            key={status.value}
            onClick={() => {
              const currentStatuses = filters.status || [];
              const newStatuses = currentStatuses.includes(status.value as any)
                ? currentStatuses.filter(s => s !== status.value)
                : [...currentStatuses, status.value as any];
              handleFilterChange('status', newStatuses);
            }}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filters.status?.includes(status.value as any)
                ? status.color
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.label}
            {filters.status?.includes(status.value as any) && (
              <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categoryOptions.map((category) => (
                  <label key={category.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.category?.includes(category.value as any) || false}
                      onChange={(e) => {
                        const currentCategories = filters.category || [];
                        const newCategories = e.target.checked
                          ? [...currentCategories, category.value as any]
                          : currentCategories.filter(c => c !== category.value);
                        handleFilterChange('category', newCategories);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                      <span>{category.icon}</span>
                      {category.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  placeholder="Start date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    start: e.target.value
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <input
                  type="date"
                  placeholder="End date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    end: e.target.value
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableTags.map((tag) => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.tags?.includes(tag) || false}
                      onChange={(e) => {
                        const currentTags = filters.tags || [];
                        const newTags = e.target.checked
                          ? [...currentTags, tag]
                          : currentTags.filter(t => t !== tag);
                        handleFilterChange('tags', newTags);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">#{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-200 pt-3">
        <span>
          {campaignCount} campaign{campaignCount !== 1 ? 's' : ''} found
          {hasActiveFilters && ' with current filters'}
        </span>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-4">
            <span>Active filters:</span>
            <div className="flex flex-wrap gap-1">
              {filters.status && filters.status.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800">
                  Status ({filters.status.length})
                </span>
              )}
              {filters.category && filters.category.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 text-purple-800">
                  Category ({filters.category.length})
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 text-green-800">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.dateRange && (filters.dateRange.start || filters.dateRange.end) && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-yellow-100 text-yellow-800">
                  Date Range
                </span>
              )}
              {filters.tags && filters.tags.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-pink-100 text-pink-800">
                  Tags ({filters.tags.length})
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};