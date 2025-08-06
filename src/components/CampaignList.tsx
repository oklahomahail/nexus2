import React, { useState, useEffect } from 'react';
import { Campaign, CampaignFilters } from '../models/campaign';
import { campaignService } from '../services/campaignService';
import { CampaignCard } from './CampaignCard';
import { CampaignFiltersComponent } from './CampaignFilters';
import { LoadingSpinner } from './LoadingSpinner';

interface CampaignListProps {
  onEditCampaign: (campaign: Campaign) => void;
  onViewCampaign: (campaign: Campaign) => void;
  onCreateCampaign: () => void;
}

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
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Campaigns</h2>
          <p className="text-gray-600">
            Manage your fundraising campaigns and track their progress
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={onCreateCampaign}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            + New Campaign
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <CampaignFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        campaignCount={campaigns.length}
      />

      {/* Campaigns Display */}
      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              viewMode={viewMode}
              onEdit={() => onEditCampaign(campaign)}
              onView={() => onViewCampaign(campaign)}
              onDuplicate={() => handleDuplicate(campaign)}
              onDelete={() => handleDelete(campaign)}
            />
          ))}
        </div>
      )}
    </div>
  );
};