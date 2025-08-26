/* eslint-disable */
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AnalyticsFiltersComponent from "../components/AnalyticsFiltersComponent";
import DonorInsightsPanel from "../components/DonorInsightsPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import MetricsOverview from "../components/MetricsOverview";
import { analyticsService } from "../services/analyticsService";

type AnalyticsView = "overview" | "campaigns" | "donors" | "export";
type DateRange = { startDate: string; endDate: string };
type AnalyticsFilters = { dateRange: DateRange };

type OrganizationAnalytics = {
  currentPeriod: { totalRaised: number };
  previousPeriod: { totalRaised: number };
  topPerformingCampaigns: {
    id: string;
    name: string;
    raised: number;
    goal: number;
  }[];
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
            <MetricsOverview />
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Performance Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    ${orgAnalytics.currentPeriod.totalRaised.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-400">Current Period</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">
                    ${orgAnalytics.previousPeriod.totalRaised.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-400">Previous Period</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === "campaigns" && orgAnalytics && (
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Top Performing Campaigns
              </h3>
              <div className="space-y-3">
                {orgAnalytics.topPerformingCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-800 rounded"
                  >
                    <span className="font-medium text-white">
                      {campaign.name}
                    </span>
                    <div className="text-right">
                      <p className="font-semibold text-blue-300">
                        ${campaign.raised.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-400">
                        Goal: ${campaign.goal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
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
