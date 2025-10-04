// src/components/segmentation/SegmentPerformanceDashboard.tsx

import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  AlertCircle,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Bell,
  Mail,
  Phone,
  MessageSquare,
  Activity,
  Zap,
} from "lucide-react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

import type {
  AudienceSegment,
  SegmentPerformance,
} from "@/models/segmentation";
import {
  getSegmentPerformance,
  getSegments,
} from "@/services/segmentationEngine";

// Component interfaces
interface PerformanceDashboardProps {
  selectedSegmentId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  refreshInterval?: number;
}

interface PerformanceAlert {
  id: string;
  segmentId: string;
  segmentName: string;
  type:
    | "performance_drop"
    | "size_change"
    | "conversion_anomaly"
    | "engagement_spike";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: Date;
  isRead: boolean;
  threshold?: number;
  currentValue?: number;
  previousValue?: number;
}

interface SegmentComparison {
  segmentId: string;
  segmentName: string;
  size: number;
  conversionRate: number;
  revenue: number;
  avgDonation: number;
  engagementScore: number;
  trend: "up" | "down" | "stable";
  changePercent: number;
}

interface TimeSeriesData {
  date: string;
  conversions: number;
  revenue: number;
  engagement: number;
  size: number;
}

const COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  secondary: "#6B7280",
  purple: "#8B5CF6",
  pink: "#EC4899",
  teal: "#14B8A6",
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.purple,
  COLORS.pink,
  COLORS.teal,
];

export const SegmentPerformanceDashboard: React.FC<
  PerformanceDashboardProps
