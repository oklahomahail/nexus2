import React from 'react';
import { DonorSegmentAnalytics } from '../models/donorSegments';

interface SegmentOverviewCardsProps {
  analytics: DonorSegmentAnalytics;
}

export const SegmentOverviewCards: React.FC<SegmentOverviewCardsProps> = ({ analytics }) => {
  const { segmentData, totalDonors, totalContributed, crossSegmentInsights } = analytics;

  const activeSegments = segmentData.length;
  const averageGiftSize = totalDonors > 0 ? totalContributed / totalDonors : 0;
  const totalRetentionRate = segmentData.reduce((sum, segment) => sum + segment.retentionRate, 0) / segmentData.length;
  const averageEngagement = segmentData.reduce((sum, segment) => sum + segment.engagementScore, 0) / segmentData.length;

  // Find highest performing segments
  const highestRevenue = segmentData.reduce((max, segment) => 
    segment.totalContributed > max.totalContributed ? segment : max
  , segmentData[0]);

  const highestRetention = segmentData.reduce((max, segment) => 
    segment.retentionRate > max.retentionRate ? segment : max
  , segmentData[0]);

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    subtext?: string;
    icon: string;
    color: string;
    trend?: {
      value: number;
      label: string;
      positive?: boolean;
    };
  }> = ({ title, value, subtext, icon, color, trend }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-lg`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            </div>
          </div>
          
          {subtext && (
            <p className="text-xs text-gray-500 mb-2">{subtext}</p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1">
              <span className={`text-sm ${trend.positive !== false ? 'text-green-600' : 'text-red-600'}`}>
                {trend.positive !== false ? '↗️' : '↘️'} {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-600">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const InsightCard: React.FC<{
    title: string;
    insights: string[];
    icon: string;
    color: string;
  }> = ({ title, insights, icon, color }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-2">
        {insights.slice(0, 3).map((insight, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <p className="text-sm text-gray-700">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Segment Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Segments"
            value={activeSegments}
            subtext="Donor categories being tracked"
            icon="👥"
            color="bg-blue-100 text-blue-600"
          />
          
          <MetricCard
            title="Total Donors"
            value={totalDonors.toLocaleString()}
            subtext="Across all segments"
            icon="🎯"
            color="bg-green-100 text-green-600"
            trend={{
              value: 12.5,
              label: "vs last period",
              positive: true
            }}
          />
          
          <MetricCard
            title="Total Contributed"
            value={`$${totalContributed.toLocaleString()}`}
            subtext="All segment contributions"
            icon="💰"
            color="bg-purple-100 text-purple-600"
            trend={{
              value: 8.3,
              label: "vs last period",
              positive: true
            }}
          />
          
          <MetricCard
            title="Average Gift Size"
            value={`$${averageGiftSize.toFixed(0)}`}
            subtext="Across all segments"
            icon="🎁"
            color="bg-orange-100 text-orange-600"
            trend={{
              value: 5.2,
              label: "vs last period",
              positive: true
            }}
          />
        </div>
      </div>

      {/* Secondary Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement & Retention</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Average Retention Rate"
            value={`${totalRetentionRate.toFixed(1)}%`}
            subtext={`Best: ${highestRetention.segmentName} (${highestRetention.retentionRate}%)`}
            icon="🔄"
            color="bg-indigo-100 text-indigo-600"
          />
          
          <MetricCard
            title="Average Engagement"
            value={`${averageEngagement.toFixed(1)}%`}
            subtext="Engagement score across segments"
            icon="📈"
            color="bg-pink-100 text-pink-600"
          />
          
          <MetricCard
            title="Top Revenue Segment"
            value={highestRevenue.segmentName}
            subtext={`$${highestRevenue.totalContributed.toLocaleString()} contributed`}
            icon="🏆"
            color="bg-yellow-100 text-yellow-600"
          />
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightCard
          title="Growth Opportunities"
          icon="📊"
          color="bg-green-100 text-green-600"
          insights={crossSegmentInsights.opportunityAnalysis
            .filter(opp => opp.opportunity === 'upgrade_potential')
            .map(opp => `${segmentData.find(s => s.segmentId === opp.segmentId)?.segmentName}: ${opp.description}`)
          }
        />
        
        <InsightCard
          title="Retention Alerts"
          icon="⚠️"
          color="bg-red-100 text-red-600"
          insights={crossSegmentInsights.opportunityAnalysis
            .filter(opp => opp.opportunity === 'retention_risk')
            .map(opp => `${segmentData.find(s => s.segmentId === opp.segmentId)?.segmentName}: ${opp.description}`)
          }
        />
      </div>

      {/* Segment Migration Flow */}
      {crossSegmentInsights.segmentMigration.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Segment Migration Trends</h3>
          <div className="space-y-3">
            {crossSegmentInsights.segmentMigration.map((migration, index) => {
              const fromSegment = segmentData.find(s => s.segmentId === migration.fromSegmentId);
              const toSegment = segmentData.find(s => s.segmentId === migration.toSegmentId);
              
              return (
                <div key={index} className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700">
                      {fromSegment?.segmentName || 'Unknown'}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700">
                      {toSegment?.segmentName || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {migration.donorCount} donors
                    </div>
                    <div className="text-xs text-gray-600">
                      {migration.timeframe}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Industry Benchmarks */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Benchmarks</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Segment Type</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Your Retention</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Industry Avg</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Performance</th>
              </tr>
            </thead>
            <tbody>
              {analytics.benchmarkData.industryAverages.map((benchmark, index) => {
                const yourSegment = segmentData.find(s => 
                  s.segmentName.toLowerCase().includes(benchmark.segmentType.toLowerCase().split(' ')[0])
                );
                const yourRetention = yourSegment?.retentionRate || 0;
                const performance = yourRetention - benchmark.averageRetentionRate;
                
                return (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-sm text-gray-900">{benchmark.segmentType}</td>
                    <td className="py-2 px-3 text-sm text-right text-gray-900">
                      {yourRetention > 0 ? `${yourRetention.toFixed(1)}%` : '-'}
                    </td>
                    <td className="py-2 px-3 text-sm text-right text-gray-600">
                      {benchmark.averageRetentionRate}%
                    </td>
                    <td className="py-2 px-3 text-sm text-right">
                      {yourRetention > 0 ? (
                        <span className={`font-medium ${
                          performance > 0 ? 'text-green-600' : performance < -5 ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {performance > 0 ? '+' : ''}{performance.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};