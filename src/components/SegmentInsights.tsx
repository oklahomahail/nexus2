import React from 'react';
import { DonorSegmentAnalytics, DonorSegment } from '../models/donorSegments';

interface SegmentInsightsProps {
  analytics: DonorSegmentAnalytics;
  segments: DonorSegment[];
}

export const SegmentInsights: React.FC<SegmentInsightsProps> = ({ analytics, segments }) => {
  const { crossSegmentInsights, segmentData } = analytics;

  const getSegmentName = (segmentId: string) => {
    return segments.find(s => s.id === segmentId)?.name || 'Unknown Segment';
  };

  const OpportunityCard: React.FC<{
    title: string;
    opportunities: typeof crossSegmentInsights.opportunityAnalysis;
    icon: string;
    color: string;
    emptyMessage: string;
  }> = ({ title, opportunities, icon, color, emptyMessage }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      {opportunities.length === 0 ? (
        <p className="text-gray-600 text-sm">{emptyMessage}</p>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opportunity, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {getSegmentName(opportunity.segmentId)}
                </h4>
                <span className="text-sm font-medium text-green-600">
                  ${opportunity.estimatedImpact.toLocaleString()} potential
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-3">{opportunity.description}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium">💡 Recommendation:</p>
                <p className="text-sm text-blue-700 mt-1">{opportunity.actionRecommendation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const MigrationFlow: React.FC = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
          🔄
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Donor Movement Patterns</h3>
      </div>
      
      {crossSegmentInsights.segmentMigration.length === 0 ? (
        <p className="text-gray-600 text-sm">No significant segment migration detected in the current period.</p>
      ) : (
        <div className="space-y-4">
          {crossSegmentInsights.segmentMigration.map((migration, index) => {
            const fromSegment = segmentData.find(s => s.segmentId === migration.fromSegmentId);
            const toSegment = segmentData.find(s => s.segmentId === migration.toSegmentId);
            
            return (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {getSegmentName(migration.fromSegmentId)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {fromSegment?.donorCount.toLocaleString()} donors
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <div className="text-xs text-gray-600 mt-1">
                      {migration.donorCount} moved
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {getSegmentName(migration.toSegmentId)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {toSegment?.donorCount.toLocaleString()} donors
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{migration.timeframe}</div>
                  {fromSegment && toSegment && (
                    <div className="text-xs text-gray-600">
                      Avg gift: ${fromSegment.averageGiftSize} → ${toSegment.averageGiftSize}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Migration Insights:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Positive migration patterns suggest effective donor stewardship</li>
              <li>• Monitor segments with high outflow for retention opportunities</li>
              <li>• Use successful migration paths as models for other segments</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const TopPerformers: React.FC = () => {
    const topByRevenue = crossSegmentInsights.topPerformingSegments
      .filter(s => s.metric === 'total_revenue')
      .slice(0, 3);
    
    const topByRetention = crossSegmentInsights.topPerformingSegments
      .filter(s => s.metric === 'retention_rate')
      .slice(0, 3);

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
            🏆
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Segments</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Highest Revenue</h4>
            <div className="space-y-2">
              {topByRevenue.map((segment, index) => (
                <div key={segment.segmentId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === 0 ? 'bg-yellow-200 text-yellow-800' :
                      index === 1 ? 'bg-gray-200 text-gray-800' :
                      'bg-orange-200 text-orange-800'
                    }`}>
                      {segment.rank}
                    </div>
                    <span className="text-sm font-medium">{segment.segmentName}</span>
                  </div>
                  <span className="text-sm text-gray-600">${segment.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Best Retention</h4>
            <div className="space-y-2">
              {topByRetention.map((segment, index) => (
                <div key={segment.segmentId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === 0 ? 'bg-green-200 text-green-800' :
                      index === 1 ? 'bg-blue-200 text-blue-800' :
                      'bg-purple-200 text-purple-800'
                    }`}>
                      {segment.rank}
                    </div>
                    <span className="text-sm font-medium">{segment.segmentName}</span>
                  </div>
                  <span className="text-sm text-gray-600">{segment.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StrategicRecommendations: React.FC = () => {
    const recommendations = [
      {
        category: 'Revenue Growth',
        items: [
          'Focus upgrade campaigns on high-engagement, low-gift segments',
          'Implement mid-level donor program for $250-$999 range',
          'Create exclusive events for major gift prospects'
        ]
      },
      {
        category: 'Retention Improvement',
        items: [
          'Develop targeted stewardship for at-risk segments',
          'Implement monthly touchpoints for new donors',
          'Create reactivation campaigns for lapsed donors'
        ]
      },
      {
        category: 'Segmentation Optimization',
        items: [
          'Consider splitting large segments for better targeting',
          'Create sub-segments based on engagement patterns',
          'Review and update segment criteria quarterly'
        ]
      }
    ];

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            🎯
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Strategic Recommendations</h3>
        </div>
        
        <div className="space-y-6">
          {recommendations.map((category, index) => (
            <div key={index}>
              <h4 className="text-sm font-medium text-gray-900 mb-3">{category.category}</h4>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h4 className="text-sm font-medium text-indigo-800 mb-2">📈 Next Steps:</h4>
          <p className="text-sm text-indigo-700">
            Prioritize retention improvements for your lowest-performing segments while developing 
            upgrade strategies for high-engagement donors. Review segment performance monthly and 
            adjust strategies based on results.
          </p>
        </div>
      </div>
    );
  };

  const upgradeOpportunities = crossSegmentInsights.opportunityAnalysis
    .filter(opp => opp.opportunity === 'upgrade_potential');
  
  const retentionRisks = crossSegmentInsights.opportunityAnalysis
    .filter(opp => opp.opportunity === 'retention_risk');

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <TopPerformers />
      
      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OpportunityCard
          title="Upgrade Opportunities"
          opportunities={upgradeOpportunities}
          icon="📈"
          color="bg-green-100 text-green-600"
          emptyMessage="No upgrade opportunities identified at this time. Continue monitoring engagement metrics for potential prospects."
        />
        
        <OpportunityCard
          title="Retention Risks"
          opportunities={retentionRisks}
          icon="⚠️"
          color="bg-red-100 text-red-600"
          emptyMessage="No immediate retention risks detected. Your donor retention strategies appear to be working well."
        />
      </div>
      
      {/* Migration Patterns */}
      <MigrationFlow />
      
      {/* Strategic Recommendations */}
      <StrategicRecommendations />
    </div>
  );
};