> = ({
  selectedSegmentId,
  dateRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  },
  refreshInterval = 300000, // 5 minutes
}) => {
  // State management
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>(
    selectedSegmentId || "",
  );
  const [performanceData, setPerformanceData] = useState<SegmentPerformance[]>(
    [],
  );
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [segmentComparisons, setSegmentComparisons] = useState<
    SegmentComparison[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeTab, setActiveTab] = useState<
    "overview" | "performance" | "alerts" | "comparison"
  >("overview");
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d",
  );

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, [selectedSegment, dateRange, timeframe]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, selectedSegment, dateRange]);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load segments
      const segmentsData = await getSegments();
      setSegments(segmentsData);

      // Set default selected segment if none specified
      if (!selectedSegment && segmentsData.length > 0) {
        setSelectedSegment(segmentsData[0].id);
      }

      // Load performance data
      const performancePromises = segmentsData.map((segment) =>
        getSegmentPerformance(segment.id, dateRange.start, dateRange.end),
      );
      const performanceResults = await Promise.all(performancePromises);
      setPerformanceData(performanceResults);

      // Generate mock time series data
      const timeSeriesDataGen = generateTimeSeriesData(dateRange, timeframe);
      setTimeSeriesData(timeSeriesDataGen);

      // Generate mock alerts
      const alertsData = generateMockAlerts(segmentsData);
      setAlerts(alertsData);

      // Generate segment comparisons
      const comparisons = generateSegmentComparisons(
        segmentsData,
        performanceResults,
      );
      setSegmentComparisons(comparisons);

      setLastRefresh(new Date());
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedSegment, dateRange, timeframe]);

  // Generate mock time series data
  const generateTimeSeriesData = useCallback(
    (range: { start: Date; end: Date }, period: string): TimeSeriesData[] => {
      const days =
        period === "7d"
          ? 7
          : period === "30d"
            ? 30
            : period === "90d"
              ? 90
              : 365;
      const data: TimeSeriesData[] = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(
          range.end.getTime() - (days - i - 1) * 24 * 60 * 60 * 1000,
        );
        data.push({
          date: date.toISOString().split("T")[0],
          conversions: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 10000) + 1000,
          engagement: Math.floor(Math.random() * 30) + 40,
          size: Math.floor(Math.random() * 100) + 200,
        });
      }

      return data;
    },
    [],
  );

  // Generate mock alerts
  const generateMockAlerts = useCallback(
    (segments: AudienceSegment[]): PerformanceAlert[] => {
      const alertTypes = [
        "performance_drop",
        "size_change",
        "conversion_anomaly",
        "engagement_spike",
      ] as const;
      const severities = ["low", "medium", "high", "critical"] as const;

      return segments.slice(0, 5).map((segment, index) => ({
        id: `alert_${segment.id}_${index}`,
        segmentId: segment.id,
        segmentName: segment.name,
        type: alertTypes[index % alertTypes.length],
        severity: severities[index % severities.length],
        message: `${segment.name} ${getAlertMessage(alertTypes[index % alertTypes.length])}`,
        timestamp: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        ),
        isRead: Math.random() > 0.5,
        threshold: Math.random() * 100,
        currentValue: Math.random() * 200,
        previousValue: Math.random() * 180,
      }));
    },
    [],
  );

  // Get alert message based on type
  const getAlertMessage = (type: PerformanceAlert["type"]): string => {
    switch (type) {
      case "performance_drop":
        return "conversion rate dropped by 15% compared to last week";
      case "size_change":
        return "segment size increased by 25% in the last 24 hours";
      case "conversion_anomaly":
        return "unusual conversion pattern detected - manual review recommended";
      case "engagement_spike":
        return "engagement score increased by 40% - optimization opportunity";
      default:
        return "requires attention";
    }
  };

  // Generate segment comparisons
  const generateSegmentComparisons = useCallback(
    (
      segments: AudienceSegment[],
      performance: SegmentPerformance[],
    ): SegmentComparison[] => {
      return segments.map((segment, index) => {
        const perf = performance[index] || {};
        const changePercent = (Math.random() - 0.5) * 40; // -20% to +20%

        return {
          segmentId: segment.id,
          segmentName: segment.name,
          size:
            segment.metadata?.size || Math.floor(Math.random() * 1000) + 100,
          conversionRate: Math.random() * 15 + 5, // 5-20%
          revenue: Math.floor(Math.random() * 50000) + 10000,
          avgDonation: Math.floor(Math.random() * 200) + 50,
          engagementScore: Math.floor(Math.random() * 40) + 60,
          trend:
            changePercent > 5 ? "up" : changePercent < -5 ? "down" : "stable",
          changePercent: Math.abs(changePercent),
        };
      });
    },
    [],
  );

  // Get performance metrics for selected segment
  const selectedSegmentMetrics = useMemo(() => {
    if (!selectedSegment) return null;

    const performance = performanceData.find(
      (p) => p?.segmentId === selectedSegment,
    );
    const comparison = segmentComparisons.find(
      (c) => c.segmentId === selectedSegment,
    );

    return {
      performance,
      comparison,
      segment: segments.find((s) => s.id === selectedSegment),
    };
  }, [selectedSegment, performanceData, segmentComparisons, segments]);

  // Handle alert dismissal
  const dismissAlert = useCallback(async (alertId: string) => {
    setAlerts((alerts) =>
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, isRead: true } : alert,
      ),
    );
  }, []);

  // Export dashboard data
  const exportData = useCallback(() => {
    const data = {
      segments: segmentComparisons,
      timeSeriesData,
      alerts: alerts.filter((a) => !a.isRead),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `segment-performance-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [segmentComparisons, timeSeriesData, alerts]);

  // Render metric card
  const renderMetricCard = (
    title: string,
    value: string | number,
    change?: number,
    icon?: React.ComponentType<any>,
    color: string = COLORS.primary,
  ) => {
    const Icon = icon || Activity;
    const changeIcon =
      change && change > 0 ? ArrowUp : change && change < 0 ? ArrowDown : Minus;
    const changeColor =
      change && change > 0
        ? COLORS.success
        : change && change < 0
          ? COLORS.danger
          : COLORS.secondary;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-2">
                {React.createElement(changeIcon, {
                  className: "w-4 h-4 mr-1",
                  style: { color: changeColor },
                })}
                <span className="text-sm" style={{ color: changeColor }}>
                  {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  vs last period
                </span>
              </div>
            )}
          </div>
          <div
            className="p-3 rounded-full"
            style={{ backgroundColor: color + "20" }}
          >
            <Icon className="w-8 h-8" style={{ color }} />
          </div>
        </div>
      </div>
    );
  };

  if (loading && segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="text-lg font-medium text-red-900">
              Error Loading Dashboard
            </h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Segment Performance
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor segment effectiveness and engagement metrics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={exportData}
            className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            title="Export data"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Alerts Bar */}
      {alerts.filter((a) => !a.isRead).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">
                {alerts.filter((a) => !a.isRead).length} active alerts require
                attention
              </p>
              <p className="text-sm text-yellow-700">
                {
                  alerts.filter((a) => a.severity === "critical" && !a.isRead)
                    .length
                }{" "}
                critical,{" "}
                {
                  alerts.filter((a) => a.severity === "high" && !a.isRead)
                    .length
                }{" "}
                high priority
              </p>
            </div>
            <button
              onClick={() => setActiveTab("alerts")}
              className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
            >
              View Alerts
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: "overview", label: "Overview", icon: Activity },
          { key: "performance", label: "Performance", icon: TrendingUp },
          { key: "alerts", label: "Alerts", icon: Bell },
          { key: "comparison", label: "Comparison", icon: Target },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.key === "alerts" &&
              alerts.filter((a) => !a.isRead).length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {alerts.filter((a) => !a.isRead).length}
                </span>
              )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderMetricCard(
              "Total Segments",
              segments.length,
              undefined,
              Users,
              COLORS.primary,
            )}
            {renderMetricCard(
              "Active Donors",
              segmentComparisons
                .reduce((sum, s) => sum + s.size, 0)
                .toLocaleString(),
              8.2,
              Target,
              COLORS.success,
            )}
            {renderMetricCard(
              "Total Revenue",
              "$" +
                segmentComparisons
                  .reduce((sum, s) => sum + s.revenue, 0)
                  .toLocaleString(),
              12.4,
              DollarSign,
              COLORS.warning,
            )}
            {renderMetricCard(
              "Avg Conversion Rate",
              (
                segmentComparisons.reduce(
                  (sum, s) => sum + s.conversionRate,
                  0,
                ) / segmentComparisons.length
              ).toFixed(1) + "%",
              -2.1,
              Zap,
              COLORS.purple,
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.success}
                    fill={COLORS.success + "20"}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Conversion Rate Trend */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Engagement Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, "Engagement"]} />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performing Segments */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Performing Segments
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Segment
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Size
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Conversion Rate
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Revenue
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {segmentComparisons
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((segment) => (
                      <tr
                        key={segment.segmentId}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {segment.segmentName}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {segment.size.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-900">
                            {segment.conversionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          ${segment.revenue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            {segment.trend === "up" && (
                              <ArrowUp className="w-4 h-4 text-green-600" />
                            )}
                            {segment.trend === "down" && (
                              <ArrowDown className="w-4 h-4 text-red-600" />
                            )}
                            {segment.trend === "stable" && (
                              <Minus className="w-4 h-4 text-gray-600" />
                            )}
                            <span
                              className={`text-sm ${
                                segment.trend === "up"
                                  ? "text-green-600"
                                  : segment.trend === "down"
                                    ? "text-red-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {segment.changePercent.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Segment Selector */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Select Segment:
              </label>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
              >
                <option value="">All Segments</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Conversion Rate by Segment
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={segmentComparisons.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="segmentName"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Conversion Rate"]}
                  />
                  <Bar dataKey="conversionRate" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Segment Size Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={segmentComparisons.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ segmentName, percent }) =>
                      `${segmentName}: ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="size"
                  >
                    {segmentComparisons.slice(0, 6).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Performance Table */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detailed Performance Metrics
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Segment
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Size
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Conversion Rate
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Revenue
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Avg Donation
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Engagement
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {segmentComparisons.map((segment) => (
                    <tr
                      key={segment.segmentId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {segment.segmentName}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {segment.size.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900">
                          {segment.conversionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        ${segment.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        ${segment.avgDonation}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${segment.engagementScore}%`,
                                backgroundColor:
                                  segment.engagementScore > 80
                                    ? COLORS.success
                                    : segment.engagementScore > 60
                                      ? COLORS.warning
                                      : COLORS.danger,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {segment.engagementScore}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          {segment.trend === "up" && (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          )}
                          {segment.trend === "down" && (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          {segment.trend === "stable" && (
                            <Minus className="w-4 h-4 text-gray-600" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              segment.trend === "up"
                                ? "text-green-600"
                                : segment.trend === "down"
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {segment.trend === "stable"
                              ? "Stable"
                              : `${segment.changePercent.toFixed(1)}%`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                label: "Critical",
                count: alerts.filter(
                  (a) => a.severity === "critical" && !a.isRead,
                ).length,
                color: COLORS.danger,
              },
              {
                label: "High",
                count: alerts.filter((a) => a.severity === "high" && !a.isRead)
                  .length,
                color: COLORS.warning,
              },
              {
                label: "Medium",
                count: alerts.filter(
                  (a) => a.severity === "medium" && !a.isRead,
                ).length,
                color: COLORS.primary,
              },
              {
                label: "Low",
                count: alerts.filter((a) => a.severity === "low" && !a.isRead)
                  .length,
                color: COLORS.secondary,
              },
            ].map(({ label, count, color }) => (
              <div
                key={label}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {label} Priority
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {count}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-full"
                    style={{ backgroundColor: color + "20" }}
                  >
                    <AlertCircle className="w-8 h-8" style={{ color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Alerts
            </h3>
            <div className="space-y-4">
              {alerts
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-4 ${alert.isRead ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-full ${
                            alert.severity === "critical"
                              ? "bg-red-100"
                              : alert.severity === "high"
                                ? "bg-yellow-100"
                                : alert.severity === "medium"
                                  ? "bg-blue-100"
                                  : "bg-gray-100"
                          }`}
                        >
                          <AlertCircle
                            className={`w-5 h-5 ${
                              alert.severity === "critical"
                                ? "text-red-600"
                                : alert.severity === "high"
                                  ? "text-yellow-600"
                                  : alert.severity === "medium"
                                    ? "text-blue-600"
                                    : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              {alert.segmentName}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                alert.severity === "critical"
                                  ? "bg-red-100 text-red-800"
                                  : alert.severity === "high"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : alert.severity === "medium"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {alert.timestamp.toLocaleDateString()} at{" "}
                            {alert.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {!alert.isRead && (
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "comparison" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Segment Comparison Matrix
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Revenue vs Conversion Rate
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={segmentComparisons}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="segmentName"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke={COLORS.success}
                      fill={COLORS.success + "20"}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversionRate"
                      stackId="2"
                      stroke={COLORS.primary}
                      fill={COLORS.primary + "20"}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Performance Ranking
                </h4>
                <div className="space-y-3">
                  {segmentComparisons
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 8)
                    .map((segment, index) => (
                      <div
                        key={segment.segmentId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                              index < 3
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900">
                            {segment.segmentName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            ${segment.revenue.toLocaleString()}
                          </span>
                          <div className="flex items-center space-x-1">
                            {segment.trend === "up" && (
                              <ArrowUp className="w-4 h-4 text-green-600" />
                            )}
                            {segment.trend === "down" && (
                              <ArrowDown className="w-4 h-4 text-red-600" />
                            )}
                            {segment.trend === "stable" && (
                              <Minus className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Channel Performance by Segment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { channel: "Email", icon: Mail, performance: 85 },
                { channel: "Phone", icon: Phone, performance: 72 },
                { channel: "Social", icon: MessageSquare, performance: 68 },
              ].map(({ channel, icon: Icon, performance }) => (
                <div key={channel} className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{channel}</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${performance}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {performance}% effective
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
