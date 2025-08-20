// src/components/analytics/ComparativeCampaignAnalysis.tsx
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  Award,
  CheckCircle,
  Clock,
  Zap,
  Activity,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { useClient } from "../../context/ClientContext";
import { useCampaigns } from "../../hooks/useCampaigns";

import type { Campaign } from "../../models/campaign";

interface CampaignMetrics {
  campaign: Campaign;
  progressPercentage: number;
  daysRemaining: number;
  totalDays: number;
  dailyAverageNeeded: number;
  dailyAverageActual: number;
  efficiency: number;
  performanceScore: number;
  velocity: "ahead" | "on-track" | "behind";
  timelineData: TimelineDataPoint[];
  costPerDollar: number;
  projectedCompletionDate: Date;
}

interface TimelineDataPoint {
  date: string;
  day: number;
  cumulativeRaised: number;
  cumulativePercentage: number;
  dailyRaised: number;
  targetCumulative: number;
  targetPercentage: number;
  velocity: number;
  efficiency: number;
}

// Palette + safe color helper
const PALETTE = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#22c55e",
];

function toColorString(themeLike: unknown, fallback: string): string {
  if (typeof themeLike === "string" && themeLike.trim()) return themeLike;
  if (themeLike && typeof themeLike === "object") {
    const t = themeLike as Record<string, unknown>;
    const maybe =
      (t.primary as string) ??
      (t.color as string) ??
      (t.hex as string) ??
      (t.css as string);
    if (typeof maybe === "string" && maybe.trim()) return maybe;
  }
  return fallback;
}

