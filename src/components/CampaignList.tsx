// Updated CampaignList component using new Panel and Card system
import React, { useState, useEffect } from 'react';
import { Campaign, CampaignFilters } from '../models/campaign';
import { campaignService } from '../services/campaignService';
import { Panel, CampaignPanel, AlertPanel } from '../components/ui-kit/Panel';
import { Card, CampaignQuickCard } from '../components/ui-kit/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface CampaignListProps {
  onEditCampaign: (campaign: Campaign) => void;
  onViewCampaign: (campaign: Campaign) => void;
  onCreateCampaign: () => void;
}

// Enhanced filters component using Panel
const CampaignFiltersPanel: React.FC<{
  filters: CampaignFilters;
  onFiltersChange: (filters: CampaignFilters) => void;
  campaignCount: number;
}> = ({ filters, onFiltersChange, campaignCount }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { value: 'Planned', label: 'Planned', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'Completed', label: 'Completed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-brand-accent/10 text-brand-accent border-brand-accent/20' }
  ];

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof CampaignFilters];
    return value !== undefined && value !== null && 
           (!Array.isArray(value) || value.length > 0) &&
           (typeof value !== 'object' || (value as any).start || (value as any).end);
  });

  return (
    <Panel 
      title="Filter Campaigns"
      headerActions={
        <div className="flex items-center gap-2">
          <span className="text-sm text-brand-primary">
            {campaignCount} campaign{campaignCount !== 1 ? 's' : ''} found
          </span>
          {hasActiveFilters && (
            <button
              onClick={() => onFiltersChange({})}
              className="text-sm text-brand-accent hover:text-brand-accent/80 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search */}
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
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-brand-secondary focus:border-brand-secondary text-sm"
          />
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
                onFiltersChange({ ...filters, status: newStatuses });
              }}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filters.status?.includes(status.value as any)
                  ? status.color
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
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

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-brand-secondary hover:text-brand-primary font-medium"
        >
          Advanced Filters
          <svg
            className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-brand-primary mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    placeholder="Start date"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      const currentEnd = filters.dateRange?.end || '';
                      
                      if (newStart && currentEnd) {
                        onFiltersChange({
                          ...filters,
                          dateRange: { start: newStart, end: currentEnd }
                        });
                      } else if (newStart || currentEnd) {
                        // If only one date is set, don't include dateRange in filters yet
                        const newFilters = { ...filters };
                        if (!newStart && !currentEnd) {
                          delete newFilters.dateRange;
                        }
                        onFiltersChange(newFilters);
                      }
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-brand-secondary focus:border-brand-secondary text-sm"
                  />
                  <input
                    type="date"
                    placeholder="End date"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      const currentStart = filters.dateRange?.start || '';
                      
                      if (currentStart && newEnd) {
                        onFiltersChange({
                          ...filters,
                          dateRange: { start: currentStart, end: newEnd }
                        });
                      } else if (currentStart || newEnd) {
                        // If only one date is set, don't include dateRange in filters yet
                        const newFilters = { ...filters };
                        if (!currentStart && !newEnd) {
                          delete newFilters.dateRange;
                        }
                        onFiltersChange(newFilters);
                      }
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-brand-secondary focus:border-brand-secondary text-sm"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-brand-primary mb-2">
                  Categories
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['Education', 'Healthcare', 'Environment', 'Emergency', 'Community', 'General'].map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.category?.includes(category as any) || false}
                        onChange={(e) => {
                          const currentCategories = filters.category || [];
                          const newCategories = e.target.checked
                            ? [...currentCategories, category as any]
                            : currentCategories.filter(c => c !== category);
                          onFiltersChange({ ...filters, category: newCategories });
                        }}
                        className="h-4 w-4 text-brand-secondary focus:ring-brand-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-brand-dark">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};

