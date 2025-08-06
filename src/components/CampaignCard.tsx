import React from 'react';
import { Campaign } from '../models/campaign';

interface CampaignCardProps {
  campaign: Campaign;
  viewMode: 'grid' | 'list';
  onEdit: () => void;
  onView: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  viewMode,
  onEdit,
  onView,
  onDuplicate,
  onDelete,
}) => {
  const progressPercentage = Math.min((campaign.raised / campaign.goal) * 100, 100);

  const daysRemaining = Math.ceil(
    (new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: Campaign['category']) => {
    switch (category) {
      case 'Education':
        return '🎓';
      case 'Healthcare':
        return '🏥';
      case 'Environment':
        return '🌱';
      case 'Emergency':
        return '🚨';
      case 'Community':
        return '🏘️';
      default:
        return '📋';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        {/* List view content... */}
        {/* Copy/paste your existing JSX here, unchanged */}
      </div>
    );
  }

  // Grid view content
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Grid view content... */}
      {/* Copy/paste your existing JSX here, unchanged */}
    </div>
  );
};
