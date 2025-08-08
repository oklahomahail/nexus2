import React from 'react';
import { Campaign } from '../models/campaign';

interface CampaignDetailProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onBack: () => void;
}

export const CampaignDetail: React.FC<CampaignDetailProps> = ({
  campaign,
  onEdit,
  onBack
}) => {
  const progressPercentage = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const daysRemaining = Math.ceil(
    (new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Planned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getCategoryIcon(campaign.category)}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">{campaign.category}</span>
                  <span className="text-gray-400">•</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
              </div>
            </div>
            {campaign.description && (
              <p className="text-gray-700 leading-relaxed">{campaign.description}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onEdit(campaign)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Progress and Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fundraising Progress</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900">
                ${campaign.raised.toLocaleString()}
              </span>
              <span className="text-lg text-gray-600">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>Raised: ${campaign.raised.toLocaleString()}</span>
              <span>Goal: ${campaign.goal.toLocaleString()}</span>
            </div>

            {progressPercentage >= 100 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 font-medium">🎉 Congratulations! Goal reached!</p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800">
                  <span className="font-medium">${(campaign.goal - campaign.raised).toLocaleString()}</span> remaining to reach goal
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Key Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{campaign.donorCount}</p>
                <p className="text-sm text-gray-600">Total Donors</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${campaign.averageGift}</p>
                <p className="text-sm text-gray-600">Average Gift</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {daysRemaining > 0 ? daysRemaining : 0}
                </p>
                <p className="text-sm text-gray-600">
                  {daysRemaining > 0 ? 'Days Remaining' : 'Campaign Ended'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Start Date</p>
                <p className="text-gray-900">{new Date(campaign.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">End Date</p>
                <p className="text-gray-900">{new Date(campaign.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            {campaign.targetAudience && (
              <div>
                <p className="text-sm font-medium text-gray-700">Target Audience</p>
                <p className="text-gray-900">{campaign.targetAudience}</p>
              </div>
            )}

            {campaign.createdBy && (
              <div>
                <p className="text-sm font-medium text-gray-700">Created By</p>
                <p className="text-gray-900">{campaign.createdBy}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700">Created</p>
              <p className="text-gray-900">{new Date(campaign.createdAt).toLocaleDateString()}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Last Updated</p>
              <p className="text-gray-900">{new Date(campaign.lastUpdated).toLocaleDateString()}</p>
            </div>

            {campaign.tags && campaign.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          
          <div className="space-y-4">
            {campaign.emailsSent !== undefined && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Emails Sent</span>
                <span className="text-gray-900 font-medium">{campaign.emailsSent.toLocaleString()}</span>
              </div>
            )}

            {campaign.clickThroughRate !== undefined && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Click-Through Rate</span>
                <span className="text-gray-900 font-medium">{campaign.clickThroughRate}%</span>
              </div>
            )}

            {campaign.conversionRate !== undefined && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                <span className="text-gray-900 font-medium">{campaign.conversionRate}%</span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Completion Rate</span>
              <span className="text-gray-900 font-medium">{progressPercentage.toFixed(1)}%</span>
            </div>

            {campaign.donorCount > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-700">Average Gift Size</span>
                <span className="text-gray-900 font-medium">${campaign.averageGift}</span>
              </div>
            )}
          </div>

          {/* Performance Indicators */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  progressPercentage >= 75 ? 'text-green-600' : 
                  progressPercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {progressPercentage >= 75 ? '📈' : progressPercentage >= 50 ? '📊' : '📉'}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {progressPercentage >= 75 ? 'Excellent' : 
                   progressPercentage >= 50 ? 'Good' : 'Needs Attention'}
                </p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  daysRemaining > 7 ? 'text-green-600' : 
                  daysRemaining > 0 ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {daysRemaining > 7 ? '⏰' : daysRemaining > 0 ? '⚡' : '🏁'}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {daysRemaining > 7 ? 'On Track' : 
                   daysRemaining > 0 ? 'Final Sprint' : 'Completed'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Notes */}
      {campaign.notes && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{campaign.notes}</p>
          </div>
        </div>
      )}

      {/* Action Items / Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
        <div className="space-y-3">
          {progressPercentage < 50 && daysRemaining > 0 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Campaign is behind target</p>
                <p className="text-xs text-yellow-700">Consider increasing outreach efforts or adjusting messaging strategy.</p>
              </div>
            </div>
          )}
          
          {daysRemaining <= 7 && daysRemaining > 0 && progressPercentage < 90 && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-orange-600 mt-0.5">🏃‍♂️</div>
              <div>
                <p className="text-sm font-medium text-orange-800">Final week push needed</p>
                <p className="text-xs text-orange-700">Send urgent appeals and follow up with major donor prospects.</p>
              </div>
            </div>
          )}
          
          {progressPercentage >= 100 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-600 mt-0.5">🎉</div>
              <div>
                <p className="text-sm font-medium text-green-800">Goal achieved!</p>
                <p className="text-xs text-green-700">Send thank you messages to all donors and consider stretch goals.</p>
              </div>
            </div>
          )}
          
          {campaign.donorCount > 0 && campaign.averageGift < 100 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-blue-600 mt-0.5">💡</div>
              <div>
                <p className="text-sm font-medium text-blue-800">Focus on major gifts</p>
                <p className="text-xs text-blue-700">Consider targeted outreach to increase average gift size.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
