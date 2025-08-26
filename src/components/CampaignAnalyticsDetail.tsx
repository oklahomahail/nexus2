import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
  Zap,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Types for our enhanced analytics
interface CampaignVelocity {
  dailyAverage: number;
  weeklyTrend: number;
  projectedCompletion: string;
  daysToGoal: number;
  isOnTrack: boolean;
}

interface ChannelMetrics {
  channel: string;
  revenue: number;
  donors: number;
  averageGift: number;
  conversionRate: number;
  cost: number;
  roi: number;
  trend: number;
}

interface DonorSegmentAnalysis {
  segment: string;
  count: number;
  percentage: number;
  revenue: number;
  averageGift: number;
  retentionLikelihood: number;
  growthPotential: "high" | "medium" | "low";
}

interface CampaignHealthScore {
  overall: number;
  fundraising: number;
  engagement: number;
  momentum: number;
  efficiency: number;
  factors: Array<{
    factor: string;
    score: number;
    impact: "positive" | "negative" | "neutral";
    suggestion: string;
  }>;
}

// Mock data generator
const generateCampaignAnalytics = (_campaignId: string) => {
  const baseRevenue = 32500;
  const goalAmount = 50000;
  const donorCount = 127;

  // Velocity calculation
  const daysElapsed = 25;
  const dailyAverage = baseRevenue / daysElapsed;
  const remainingAmount = goalAmount - baseRevenue;
  const daysToGoal = Math.ceil(remainingAmount / dailyAverage);
  const projectedEndDate = new Date();
  projectedEndDate.setDate(projectedEndDate.getDate() + daysToGoal);

  const velocity: CampaignVelocity = {
    dailyAverage: Math.round(dailyAverage),
    weeklyTrend: 12.5,
    projectedCompletion: projectedEndDate.toLocaleDateString(),
    daysToGoal,
    isOnTrack: daysToGoal <= 45,
  };

  // Channel performance with ROI
  const channels: ChannelMetrics[] = [
    {
      channel: "Email",
      revenue: 15600,
      donors: 78,
      averageGift: 200,
      conversionRate: 8.2,
      cost: 450,
      roi: 34.7,
      trend: 15.2,
    },
    {
      channel: "Social Media",
      revenue: 8200,
      donors: 32,
      averageGift: 156,
      conversionRate: 4.1,
      cost: 320,
      roi: 25.6,
      trend: -2.1,
    },
    {
      channel: "Direct Mail",
      revenue: 6800,
      donors: 24,
      averageGift: 283,
      conversionRate: 12.4,
      cost: 890,
      roi: 7.6,
      trend: -8.3,
    },
    {
      channel: "Events",
      revenue: 1900,
      donors: 8,
      averageGift: 237,
      conversionRate: 45.2,
      cost: 1200,
      roi: 1.6,
      trend: 5.7,
    },
  ];

  // Donor segmentation
  const segments: DonorSegmentAnalysis[] = [
    {
      segment: "Major Donors",
      count: 12,
      percentage: 9.4,
      revenue: 14500,
      averageGift: 1208,
      retentionLikelihood: 85,
      growthPotential: "high",
    },
    {
      segment: "Mid-Level",
      count: 28,
      percentage: 22.0,
      revenue: 11200,
      averageGift: 400,
      retentionLikelihood: 72,
      growthPotential: "high",
    },
    {
      segment: "Regular Donors",
      count: 67,
      percentage: 52.8,
      revenue: 5850,
      averageGift: 87,
      retentionLikelihood: 58,
      growthPotential: "medium",
    },
    {
      segment: "First-Time",
      count: 20,
      percentage: 15.7,
      revenue: 950,
      averageGift: 47,
      retentionLikelihood: 28,
      growthPotential: "high",
    },
  ];

  // Health score calculation
  const healthScore: CampaignHealthScore = {
    overall: 78,
    fundraising: 82,
    engagement: 71,
    momentum: 85,
    efficiency: 75,
    factors: [
      {
        factor: "Donation Velocity",
        score: 85,
        impact: "positive",
        suggestion: "Strong momentum - maintain current strategies",
      },
      {
        factor: "Email Performance",
        score: 78,
        impact: "positive",
        suggestion: "Above average open rates, optimize subject lines",
      },
      {
        factor: "Donor Retention",
        score: 65,
        impact: "neutral",
        suggestion: "Focus on stewardship of first-time donors",
      },
      {
        factor: "Channel Diversification",
        score: 58,
        impact: "negative",
        suggestion: "Heavy reliance on email - expand social media",
      },
    ],
  };

  // Time series data for trending
  const timeSeriesData = Array.from({ length: 25 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (24 - i));
    const baseDaily = dailyAverage * (0.7 + Math.random() * 0.6);
    const cumulativeRevenue = Math.min(baseRevenue, (i + 1) * dailyAverage);

    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      daily: Math.round(baseDaily),
      cumulative: Math.round(cumulativeRevenue),
      donors: Math.round(
        (i + 1) * (donorCount / 25) * (0.8 + Math.random() * 0.4),
      ),
      avgGift: Math.round(200 + Math.random() * 100),
    };
  });

  return {
    velocity,
    channels,
    segments,
    healthScore,
    timeSeriesData,
  };
};

