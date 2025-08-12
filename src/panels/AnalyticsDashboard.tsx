// src/panels/AnalyticsDashboard.tsx
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  Users,
  Target,
  DollarSign,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useClient } from "@/context/ClientContext";
import type {
  CampaignAnalytics,
  OrganizationAnalytics,
  _DonorInsights,
  AnalyticsFilters,
} from "@/models/analytics";
import analyticsService from "@/services/analyticsService";

interface AnalyticsTimeRange {
  start: Date;
  end: Date;
  label: string;
}

const AnalyticsDashboard: React.FC = () => {
  const { currentClient } = useClient();
  const { id: clientId } = useParams();
  const location = useLocation();

  // Client-scoped if the URL path contains /client/
  const isClientScoped = location.pathname.includes("/client/");
  const effectiveClientId = isClientScoped
    ? clientId || currentClient?.id
    : undefined;

  const [campaignAnalytics, setCampaignAnalytics] =
    useState<CampaignAnalytics | null>(null);
  const [orgAnalytics, setOrgAnalytics] =
    useState<OrganizationAnalytics | null>(null);
  const [donorInsights, setDonorInsights] = useState<_DonorInsights | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<AnalyticsTimeRange | null>(null);
  const [exporting, setExporting] = useState(false);

  // Predefined time ranges
  const timeRanges = useMemo<AnalyticsTimeRange[]>(() => {
    const now = new Date();
    return [
      {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
        label: "This Month",
      },
      {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0),
        label: "Last Month",
      },
      {
        start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0),
        label: "Last 3 Months",
      },
      {
        start: new Date(now.getFullYear(), 0, 1),
        end: now,
        label: "Year to Date",
      },
    ];
  }, []);

  useEffect(() => {
    if (!selectedTimeRange && timeRanges.length > 0) {
      setSelectedTimeRange(timeRanges[0]);
    }
  }, [timeRanges, selectedTimeRange]);

  useEffect(() => {
    if (selectedTimeRange) {
      void loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveClientId, selectedTimeRange]);

  async function loadAnalytics() {
    if (!selectedTimeRange) return;

    try {
      setLoading(true);
      setError(null);

      const filters: AnalyticsFilters = {
        dateRange: {
          startDate: selectedTimeRange.start.toISOString().split("T")[0],
          endDate: selectedTimeRange.end.toISOString().split("T")[0],
        },
      };

      if (effectiveClientId) {
        // Client-scoped: load a representative campaign analytics (adjust when you add real client rollups)
        const data = await analyticsService.getCampaignAnalytics(
          "sample-campaign",
          filters,
        );
        setCampaignAnalytics(data);
        setOrgAnalytics(null);
        setDonorInsights(null);
      } else {
        // Organization-wide view
        const [orgData, donorData] = await Promise.all([
          analyticsService.getOrganizationAnalytics(filters),
          analyticsService.getDonorInsights(filters),
        ]);
        setOrgAnalytics(orgData);
        setDonorInsights(donorData);
        setCampaignAnalytics(null);
      }
    } catch (err: any) {
      console.error("Failed to load analytics:", err);
      setError(err?.message ?? "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(format: "csv" | "json") {
    try {
      setExporting(true);

      const filters: AnalyticsFilters | undefined = selectedTimeRange
        ? {
            dateRange: {
              startDate: selectedTimeRange.start.toISOString().split("T")[0],
              endDate: selectedTimeRange.end.toISOString().split("T")[0],
            },
          }
        : undefined;

      const scope = effectiveClientId ? "campaign" : "organization";
      const dataUri = await analyticsService.exportAnalyticsData(
        scope,
        filters,
      );

      if (!dataUri || !dataUri.startsWith("data:")) {
        throw new Error("Invalid export data format");
      }

      const a = document.createElement("a");
      a.href = dataUri;
      a.download = `${scope}-analytics.${format === "csv" ? "csv" : "json"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Failed to export data");
    } finally {
      setExporting(false);
    }
  }

  if (!selectedTimeRange) {
    return <LoadingSpinner size="lg" />;
  }

  if (isClientScoped && !effectiveClientId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Select a Client
          </h3>
          <p className="text-slate-400">
            Choose a client from the switcher above to view their analytics.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-slate-400">Loading analytics…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6">
        <h3 className="text-red-400 font-medium mb-2">
          Error Loading Analytics
        </h3>
        <p className="text-red-300 text-sm mb-4">{error}</p>
        <button
          onClick={() => void loadAnalytics()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {effectiveClientId
              ? `${currentClient?.name ?? "Client"} Analytics`
              : "Organization Analytics"}
          </h1>
          <p className="text-slate-400">
            {effectiveClientId
              ? `Performance insights for ${currentClient?.name ?? "this client"}`
              : "Organization-wide performance insights and reports"}
          </p>

          <div className="mt-3 flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${effectiveClientId ? "bg-blue-400" : "bg-purple-400"}`}
            />
            <span
              className={`text-sm font-medium ${effectiveClientId ? "text-blue-400" : "text-purple-400"}`}
            >
              {effectiveClientId
                ? "Client-scoped view"
                : "Organization-wide view"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            {(() => {
              const idx = Math.max(
                0,
                timeRanges.findIndex(
                  (r) => r.label === selectedTimeRange.label,
                ),
              );
              return (
                <select
                  value={idx}
                  onChange={(e) =>
                    setSelectedTimeRange(
                      timeRanges[parseInt(e.target.value, 10)],
                    )
                  }
                  className="pl-9 pr-8 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                >
                  {timeRanges.map((range, index) => (
                    <option key={`timerange-${index}`} value={index}>
                      {range.label}
                    </option>
                  ))}
                </select>
              );
            })()}
          </div>

          {/* Export Button */}
          <button
            onClick={() => void handleExport("csv")}
            disabled={exporting}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? "Exporting…" : "Export CSV"}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => void loadAnalytics()}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Client-scoped Campaign Analytics */}
      {campaignAnalytics && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">
                  Total Raised
                </h3>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                $
                {campaignAnalytics.fundraisingMetrics.totalRaised.toLocaleString()}
              </div>
              <p className="text-slate-400 text-sm">
                {campaignAnalytics.fundraisingMetrics.completionRate}% of $
                {campaignAnalytics.fundraisingMetrics.goalAmount.toLocaleString()}{" "}
                goal
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">Donors</h3>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {campaignAnalytics.fundraisingMetrics.donorCount.toLocaleString()}
              </div>
              <p className="text-slate-400 text-sm">
                {campaignAnalytics.fundraisingMetrics.repeatDonorRate.toFixed(
                  1,
                )}
                % repeat donors
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">
                  Avg Gift Size
                </h3>
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                $
                {campaignAnalytics.fundraisingMetrics.averageGiftSize.toLocaleString()}
              </div>
              <p className="text-slate-400 text-sm">
                Range: ${campaignAnalytics.fundraisingMetrics.smallestGift} – $
                {campaignAnalytics.fundraisingMetrics.largestGift.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">
                  Conversion Rate
                </h3>
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {campaignAnalytics.conversionMetrics.conversionRate.toFixed(1)}%
              </div>
              <p className="text-slate-400 text-sm">
                {campaignAnalytics.conversionMetrics.donationPageViews.toLocaleString()}{" "}
                page views
              </p>
            </div>
          </div>

          {/* Channel Performance */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Channel Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {campaignAnalytics.channelPerformance.map((channel, index) => (
                <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                  <h4 className="text-white font-medium mb-2">
                    {channel.channel}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Revenue:</span>
                      <span className="text-white font-semibold">
                        ${channel.totalRaised.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Donors:</span>
                      <span className="text-white">{channel.donorCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Gift:</span>
                      <span className="text-white">
                        ${channel.averageGift.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Conv Rate:</span>
                      <span className="text-white">
                        {channel.conversionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Organization Analytics */}
      {orgAnalytics && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">
                  Total Raised
                </h3>
                <div className="flex items-center space-x-1">
                  {orgAnalytics.growthMetrics.raisedChange > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`text-xs ${
                      orgAnalytics.growthMetrics.raisedChange > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {orgAnalytics.growthMetrics.raisedChange > 0 ? "+" : ""}
                    {orgAnalytics.growthMetrics.raisedChange.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                ${orgAnalytics.currentPeriod.totalRaised.toLocaleString()}
              </div>
              <p className="text-slate-400 text-sm">
                vs ${orgAnalytics.previousPeriod.totalRaised.toLocaleString()}{" "}
                previous period
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">
                  Total Donors
                </h3>
                <div className="flex items-center space-x-1">
                  {orgAnalytics.growthMetrics.donorsChange > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`text-xs ${
                      orgAnalytics.growthMetrics.donorsChange > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {orgAnalytics.growthMetrics.donorsChange > 0 ? "+" : ""}
                    {orgAnalytics.growthMetrics.donorsChange.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {orgAnalytics.currentPeriod.donorCount.toLocaleString()}
              </div>
              <p className="text-slate-400 text-sm">
                vs {orgAnalytics.previousPeriod.donorCount.toLocaleString()}{" "}
                previous period
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">
                  Campaigns
                </h3>
                <div className="flex items-center space-x-1">
                  {orgAnalytics.growthMetrics.campaignsChange > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`text-xs ${
                      orgAnalytics.growthMetrics.campaignsChange > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {orgAnalytics.growthMetrics.campaignsChange > 0 ? "+" : ""}
                    {orgAnalytics.growthMetrics.campaignsChange.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {orgAnalytics.currentPeriod.campaignCount}
              </div>
              <p className="text-slate-400 text-sm">
                vs {orgAnalytics.previousPeriod.campaignCount} previous period
              </p>
            </div>
          </div>

          {/* Top Performing Campaigns */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Top Performing Campaigns
            </h3>
            <div className="space-y-3">
              {orgAnalytics.topPerformingCampaigns.map(
                (
                  campaign: {
                    id: React.Key | null | undefined;
                    name:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactPortal
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                    raised: number;
                    goal: number;
                  },
                  index: number,
                ) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {campaign.name}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {Math.round((campaign.raised / campaign.goal) * 100)}%
                          of ${campaign.goal.toLocaleString()} goal
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        ${campaign.raised.toLocaleString()}
                      </p>
                      <div className="w-24 bg-slate-600 rounded-full h-2 mt-1">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Donor Insights */}
          {donorInsights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Top Donors
                </h3>
                <div className="space-y-3">
                  {donorInsights.topDonors.map((donor, index) => (
                    <div
                      key={donor.id}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="text-white font-medium">
                          {donor.name}
                        </span>
                      </div>
                      <span className="text-white font-semibold">
                        ${donor.totalGiven.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Donor Insights
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">Retention Rate</span>
                      <div className="flex items-center space-x-1">
                        {donorInsights.donorRetention.change > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span
                          className={`text-sm ${
                            donorInsights.donorRetention.change > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {donorInsights.donorRetention.change > 0 ? "+" : ""}
                          {donorInsights.donorRetention.change}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {donorInsights.donorRetention.current}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                      <div className="text-lg font-bold text-white">
                        {donorInsights.acquisition.newDonors}
                      </div>
                      <div className="text-slate-400 text-sm">New Donors</div>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                      <div className="text-lg font-bold text-white">
                        {donorInsights.acquisition.returningDonors}
                      </div>
                      <div className="text-slate-400 text-sm">Returning</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Organization-wide client breakdown */}
      {!effectiveClientId && orgAnalytics && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            All Clients Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 text-sm font-medium py-3">
                    Client
                  </th>
                  <th className="text-right text-slate-400 text-sm font-medium py-3">
                    Revenue
                  </th>
                  <th className="text-right text-slate-400 text-sm font-medium py-3">
                    Campaigns
                  </th>
                  <th className="text-right text-slate-400 text-sm font-medium py-3">
                    Donors
                  </th>
                  <th className="text-right text-slate-400 text-sm font-medium py-3">
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody>
                {orgAnalytics.clientPerformance.map(
                  (client: {
                    clientId: React.Key | null | undefined;
                    clientName:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactPortal
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                    revenue: {
                      toLocaleString: () =>
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                    };
                    campaigns:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactPortal
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                    donors: {
                      toLocaleString: () =>
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                    };
                    growth: number;
                  }) => (
                    <tr
                      key={client.clientId}
                      className="border-b border-slate-700/50"
                    >
                      <td className="py-3">
                        <p className="text-white font-medium">
                          {client.clientName}
                        </p>
                      </td>
                      <td className="text-right py-3">
                        <p className="text-white font-semibold">
                          ${client.revenue.toLocaleString()}
                        </p>
                      </td>
                      <td className="text-right py-3">
                        <p className="text-white">{client.campaigns}</p>
                      </td>
                      <td className="text-right py-3">
                        <p className="text-white">
                          {client.donors.toLocaleString()}
                        </p>
                      </td>
                      <td className="text-right py-3">
                        <div className="flex items-center justify-end space-x-1">
                          {client.growth > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span
                            className={`font-medium ${
                              client.growth > 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {client.growth > 0 ? "+" : ""}
                            {client.growth.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
