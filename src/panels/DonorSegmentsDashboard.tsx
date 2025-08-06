import React, { useState, useEffect } from 'react';
import { DonorSegment, DonorSegmentAnalytics, SegmentFilter } from '../models/donorSegments';
import { donorSegmentService } from '../services/donorSegmentService';
import { SegmentOverviewCards } from '../components/SegmentOverviewCards';
import { SegmentGrid } from '../components/SegmentGrid';
import { SegmentComparison } from '../components/SegmentComparison';
import { SegmentManagement } from '../components/SegmentManagement';
import { SegmentInsights } from '../components/SegmentInsights';
import { LoadingSpinner } from '../components/LoadingSpinner';

type DashboardView = 'overview' | 'segments' | 'comparison' | 'insights' | 'management';

export const DonorSegmentsDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [segments, setSegments] = useState<DonorSegment[]>([]);
  const [analytics, setAnalytics] = useState<DonorSegmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SegmentFilter>({});

  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [segmentsData, analyticsData] = await Promise.all([
        donorSegmentService.getAllSegments(),
        donorSegmentService.getSegmentAnalytics(filters)
      ]);
      
      setSegments(segmentsData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load donor segment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSegmentCreate = async (segmentData: any) => {
    try {
      const newSegment = await donorSegmentService.createSegment(segmentData);
      setSegments(prev => [...prev, newSegment]);
      await loadData(); // Refresh analytics
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create segment');
    }
  };

  const handleSegmentUpdate = async (id: string, updates: any) => {
    try {
      const updatedSegment = await donorSegmentService.updateSegment(id, updates);
      setSegments(prev => prev.map(s => s.id === id ? updatedSegment : s));
      await loadData(); // Refresh analytics
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update segment');
    }
  };

  const handleSegmentDelete = async (id: string) => {
    try {
      await donorSegmentService.deleteSegment(id);
      setSegments(prev => prev.filter(s => s.id !== id));
      await loadData(); // Refresh analytics
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete segment');
    }
  };

  const navigationItems = [
    { key: 'overview', label: 'Overview', icon: '📊', description: 'Segment performance summary' },
    { key: 'segments', label: 'Segment Details', icon: '👥', description: 'Detailed segment analytics' },
    { key: 'comparison', label: 'Compare Segments', icon: '⚖️', description: 'Side-by-side comparisons' },
    { key: 'insights', label: 'Insights & Opportunities', icon: '💡', description: 'Strategic recommendations' },
    { key: 'management', label: 'Manage Segments', icon: '⚙️', description: 'Create and edit segments' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading donor segments..." />
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
            <h3 className="text-sm font-medium text-red-800">Donor Segments Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={loadData}
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
          <h1 className="text-2xl font-bold text-gray-900">Donor Segments</h1>
          <p className="text-gray-600">
            Analyze and manage donor segments to optimize your fundraising strategy
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {navigationItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key as DashboardView)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 min-w-0 ${
                activeView === item.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
            >
              <span className="text-base">{item.icon}</span>
              <div className="hidden sm:block">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {analytics && (
        <div className="space-y-6">
          {activeView === 'overview' && (
            <>
              <SegmentOverviewCards analytics={analytics} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performing Segments */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Segments</h3>
                  <div className="space-y-3">
                    {analytics.crossSegmentInsights.topPerformingSegments
                      .filter(s => s.metric === 'total_revenue')
                      .slice(0, 5)
                      .map((segment, index) => (
                        <div key={segment.segmentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              #{segment.rank}
                            </div>
                            <span className="font-medium text-gray-900">{segment.segmentName}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            ${segment.value.toLocaleString()}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveView('management')}
                      className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600">➕</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Create New Segment</div>
                        <div className="text-sm text-gray-600">Define custom donor categories</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveView('comparison')}
                      className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600">⚖️</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Compare Segments</div>
                        <div className="text-sm text-gray-600">Analyze performance differences</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveView('insights')}
                      className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600">💡</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">View Insights</div>
                        <div className="text-sm text-gray-600">Get strategic recommendations</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeView === 'segments' && (
            <SegmentGrid 
              segments={segments}
              analytics={analytics}
              selectedSegments={selectedSegments}
              onSelectionChange={setSelectedSegments}
            />
          )}

          {activeView === 'comparison' && (
            <SegmentComparison 
              segments={segments}
              analytics={analytics}
            />
          )}

          {activeView === 'insights' && (
            <SegmentInsights 
              analytics={analytics}
              segments={segments}
            />
          )}

          {activeView === 'management' && (
            <SegmentManagement 
              segments={segments}
              onSegmentCreate={handleSegmentCreate}
              onSegmentUpdate={handleSegmentUpdate}
              onSegmentDelete={handleSegmentDelete}
            />
          )}
        </div>
      )}
    </div>
  );
};