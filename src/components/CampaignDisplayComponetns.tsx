// src/components/CampaignDisplayComponents.tsx - Optional display components
import React from 'react';
import { Campaign } from '../models/campaign';

interface CampaignDisplayProps {
  campaign: Campaign;
}

export const CampaignProgressDisplay: React.FC<CampaignDisplayProps> = ({ campaign }) => (
  <div className="flex items-center space-x-2">
    <div className="w-20 bg-slate-700 rounded-full h-2">
      <div 
        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${Math.min(campaign.progress || 0, 100)}%` }}
      />
    </div>
    <span className="text-sm font-medium text-slate-200">{campaign.progress || 0}%</span>
  </div>
);

export const CampaignDaysLeftDisplay: React.FC<CampaignDisplayProps> = ({ campaign }) => (
  <span className={`font-medium ${
    campaign.daysLeft || 0 || 0 <= 7 ? 'text-red-400' : 
    campaign.daysLeft || 0 || 0 <= 30 ? 'text-yellow-400' : 
    'text-slate-300'
  }`}>
    {campaign.daysLeft || 0 || 0} days left
  </span>
);

export const CampaignStatusBadge: React.FC<CampaignDisplayProps> = ({ campaign }) => (
  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
    campaign.status === 'Active' ? 'bg-green-500/20 text-green-400' :
    campaign.status === 'Planned' ? 'bg-blue-500/20 text-blue-400' :
    campaign.status === 'Completed' ? 'bg-slate-500/20 text-slate-400' :
    'bg-red-500/20 text-red-400'
  }`}>
    {campaign.status}
  </span>
);

export const CampaignGoalDisplay: React.FC<CampaignDisplayProps> = ({ campaign }) => (
  <div className="text-sm">
    <div className="text-slate-400">Goal Progress</div>
    <div className="text-white font-semibold">
      ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
    </div>
  </div>
);
