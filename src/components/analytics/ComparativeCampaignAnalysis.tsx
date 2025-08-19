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

// Import your existing services and types
import { useClient } from "../../context/ClientContext";
import { useCampaigns } from "../../hooks/useCampaigns";

import type { Campaign } from "../../models/campaign";

// Use your existing Campaign type
// interface Campaign is imported from '../../models/campaign'

// Calculated metrics for comparison
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
}

// Timeline data structure
interface TimelineDataPoint {
  date: string;
  day: number;
  cumulativeRaised: number;
  cumulativePercentage: number;
  dailyRaised: number;
  targetCumulative: number;
  targetPercentage: number;
  velocity: number; // daily fundraising rate
  efficiency: number; // actual vs target at this point
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

  // Filter campaigns for current client
  const clientCampaigns = useMemo(() => {
    if (!currentClient || !campaigns) return [];
    return campaigns.filter(
      (campaign) => campaign.clientId === currentClient.id,
    );
  }, [campaigns, currentClient]);

  // Generate realistic timeline data for campaigns
  const generateTimelineData = (campaign: Campaign): TimelineDataPoint[] => {
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    const now = new Date();

    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysPassed = Math.min(
      totalDays,
      Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const timelineData: TimelineDataPoint[] = [];

    // Generate data for each day of the campaign
    for (let day = 0; day <= Math.min(daysPassed, totalDays); day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);

      // Simulate realistic fundraising curve (typically starts slow, accelerates, then plateaus)
      const progressFactor = day / totalDays;
      let cumulativePercentage: number;

      if (campaign.status === "Completed") {
        // For completed campaigns, use a realistic S-curve
        cumulativePercentage = Math.min(
          100,
          100 * (1 - Math.exp(-3 * progressFactor)),
        );
      } else {
        // For active campaigns, simulate current progress with some variance
        const targetProgress = (day / totalDays) * 100;
        const actualProgress = (campaign.raised / campaign.goal) * 100;

        // Interpolate between target and actual based on campaign efficiency
        if (day === daysPassed) {
          cumulativePercentage = actualProgress;
        } else {
          // Simulate a curve leading to current progress
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

      // Calculate daily velocity (change from previous day)
      const prevRaised = day > 0 ? timelineData[day - 1].cumulativeRaised : 0;
      const dailyRaised = cumulativeRaised - prevRaised;
      const velocity = dailyRaised;

      // Calculate efficiency (actual vs target)
      const efficiency =
        targetCumulative > 0 ? cumulativeRaised / targetCumulative : 1;

      timelineData.push({
        date: currentDate.toISOString().split("T")[0],
        day: day + 1,
        cumulativeRaised: Math.round(cumulativeRaised),
        cumulativePercentage: Math.round(cumulativePercentage * 10) / 10,
        dailyRaised: Math.round(dailyRaised),
        targetCumulative: Math.round(targetCumulative),
        targetPercentage: Math.round(targetPercentage * 10) / 10,
        velocity: Math.round(velocity),
        efficiency: Math.round(efficiency * 100) / 100,
      });
    }

    return timelineData;
  };

  // Calculate metrics for each campaign
  const campaignMetrics = useMemo((): CampaignMetrics[] => {
    return clientCampaigns.map((campaign) => {
      const progressPercentage = (campaign.raised / campaign.goal) * 100;
      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);
      const now = new Date();

      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const daysPassed = Math.ceil(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const daysRemaining = Math.max(0, totalDays - daysPassed);

      const timeProgressPercentage = (daysPassed / totalDays) * 100;
      const efficiency =
        progressPercentage / Math.max(timeProgressPercentage, 1);

      const dailyAverageNeeded =
        daysRemaining > 0
          ? (campaign.goal - campaign.raised) / daysRemaining
          : 0;
      const dailyAverageActual =
        daysPassed > 0 ? campaign.raised / daysPassed : 0;

      let velocity: "ahead" | "on-track" | "behind" = "on-track";
      if (efficiency > 1.1) velocity = "ahead";
      else if (efficiency < 0.9) velocity = "behind";

      const performanceScore = Math.min(
        100,
        Math.max(
          0,
          progressPercentage * 0.6 +
            efficiency * 20 +
            (campaign.status === "Completed" ? 20 : 0),
        ),
      );

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
      };
    });
  }, [clientCampaigns]);

  // Filter and sort campaigns
  const filteredMetrics = useMemo(() => {
    let filtered = campaignMetrics;

    if (filterType !== "all") {
      filtered = filtered.filter(
        (metric) => metric.campaign.type === filterType,
      );
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

  // Prepare timeline chart data for selected campaigns
  const timelineChartData = useMemo(() => {
    if (selectedCampaigns.length === 0) return [];

    const selectedMetrics = filteredMetrics.filter((m) =>
      selectedCampaigns.includes(m.campaign.id),
    );
    if (selectedMetrics.length === 0) return [];

    // Find the maximum timeline length
    const maxDays = Math.max(
      ...selectedMetrics.map((m) => m.timelineData.length),
    );

    // Create combined timeline data
    const combinedData = [];
    for (let day = 1; day <= maxDays; day++) {
      const dataPoint: any = { day };

      selectedMetrics.forEach((metric, index) => {
        const dayData = metric.timelineData.find((d) => d.day === day);
        const campaignName = metric.campaign.name;
        const color =
          metric.campaign.theme?.primary ||
          ["#3B82F6", "#059669", "#DC2626", "#7C3AED"][index % 4];

        if (dayData) {
          switch (timelineView) {
            case "progress":
              dataPoint[`${campaignName}_progress`] =
                dayData.cumulativePercentage;
              dataPoint[`${campaignName}_target`] = dayData.targetPercentage;
              break;
            case "velocity":
              dataPoint[`${campaignName}_velocity`] = dayData.velocity;
              break;
            case "efficiency":
              dataPoint[`${campaignName}_efficiency`] = dayData.efficiency;
              break;
          }
          dataPoint[`${campaignName}_color`] = color;
        }
      });

      combinedData.push(dataPoint);
    }

    return combinedData;
  }, [selectedCampaigns, filteredMetrics, timelineView]);

  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(campaignId)
        ? prev.filter((id) => id !== campaignId)
        : [...prev, campaignId],
    );
  };

  const getVelocityIcon = (velocity: string) => {
    switch (velocity) {
      case "ahead":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "behind":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (name.includes("progress") || name.includes("target")) {
      return [`${value}%`, name.replace(/_progress|_target/, "")];
    }
    if (name.includes("velocity")) {
      return [formatCurrency(value), name.replace(/_velocity/, "") + " Daily"];
    }
    if (name.includes("efficiency")) {
      return [`${value}x`, name.replace(/_efficiency/, "") + " Efficiency"];
    }
    return [value, name];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <option value="Annual Fund">Annual Fund</option>
            <option value="Capital">Capital</option>
            <option value="Emergency">Emergency</option>
            <option value="Program">Program</option>
            <option value="Event">Event</option>
            <option value="Endowment">Endowment</option>
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
              onClick={() => setShowTimelineCharts(!showTimelineCharts)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <Activity className="h-4 w-4" />
              {showTimelineCharts ? "Hide" : "Show"} Timeline
            </button>
          )}
        </div>
      </div>

      {/* Timeline Charts Section */}
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

                {/* Render lines for each selected campaign */}
                {filteredMetrics
                  .filter((m) => selectedCampaigns.includes(m.campaign.id))
                  .map((metric, index) => {
                    const campaignName = metric.campaign.name;
                    const color =
                      metric.campaign.theme?.primary ||
                      ["#3B82F6", "#059669", "#DC2626", "#7C3AED"][index % 4];

                    return (
                      <Line
                        key={`${campaignName}_${timelineView}`}
                        type="monotone"
                        dataKey={`${campaignName}_${timelineView}`}
                        stroke={color}
                        strokeWidth={3}
                        dot={{ fill: color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                        name={campaignName}
                      />
                    );
                  })}

                {/* Show target line for progress view */}
                {timelineView === "progress" && (
                  <Line
                    type="monotone"
                    dataKey={`${filteredMetrics.find((m) => selectedCampaigns.includes(m.campaign.id))?.campaign.name}_target`}
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                    name="Target Progress"
                  />
                )}

                {/* Reference line for efficiency view */}
                {timelineView === "efficiency" && (
                  <ReferenceLine y={1} stroke="#94a3b8" strokeDasharray="3 3" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Timeline View Explanations */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>
                <strong>Progress:</strong> Cumulative fundraising percentage
                over time
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>
                <strong>Velocity:</strong> Daily fundraising amounts showing
                momentum
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

      {/* Summary Stats */}
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
                  filteredMetrics.reduce((sum, m) => sum + m.campaign.goal, 0),
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
                  filteredMetrics.reduce(
                    (sum, m) => sum + m.campaign.raised,
                    0,
                  ),
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
                {Math.round(
                  filteredMetrics.reduce(
                    (sum, m) => sum + m.performanceScore,
                    0,
                  ) / filteredMetrics.length,
                )}
                %
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Campaign Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMetrics.map((metric) => (
          <div
            key={metric.campaign.id}
            className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
              selectedCampaigns.includes(metric.campaign.id)
                ? "border-blue-500 shadow-md"
                : "border-slate-200 hover:border-slate-300"
            }`}
            onClick={() => toggleCampaignSelection(metric.campaign.id)}
          >
            {/* Header */}
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

            {/* Metrics */}
            <div className="p-6 space-y-4">
              {/* Progress Bar */}
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
                      backgroundColor:
                        metric.campaign.theme?.primary || "#3B82F6",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{formatCurrency(metric.campaign.raised)}</span>
                  <span>{formatCurrency(metric.campaign.goal)}</span>
                </div>
              </div>

              {/* Performance Score */}
              <div
                className={`p-3 rounded-lg border ${getPerformanceColor(metric.performanceScore)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Performance Score</span>
                  <span className="text-lg font-bold">
                    {Math.round(metric.performanceScore)}/100
                  </span>
                </div>
              </div>

              {/* Key Metrics Grid */}
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

              {/* Timeline */}
              <div className="text-xs text-slate-500">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(metric.campaign.startDate).toLocaleDateString()} -{" "}
                    {new Date(metric.campaign.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Analysis Panel */}
      {selectedCampaigns.length >= 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Comparative Analysis ({selectedCampaigns.length} campaigns selected)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Best Performer */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Top Performer
              </h3>
              {(() => {
                const selectedMetrics = filteredMetrics.filter((m) =>
                  selectedCampaigns.includes(m.campaign.id),
                );
                const topPerformer = selectedMetrics.reduce((best, current) =>
                  current.performanceScore > best.performanceScore
                    ? current
                    : best,
                );
                return (
                  <div>
                    <p className="font-semibold text-green-900">
                      {topPerformer.campaign.name}
                    </p>
                    <p className="text-sm text-green-700">
                      Score: {Math.round(topPerformer.performanceScore)}/100
                    </p>
                    <p className="text-sm text-green-700">
                      {topPerformer.progressPercentage.toFixed(1)}% of goal
                      achieved
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Efficiency Leader */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Most Efficient
              </h3>
              {(() => {
                const selectedMetrics = filteredMetrics.filter((m) =>
                  selectedCampaigns.includes(m.campaign.id),
                );
                const mostEfficient = selectedMetrics.reduce((best, current) =>
                  current.efficiency > best.efficiency ? current : best,
                );
                return (
                  <div>
                    <p className="font-semibold text-blue-900">
                      {mostEfficient.campaign.name}
                    </p>
                    <p className="text-sm text-blue-700">
                      Efficiency: {mostEfficient.efficiency.toFixed(2)}x
                    </p>
                    <p className="text-sm text-blue-700">
                      {mostEfficient.velocity === "ahead"
                        ? "Ahead of schedule"
                        : mostEfficient.velocity === "behind"
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
                const selectedMetrics = filteredMetrics.filter((m) =>
                  selectedCampaigns.includes(m.campaign.id),
                );
                const highestVelocity = selectedMetrics.reduce(
                  (best, current) => {
                    const currentVelocity =
                      current.timelineData[current.timelineData.length - 1]
                        ?.velocity || 0;
                    const bestVelocity =
                      best.timelineData[best.timelineData.length - 1]
                        ?.velocity || 0;
                    return currentVelocity > bestVelocity ? current : best;
                  },
                );
                const latestVelocity =
                  highestVelocity.timelineData[
                    highestVelocity.timelineData.length - 1
                  ]?.velocity || 0;
                return (
                  <div>
                    <p className="font-semibold text-purple-900">
                      {highestVelocity.campaign.name}
                    </p>
                    <p className="text-sm text-purple-700">
                      Current: {formatCurrency(latestVelocity)}/day
                    </p>
                    <p className="text-sm text-purple-700">
                      Daily average:{" "}
                      {formatCurrency(highestVelocity.dailyAverageActual)}
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
                const selectedMetrics = filteredMetrics.filter((m) =>
                  selectedCampaigns.includes(m.campaign.id),
                );
                const avgPerformance =
                  selectedMetrics.reduce(
                    (sum, m) => sum + m.performanceScore,
                    0,
                  ) / selectedMetrics.length;
                const aheadCount = selectedMetrics.filter(
                  (m) => m.velocity === "ahead",
                ).length;
                const behindCount = selectedMetrics.filter(
                  (m) => m.velocity === "behind",
                ).length;

                // Calculate velocity trends
                const velocityTrends = selectedMetrics.map((metric) => {
                  const data = metric.timelineData;
                  if (data.length < 7)
                    return { name: metric.campaign.name, trend: "stable" };

                  const recent =
                    data.slice(-7).reduce((sum, d) => sum + d.velocity, 0) / 7;
                  const previous =
                    data
                      .slice(-14, -7)
                      .reduce((sum, d) => sum + d.velocity, 0) / 7;

                  const change = recent - previous;
                  const trend =
                    Math.abs(change) < previous * 0.1
                      ? "stable"
                      : change > 0
                        ? "increasing"
                        : "decreasing";

                  return { name: metric.campaign.name, trend, change };
                });

                return (
                  <div className="space-y-2">
                    <div>
                      • Average performance score: {Math.round(avgPerformance)}
                      /100
                    </div>
                    <div>
                      • {aheadCount} campaign(s) ahead of schedule,{" "}
                      {behindCount} behind
                    </div>
                    <div>
                      • Total raised across selected:{" "}
                      {formatCurrency(
                        selectedMetrics.reduce(
                          (sum, m) => sum + m.campaign.raised,
                          0,
                        ),
                      )}
                    </div>
                    <div className="mt-3">
                      <strong>Velocity Trends (last 7 days):</strong>
                      <ul className="mt-1 space-y-1">
                        {velocityTrends.map((trend) => (
                          <li key={trend.name} className="text-xs">
                            • {trend.name}:
                            <span
                              className={`ml-1 ${
                                trend.trend === "increasing"
                                  ? "text-green-600"
                                  : trend.trend === "decreasing"
                                    ? "text-red-600"
                                    : "text-slate-600"
                              }`}
                            >
                              {trend.trend}
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

          {/* Show Timeline Button */}
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

      {/* Help Text */}
      {selectedCampaigns.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                Get Started with Campaign Comparison
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                Click on 2 or more campaign cards to compare their performance
                and see timeline analysis.
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>
                  • <strong>Timeline Charts:</strong> See progress curves, daily
                  velocity, and efficiency over time
                </li>
                <li>
                  • <strong>Performance Analysis:</strong> Compare key metrics
                  and identify top performers
                </li>
                <li>
                  • <strong>Velocity Insights:</strong> Track fundraising
                  momentum and trends
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
