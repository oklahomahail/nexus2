/* eslint-disable */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import AnalyticsFiltersComponent from "../components/AnalyticsFiltersComponent";
import DonorInsightsPanel from "../components/DonorInsightsPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  KPIWidget,
  ChartWidget,
  ActivityFeed,
  GoalProgressWidget,
  CampaignSummaryWidget,
} from "../components/AnalyticsWidgets";
import { analyticsService } from "../services/analyticsService";
import { usePolling } from "@/hooks/usePolling";
import { POLLING } from "@/config/runtime";

type AnalyticsView = "overview" | "campaigns" | "donors" | "export";
type DateRange = { startDate: string; endDate: string };
type AnalyticsFilters = { dateRange: DateRange };

type OrganizationAnalytics = {
  currentPeriod: {
    totalRaised: number;
    donorCount: number;
    campaignsActive: number;
  };
  previousPeriod: { totalRaised: number; donorCount: number };
  topPerformingCampaigns: {
    id: string;
    name: string;
    raised: number;
    goal: number;
    daysLeft: number;
    status: "active" | "completed" | "draft";
  }[];
  recentActivities: {
    id: string;
    type: "donation" | "campaign" | "donor" | "goal";
    title: string;
    description: string;
    timestamp: Date;
    amount?: number;
  }[];
  monthlyData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
    }[];
  };
  goals: {
    monthly: { current: number; goal: number };
    quarterly: { current: number; goal: number };
    annual: { current: number; goal: number };
  };
};

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return null;
  }

  const [activeView, setActiveView] = useState<AnalyticsView>("overview");
  const [orgAnalytics, setOrgAnalytics] =
    useState<OrganizationAnalytics | null>(null);
  const [donorInsights, setDonorInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
  });

  useEffect(() => {
    void loadAnalyticsData();
  }, [filters]);
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [orgData, donorData] = await Promise.all([
        analyticsService.getOrganizationAnalytics(filters),
        analyticsService.getDonorInsights(filters),
      ]);

      setOrgAnalytics(orgData);
      setDonorInsights(donorData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load analytics data",
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh analytics data
  usePolling(loadAnalyticsData, {
    visibleInterval: POLLING.dashboard.visibleMs,
    hiddenInterval: POLLING.dashboard.hiddenMs,
    enabled: true,
    immediate: false,
    deps: [filters],
  });

  const handleExportData = async () => {
    try {
      const csvUrl = await analyticsService.exportAnalyticsData(
        "organization",
        filters,
      );
      const link = document.createElement("a");
      link.href = csvUrl;
      link.download = `analytics-export-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
    } catch {
      setError("Failed to export data");
    }
  };

  const navigationItems = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "campaigns", label: "Campaign Performance", icon: "🎯" },
    { key: "donors", label: "Donor Insights", icon: "👥" },
    { key: "export", label: "Export Data", icon: "📈" },
  ] as const;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-6">
        <div className="flex">
          <div className="mt-0.5">⚠️</div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-300">
              Analytics Error
            </h3>
            <p className="text-sm text-red-200 mt-1">{error}</p>
            <button
              onClick={loadAnalyticsData}
              className="mt-2 text-sm text-red-200 hover:text-red-100 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabBase =
    "py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors";

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400">
            Comprehensive insights into your fundraising performance and donor
            engagement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAnalyticsData}
            className="px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            Export Data
          </button>
        </div>
      </div>

      <AnalyticsFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
      />

      <div className="border-b border-slate-800/50">
        <nav className="-mb-px flex space-x-8">
          {navigationItems.map((item) => {
            const active =
              activeView === (item.key as AnalyticsView)
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700";
            return (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key as AnalyticsView)}
                className={[tabBase, active].join(" ")}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6">
        {activeView === "overview" && orgAnalytics && (
          <>
            {/* KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPIWidget
                title="Total Raised"
                value={`$${orgAnalytics.currentPeriod.totalRaised.toLocaleString()}`}
                change={{
                  value: `${(((orgAnalytics.currentPeriod.totalRaised - orgAnalytics.previousPeriod.totalRaised) / orgAnalytics.previousPeriod.totalRaised) * 100).toFixed(1)}%`,
                  direction:
                    orgAnalytics.currentPeriod.totalRaised >
                    orgAnalytics.previousPeriod.totalRaised
                      ? "up"
                      : "down",
                  period: "vs last period",
                }}
                icon="💰"
                color="green"
              />
              <KPIWidget
                title="Active Donors"
                value={orgAnalytics.currentPeriod.donorCount.toLocaleString()}
                change={{
                  value: `${orgAnalytics.currentPeriod.donorCount - orgAnalytics.previousPeriod.donorCount}`,
                  direction:
                    orgAnalytics.currentPeriod.donorCount >
                    orgAnalytics.previousPeriod.donorCount
                      ? "up"
                      : "down",
                  period: "new donors",
                }}
                icon="👥"
                color="blue"
              />
              <KPIWidget
                title="Active Campaigns"
                value={orgAnalytics.currentPeriod.campaignsActive}
                icon="🎯"
                color="purple"
              />
              <KPIWidget
                title="Avg Donation"
                value={`$${Math.round(orgAnalytics.currentPeriod.totalRaised / orgAnalytics.currentPeriod.donorCount).toLocaleString()}`}
                icon="📊"
                color="yellow"
              />
            </div>

            {/* Goals Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GoalProgressWidget
                title="Monthly Goal"
                current={orgAnalytics.goals.monthly.current}
                goal={orgAnalytics.goals.monthly.goal}
                period="This Month"
              />
              <GoalProgressWidget
                title="Quarterly Goal"
                current={orgAnalytics.goals.quarterly.current}
                goal={orgAnalytics.goals.quarterly.goal}
                period="Q4 2024"
              />
              <GoalProgressWidget
                title="Annual Goal"
                current={orgAnalytics.goals.annual.current}
                goal={orgAnalytics.goals.annual.goal}
                period="2024"
              />
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartWidget
                title="Monthly Fundraising Trend"
                data={orgAnalytics.monthlyData}
                height="300px"
              />
              <ActivityFeed
                activities={orgAnalytics.recentActivities}
                maxItems={8}
              />
            </div>

            {/* Campaign Overview */}
            <CampaignSummaryWidget
              campaigns={orgAnalytics.topPerformingCampaigns}
            />
          </>
        )}

        {activeView === "campaigns" && orgAnalytics && (
          <div className="space-y-6">
            {/* Campaign Performance KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPIWidget
                title="Total Campaign Revenue"
                value={`$${orgAnalytics.topPerformingCampaigns.reduce((sum, c) => sum + c.raised, 0).toLocaleString()}`}
                icon="💰"
                color="green"
              />
              <KPIWidget
                title="Active Campaigns"
                value={
                  orgAnalytics.topPerformingCampaigns.filter(
                    (c) => c.status === "active",
                  ).length
                }
                icon="🚀"
                color="blue"
              />
              <KPIWidget
                title="Completed Campaigns"
                value={
                  orgAnalytics.topPerformingCampaigns.filter(
                    (c) => c.status === "completed",
                  ).length
                }
                icon="✅"
                color="purple"
              />
            </div>

            {/* Detailed Campaign List */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Campaign Performance Details
              </h3>
              <div className="space-y-4">
                {orgAnalytics.topPerformingCampaigns.map((campaign) => {
                  const progress = (campaign.raised / campaign.goal) * 100;
                  const statusColors = {
                    active: "text-green-400 bg-green-900/20 border-green-800",
                    completed: "text-blue-400 bg-blue-900/20 border-blue-800",
                    draft: "text-yellow-400 bg-yellow-900/20 border-yellow-800",
                  };

                  return (
                    <div
                      key={campaign.id}
                      className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white text-lg">
                          {campaign.name}
                        </h4>
                        <span
                          className={clsx(
                            "px-3 py-1 rounded-full text-xs font-medium border",
                            statusColors[campaign.status],
                          )}
                        >
                          {campaign.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-slate-400">Raised</p>
                          <p className="font-semibold text-green-300">
                            ${campaign.raised.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Goal</p>
                          <p className="font-semibold text-white">
                            ${campaign.goal.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Progress</p>
                          <p className="font-semibold text-blue-300">
                            {progress.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Days Left</p>
                          <p className="font-semibold text-white">
                            {campaign.daysLeft}
                          </p>
                        </div>
                      </div>

                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeView === "donors" && donorInsights && (
          <DonorInsightsPanel insights={donorInsights} />
        )}

        {activeView === "export" && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Export Analytics Data
            </h3>
            <p className="text-slate-300 mb-4">
              Download fundraising and donor performance data filtered by the
              current date range and selected criteria.
            </p>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export All Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
