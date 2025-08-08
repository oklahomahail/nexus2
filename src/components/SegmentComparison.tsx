import React, { useState, useEffect } from 'react';
import { DonorSegment, DonorSegmentAnalytics, SegmentComparison as SegmentComparisonType } from '../models/donorSegments';
import donorSegmentService from '../services/donorSegmentService';
import LoadingSpinner from './LoadingSpinner';

interface SegmentComparisonProps {
  segments: DonorSegment[];
  analytics: DonorSegmentAnalytics;
}

export const SegmentComparison: React.FC<SegmentComparisonProps> = ({ segments, analytics }) => {
  const [selectedSegment1, setSelectedSegment1] = useState<string>('');
  const [selectedSegment2, setSelectedSegment2] = useState<string>('');
  const [comparison, setComparison] = useState<SegmentComparisonType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-select top 2 segments by revenue on initial load
  useEffect(() => {
    if (segments.length >= 2 && !selectedSegment1 && !selectedSegment2) {
      const sortedByRevenue = [...analytics.segmentData]
        .sort((a, b) => b.totalContributed - a.totalContributed)
        .slice(0, 2);
      
      if (sortedByRevenue.length >= 2) {
        setSelectedSegment1(sortedByRevenue[0].segmentId);
        setSelectedSegment2(sortedByRevenue[1].segmentId);
      }
    }
  }, [segments, analytics.segmentData, selectedSegment1, selectedSegment2]);

  useEffect(() => {
    if (selectedSegment1 && selectedSegment2 && selectedSegment1 !== selectedSegment2) {
      loadComparison();
    }
  }, [selectedSegment1, selectedSegment2]);

  const loadComparison = async () => {
    if (!selectedSegment1 || !selectedSegment2 || selectedSegment1 === selectedSegment2) return;

    try {
      setLoading(true);
      setError(null);
      const comparisonData = await donorSegmentService.compareSegments(selectedSegment1, selectedSegment2);
      setComparison(comparisonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  const getSegmentData = (segmentId: string) => {
    return analytics.segmentData.find(d => d.segmentId === segmentId);
  };

  const getSegmentInfo = (segmentId: string) => {
    return segments.find(s => s.id === segmentId);
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `$${num.toLocaleString()}`;
  const formatPercentage = (num: number) => `${num.toFixed(1)}%`;

  const MetricComparisonCard: React.FC<{
    title: string;
    metric: keyof SegmentComparisonType['metrics'];
    formatter: (num: number) => string;
    icon: string;
  }> = ({ title, metric, formatter, icon }) => {
    if (!comparison) return null;

    const data = comparison.metrics[metric];
    const isPositive = data.difference > 0;
    const segment1Info = getSegmentInfo(comparison.baseSegmentId);
    const segment2Info = getSegmentInfo(comparison.compareSegmentId);

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        <div className="space-y-4">
          {/* Segment 1 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {segment1Info && (
                <div className={`w-6 h-6 rounded flex items-center justify-center text-sm ${segment1Info.color}`}>
                  {segment1Info.icon}
                </div>
              )}
              <span className="font-medium text-gray-900">
                {segment1Info?.name || 'Segment 1'}
              </span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {formatter(data.base)}
            </span>
          </div>

          {/* Segment 2 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {segment2Info && (
                <div className={`w-6 h-6 rounded flex items-center justify-center text-sm ${segment2Info.color}`}>
                  {segment2Info.icon}
                </div>
              )}
              <span className="font-medium text-gray-900">
                {segment2Info?.name || 'Segment 2'}
              </span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {formatter(data.compare)}
            </span>
          </div>

          {/* Difference */}
          <div className="flex items-center justify-between p-3 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-600">Difference</span>
            <div className="text-right">
              <div className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{formatter(data.difference)}
              </div>
              <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{data.percentageDifference.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SegmentSelector: React.FC<{
    value: string;
    onChange: (value: string) => void;
    label: string;
    excludeId?: string;
  }> = ({ value, onChange, label, excludeId }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select a segment</option>
        {segments
          .filter(segment => segment.id !== excludeId)
          .map(segment => (
            <option key={segment.id} value={segment.id}>
              {segment.icon} {segment.name}
            </option>
          ))
        }
      </select>
    </div>
  );

  const ComparisonSummary: React.FC = () => {
    if (!comparison) return null;

    const segment1Info = getSegmentInfo(comparison.baseSegmentId);
    const segment2Info = getSegmentInfo(comparison.compareSegmentId);
    const segment1Data = getSegmentData(comparison.baseSegmentId);
    const segment2Data = getSegmentData(comparison.compareSegmentId);

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Segment 1 Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              {segment1Info && (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${segment1Info.color}`}>
                  {segment1Info.icon}
                </div>
              )}
              <h4 className="font-medium text-gray-900">{segment1Info?.name}</h4>
            </div>
            {segment1Data && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Donors:</span>
                  <span className="font-medium">{formatNumber(segment1Data.donorCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(segment1Data.totalContributed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Gift:</span>
                  <span className="font-medium">{formatCurrency(segment1Data.averageGiftSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Retention:</span>
                  <span className="font-medium">{formatPercentage(segment1Data.retentionRate)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Segment 2 Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              {segment2Info && (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${segment2Info.color}`}>
                  {segment2Info.icon}
                </div>
              )}
              <h4 className="font-medium text-gray-900">{segment2Info?.name}</h4>
            </div>
            {segment2Data && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Donors:</span>
                  <span className="font-medium">{formatNumber(segment2Data.donorCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(segment2Data.totalContributed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Gift:</span>
                  <span className="font-medium">{formatCurrency(segment2Data.averageGiftSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Retention:</span>
                  <span className="font-medium">{formatPercentage(segment2Data.retentionRate)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Key Insights */}
        {comparison.insights.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Key Insights</h4>
            <div className="space-y-2">
              {comparison.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {comparison.recommendations.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Recommendations</h4>
            <div className="space-y-3">
              {comparison.recommendations.map((recommendation, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-600 mt-0.5">💡</div>
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Selectors */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Compare Donor Segments</h3>
            <p className="text-gray-600">Analyze performance differences between segments</p>
          </div>
          
          <button
            onClick={loadComparison}
            disabled={!selectedSegment1 || !selectedSegment2 || selectedSegment1 === selectedSegment2 || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? 'Comparing...' : 'Update Comparison'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SegmentSelector
            value={selectedSegment1}
            onChange={setSelectedSegment1}
            label="Base Segment"
            excludeId={selectedSegment2}
          />
          <SegmentSelector
            value={selectedSegment2}
            onChange={setSelectedSegment2}
            label="Compare To"
            excludeId={selectedSegment1}
          />
        </div>

        {selectedSegment1 === selectedSegment2 && selectedSegment1 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">Please select two different segments to compare.</p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="md" text="Comparing segments..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && !loading && (
        <>
          {/* Summary */}
          <ComparisonSummary />

          {/* Metric Comparisons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricComparisonCard
              title="Donor Count"
              metric="donorCount"
              formatter={formatNumber}
              icon="👥"
            />
            
            <MetricComparisonCard
              title="Average Gift Size"
              metric="averageGift"
              formatter={formatCurrency}
              icon="💰"
            />
            
            <MetricComparisonCard
              title="Retention Rate"
              metric="retentionRate"
              formatter={formatPercentage}
              icon="🔄"
            />
            
            <MetricComparisonCard
              title="Engagement Score"
              metric="engagementScore"
              formatter={(num) => num.toFixed(0)}
              icon="📈"
            />
          </div>
        </>
      )}

      {/* Empty State */}
      {!selectedSegment1 || !selectedSegment2 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚖️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select Segments to Compare</h3>
          <p className="text-gray-600">
            Choose two different segments to see detailed performance comparisons and insights.
          </p>
        </div>
      ) : null}
    </div>
  );
};