// Component
type CampaignAnalyticsDetailProps = { campaignId: string };

const CampaignAnalyticsDetail: React.FC<CampaignAnalyticsDetailProps> = ({
  campaignId,
}) => {
  const [activeTab, setActiveTab] = useState("performance");
  const analytics = useMemo(
    () => generateCampaignAnalytics(campaignId),
    [campaignId],
  );

  const tabs = [
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "velocity", label: "Velocity & Forecast", icon: Zap },
    { id: "channels", label: "Channel Analysis", icon: BarChart3 },
    { id: "donors", label: "Donor Insights", icon: Users },
    { id: "health", label: "Health Score", icon: Activity },
  ];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const SEGMENT_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Campaign Analytics</h2>
          <p className="text-slate-400">
            Deep performance insights and forecasting
          </p>
        </div>

        {/* Quick Health Indicator */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm text-slate-400">Overall Health</div>
            <div
              className={`text-xl font-bold ${getHealthColor(analytics.healthScore.overall)}`}
            >
              {analytics.healthScore.overall}/100
            </div>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-700"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${analytics.healthScore.overall}, 100`}
                className={getHealthColor(analytics.healthScore.overall)}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Performance Overview */}
        {activeTab === "performance" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Revenue Trend
              </h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.timeSeriesData}>
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Performance */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Daily Performance
              </h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.timeSeriesData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="daily" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Velocity & Forecast */}
        {activeTab === "velocity" && (
          <div className="space-y-6">
            {/* Velocity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-sm font-medium">
                    Daily Average
                  </h3>
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(analytics.velocity.dailyAverage)}
                </div>
                <div
                  className={`flex items-center mt-2 text-sm ${
                    analytics.velocity.weeklyTrend > 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {analytics.velocity.weeklyTrend > 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(analytics.velocity.weeklyTrend)}% this week
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-sm font-medium">
                    Days to Goal
                  </h3>
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {analytics.velocity.daysToGoal}
                </div>
                <div
                  className={`text-sm mt-2 ${
                    analytics.velocity.isOnTrack
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {analytics.velocity.isOnTrack ? (
                    <>
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      On track
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Behind pace
                    </>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-sm font-medium">
                    Projected End
                  </h3>
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {analytics.velocity.projectedCompletion}
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  At current pace
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-sm font-medium">
                    Momentum
                  </h3>
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {analytics.healthScore.momentum}%
                </div>
                <div className="text-sm text-green-400 mt-2">
                  Strong velocity
                </div>
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Revenue Forecast
              </h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      ...analytics.timeSeriesData,
                      {
                        date: "Goal",
                        cumulative: 50000,
                        daily: 0,
                        donors: 150,
                        avgGift: 250,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Channel Analysis */}
        {activeTab === "channels" && (
          <div className="space-y-6">
            {/* Channel Performance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analytics.channels.map((channel, _index) => (
                <div
                  key={channel.channel}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">
                      {channel.channel}
                    </h3>
                    <div
                      className={`flex items-center text-sm ${
                        channel.trend > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {channel.trend > 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(channel.trend)}%
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-slate-400 text-xs">Revenue</div>
                      <div className="text-lg font-bold text-white">
                        {formatCurrency(channel.revenue)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-slate-400 text-xs">Donors</div>
                        <div className="text-white font-medium">
                          {channel.donors}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">Avg Gift</div>
                        <div className="text-white font-medium">
                          {formatCurrency(channel.averageGift)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">Conv Rate</div>
                        <div className="text-white font-medium">
                          {channel.conversionRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">ROI</div>
                        <div
                          className={`font-medium ${channel.roi > 10 ? "text-green-400" : channel.roi > 5 ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {channel.roi}x
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Channel ROI Comparison */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Channel ROI Comparison
              </h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.channels}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="channel" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="roi" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Donor Insights */}
        {activeTab === "donors" && (
          <div className="space-y-6">
            {/* Donor Segmentation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Donor Distribution
                </h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <RechartsPieChart
                        data={analytics.segments.map((seg, i) => ({
                          ...seg,
                          fill: SEGMENT_COLORS[i],
                        }))}
                      >
                        {analytics.segments.map((entry, _index) => (
                          <Cell
                            key={`cell-${_index}`}
                            fill={
                              SEGMENT_COLORS[_index % SEGMENT_COLORS.length]
                            }
                          />
                        ))}
                      </RechartsPieChart>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Segment Analysis
                </h3>
                <div className="space-y-4">
                  {analytics.segments.map((segment, _index) => (
                    <div
                      key={segment.segment}
                      className="p-4 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: SEGMENT_COLORS[_index] }}
                          />
                          <h4 className="text-white font-medium">
                            {segment.segment}
                          </h4>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            segment.growthPotential === "high"
                              ? "bg-green-500/20 text-green-400"
                              : segment.growthPotential === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {segment.growthPotential} potential
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400">Count</div>
                          <div className="text-white font-medium">
                            {segment.count} ({segment.percentage}%)
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Revenue</div>
                          <div className="text-white font-medium">
                            {formatCurrency(segment.revenue)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Avg Gift</div>
                          <div className="text-white font-medium">
                            {formatCurrency(segment.averageGift)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Retention</div>
                          <div className="text-white font-medium">
                            {segment.retentionLikelihood}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Score */}
        {activeTab === "health" && (
          <div className="space-y-6">
            {/* Health Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Fundraising",
                  score: analytics.healthScore.fundraising,
                  icon: DollarSign,
                },
                {
                  label: "Engagement",
                  score: analytics.healthScore.engagement,
                  icon: Users,
                },
                {
                  label: "Momentum",
                  score: analytics.healthScore.momentum,
                  icon: TrendingUp,
                },
                {
                  label: "Efficiency",
                  score: analytics.healthScore.efficiency,
                  icon: Target,
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-sm font-medium">
                      {metric.label}
                    </h3>
                    <metric.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div
                    className={`text-2xl font-bold ${getHealthColor(metric.score)}`}
                  >
                    {metric.score}/100
                  </div>
                  <div className="mt-3 w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${getHealthBg(metric.score)}`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Health Factors */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Performance Factors
              </h3>
              <div className="space-y-4">
                {analytics.healthScore.factors.map((factor, _index) => (
                  <div key={_index} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">
                        {factor.factor}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`text-sm font-medium ${getHealthColor(factor.score)}`}
                        >
                          {factor.score}/100
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            factor.impact === "positive"
                              ? "bg-green-400"
                              : factor.impact === "negative"
                                ? "bg-red-400"
                                : "bg-yellow-400"
                          }`}
                        />
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm">
                      {factor.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignAnalyticsDetail;
