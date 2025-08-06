import React, { useState } from 'react';
import { DonorSegment, DonorSegmentAnalytics } from '../models/donorSegments';

interface SegmentGridProps {
  segments: DonorSegment[];
  analytics: DonorSegmentAnalytics;
  selectedSegments: string[];
  onSelectionChange: (segmentIds: string[]) => void;
}

export const SegmentGrid: React.FC<SegmentGridProps> = ({
  segments,
  analytics,
  selectedSegments,
  onSelectionChange
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'donors' | 'revenue' | 'retention' | 'engagement'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSegmentToggle = (segmentId: string) => {
    if (selectedSegments.includes(segmentId)) {
      onSelectionChange(selectedSegments.filter(id => id !== segmentId));
    } else {
      onSelectionChange([...selectedSegments, segmentId]);
    }
  };

  const sortedSegments = [...segments]
    .filter(segment => filterActive === null || segment.isActive === filterActive)
    .sort((a, b) => {
      const aData = analytics.segmentData.find(d => d.segmentId === a.id);
      const bData = analytics.segmentData.find(d => d.segmentId === b.id);
      
      if (!aData || !bData) return 0;

      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'donors':
          aValue = aData.donorCount;
          bValue = bData.donorCount;
          break;
        case 'revenue':
          aValue = aData.totalContributed;
          bValue = bData.totalContributed;
          break;
        case 'retention':
          aValue = aData.retentionRate;
          bValue = bData.retentionRate;
          break;
        case 'engagement':
          aValue = aData.engagementScore;
          bValue = bData.engagementScore;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

  const SegmentCard: React.FC<{ segment: DonorSegment }> = ({ segment }) => {
    const data = analytics.segmentData.find(d => d.segmentId === segment.id);
    const isSelected = selectedSegments.includes(segment.id);

    if (!data) return null;

    return (
      <div 
        className={`bg-white rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => handleSegmentToggle(segment.id)}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${segment.color}`}>
                {segment.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{segment.name}</h3>
                <p className="text-sm text-gray-600">{segment.description}</p>
              </div>
            </div>
            {isSelected && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.donorCount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Donors</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${data.totalContributed.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Contributed</p>
            </div>
          </div>

          {/* Performance Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Retention Rate</span>
                <span className="font-medium">{data.retentionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${data.retentionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Engagement Score</span>
                <span className="font-medium">{data.engagementScore.toFixed(0)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${data.engagementScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg. Gift</span>
              <span className="font-medium">${data.averageGiftSize.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Growth Rate</span>
              <span className={`font-medium ${data.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.growthRate >= 0 ? '+' : ''}{data.growthRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Channel Performance */}
          {data.giftPatterns.channelPreferences.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Top Channels</p>
              <div className="space-y-1">
                {data.giftPatterns.channelPreferences
                  .sort((a, b) => b.percentage - a.percentage)
                  .slice(0, 2)
                  .map((channel, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-600">{channel.channel}</span>
                      <span className="font-medium">{channel.percentage}%</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filterActive === null ? 'all' : filterActive ? 'active' : 'inactive'}
              onChange={(e) => setFilterActive(
                e.target.value === 'all' ? null : e.target.value === 'active'
              )}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Segments</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="name">Name</option>
              <option value="donors">Donor Count</option>
              <option value="revenue">Total Revenue</option>
              <option value="retention">Retention Rate</option>
              <option value="engagement">Engagement</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 text-gray-600 hover:text-gray-900"
            >
              <svg 
                className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {selectedSegments.length > 0 && `${selectedSegments.length} selected • `}
          {sortedSegments.length} segments
        </div>
      </div>

      {/* Selection Actions */}
      {selectedSegments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              {selectedSegments.length} segment{selectedSegments.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {/* Handle compare action */}}
                disabled={selectedSegments.length !== 2}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Compare
              </button>
              <button
                onClick={() => onSelectionChange([])}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSegments.map(segment => (
          <SegmentCard key={segment.id} segment={segment} />
        ))}
      </div>

      {sortedSegments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No segments found</h3>
          <p className="text-gray-600">
            {filterActive !== null 
              ? 'Try adjusting your filters to see more segments.'
              : 'Create your first donor segment to get started.'
            }
          </p>
        </div>
      )}
    </div>
  );
};