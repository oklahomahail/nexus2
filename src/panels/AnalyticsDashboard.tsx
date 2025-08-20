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
  Plus,
  CheckCircle,
  AlertCircle,
  Edit3,
  Copy,
  X,
  Bookmark,
  FileText,
  Layout,
  Activity,
  Brain,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";

import LiveDashboards from "@/components/analytics/LiveDashboards";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useClient } from "@/context/ClientContext";
import { useNotifications } from "@/hooks/useNotifications";
import type { DonorInsights } from "@/models/analytics";
import type {
  CampaignAnalytics,
  OrganizationAnalytics,
  AnalyticsFilters,
  GoalAlert,
} from "@/models/analytics";
import analyticsService from "@/services/analyticsService";
import {
  goalsService,
  type Goal,
  type GoalTemplate,
} from "@/services/goalsService";

import { ComparativeCampaignAnalysis } from "../components/analytics";
import PredictiveAnalytics from "../components/analytics/PredictiveAnalytics";
import ReportGenerator from "../components/analytics/ReportGenerator";

interface AnalyticsTimeRange {
  start: Date;
  end: Date;
  label: string;
}

const AnalyticsDashboard: React.FC = () => {
  const { currentClient } = useClient();
  const { id: clientId } = useParams();
  const location = useLocation();
  const { add: addNotification } = useNotifications();

  // Tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "comparison", label: "Campaign Comparison", icon: TrendingUp },
    { id: "reports", label: "Executive Reports", icon: FileText },
    { id: "builder", label: "Report Builder", icon: Layout },
    { id: "scheduler", label: "Automation", icon: Calendar },
    { id: "dashboards", label: "Live Dashboards", icon: Activity }, // NEW
    { id: "goals", label: "Goals & Targets", icon: Target },
    { id: "predictive", label: "Predictive Analytics", icon: Brain },
    { id: "reports", label: "Report Generator", icon: FileText },
  ];

  // Current active tab state
  const [activeTab, setActiveTab] = useState("overview");
  {
    activeTab === "reports" && <ReportGenerator />;
  }

  // Client-scoped if the URL path contains /client/
  const isClientScoped = location.pathname.includes("/client/");
  const effectiveClientId = isClientScoped
    ? clientId || currentClient?.id
    : undefined;

  // Analytics state
  const [campaignAnalytics, setCampaignAnalytics] =
    useState<CampaignAnalytics | null>(null);
  const [orgAnalytics, setOrgAnalytics] =
    useState<OrganizationAnalytics | null>(null);
  const [donorInsights, setDonorInsights] = useState<DonorInsights | null>(
    null,
  );
  void donorInsights;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<AnalyticsTimeRange | null>(null);
  const [exporting, setExporting] = useState(false);

  // Goals state
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalAlerts, setGoalAlerts] = useState<GoalAlert[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

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

  // Load goals on mount
  useEffect(() => {
    const loadedGoals = goalsService.list();
    setGoals(loadedGoals);
  }, []);

  useEffect(() => {
    if (selectedTimeRange && activeTab === "overview") {
      void loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveClientId, selectedTimeRange, activeTab]);

  const loadAnalytics = useCallback(async () => {
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

      const scope = effectiveClientId ? "client" : "org";

      if (effectiveClientId) {
        // Client-scoped: load a representative campaign analytics
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

      // Evaluate goals and check for new alerts
      const alerts = await analyticsService.evaluateGoals(
        scope,
        effectiveClientId,
        filters,
      );
      setGoalAlerts(alerts);

      // Send notifications for newly met goals
      alerts.forEach((alert) => {
        if (alert.met) {
          addNotification({
            title: "Goal Achieved! 🎉",
            message: `${alert.goalName || alert.metric} target of ${alert.target.toLocaleString()} has been reached with ${alert.actual.toLocaleString()}`,
            type: "success",
          });
        }
      });
    } catch (err: any) {
      console.error("Failed to load analytics:", err);
      setError(err?.message ?? "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [selectedTimeRange, effectiveClientId, addNotification]);

  const handleSaveGoal = useCallback(
    (goalData: Omit<Goal, "id" | "createdAt"> & { id?: string }) => {
      const savedGoal = goalsService.upsert(goalData);

      if (goalData.id) {
        // Updating existing goal
        setGoals((prev) =>
          prev.map((g) => (g.id === goalData.id ? savedGoal : g)),
        );
        addNotification({
          title: "Goal Updated",
          message: `Goal "${savedGoal.name || savedGoal.metric}" has been updated`,
          type: "info",
        });
      } else {
        // Creating new goal
        setGoals((prev) => [...prev, savedGoal]);
        addNotification({
          title: "Goal Created",
          message: `New goal "${savedGoal.name || savedGoal.metric}" has been created`,
          type: "info",
        });
      }

      setShowGoalModal(false);
      setEditingGoal(null);
    },
    [addNotification],
  );

  const handleEditGoal = useCallback((goal: Goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  }, []);

  const handleRemoveGoal = useCallback(
    (goalId: string) => {
      goalsService.remove(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      setGoalAlerts((prev) => prev.filter((a) => a.goalId !== goalId));

      addNotification({
        title: "Goal Removed",
        message: "Goal has been deleted",
        type: "info",
      });
    },
    [addNotification],
  );

  const handleCreateFromTemplate = useCallback(
    (template: GoalTemplate, customTarget?: number) => {
      const scope = effectiveClientId ? "client" : "org";
      const newGoal = goalsService.createFromTemplate(
        template.id,
        scope,
        effectiveClientId || null,
        customTarget,
      );

      setGoals((prev) => [...prev, newGoal]);
      addNotification({
        title: "Goal Created from Template",
        message: `Created "${template.name}" goal`,
        type: "success",
      });
    },
    [effectiveClientId, addNotification],
  );

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

  const currentGoals = goals.filter(
    (g) =>
      g.scope === (effectiveClientId ? "client" : "org") &&
      g.scopeId === (effectiveClientId || null),
  );

  const metGoals = goalAlerts.filter((a) => a.met).length;
  const totalGoals = goalAlerts.length;

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
          {/* Time Range Selector - only show for overview tab */}
          {activeTab === "overview" && (
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
          )}

          {/* Export Button - only show for overview tab */}
          {activeTab === "overview" && (
            <button
              onClick={() => void handleExport("csv")}
              disabled={exporting}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? "Exporting…" : "Export CSV"}</span>
            </button>
          )}

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
                    : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300"
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
      {activeTab === "predictive" && <PredictiveAnalytics />}
      {activeTab === "overview" && (
        <>
          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-slate-400">Loading analytics…</span>
            </div>
          )}

          {error && (
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
          )}

          {/* Campaign Analytics */}
          {campaignAnalytics && !loading && !error && (
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
                    <h3 className="text-slate-400 text-sm font-medium">
                      Donors
                    </h3>
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
                    Range: ${campaignAnalytics.fundraisingMetrics.smallestGift}{" "}
                    – $
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
                    {campaignAnalytics.conversionMetrics.conversionRate.toFixed(
                      1,
                    )}
                    %
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
                  {campaignAnalytics.channelPerformance.map(
                    (channel, index) => (
                      <div
                        key={index}
                        className="p-4 bg-slate-700/50 rounded-lg"
                      >
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
                            <span className="text-white">
                              {channel.donorCount}
                            </span>
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
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Organization Analytics */}
          {orgAnalytics && !loading && !error && (
            <div className="space-y-6">
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
                        className={`text-xs ${orgAnalytics.growthMetrics.raisedChange > 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {orgAnalytics.growthMetrics.raisedChange > 0 ? "+" : ""}
                        {orgAnalytics.growthMetrics.raisedChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${orgAnalytics.currentPeriod.totalRaised.toLocaleString()}
                  </div>
                </div>
                {/* Add other org analytics cards as needed */}
              </div>
            </div>
          )}
        </>
      )}

      {/* Campaign Comparison Tab */}
      {activeTab === "comparison" && <ComparativeCampaignAnalysis />}
      {/* Live Dashboards Tab */}
      {activeTab === "dashboards" && <LiveDashboards />}

      {/* Goals Tab */}
      {activeTab === "goals" && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  Goals & Targets
                </h3>
              </div>
              {totalGoals > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-400">
                    {metGoals} of {totalGoals} goals met
                  </span>
                  <div className="w-20 bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${totalGoals > 0 ? (metGoals / totalGoals) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setEditingGoal(null);
                setShowGoalModal(true);
              }}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentGoals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No goals set yet</p>
                <button
                  onClick={() => {
                    setEditingGoal(null);
                    setShowGoalModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Your First Goal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goalAlerts.map((alert) => {
                  const goal = goals.find((g) => g.id === alert.goalId);
                  if (!goal) return null;

                  const progress = Math.min(
                    (alert.actual / alert.target) * 100,
                    100,
                  );

                  return (
                    <div
                      key={alert.goalId}
                      className="p-4 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium truncate">
                          {goal.name || alert.metric}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {alert.met ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                          )}
                          <button
                            onClick={() => handleEditGoal(goal)}
                            className="text-slate-400 hover:text-blue-400 transition-colors"
                            title="Edit goal"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveGoal(goal.id)}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                            title="Remove goal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {goal.description && (
                        <p className="text-slate-400 text-xs mb-2 truncate">
                          {goal.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Progress:</span>
                          <span
                            className={`font-semibold ${alert.met ? "text-green-400" : "text-white"}`}
                          >
                            {alert.actual.toLocaleString()} /{" "}
                            {alert.target.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              alert.met
                                ? "bg-gradient-to-r from-green-500 to-green-400"
                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-slate-400">
                            {progress.toFixed(1)}% complete
                          </div>
                          {goal.category && (
                            <span className="px-2 py-1 bg-slate-600 text-slate-300 rounded text-xs">
                              {goal.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <GoalModal
          scope={effectiveClientId ? "client" : "org"}
          scopeId={effectiveClientId || null}
          editingGoal={editingGoal}
          onSave={handleSaveGoal}
          onCancel={() => {
            setShowGoalModal(false);
            setEditingGoal(null);
          }}
          onCreateFromTemplate={handleCreateFromTemplate}
        />
      )}
    </div>
  );
};

// Enhanced Goal Modal with Templates and Editing
const GoalModal: React.FC<{
  scope: "org" | "client";
  scopeId: string | null;
  editingGoal?: Goal | null;
  onSave: (goal: Omit<Goal, "id" | "createdAt"> & { id?: string }) => void;
  onCancel: () => void;
  onCreateFromTemplate: (template: GoalTemplate, customTarget?: number) => void;
}> = ({
  scope,
  scopeId,
  editingGoal,
  onSave,
  onCancel,
  onCreateFromTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<"manual" | "templates">(
    editingGoal ? "manual" : "templates",
  );

  const [name, setName] = useState(editingGoal?.name || "");
  const [description, setDescription] = useState(
    editingGoal?.description || "",
  );
  const [metric, setMetric] = useState(editingGoal?.metric || "totalRaised");
  const [comparator, setComparator] = useState<
    "gte" | "gt" | "lt" | "lte" | "eq"
  >(editingGoal?.comparator || "gte");
  const [target, setTarget] = useState(editingGoal?.target?.toString() || "");
  const [category, setCategory] = useState(
    editingGoal?.category || "fundraising",
  );

  const templates = goalsService.getTemplates(scope);
  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !target.trim()) return;

    onSave({
      ...(editingGoal?.id ? { id: editingGoal.id } : {}),
      scope,
      scopeId,
      name: name.trim(),
      description: description.trim(),
      metric,
      comparator,
      target: parseInt(target, 10),
      category,
      active: true,
    });
  };

  const handleTemplateSelect = (template: GoalTemplate) => {
    setName(template.name);
    setDescription(template.description);
    setMetric(template.metric);
    setComparator(template.comparator);
    setTarget(template.suggestedTarget.toString());
    setCategory(template.category);
    setActiveTab("manual");
  };

  const handleQuickCreate = (template: GoalTemplate) => {
    onCreateFromTemplate(template);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-semibold text-white">
            {editingGoal ? "Edit Goal" : "Add New Goal"}
          </h3>

          {!editingGoal && (
            <div className="flex space-x-1 mt-4">
              <button
                onClick={() => setActiveTab("templates")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "templates"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Bookmark className="w-4 h-4 inline mr-2" />
                Templates
              </button>
              <button
                onClick={() => setActiveTab("manual")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "manual"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Custom Goal
              </button>
            </div>
          )}
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeTab === "templates" && !editingGoal && (
            <div className="p-6">
              <div className="space-y-4">
                {categories.map((cat) => {
                  const categoryTemplates = templates.filter(
                    (t) => t.category === cat,
                  );
                  return (
                    <div key={cat}>
                      <h4 className="text-sm font-semibold text-slate-300 mb-3 capitalize">
                        {cat} Goals
                      </h4>
                      <div className="grid gap-3">
                        {categoryTemplates.map((template) => (
                          <div
                            key={template.id}
                            className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="text-white font-medium">
                                {template.name}
                              </h5>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleTemplateSelect(template)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Customize template"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleQuickCreate(template)}
                                  className="text-green-400 hover:text-green-300 transition-colors"
                                  title="Create with default settings"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-slate-400 text-sm mb-2">
                              {template.description}
                            </p>
                            <div className="text-xs text-slate-500">
                              Target:{" "}
                              {template.suggestedTarget.toLocaleString()}{" "}
                              {template.metric}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "manual" && (
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Goal Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Annual Fundraising Target"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="fundraising">Fundraising</option>
                      <option value="engagement">Engagement</option>
                      <option value="growth">Growth</option>
                      <option value="efficiency">Efficiency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this goal represents..."
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Metric
                    </label>
                    <select
                      value={metric}
                      onChange={(e) => setMetric(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="totalRaised">Total Raised</option>
                      <option value="donorCount">Donor Count</option>
                      <option value="campaignCount">Campaign Count</option>
                      <option value="averageGiftSize">Average Gift Size</option>
                      <option value="conversionRate">Conversion Rate</option>
                      {scope === "org" && (
                        <option value="growthRate">Growth Rate (%)</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Condition
                    </label>
                    <select
                      value={comparator}
                      onChange={(e) => setComparator(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="gte">≥ At least</option>
                      <option value="gt">&gt; Greater than</option>
                      <option value="lte">≤ At most</option>
                      <option value="lt">&lt; Less than</option>
                      <option value="eq">= Equal to</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Target *
                    </label>
                    <input
                      type="number"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="50000"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingGoal ? "Update Goal" : "Create Goal"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
