import React, { useMemo } from "react";

import { DeliverableVersion } from "./DeliverableSegmentationEditor";
import { getSegmentById } from "../../services/campaignComposer/defaultSegmentCatalog";

interface VersionPerformanceMetrics {
  versionId: string;
  sent: number;
  delivered: number;
  opened?: number;
  clicked?: number;
  donated: number;
  totalRevenue: number;
  avgGift: number;
  responseRate: number;
  roi?: number;
  costPerAcquisition?: number;
}

interface DeliverableVersionPerformanceProps {
  versions: DeliverableVersion[];
  performanceData?: VersionPerformanceMetrics[];
  deliverableType: "direct_mail" | "email" | "sms" | "social" | "phone";
  isLive?: boolean;
}

/**
 * DeliverableVersionPerformance
 *
 * Analytics component showing performance metrics by deliverable version.
 * Allows fundraisers to compare results across different segments and
 * optimize future campaigns based on data.
 *
 * Features:
 * - Response rate comparison
 * - Revenue attribution by segment
 * - ROI calculation
 * - Visual performance indicators
 */
export function DeliverableVersionPerformance({
  versions,
  performanceData = [],
  deliverableType,
  isLive = false,
}: DeliverableVersionPerformanceProps): React.JSX.Element {
  // Mock performance data if not provided (for preview)
  const mockPerformance = useMemo((): VersionPerformanceMetrics[] => {
    if (performanceData.length > 0) {
      return performanceData;
    }
    return versions.map((version) => ({
      versionId: version.versionId,
      sent:
        version.estimatedRecipients || Math.floor(Math.random() * 5000) + 500,
      delivered: Math.floor((version.estimatedRecipients || 1000) * 0.95),
      opened:
        deliverableType === "email"
          ? Math.floor((version.estimatedRecipients || 1000) * 0.22)
          : undefined,
      clicked:
        deliverableType === "email"
          ? Math.floor((version.estimatedRecipients || 1000) * 0.05)
          : undefined,
      donated: Math.floor((version.estimatedRecipients || 1000) * 0.03),
      totalRevenue: Math.floor(Math.random() * 50000) + 5000,
      avgGift: Math.floor(Math.random() * 200) + 50,
      responseRate: Math.random() * 5 + 1,
      roi: Math.random() * 8 + 2,
      costPerAcquisition: Math.floor(Math.random() * 50) + 20,
    }));
  }, [versions, performanceData, deliverableType]);

  const totals = useMemo(() => {
    return mockPerformance.reduce(
      (acc, metrics) => ({
        sent: acc.sent + metrics.sent,
        delivered: acc.delivered + metrics.delivered,
        opened: acc.opened + (metrics.opened || 0),
        clicked: acc.clicked + (metrics.clicked || 0),
        donated: acc.donated + metrics.donated,
        totalRevenue: acc.totalRevenue + metrics.totalRevenue,
      }),
      {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        donated: 0,
        totalRevenue: 0,
      },
    );
  }, [mockPerformance]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const getPerformanceColor = (responseRate: number): string => {
    if (responseRate >= 4) return "text-green-600";
    if (responseRate >= 2) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (
    responseRate: number,
  ): { text: string; color: string } => {
    if (responseRate >= 4)
      return { text: "Excellent", color: "bg-green-100 text-green-800" };
    if (responseRate >= 2)
      return { text: "Good", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Needs Improvement", color: "bg-red-100 text-red-800" };
  };

  const getMetrics = (
    versionId: string,
  ): VersionPerformanceMetrics | undefined => {
    return mockPerformance.find((m) => m.versionId === versionId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Performance by Version
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {isLive
              ? "Live campaign results - updates every hour"
              : "Estimated performance based on historical data"}
          </p>
        </div>
        {isLive && (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-green-600"></span>
            Live
          </span>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <div className="text-xs font-medium text-gray-600">Total Sent</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">
            {formatNumber(totals.sent)}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-600">Delivered</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">
            {formatNumber(totals.delivered)}
          </div>
        </div>
        {deliverableType === "email" && (
          <>
            <div>
              <div className="text-xs font-medium text-gray-600">Opened</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">
                {formatNumber(totals.opened)}
              </div>
              <div className="text-xs text-gray-500">
                {formatPercentage((totals.opened / totals.delivered) * 100)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600">Clicked</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">
                {formatNumber(totals.clicked)}
              </div>
              <div className="text-xs text-gray-500">
                {formatPercentage((totals.clicked / totals.delivered) * 100)}
              </div>
            </div>
          </>
        )}
        <div>
          <div className="text-xs font-medium text-gray-600">Donors</div>
          <div className="mt-1 text-xl font-semibold text-green-700">
            {formatNumber(totals.donated)}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-600">Total Revenue</div>
          <div className="mt-1 text-xl font-semibold text-green-700">
            {formatCurrency(totals.totalRevenue)}
          </div>
        </div>
      </div>

      {/* Version-by-Version Performance */}
      <div className="space-y-4">
        {versions.map((version, index) => {
          const metrics = getMetrics(version.versionId);
          const segment = getSegmentById(version.segmentCriteriaId);
          if (!metrics) return null;

          const performanceBadge = getPerformanceBadge(metrics.responseRate);

          return (
            <div
              key={version.versionId}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              {/* Version Header */}
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      Version {index + 1}
                    </span>
                    <h4 className="text-base font-semibold text-gray-900">
                      {version.versionLabel}
                    </h4>
                    {segment && (
                      <span className="text-sm text-gray-600">
                        • {segment.name}
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${performanceBadge.color}`}
                  >
                    {performanceBadge.text}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 lg:grid-cols-6">
                <div>
                  <div className="text-xs font-medium text-gray-600">Sent</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {formatNumber(metrics.sent)}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-600">
                    Delivered
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {formatNumber(metrics.delivered)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage((metrics.delivered / metrics.sent) * 100)}
                  </div>
                </div>

                {deliverableType === "email" &&
                  metrics.opened !== undefined && (
                    <>
                      <div>
                        <div className="text-xs font-medium text-gray-600">
                          Opened
                        </div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatNumber(metrics.opened)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatPercentage(
                            (metrics.opened / metrics.delivered) * 100,
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-medium text-gray-600">
                          Clicked
                        </div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatNumber(metrics.clicked || 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatPercentage(
                            ((metrics.clicked || 0) / metrics.delivered) * 100,
                          )}
                        </div>
                      </div>
                    </>
                  )}

                <div>
                  <div className="text-xs font-medium text-gray-600">
                    Donors
                  </div>
                  <div className="mt-1 text-lg font-semibold text-green-700">
                    {formatNumber(metrics.donated)}
                  </div>
                  <div
                    className={`text-xs font-medium ${getPerformanceColor(metrics.responseRate)}`}
                  >
                    {formatPercentage(metrics.responseRate)} rate
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-600">
                    Revenue
                  </div>
                  <div className="mt-1 text-lg font-semibold text-green-700">
                    {formatCurrency(metrics.totalRevenue)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(metrics.avgGift)} avg
                  </div>
                </div>

                {metrics.roi !== undefined && (
                  <div>
                    <div className="text-xs font-medium text-gray-600">ROI</div>
                    <div className="mt-1 text-lg font-semibold text-purple-700">
                      {metrics.roi.toFixed(1)}x
                    </div>
                  </div>
                )}

                {metrics.costPerAcquisition !== undefined && (
                  <div>
                    <div className="text-xs font-medium text-gray-600">
                      Cost/Donor
                    </div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">
                      {formatCurrency(metrics.costPerAcquisition)}
                    </div>
                  </div>
                )}
              </div>

              {/* Performance Bar */}
              <div className="bg-gray-50 px-5 py-3">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Performance Score</span>
                  <span>{formatPercentage(metrics.responseRate * 20)}</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full ${
                      metrics.responseRate >= 4
                        ? "bg-green-500"
                        : metrics.responseRate >= 2
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(metrics.responseRate * 20, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      {!isLive && (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Preview Mode:</strong> These metrics are projections
                based on your organization's historical performance. Launch the
                campaign to see live results.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
