// src/components/CrossChannelAnalyticsDashboard.tsx

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  MousePointer,
  Eye,
  Target,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  PieChart,
  Activity,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

import type { ChannelType, AttributionModel } from "@/models/channels";
import {
  getCrossChannelAnalytics,
  generateCampaignReport,
  syncChannelData,
} from "@/services/crossChannelAnalyticsService";

interface CrossChannelAnalyticsDashboardProps {
  campaignId: string;
  clientId: string;
  dateRange?: { start: Date; end: Date };
}

type ViewMode =
  | "overview"
  | "channels"
  | "attribution"
  | "journey"
  | "insights";
type AttributionModelType = AttributionModel["type"];

export const CrossChannelAnalyticsDashboard: React.FC<
  CrossChannelAnalyticsDashboardProps
> = ({
  campaignId,
  clientId,
  dateRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  },
}) => {
  const [currentView, setCurrentView] = useState<ViewMode>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [attributionModel, setAttributionModel] =
    useState<AttributionModelType>("linear");

  // Analytics data state
  const [analytics, setAnalytics] = useState<any>(null);
  const [campaignReport, setCampaignReport] = useState<any>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);

      // Sync channel data first
      await syncChannelData(campaignId, clientId);

      // Load analytics
      const analyticsData = await getCrossChannelAnalytics(campaignId);
      const reportData = await generateCampaignReport(campaignId, dateRange);

      setAnalytics(analyticsData);
      setCampaignReport(reportData);
      setLastSynced(new Date());
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, clientId, dateRange]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const handleRefresh = async () => {
    await loadAnalytics();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getChannelIcon = (channelType: ChannelType): React.ReactNode => {
    switch (channelType) {
      case "email":
        return "📧";
      case "social_media":
        return "📱";
      case "direct_mail":
        return "📮";
      case "website":
        return "🌐";
      case "sms":
        return "💬";
      case "phone":
        return "📞";
      default:
        return "📊";
    }
  };

  const getChannelColor = (channelType: ChannelType): string => {
    switch (channelType) {
      case "email":
        return "bg-blue-500";
      case "social_media":
        return "bg-purple-500";
      case "direct_mail":
        return "bg-green-500";
      case "website":
        return "bg-orange-500";
      case "sms":
        return "bg-yellow-500";
      case "phone":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const renderKPICards = () => {
    if (!analytics || !campaignReport) return null;

    const { unifiedMetrics: __unifiedMetrics } = analytics;
    const { summary } = campaignReport;

    const kpis = [
      {
        title: "Total Reach",
        value: formatNumber(__unifiedMetrics.totalReach),
        change: "+12.5%",
        positive: true,
        icon: Users,
      },
      {
        title: "Total Revenue",
        value: formatCurrency(__unifiedMetrics.totalRevenue),
        change: "+8.3%",
        positive: true,
        icon: DollarSign,
      },
      {
        title: "Conversions",
        value: formatNumber(__unifiedMetrics.totalConversions),
        change: "+15.7%",
        positive: true,
        icon: Target,
      },
      {
        title: "Conversion Rate",
        value: `${summary.averageConversionRate.toFixed(2)}%`,
        change: "+2.1%",
        positive: true,
        icon: TrendingUp,
      },
      {
        title: "Total Impressions",
        value: formatNumber(__unifiedMetrics.totalImpressions),
        change: "+18.9%",
        positive: true,
        icon: Eye,
      },
      {
        title: "ROI",
        value: `${summary.roi.toFixed(1)}%`,
        change: summary.roi > 200 ? "+25.4%" : "-5.2%",
        positive: summary.roi > 200,
        icon: BarChart3,
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {kpis.map(({ title, value, change, positive, icon: Icon }) => (
          <div
            key={title}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className="w-8 h-8 text-blue-600" />
              <div
                className={`flex items-center text-sm font-medium ${
                  positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {positive ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {change}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-gray-600">{title}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderChannelPerformance = () => {
    if (!analytics) return null;

    const { channelPerformance, unifiedMetrics: __unifiedMetrics } = analytics;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold mb-6">Channel Performance</h3>

        <div className="space-y-4">
          {channelPerformance.map((channel: any, index: number) => (
            <div
              key={channel.channelId}
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getChannelIcon(channel.channelType)}
                </div>
                <div>
                  <h4 className="font-medium capitalize">
                    {channel.channelType.replace("_", " ")}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Performance Score: {channel.performance.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {formatNumber(channel.metrics.reach)}
                    </div>
                    <div className="text-gray-600">Reach</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {formatNumber(channel.metrics.engagements)}
                    </div>
                    <div className="text-gray-600">Engagements</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {formatNumber(channel.metrics.conversions)}
                    </div>
                    <div className="text-gray-600">Conversions</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(channel.metrics.revenue)}
                    </div>
                    <div className="text-gray-600">Revenue</div>
                  </div>
                </div>

                {/* Performance bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Performance</span>
                    <span className="text-xs font-medium text-gray-900">
                      {channel.performance.toFixed(1)}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        channel.performance >= 70
                          ? "bg-green-500"
                          : channel.performance >= 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${channel.performance}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${
                    index === 0
                      ? "text-green-600"
                      : index === channelPerformance.length - 1
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                >
                  #{index + 1}
                </div>
                <div className="text-xs text-gray-600">Rank</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAttribution = () => {
    if (!analytics) return null;

    const { attribution } = analytics;
    const ___totalPercentage = Object.values(attribution).reduce(
      (sum: number, attr: any) => sum + attr.percentage,
      0,
    );

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Channel Attribution</h3>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Model:</label>
            <select
              value={attributionModel}
              onChange={(e) =>
                setAttributionModel(e.target.value as AttributionModelType)
              }
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="first_touch">First Touch</option>
              <option value="last_touch">Last Touch</option>
              <option value="linear">Linear</option>
              <option value="position_based">Position Based</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attribution Chart */}
          <div>
            <h4 className="font-medium mb-4">Revenue Attribution</h4>
            <div className="space-y-3">
              {Object.entries(attribution).map(
                ([channelType, data]: [string, any]) => (
                  <div
                    key={channelType}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="text-lg">
                        {getChannelIcon(channelType as ChannelType)}
                      </div>
                      <span className="capitalize font-medium">
                        {channelType.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {formatCurrency(data.attributedRevenue)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {data.percentage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getChannelColor(channelType as ChannelType)}`}
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Attribution Details */}
          <div>
            <h4 className="font-medium mb-4">Attribution Details</h4>
            <div className="space-y-4">
              {Object.entries(attribution).map(
                ([channelType, data]: [string, any]) => (
                  <div
                    key={channelType}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="text-lg">
                          {getChannelIcon(channelType as ChannelType)}
                        </div>
                        <span className="font-medium capitalize">
                          {channelType.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-sm font-semibold">
                        {data.percentage.toFixed(1)}%
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        <div className="font-medium">{data.touches}</div>
                        <div>Touches</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {formatNumber(data.attributedConversions)}
                        </div>
                        <div>Conversions</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {formatCurrency(data.attributedRevenue)}
                        </div>
                        <div>Revenue</div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderJourneyAnalytics = () => {
    if (!analytics) return null;

    const { journeyAnalytics } = analytics;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold mb-6">
          Customer Journey Analytics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {journeyAnalytics.totalJourneys}
            </div>
            <div className="text-sm text-gray-600">Total Journeys</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {journeyAnalytics.avgTouchpoints}
            </div>
            <div className="text-sm text-gray-600">Avg Touchpoints</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {journeyAnalytics.avgJourneyLength}
            </div>
            <div className="text-sm text-gray-600">Avg Journey (days)</div>
          </div>
        </div>

        {journeyAnalytics.topPaths && journeyAnalytics.topPaths.length > 0 && (
          <div>
            <h4 className="font-medium mb-4">Top Customer Paths</h4>
            <div className="space-y-3">
              {journeyAnalytics.topPaths
                .slice(0, 5)
                .map((path: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-gray-900">
                        #{index + 1}
                      </div>
                      <div className="flex items-center space-x-1">
                        {path.path.map((channel: string, i: number) => (
                          <React.Fragment key={i}>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm">
                                {getChannelIcon(channel as ChannelType)}
                              </span>
                              <span className="text-xs capitalize">
                                {channel.replace("_", " ")}
                              </span>
                            </div>
                            {i < path.path.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{path.count}</div>
                        <div className="text-gray-600 text-xs">Users</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {path.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-gray-600 text-xs">Conv Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {formatCurrency(path.avgRevenue)}
                        </div>
                        <div className="text-gray-600 text-xs">Avg Revenue</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInsights = () => {
    if (!campaignReport) return null;

    const { insights, recommendations } = campaignReport;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Key Insights</h3>
          </div>

          <div className="space-y-3">
            {insights.map((insight: string, index: number) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-900">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Recommendations</h3>
          </div>

          <div className="space-y-3">
            {recommendations.map((recommendation: string, index: number) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg"
              >
                <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5" />
                <p className="text-sm text-orange-900">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderNavigationTabs = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {[
          { key: "overview" as const, label: "Overview", icon: BarChart3 },
          { key: "channels" as const, label: "Channels", icon: Activity },
          { key: "attribution" as const, label: "Attribution", icon: PieChart },
          { key: "journey" as const, label: "Journey", icon: MousePointer },
          { key: "insights" as const, label: "Insights", icon: TrendingUp },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setCurrentView(key)}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              currentView === key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Cross-Channel Analytics
            </h2>
            <p className="text-gray-600 mt-1">
              Unified view of campaign performance across all channels
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              Last synced: {lastSynced.toLocaleTimeString()}
            </div>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {renderNavigationTabs()}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <>
          {currentView === "overview" && (
            <>
              {renderKPICards()}
              {renderChannelPerformance()}
            </>
          )}

          {currentView === "channels" && renderChannelPerformance()}
          {currentView === "attribution" && renderAttribution()}
          {currentView === "journey" && renderJourneyAnalytics()}
          {currentView === "insights" && renderInsights()}
        </>
      )}
    </div>
  );
};