const ComparativeCampaignAnalysis: React.FC = () => {
  const { currentClient } = useClient();
  const { campaigns, loading, error } = useCampaigns();

  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "performance" | "progress" | "efficiency"
  >("performance");
  const [timelineView, setTimelineView] = useState<
    "progress" | "velocity" | "efficiency"
  >("progress");
  const [showTimelineCharts, setShowTimelineCharts] = useState(false);

  // Filter to current client
  const clientCampaigns = useMemo(() => {
    if (!currentClient || !campaigns) return [];
    return campaigns.filter((c) => c.clientId === currentClient.id);
  }, [campaigns, currentClient]);

  // Generate plausible timeline data
  const generateTimelineData = (campaign: Campaign): TimelineDataPoint[] => {
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    const now = new Date();

    const totalDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000),
    );
    const daysPassed = Math.max(
      0,
      Math.min(
        totalDays,
        Math.ceil((now.getTime() - startDate.getTime()) / 86_400_000),
      ),
    );

    const timelineData: TimelineDataPoint[] = [];

    for (let day = 0; day <= Math.min(daysPassed, totalDays); day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);

      const progressFactor = day / totalDays;
      let cumulativePercentage: number;

      if (campaign.status === "Completed") {
        // S-curve for completed
        cumulativePercentage = Math.min(
          100,
          100 * (1 - Math.exp(-3 * progressFactor)),
        );
      } else {
        // Active: converge toward current actual
        const targetProgress = (day / totalDays) * 100;
        const actualProgress = (campaign.raised / campaign.goal) * 100;
        if (day === daysPassed) {
          cumulativePercentage = actualProgress;
        } else {
          const efficiency = actualProgress / Math.max(targetProgress, 1);
          cumulativePercentage = Math.min(
            100,
            targetProgress * efficiency * (1 + 0.2 * Math.sin(day * 0.3)),
          );
        }
      }

      const cumulativeRaised = (cumulativePercentage / 100) * campaign.goal;
      const targetCumulative = (day / totalDays) * campaign.goal;
      const targetPercentage = (day / totalDays) * 100;

      const prevRaised = day > 0 ? timelineData[day - 1].cumulativeRaised : 0;
      const dailyRaised = cumulativeRaised - prevRaised;
      const velocity = dailyRaised;
      const efficiency =
        targetCumulative > 0 ? cumulativeRaised / targetCumulative : 1;

      timelineData.push({
        date: currentDate.toISOString().split("T")[0],
        day: day + 1,
        cumulativeRaised: Math.round(cumulativeRaised),
        cumulativePercentage: Math.round(cumulativePercentage * 10) / 10,
        dailyRaised: Math.max(0, Math.round(dailyRaised)),
        targetCumulative: Math.round(targetCumulative),
        targetPercentage: Math.round(targetPercentage * 10) / 10,
        velocity: Math.max(0, Math.round(velocity)),
        efficiency: Math.round(efficiency * 100) / 100,
      });
    }

    return timelineData;
  };

  // Main metrics
  const campaignMetrics = useMemo<CampaignMetrics[]>(() => {
    return clientCampaigns.map((campaign) => {
      // Basic progress calculation
      const progressPercentage = (campaign.raised / campaign.goal) * 100;

      // Date calculations
      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);
      const now = new Date();

      const totalDays = Math.max(
        1,
        Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000),
      );
      const daysPassed = Math.max(
        0,
        Math.ceil((now.getTime() - startDate.getTime()) / 86_400_000),
      );
      const daysRemaining = Math.max(0, totalDays - daysPassed);

      // Financial metrics
      const dailyAverageActual =
        daysPassed > 0 ? campaign.raised / daysPassed : 0;
      const remainingAmount = campaign.goal - campaign.raised;
      const dailyAverageNeeded =
        daysRemaining > 0 ? Math.max(0, remainingAmount / daysRemaining) : 0;
      const costPerDollar =
        campaign.raised > 0
          ? (campaign.marketingCost || 0) / campaign.raised
          : 0;

      // Performance calculations
      const timeProgressPercentage = (daysPassed / totalDays) * 100;
      const efficiency =
        progressPercentage / Math.max(timeProgressPercentage, 1);

      // Velocity assessment
      let velocity: "ahead" | "on-track" | "behind" = "on-track";
      if (efficiency > 1.1) velocity = "ahead";
      else if (efficiency < 0.9) velocity = "behind";

      // Performance score
      const performanceScore = Math.min(
        100,
        Math.max(
          0,
          progressPercentage * 0.6 +
            efficiency * 20 +
            (campaign.status === "Completed" ? 20 : 0),
        ),
      );

      // Projected completion date
      const projectedCompletionDate = new Date();
      if (dailyAverageActual > 0 && remainingAmount > 0) {
        projectedCompletionDate.setDate(
          projectedCompletionDate.getDate() +
            Math.ceil(remainingAmount / dailyAverageActual),
        );
      }

      // Timeline
      const timelineData = generateTimelineData(campaign);

      return {
        campaign,
        progressPercentage,
        daysRemaining,
        totalDays,
        dailyAverageNeeded,
        dailyAverageActual,
        efficiency,
        performanceScore,
        velocity,
        timelineData,
        costPerDollar,
        projectedCompletionDate,
      };
    });
  }, [clientCampaigns]);

  // Filter / sort
  const filteredMetrics = useMemo(() => {
    let filtered = campaignMetrics;
    if (filterType !== "all") {
      filtered = filtered.filter((m) => m.campaign.type === filterType);
    }
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "performance":
          return b.performanceScore - a.performanceScore;
        case "progress":
          return b.progressPercentage - a.progressPercentage;
        case "efficiency":
          return b.efficiency - a.efficiency;
        default:
          return 0;
      }
    });
  }, [campaignMetrics, filterType, sortBy]);

  // Combined chart data
  const timelineChartData = useMemo(() => {
    if (selectedCampaigns.length === 0) return [];
    const selectedMetrics = filteredMetrics.filter((m) =>
      selectedCampaigns.includes(m.campaign.id),
    );
    if (selectedMetrics.length === 0) return [];

    const maxDays = Math.max(
      ...selectedMetrics.map((m) => m.timelineData.length),
    );
    const combined: Record<string, number | string>[] = [];

    for (let day = 1; day <= maxDays; day++) {
      const point: Record<string, number | string> = { day };
      selectedMetrics.forEach((metric, index) => {
        const campaignName = metric.campaign.name;
        const dayData = metric.timelineData.find((d) => d.day === day);
        if (!dayData) return;
        if (timelineView === "progress") {
          point[`${campaignName}_progress`] = dayData.cumulativePercentage;
          if (index === 0) {
            point[`${campaignName}_target`] = dayData.targetPercentage;
          }
        } else if (timelineView === "velocity") {
          point[`${campaignName}_velocity`] = dayData.velocity;
        } else {
          point[`${campaignName}_efficiency`] = dayData.efficiency;
        }
      });
      combined.push(point);
    }
    return combined;
  }, [filteredMetrics, selectedCampaigns, timelineView]);

  const toggleCampaignSelection = (id: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const getVelocityIcon = (v: "ahead" | "on-track" | "behind") => {
    if (v === "ahead") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (v === "behind")
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Target className="h-4 w-4 text-blue-500" />;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatTooltipValue = (value: unknown, name: string) => {
    const v = typeof value === "number" ? value : Number(value ?? 0);
    if (name.includes("progress") || name.includes("target")) {
      return [`${v}%`, name.replace(/_progress|_target/, "")] as [
        string,
        string,
      ];
    }
    if (name.includes("velocity")) {
      return [formatCurrency(v), name.replace(/_velocity/, "") + " Daily"] as [
        string,
        string,
      ];
    }
    if (name.includes("efficiency")) {
      return [`${v}x`, name.replace(/_efficiency/, "") + " Efficiency"] as [
        string,
        string,
      ];
    }
    return [String(v), name] as [string, string];
  };

  // Loading / error / empty
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading campaigns: {error}</p>
      </div>
    );
  }
  if (!clientCampaigns.length) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
        <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          No Campaigns Found
        </h3>
        <p className="text-slate-600">
          Create some campaigns to see comparative analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Campaign Performance Comparison
          </h1>
          <p className="text-slate-600 mt-1">
            Analyze and compare campaign effectiveness with timeline insights
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="all">All Campaign Types</option>
            <option value="annual">Annual Fund</option>
            <option value="capital">Capital</option>
            <option value="emergency">Emergency</option>
            <option value="program">Program</option>
            <option value="event">Event</option>
            <option value="endowment">Endowment</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="performance">Sort by Performance</option>
            <option value="progress">Sort by Progress</option>
            <option value="efficiency">Sort by Efficiency</option>
          </select>

          {selectedCampaigns.length >= 2 && (
            <button
              onClick={() => setShowTimelineCharts((s) => !s)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <Activity className="h-4 w-4" />
              {showTimelineCharts ? "Hide" : "Show"} Timeline
            </button>
          )}
        </div>
      </div>

      {/* Timeline Charts */}
      {selectedCampaigns.length >= 2 && showTimelineCharts && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Timeline Comparison
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">View:</span>
              <select
                value={timelineView}
                onChange={(e) => setTimelineView(e.target.value as any)}
                className="px-3 py-1 border border-slate-300 rounded text-sm bg-white"
              >
                <option value="progress">Progress %</option>
                <option value="velocity">Daily Velocity</option>
                <option value="efficiency">Efficiency</option>
              </select>
            </div>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="day"
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Campaign Day",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  label={{
                    value:
                      timelineView === "progress"
                        ? "Progress %"
                        : timelineView === "velocity"
                          ? "Daily Amount"
                          : "Efficiency Ratio",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(51, 65, 85, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={formatTooltipValue}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Legend />

                {/* one Line per selected campaign */}
                {filteredMetrics
                  .filter((m) => selectedCampaigns.includes(m.campaign.id))
                  .map((metric, index) => {
                    const campaignName = metric.campaign.name;
                    const color = toColorString(
                      (metric.campaign as any).theme,
                      PALETTE[index % PALETTE.length],
                    );
                    const dataKey =
                      timelineView === "progress"
                        ? `${campaignName}_progress`
                        : timelineView === "velocity"
                          ? `${campaignName}_velocity`
                          : `${campaignName}_efficiency`;
                    return (
                      <Line
                        key={`${campaignName}_${timelineView}`}
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={3}
                        dot={{ fill: color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                        name={campaignName}
                      />
                    );
                  })}

                {/* Target line for progress view (only once for readability) */}
                {timelineView === "progress" &&
                  filteredMetrics
                    .filter((m) => selectedCampaigns.includes(m.campaign.id))
                    .slice(0, 1)
                    .map((m) => (
                      <Line
                        key="__target"
                        type="monotone"
                        dataKey={`${m.campaign.name}_target`}
                        stroke="#94a3b8"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={false}
                        name="Target Progress"
                      />
                    ))}

                {/* Efficiency reference line at 1x */}
                {timelineView === "efficiency" && (
                  <ReferenceLine y={1} stroke="#94a3b8" strokeDasharray="3 3" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend helper */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>
                <strong>Progress:</strong> Cumulative fundraising % over time
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>
                <strong>Velocity:</strong> Daily fundraising amounts (momentum)
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Target className="h-4 w-4 text-green-500" />
              <span>
                <strong>Efficiency:</strong> Actual vs target performance ratio
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Summary tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Campaigns
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {filteredMetrics.length}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Goal</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(
                  filteredMetrics.reduce((s, m) => s + m.campaign.goal, 0),
                )}
              </p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Raised</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(
                  filteredMetrics.reduce((s, m) => s + m.campaign.raised, 0),
                )}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Avg Performance
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {filteredMetrics.length
                  ? Math.round(
                      filteredMetrics.reduce(
                        (s, m) => s + m.performanceScore,
                        0,
                      ) / filteredMetrics.length,
                    )
                  : 0}
                %
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMetrics.map((metric, idx) => {
          const color = toColorString(
            (metric.campaign as any).theme,
            PALETTE[idx % PALETTE.length],
          );
          return (
            <div
              key={metric.campaign.id}
              className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                selectedCampaigns.includes(metric.campaign.id)
                  ? "border-blue-500 shadow-md"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => toggleCampaignSelection(metric.campaign.id)}
            >
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {metric.campaign.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {metric.campaign.type}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          metric.campaign.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : metric.campaign.status === "Completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {metric.campaign.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getVelocityIcon(metric.velocity)}
                    {selectedCampaigns.includes(metric.campaign.id) && (
                      <CheckCircle className="h-4 w-4 text-blue-500 ml-1" />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-medium text-slate-900">
                      {metric.progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, metric.progressPercentage)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>{formatCurrency(metric.campaign.raised)}</span>
                    <span>{formatCurrency(metric.campaign.goal)}</span>
                  </div>
                </div>

                {/* Performance */}
                <div
                  className={`p-3 rounded-lg border ${getPerformanceColor(
                    metric.performanceScore,
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Performance Score
                    </span>
                    <span className="text-lg font-bold">
                      {Math.round(metric.performanceScore)}/100
                    </span>
                  </div>
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-600 mb-1">Efficiency</p>
                    <p className="font-semibold text-slate-900">
                      {metric.efficiency.toFixed(2)}x
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-600 mb-1">Days Left</p>
                    <p className="font-semibold text-slate-900">
                      {metric.daysRemaining}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-600 mb-1">Daily Need</p>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(metric.dailyAverageNeeded)}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-600 mb-1">Daily Avg</p>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(metric.dailyAverageActual)}
                    </p>
                  </div>
                </div>

                {/* Timeline Preview */}
                {selectedCampaigns.includes(metric.campaign.id) && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-2">
                      <Clock className="h-4 w-4" />
                      Timeline Preview
                    </div>
                    <div className="text-xs text-blue-600">
                      Latest velocity:{" "}
                      {formatCurrency(
                        metric.timelineData[metric.timelineData.length - 1]
                          ?.velocity || 0,
                      )}
                      /day
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="text-xs text-slate-500">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(metric.campaign.startDate).toLocaleDateString()}{" "}
                      - {new Date(metric.campaign.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative insights */}
      {selectedCampaigns.length >= 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Comparative Analysis ({selectedCampaigns.length} campaigns selected)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Performer */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Top Performer
              </h3>
              {(() => {
                const sel = filteredMetrics.filter((m) =>
                  selectedCampaigns.includes(m.campaign.id),
                );
                const top = sel.reduce((best, cur) =>
                  cur.performanceScore > best.performanceScore ? cur : best,
                );
                return (
                  <div>
                    <p className="font-semibold text-green-900">
                      {top.campaign.name}
                    </p>
                    <p className="text-sm text-green-700">
                      Score: {Math.round(top.performanceScore)}/100
                    </p>
                    <p className="text-sm text-green-700">
                      {top.progressPercentage.toFixed(1)}% of goal achieved
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Most Efficient */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Most Efficient
              </h3>
              {(() => {
                const sel = filteredMetrics.filter((m) =>
                  selectedCampaigns.includes(m.campaign.id),
                );
                const most = sel.reduce((best, cur) =>
                  cur.efficiency > best.efficiency ? cur : best,
                );
                return (
                  <div>
                    <p className="font-semibold text-blue-900">
                      {most.campaign.name}
                    </p>
                    <p className="text-sm text-blue-700">
                      Efficiency: {most.efficiency.toFixed(2)}x
                    </p>
                    <p className="text-sm text-blue-700">
                      {most.velocity === "ahead"
                        ? "Ahead of schedule"
                        : most.velocity === "behind"
                          ? "Behind schedule"
                          : "On track"}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Best Velocity */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Highest Velocity
              </h3>
              {(() => {
                const sel = filteredMetrics.filter((m) =>
                  selectedCampaigns.includes(m.campaign.id),
                );
                const highest = sel.reduce((best, cur) => {
                  const curV =
                    cur.timelineData[cur.timelineData.length - 1]?.velocity ||
                    0;
                  const bestV =
                    best.timelineData[best.timelineData.length - 1]?.velocity ||
                    0;
                  return curV > bestV ? cur : best;
                });
                const latestV =
                  highest.timelineData[highest.timelineData.length - 1]
                    ?.velocity || 0;
                return (
                  <div>
                    <p className="font-semibold text-purple-900">
                      {highest.campaign.name}
                    </p>
                    <p className="text-sm text-purple-700">
                      Current: {formatCurrency(latestV)}/day
                    </p>
                    <p className="text-sm text-purple-700">
                      Daily average:{" "}
                      {formatCurrency(highest.dailyAverageActual)}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Timeline Insights */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Timeline Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
              {(() => {
                const sel = filteredMetrics.filter((m) =>
                  selectedCampaigns.includes(m.campaign.id),
                );
                const avgPerf =
                  sel.reduce((s, m) => s + m.performanceScore, 0) / sel.length;
                const aheadCount = sel.filter(
                  (m) => m.velocity === "ahead",
                ).length;
                const behindCount = sel.filter(
                  (m) => m.velocity === "behind",
                ).length;

                const velocityTrends = sel.map((m) => {
                  const d = m.timelineData;
                  if (d.length < 14)
                    return {
                      name: m.campaign.name,
                      trend: "stable",
                      change: 0,
                    };
                  const recent =
                    d.slice(-7).reduce((s, x) => s + x.velocity, 0) / 7;
                  const previous =
                    d.slice(-14, -7).reduce((s, x) => s + x.velocity, 0) / 7;
                  const change = recent - previous;
                  const trend =
                    Math.abs(previous) < 1
                      ? "stable"
                      : Math.abs(change) < previous * 0.1
                        ? "stable"
                        : change > 0
                          ? "increasing"
                          : "decreasing";
                  return { name: m.campaign.name, trend, change };
                });

                return (
                  <div className="space-y-2">
                    <div>
                      • Average performance score: {Math.round(avgPerf)}/100
                    </div>
                    <div>
                      • {aheadCount} campaign(s) ahead of schedule,{" "}
                      {behindCount} behind
                    </div>
                    <div>
                      • Total raised across selected:{" "}
                      {formatCurrency(
                        sel.reduce((s, m) => s + m.campaign.raised, 0),
                      )}
                    </div>
                    <div className="mt-3">
                      <strong>Velocity Trends (last 7 days):</strong>
                      <ul className="mt-1 space-y-1">
                        {velocityTrends.map((t) => (
                          <li key={t.name} className="text-xs">
                            • {t.name}:
                            <span
                              className={`ml-1 ${
                                t.trend === "increasing"
                                  ? "text-green-600"
                                  : t.trend === "decreasing"
                                    ? "text-red-600"
                                    : "text-slate-600"
                              }`}
                            >
                              {t.trend}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {!showTimelineCharts && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowTimelineCharts(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Activity className="h-4 w-4" />
                View Timeline Comparison Charts
              </button>
            </div>
          )}
        </div>
      )}

      {/* Help */}
      {selectedCampaigns.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                Get Started with Campaign Comparison
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                Click on 2 or more campaign cards to compare performance and see
                timeline analysis.
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>
                  • <strong>Timeline Charts:</strong> Progress curves, daily
                  velocity, efficiency
                </li>
                <li>
                  • <strong>Performance Analysis:</strong> Compare key metrics
                  and identify top performers
                </li>
                <li>
                  • <strong>Velocity Insights:</strong> Track momentum and
                  trends
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparativeCampaignAnalysis;
