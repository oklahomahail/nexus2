import React, { useState, useEffect } from 'react';
import { KPIWidget } from '../components/AnalyticsWidgets';
import {
  Campaign,
  CampaignCreateRequest,
  CampaignUpdateRequest,
  CampaignStats
} from '../models/campaign';
import { campaignService } from '../services/campaignService';
import CampaignList from '../components/CampaignList';
import { CampaignModal } from '../components/CampaignModal';
import { CampaignDetail } from '../components/CampaignDetail';
import LoadingSpinner from '../components/LoadingSpinner';

type ViewMode = 'list' | 'detail';

const CampaignsPanel: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await campaignService.getCampaignStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load campaign stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCampaign(null);
  };

  const handleSaveCampaign = async (data: CampaignCreateRequest | CampaignUpdateRequest) => {
    if (modalMode === 'create') {
      await campaignService.createCampaign(data as CampaignCreateRequest);
    } else {
      await campaignService.updateCampaign(data as CampaignUpdateRequest);
    }

    loadStats();

    if (modalMode === 'edit' && selectedCampaign && viewMode === 'detail') {
      const updated = await campaignService.getCampaignById(selectedCampaign.id);
      if (updated) setSelectedCampaign(updated);
    }
  };

  if (viewMode === 'detail' && selectedCampaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Campaigns
          </button>
        </div>

        <CampaignDetail
          campaign={selectedCampaign}
          onEdit={handleEditCampaign}
          onBack={handleBackToList}
        />

        <CampaignModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveCampaign}
          initialData={selectedCampaign}
          mode={modalMode}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Campaign Overview</h2>
        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                <LoadingSpinner size="sm" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIWidget
              title="Total Campaigns"
              value={stats.totalCampaigns}
              format="number"
              color="blue"
            />
            <KPIWidget
              title="Active Campaigns"
              value={stats.activeCampaigns}
              format="number"
              color="green"
            />
            <KPIWidget
              title="Total Raised"
              value={stats.totalRaised}
              format="currency"
              color="purple"
            />
            <KPIWidget
              title="Success Rate"
              value={stats.successRate}
              format="percentage"
              color="red"
            />
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Unable to load campaign statistics.</p>
          </div>
        )}
      </div>

      <CampaignList
        onCreateCampaign={handleCreateCampaign}
        onEditCampaign={handleEditCampaign}
        onViewCampaign={handleViewCampaign}
      />

      <CampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveCampaign}
        initialData={selectedCampaign}
        mode={modalMode}
      />
    </div>
  );
};

export default CampaignsPanel;
