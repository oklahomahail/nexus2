import React, { useState, useMemo } from "react";

import Button from "@/components/ui-kit/Button";
import { PageHeading } from "@/components/ui-kit/PageHeading";
import { SectionBlock } from "@/components/ui-kit/SectionBlock";

import {
  DEFAULT_SEGMENT_CATALOG,
  BehavioralSegment,
  getSegmentsByCategory,
} from "../services/campaignComposer/defaultSegmentCatalog";

interface SegmentAnalytics {
  segmentId: string;
  donorCount: number;
  avgEngagementScore: number;
  lastCampaignResponseRate?: number;
  trend: "up" | "down" | "stable";
}

interface SegmentationOverviewPanelProps {
  campaignId?: string;
  onSelectSegment?: (segmentId: string) => void;
  onCreateSegment?: () => void;
}

/**
 * Segmentation Overview Panel
 *
 * Dashboard showing all available segments with analytics and management tools.
 * Displays donor counts, engagement trends, overlap analysis, and performance metrics.
 */
export function SegmentationOverviewPanel({
  campaignId,
  onSelectSegment,
  onCreateSegment,
}: SegmentationOverviewPanelProps): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | BehavioralSegment["category"]
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock analytics data - in production, fetch from Supabase
  const mockAnalytics: SegmentAnalytics[] = useMemo(
    () =>
      DEFAULT_SEGMENT_CATALOG.map((seg) => ({
        segmentId: seg.segmentId,
        donorCount: Math.floor(Math.random() * 5000) + 100,
        avgEngagementScore: Math.random() * 100,
        lastCampaignResponseRate: Math.random() * 10,
        trend: (["up", "down", "stable"] as const)[
          Math.floor(Math.random() * 3)
        ],
      })),
    [],
  );

  const segments = useMemo(() => {
    if (selectedCategory === "all") {
      return DEFAULT_SEGMENT_CATALOG;
    }
    return getSegmentsByCategory(selectedCategory);
  }, [selectedCategory]);

  const totalDonors = useMemo(
    () => mockAnalytics.reduce((sum, a) => sum + a.donorCount, 0),
    [mockAnalytics],
  );

  const getAnalytics = (segmentId: string): SegmentAnalytics | undefined => {
    return mockAnalytics.find((a) => a.segmentId === segmentId);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const getCategoryLabel = (
    category: BehavioralSegment["category"],
  ): string => {
    const labels: Record<BehavioralSegment["category"], string> = {
      donor_status: "Donor Status",
      engagement: "Engagement",
      giving_pattern: "Giving Pattern",
      channel_preference: "Channel Preference",
    };
    return labels[category];
  };

  const getTrendIcon = (trend: "up" | "down" | "stable"): string => {
    return trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  };

  const getTrendColor = (trend: "up" | "down" | "stable"): string => {
    return trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-gray-600";
  };

  return (
    <div className="px-8 py-10 editorial-flow">
      {/* Header */}
      <PageHeading
        title="Segment Management"
        subtitle="Manage donor segments and analyze engagement patterns"
        actions={
          <Button variant="primary" onClick={onCreateSegment}>
            + New Segment
          </Button>
        }
      />

      {/* Summary Stats */}
      <SectionBlock title="Overview">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="text-sm font-medium text-blue-900">
              Total Segments
            </div>
            <div className="mt-2 text-3xl font-semibold text-blue-700">
              {DEFAULT_SEGMENT_CATALOG.length}
            </div>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <div className="text-sm font-medium text-green-900">
              Total Donors
            </div>
            <div className="mt-2 text-3xl font-semibold text-green-700">
              {formatNumber(totalDonors)}
            </div>
            <div className="mt-1 text-xs text-green-600">
              Across all segments
            </div>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <div className="text-sm font-medium text-purple-900">
              Active Campaigns
            </div>
            <div className="mt-2 text-3xl font-semibold text-purple-700">
              {campaignId ? "1" : "0"}
            </div>
          </div>
          <div className="rounded-lg bg-orange-50 p-4">
            <div className="text-sm font-medium text-orange-900">
              Avg Response Rate
            </div>
            <div className="mt-2 text-3xl font-semibold text-orange-700">
              {formatPercentage(
                mockAnalytics.reduce(
                  (sum, a) => sum + (a.lastCampaignResponseRate || 0),
                  0,
                ) / mockAnalytics.length,
              )}
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* Filters & View Toggle */}
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Category Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                selectedCategory === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory("donor_status")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                selectedCategory === "donor_status"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Donor Status
            </button>
            <button
              onClick={() => setSelectedCategory("giving_pattern")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                selectedCategory === "giving_pattern"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Giving Pattern
            </button>
            <button
              onClick={() => setSelectedCategory("engagement")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                selectedCategory === "engagement"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Engagement
            </button>
            <button
              onClick={() => setSelectedCategory("channel_preference")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                selectedCategory === "channel_preference"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Channel
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex space-x-1 rounded-md bg-gray-100 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded px-3 py-1 text-sm font-medium ${
                viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded px-3 py-1 text-sm font-medium ${
                viewMode === "list" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Segments Display */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {segments.map((segment) => {
              const analytics = getAnalytics(segment.segmentId);
              return (
                <div
                  key={segment.segmentId}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  onClick={() => onSelectSegment?.(segment.segmentId)}
                >
                  {/* Segment Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {segment.name}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {getCategoryLabel(segment.category)}
                      </p>
                    </div>
                    {segment.isDefault && (
                      <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        Default
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-sm text-gray-600">
                    {segment.description}
                  </p>

                  {/* Analytics */}
                  {analytics && (
                    <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Donor Count
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatNumber(analytics.donorCount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Engagement
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPercentage(analytics.avgEngagementScore)}
                        </span>
                      </div>
                      {analytics.lastCampaignResponseRate !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Response Rate
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatPercentage(
                                analytics.lastCampaignResponseRate,
                              )}
                            </span>
                            <span
                              className={`text-sm ${getTrendColor(analytics.trend)}`}
                            >
                              {getTrendIcon(analytics.trend)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Criteria Preview */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(segment.criteria).map(([key, value]) => (
                      <span
                        key={key}
                        className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Segment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Donors
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Response Rate
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {segments.map((segment) => {
                  const analytics = getAnalytics(segment.segmentId);
                  return (
                    <tr
                      key={segment.segmentId}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => onSelectSegment?.(segment.segmentId)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {segment.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {segment.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getCategoryLabel(segment.category)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {analytics && formatNumber(analytics.donorCount)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {analytics &&
                          formatPercentage(analytics.avgEngagementScore)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {analytics?.lastCampaignResponseRate !== undefined &&
                          formatPercentage(analytics.lastCampaignResponseRate)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {analytics && (
                          <span
                            className={`text-sm ${getTrendColor(analytics.trend)}`}
                          >
                            {getTrendIcon(analytics.trend)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
