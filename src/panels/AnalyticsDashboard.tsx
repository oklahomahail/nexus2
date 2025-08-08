import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import MetricsOverview from '../components/MetricsOverview';
import { AnalyticsFilters, OrganizationAnalytics, DonorInsights } from '../models/analytics';
import DonorInsightsPanel from '../components/DonorInsightsPanel';
import AnalyticsFiltersComponent from '../components/AnalyticsFiltersComponent';
import PerformanceChart from '../components/PerformanceChart';
import CampaignPerformanceTable from '../components/CampaignPerformanceTable';
import LoadingSpinner from '../components/LoadingSpinner';

type AnalyticsView = 'overview' | 'campaigns' | 'donors' | 'export';

const AnalyticsDashboard: React.FC = () => {
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

      <AnalyticsFiltersComponent filters={filters} onFiltersChange={setFilters} />

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

      <div className="space-y-6">
        {activeView === 'overview' && orgAnalytics && (
          <>
            <MetricsOverview />
            <PerformanceChart
              title="Fundraising Growth"
              data={orgAnalytics.performanceComparisons as any}
              type="comparison"
            />
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
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Analytics Data</h3>
            <p className="mb-2">
              Download fundraising and donor performance data filtered by the current date range and selected criteria.
            </p>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Export All Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