export const CampaignList: React.FC<CampaignListProps> = ({
  onEditCampaign,
  onViewCampaign,
  onCreateCampaign
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CampaignFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadCampaigns = async (newFilters?: CampaignFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await campaignService.getAllCampaigns(newFilters || filters);
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleFiltersChange = (newFilters: CampaignFilters) => {
    setFilters(newFilters);
    loadCampaigns(newFilters);
  };

  const handleDuplicate = async (campaign: Campaign) => {
    try {
      await campaignService.duplicateCampaign(campaign.id);
      loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate campaign');
    }
  };

  const handleDelete = async (campaign: Campaign) => {
    if (!window.confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
      return;
    }

    try {
      await campaignService.deleteCampaign(campaign.id);
      loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
    }
  };

  if (loading) {
    return (
      <Panel title="Loading Campaigns..." className="text-center">
        <div className="py-12">
          <LoadingSpinner size="lg" />
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <CampaignPanel
        title="Campaign Management"
        subtitle="Create, track, and optimize your fundraising campaigns"
        headerActions={<div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid'
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-gray-600 hover:text-brand-dark'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list'
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-gray-600 hover:text-brand-dark'}`}
            >
              List
            </button>
          </div>

          <button
            onClick={onCreateCampaign}
            className="px-4 py-2 bg-brand-secondary text-white rounded-xl hover:bg-brand-primary font-medium text-sm transition-all hover:shadow-md flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            New Campaign
          </button>
        </div>} children={undefined}      />

      {/* Error Message */}
      {error && (
        <AlertPanel alertType="error" title="Error Loading Campaigns">
          <div className="flex justify-between items-center">
            <p className="text-sm text-brand-accent">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-brand-accent hover:text-brand-accent/80"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </AlertPanel>
      )}

      {/* Filters */}
      <CampaignFiltersPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        campaignCount={campaigns.length}
      />

      {/* Campaigns Display */}
      {campaigns.length === 0 ? (
        <Panel className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-600 mb-6">
            {Object.keys(filters).some(key => filters[key as keyof CampaignFilters])
              ? 'Try adjusting your filters or create a new campaign to get started.'
              : 'Create your first campaign to start fundraising.'}
          </p>
          <button
            onClick={onCreateCampaign}
            className="px-6 py-3 bg-brand-secondary text-white rounded-xl hover:bg-brand-primary font-medium shadow-md hover:shadow-lg transition-all"
          >
            Create Your First Campaign
          </button>
        </Panel>
      ) : (
        <Panel>
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {campaigns.map((campaign) => {
              // Convert your existing Campaign to the format expected by CampaignQuickCard
              const campaignData = {
                name: campaign.name,
                status: campaign.status,
                raised: campaign.raised,
                goal: campaign.goal,
                daysLeft: Math.max(0, Math.ceil(
                  (new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )),
                category: campaign.category
              };

              return viewMode === 'grid' ? (
                <CampaignQuickCard
                  key={campaign.id}
                  campaign={campaignData}
                  onClick={() => onViewCampaign(campaign)}
                />
              ) : (
                <Card
                  key={campaign.id}
                  className="hover:shadow-md transition-all"
                >
                  {/* List view layout */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-brand-dark truncate">
                          {campaign.name}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'Planned' ? 'bg-yellow-100 text-yellow-800' :
                          campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">{campaign.description}</p>
                      <div className="flex items-center gap-4 text-sm text-brand-primary">
                        <span>${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}</span>
                        <span>{campaignData.daysLeft} days left</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => onViewCampaign(campaign)}
                        className="p-2 text-gray-600 hover:text-brand-secondary rounded-lg transition-colors"
                        title="View details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onEditCampaign(campaign)}
                        className="p-2 text-gray-600 hover:text-green-600 rounded-lg transition-colors"
                        title="Edit campaign"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(campaign)}
                        className="p-2 text-gray-600 hover:text-brand-accent rounded-lg transition-colors"
                        title="Delete campaign"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
};