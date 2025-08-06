import React, { useState, useEffect } from 'react';
import { OrganizationAnalytics, DonorInsights, AnalyticsFilters } from '../models/analytics';
import { analyticsService } from '../services/analyticsService';
import { MetricsOverview } from '../components/MetricsOverview';
import { PerformanceChart } from '../components/PerformanceChart';
import { DonorInsightsPanel } from '../components/DonorInsightsPanel';
import { CampaignPerformanceTable } from '../components/CampaignPerformanceTable';
import { AnalyticsFiltersComponent } from '../components/AnalyticsFilters';
import { LoadingSpinner } from '../components/LoadingSpinner';

type AnalyticsView = 'overview' | 'campaigns' | 'donors' | 'export';

export const AnalyticsDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AnalyticsView>('overview');
  const [orgAnalytics, setOrgAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [donorInsights, setDonorInsights] = useState<DonorInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      startDate: '2024-01-01',
      endDate: '2024-08-31'
    }
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [orgData, donorData] = await Promise.all([
        analyticsService.getOrganizationAnalytics(filters),
        analyticsService.getDonorInsights(filters)
      ]);
      
      setOrgAnalytics(orgData);
      setDonorInsights(donorData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const csvUrl = await analyticsService.exportAnalyticsData('organization', filters);
      const link = document.createElement('a');
      link.href = csvUrl;
      link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (err) {
      setError('Failed to export data');
    }
  };

  const navigationItems = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'campaigns', label: 'Campaign Performance', icon: '🎯' },
    { key: 'donors', label: 'Donor Insights', icon: '👥' },
    { key: 'export', label: 'Export Data', icon: '📈' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Analytics Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={loadAnalyticsData}
              className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive insights into your fundraising performance and donor engagement
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadAnalyticsData}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {navigationItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key as AnalyticsView)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                activeView === item.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeView === 'overview' && orgAnalytics && (
          <>
            <MetricsOverview analytics={orgAnalytics} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart
                title="Fundraising Growth"
                data={orgAnalytics.performanceComparisons}
                type="comparison"
              />
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance vs Industry</h3>
                <div className="space-y-4">
                  {Object.entries(orgAnalytics.benchmarkData.performanceRatings).map(([key, rating]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace('Rating', '')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                        rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                        rating === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {rating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === 'campaigns' && orgAnalytics && (
          <div className="space-y-6">
            <CampaignPerformanceTable campaigns={orgAnalytics.topPerformingCampaigns} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart
                title="Campaign Success Rate"
                data={orgAnalytics.topPerformingCampaigns}
                type="success-rate"
              />
              
              <PerformanceChart
                title="ROI by Campaign"
                data={orgAnalytics.topPerformingCampaigns}
                type="roi"
              />
            </div>
          </div>
        )}

        {activeView === 'donors' && donorInsights && (
          <DonorInsightsPanel insights={donorInsights} />
        )}

        {activeView === 'export' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Analytics Data</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => analyticsService.exportAnalyticsData('organization', filters)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600">📊</span>
                  </div>
                  <span className="font-medium text-gray-900">Organization Report</span>
                </div>
                <p className="text-sm text-gray-600">
                  Complete organizational analytics including all campaigns, donors, and performance metrics
                </p>
              </button>

              <button
                onClick={() => analyticsService.exportAnalyticsData('campaign', filters)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600">🎯</span>
                  </div>
                  <span className="font-medium text-gray-900">Campaign Analytics</span>
                </div>
                <p className="text-sm text-gray-600">
                  Detailed campaign performance data including conversion rates and channel effectiveness
                </p>
              </button>

              <button
                onClick={() => analyticsService.exportAnalyticsData('donor', filters)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600">👥</span>
                  </div>
                  <span className="font-medium text-gray-900">Donor Insights</span>
                </div>
                <p className="text-sm text-gray-600">
                  Donor demographics, giving patterns, and segmentation analysis
                </p>
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Export Options</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded mr-2" defaultChecked />
                  <span>Include Charts</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded mr-2" defaultChecked />
                  <span>Include Raw Data</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded mr-2" />
                  <span>Include Projections</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded mr-2" />
                  <span>Include Recommendations</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};