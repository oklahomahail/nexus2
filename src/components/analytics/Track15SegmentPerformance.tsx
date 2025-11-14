/**
 * Track15 Segment Performance Component
 *
 * Shows performance metrics broken down by donor segment
 * Key Track15 segments: current, lapsed, high value, prospects, monthly
 */

import React from "react";
import { Users, DollarSign, TrendingUp, Percent } from "lucide-react";
import { DonorSegment, SEGMENT_DEFINITIONS } from "@/types/track15.types";

export interface SegmentPerformanceData {
  segment: DonorSegment;
  donorCount: number;
  totalGifts: number;
  avgGiftSize: number;
  responseRate: number;
  conversionRate: number;
  retentionRate?: number;
}

interface Track15SegmentPerformanceProps {
  segments: SegmentPerformanceData[];
  loading?: boolean;
}

export default function Track15SegmentPerformance({
  segments,
  loading = false,
}: Track15SegmentPerformanceProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals for comparison
  const totals = segments.reduce(
    (acc, seg) => ({
      donors: acc.donors + seg.donorCount,
      gifts: acc.gifts + seg.totalGifts,
    }),
    { donors: 0, gifts: 0 }
  );

  const sortedSegments = [...segments].sort((a, b) => b.totalGifts - a.totalGifts);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Donor Segment Performance
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Track15 segmentation analysis
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Total Donors
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totals.donors.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Across {segments.length} segments
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Total Gifts
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${totals.gifts.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Campaign to date
          </div>
        </div>
      </div>

      {/* Segment Breakdown */}
      <div className="space-y-3">
        {sortedSegments.map((segment) => {
          const segmentInfo = SEGMENT_DEFINITIONS[segment.segment];
          const donorPercentage = (segment.donorCount / totals.donors) * 100;
          const giftPercentage = (segment.totalGifts / totals.gifts) * 100;

          return (
            <div
              key={segment.segment}
              className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              {/* Segment Name and Description */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {segmentInfo.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {segmentInfo.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    ${segment.totalGifts.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {giftPercentage.toFixed(1)}% of total
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                    style={{ width: `${giftPercentage}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Donors
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {segment.donorCount}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {donorPercentage.toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Avg Gift
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${segment.avgGiftSize.toFixed(0)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Percent className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Response
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {segment.responseRate.toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Conversion
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {segment.conversionRate.toFixed(1)}%
                  </div>
                </div>

                {segment.retentionRate !== undefined && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Retention
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {segment.retentionRate.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Track15 Segment Insights
          </h4>
          <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
            {sortedSegments.length > 0 && (
              <>
                <p>
                  • <strong>{SEGMENT_DEFINITIONS[sortedSegments[0].segment].name}</strong>{" "}
                  is your top performing segment (
                  {((sortedSegments[0].totalGifts / totals.gifts) * 100).toFixed(1)}% of
                  revenue)
                </p>
                {sortedSegments.find((s) => s.segment === "lapsed_donors") && (
                  <p>
                    • Lapsed donors:{" "}
                    {
                      sortedSegments.find((s) => s.segment === "lapsed_donors")
                        ?.donorCount
                    }{" "}
                    donors - opportunity for reactivation campaigns
                  </p>
                )}
                {sortedSegments.find((s) => s.segment === "monthly_supporters") && (
                  <p>
                    • Monthly giving: $
                    {sortedSegments
                      .find((s) => s.segment === "monthly_supporters")
                      ?.totalGifts.toLocaleString()}{" "}
                    in predictable revenue
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
