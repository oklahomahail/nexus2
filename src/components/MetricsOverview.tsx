import React from 'react';
import { OrganizationAnalytics } from '../models/analytics';

interface MetricsOverviewProps {
  analytics: OrganizationAnalytics;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ analytics }) => {
  const { overallMetrics, performanceComparisons } = analytics;

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon: string;
    color: string;
    format?: 'currency' | 'number' | 'percentage';
  }> = ({ title, value, change, changeLabel, icon, color, format = 'number' }) => {
    const formatValue = (val: string | number) => {
      if (typeof val === 'string') return val;
      
      switch (format) {
        case 'currency':
          return `$${val.toLocaleString()}`;
        case 'percentage':
          return `${val}%`;
        default:
          return val.toLocaleString();
      }
    };

    const getChangeColor = (changeValue?: number) => {
      if (!changeValue) return 'text-gray-600';
      return changeValue > 0 ? 'text-green-600' : changeValue < 0 ? 'text-red-600' : 'text-gray-600';
    };

    const getChangeIcon = (changeValue?: number) => {
      if (!changeValue) return null;
      return changeValue > 0 ? '↗️' : changeValue < 0 ? '↘️' : '➡️';
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-lg`}>
                {icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
              </div>
            </div>
            
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm">{getChangeIcon(change)}</span>
                <span className={`text-sm font-medium ${getChangeColor(change)}`}>
                  {Math.abs(change)}%
                </span>
                <span className="text-sm text-gray-600">
                  {changeLabel || 'vs last period'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Funds Raised"
            value={overallMetrics.totalFundsRaised}
            change={performanceComparisons.growthMetrics.fundsRaisedGrowth}
            icon="💰"
            color="bg-green-100 text-green-600"
            format="currency"
          />
          
          <MetricCard
            title="Total Donors"
            value={overallMetrics.totalDonors}
            change={performanceComparisons.growthMetrics.donorGrowth}
            icon="👥"
            color="bg-blue-100 text-blue-600"
            format="number"
          />
          
          <MetricCard
            title="Active Campaigns"
            value={overallMetrics.totalCampaigns}
            change={performanceComparisons.growthMetrics.campaignGrowth}
            icon="🎯"
            color="bg-purple-100 text-purple-600"
            format="number"
          />
          
          <MetricCard
            title="Donor Retention"
            value={overallMetrics.donorRetentionRate}
            icon="🔄"
            color="bg-orange-100 text-orange-600"
            format="percentage"
          />
        </div>
      </div>

      {/* Secondary Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Campaign Success Rate"
            value={overallMetrics.averageCampaignSuccess}
            icon="📈"
            color="bg-indigo-100 text-indigo-600"
            format="percentage"
          />
          
          <MetricCard
            title="Cost Per Dollar Raised"
            value={overallMetrics.costPerDollarRaised}
            icon="💸"
            color="bg-red-100 text-red-600"
            format="currency"
          />
          
          <MetricCard
            title="Average Gift Size"
            value={Math.round(overallMetrics.totalFundsRaised / overallMetrics.totalDonors)}
            icon="🎁"
            color="bg-yellow-100 text-yellow-600"
            format="currency"
          />
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current vs Previous Period */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Period Comparison</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Current Period</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(performanceComparisons.currentPeriod.startDate).toLocaleDateString()} - {new Date(performanceComparisons.currentPeriod.endDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Funds Raised</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">
                    ${performanceComparisons.currentPeriod.totalRaised.toLocaleString()}
                  </span>
                  <span className="ml-2 text-xs text-green-600">
                    +{performanceComparisons.growthMetrics.fundsRaisedGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">New Donors</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {performanceComparisons.currentPeriod.donorCount.toLocaleString()}
                  </span>
                  <span className="ml-2 text-xs text-green-600">
                    +{performanceComparisons.growthMetrics.donorGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Campaigns</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {performanceComparisons.currentPeriod.campaignCount}
                  </span>
                  <span className="ml-2 text-xs text-green-600">
                    +{performanceComparisons.growthMetrics.campaignGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Key Insights</h4>
            <div className="space-y-3">
              {overallMetrics.donorRetentionRate > 60 && (
                <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 mt-0.5">✅</span>
                  <div>
                    <p className="text-sm font-medium text-green-800">Strong Donor Retention</p>
                    <p className="text-xs text-green-700">
                      Your {overallMetrics.donorRetentionRate}% retention rate is above industry average
                    </p>
                  </div>
                </div>
              )}
              
              {performanceComparisons.growthMetrics.fundsRaisedGrowth > 15 && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 mt-0.5">📈</span>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Exceptional Growth</p>
                    <p className="text-xs text-blue-700">
                      Fundraising growth of {performanceComparisons.growthMetrics.fundsRaisedGrowth.toFixed(1)}% indicates strong momentum
                    </p>
                  </div>
                </div>
              )}
              
              {overallMetrics.costPerDollarRaised < 0.20 && (
                <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                  <span className="text-purple-600 mt-0.5">💡</span>
                  <div>
                    <p className="text-sm font-medium text-purple-800">Efficient Operations</p>
                    <p className="text-xs text-purple-700">
                      Cost per dollar raised of ${overallMetrics.costPerDollarRaised.toFixed(2)} is highly efficient
                    </p>
                  </div>
                </div>
              )}
              
              {overallMetrics.averageCampaignSuccess > 75 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-600 mt-0.5">🎯</span>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">High Success Rate</p>
                    <p className="text-xs text-yellow-700">
                      {overallMetrics.averageCampaignSuccess}% campaign success rate shows effective strategy
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};