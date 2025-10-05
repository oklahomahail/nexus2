import React, { useState, useEffect, useCallback } from "react";

import { POLLING } from "@/config/runtime";
import { useAuth } from "@/context/AuthContext";
import { usePolling } from "@/hooks/usePolling";

import AnalyticsFiltersComponent from "../components/AnalyticsFiltersComponent";
import {
  EnhancedKPIWidget,
  EnhancedChartWidget,
  EnhancedActivityFeed,
  EnhancedGoalProgressWidget,
  DataTableWidget,
  ActivityItem,
} from "../components/EnhancedAnalyticsWidgets";
import LoadingSpinner from "../components/LoadingSpinner";
import { Badge } from "../components/ui-kit/Badge";
import { Column } from "../components/ui-kit/DataTable";
import { ChartDataPoint } from "../components/ui-kit/InteractiveChart";
import { OrganizationAnalytics as ImportedOrgAnalytics } from "../models/analytics";
import { analyticsService } from "../services/analyticsService";

type AnalyticsView = "overview" | "campaigns" | "donors" | "export";
type DateRange = { startDate: string; endDate: string };
type AnalyticsFilters = { dateRange: DateRange };

const AnalyticsDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<AnalyticsView>("overview");
  const [orgAnalytics, setOrgAnalytics] = useState<ImportedOrgAnalytics | null>(
    null,
  );
  const [_donorInsights, _setDonorInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
  });

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [orgData, donorData] = await Promise.all([
        analyticsService.getOrganizationAnalytics(filters),
        analyticsService.getDonorInsights(filters),
      ]);

      setOrgAnalytics(orgData);
      _setDonorInsights(donorData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load analytics data",
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadAnalyticsData();
  }, [loadAnalyticsData, filters]);

  // Auto-refresh analytics data
  usePolling(loadAnalyticsData, {
    visibleInterval: POLLING.dashboard.visibleMs,
    hiddenInterval: POLLING.dashboard.hiddenMs,
    enabled: true,
    immediate: false,
    deps: [filters],
  });

  // Early return after all hooks
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-slate-400">Loading authentication...</span>
      </div>
    );
  }

  if (!user) {
    // Instead of redirecting, show a login prompt or message
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-white mb-4">
          🏢 Welcome to Nexus Analytics Demo
        </h3>
        <p className="text-slate-300 mb-4">
          Experience our nonprofit analytics platform with interactive
          dashboards, campaign tracking, and donor insights.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Create a demo user and log them in
              const demoUser = {
                id: "demo-user",
                email: "demo@nexus.com",
                firstName: "Demo",
                lastName: "User",
                name: "Demo User",
                role: "admin",
                roles: ["admin", "user"],
              };
              // Directly set the user in localStorage and reload
              if (typeof window !== "undefined") {
                window.localStorage.setItem(
                  "nexus_auth_user",
                  JSON.stringify(demoUser),
                );
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🚀 Enter Demo Mode
          </button>
          <button
            onClick={() => {
              // Show info about the demo
              alert(
                'This is a demo of the Nexus platform. Click "Enter Demo Mode" to explore the dashboard with sample data.',
              );
            }}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            ℹ️ About Demo
          </button>
        </div>
      </div>
    );
  }

  // Generate mock activity data
  const generateActivityData = (): ActivityItem[] => {
    if (!orgAnalytics) return [];

    return [
      {
        id: "1",
        type: "donation",
        title: "John Doe",
        description: "made a donation",
        amount: 100,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: "success",
      },
      {
        id: "2",
        type: "campaign",
        title: "Sarah Smith",
        description: "created a new campaign",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: "info",
      },
      {
        id: "3",
        type: "donation",
        title: "Mike Wilson",
        description: "made a donation",
        amount: 250,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: "success",
      },
    ];
  };

  // Generate table data for donors
  const generateDonorTableData = () => {
    if (!orgAnalytics) return [];

    return [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        totalDonated: 1250,
        lastDonation: "2024-01-15",
        campaigns: 3,
        status: "active",
      },
      {
        id: "2",
        name: "Sarah Smith",
        email: "sarah@example.com",
        totalDonated: 800,
        lastDonation: "2024-01-10",
        campaigns: 2,
        status: "active",
      },
      {
        id: "3",
        name: "Mike Wilson",
        email: "mike@example.com",
        totalDonated: 2100,
        lastDonation: "2024-01-12",
        campaigns: 5,
        status: "inactive",
      },
    ];
  };

  const donorTableColumns: Column<any>[] = [
    {
      key: "name",
      title: "Donor Name",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      key: "email",
      title: "Email",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      key: "totalDonated",
      title: "Total Donated",
      sortable: true,
      filterable: true,
      filterType: "number",
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      key: "lastDonation",
      title: "Last Donation",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      key: "campaigns",
      title: "Campaigns",
      sortable: true,
      filterable: true,
      filterType: "number",
    },
    {
      key: "status",
      title: "Status",
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      render: (value) => (
        <Badge variant={value === "active" ? "success" : "secondary"} size="sm">
          {value}
        </Badge>
      ),
    },
  ];

  // Transform data for charts
  const generateChartData = (): ChartDataPoint[] => {
    if (!orgAnalytics) return [];

    return [
      { label: "Jan", value: 12000 },
      { label: "Feb", value: 15000 },
      { label: "Mar", value: 18000 },
      { label: "Apr", value: 22000 },
      { label: "May", value: 19000 },
      { label: "Jun", value: 25000 },
    ];
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

  // Define a simple widget type for rendering
  interface SimpleWidget {
    id: string;
    type: string;
    title: string;
    position: { row: number; col: number; rowSpan: number; colSpan: number };
    visible: boolean;
  }

  const renderWidget = (widget: SimpleWidget): React.ReactNode => {
    switch (widget.id) {
      case "total-revenue":
        return (
          <EnhancedKPIWidget
            title="Total Revenue"
            value={orgAnalytics?.currentPeriod.totalRaised || 0}
            change={
              orgAnalytics
                ? {
                    value: `${(((orgAnalytics.currentPeriod.totalRaised - orgAnalytics.previousPeriod.totalRaised) / orgAnalytics.previousPeriod.totalRaised) * 100).toFixed(1)}%`,
                    direction:
                      orgAnalytics.currentPeriod.totalRaised >
                      orgAnalytics.previousPeriod.totalRaised
                        ? "up"
                        : "down",
                    period: "vs last period",
                  }
                : undefined
            }
            format="currency"
            loading={loading}
          />
        );
      case "total-donors":
        return (
          <EnhancedKPIWidget
            title="Total Donors"
            value={orgAnalytics?.currentPeriod.donorCount || 0}
            change={
              orgAnalytics
                ? {
                    value: `${orgAnalytics.currentPeriod.donorCount - orgAnalytics.previousPeriod.donorCount}`,
                    direction:
                      orgAnalytics.currentPeriod.donorCount >
                      orgAnalytics.previousPeriod.donorCount
                        ? "up"
                        : "down",
                    period: "new donors",
                  }
                : undefined
            }
            format="number"
            loading={loading}
          />
        );
      case "active-campaigns":
        return (
          <EnhancedKPIWidget
            title="Active Campaigns"
            value={orgAnalytics?.currentPeriod.campaignCount || 0}
            format="number"
            loading={loading}
          />
        );
      case "avg-donation":
        return (
          <EnhancedKPIWidget
            title="Average Donation"
            value={
              orgAnalytics
                ? Math.round(
                    orgAnalytics.currentPeriod.totalRaised /
                      orgAnalytics.currentPeriod.donorCount,
                  )
                : 0
            }
            format="currency"
            loading={loading}
          />
        );
      case "donations-chart":
        return (
          <EnhancedChartWidget
            title="Donations Over Time"
            data={generateChartData()}
            type="line"
            loading={loading}
            onDataPointClick={(point) => console.log("Clicked:", point)}
          />
        );
      case "goal-progress":
        return (
          <EnhancedGoalProgressWidget
            title="Campaign Goals"
            current={orgAnalytics?.goals?.monthly?.current || 15000}
            target={orgAnalytics?.goals?.monthly?.goal || 20000}
            loading={loading}
          />
        );
      case "activity-feed":
        return (
          <EnhancedActivityFeed
            activities={generateActivityData()}
            loading={loading}
            onItemClick={(activity) =>
              console.log("Activity clicked:", activity)
            }
          />
        );
      case "donors-table":
        return (
          <DataTableWidget
            title="Top Donors"
            data={generateDonorTableData()}
            columns={donorTableColumns}
            loading={loading}
            onRowClick={(row) => console.log("Donor clicked:", row)}
          />
        );
      default:
        return (
          <div className="p-4 text-center text-slate-400">Unknown widget</div>
        );
    }
  };

  const navigationItems = [
    { key: "overview", label: "Interactive Dashboard", icon: "📊" },
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
          <h1 className="text-2xl font-bold text-white">
            Enhanced Analytics Dashboard
          </h1>
          <p className="text-slate-400">
            Interactive widgets with real-time data, advanced filtering, and
            export capabilities
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
        {activeView === "overview" && (
          <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderWidget({
                id: "total-revenue",
                type: "kpi",
                title: "Total Revenue",
                position: { row: 0, col: 0, rowSpan: 2, colSpan: 3 },
                visible: true,
              })}
              {renderWidget({
                id: "total-donors",
                type: "kpi",
                title: "Total Donors",
                position: { row: 0, col: 3, rowSpan: 2, colSpan: 3 },
                visible: true,
              })}
              {renderWidget({
                id: "active-campaigns",
                type: "kpi",
                title: "Active Campaigns",
                position: { row: 0, col: 6, rowSpan: 2, colSpan: 3 },
                visible: true,
              })}
              {renderWidget({
                id: "avg-donation",
                type: "kpi",
                title: "Avg Donation",
                position: { row: 0, col: 9, rowSpan: 2, colSpan: 3 },
                visible: true,
              })}
            </div>

            {/* Chart and Progress Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {renderWidget({
                  id: "donations-chart",
                  type: "chart",
                  title: "Donations Over Time",
                  position: { row: 2, col: 0, rowSpan: 4, colSpan: 8 },
                  visible: true,
                })}
              </div>
              <div>
                {renderWidget({
                  id: "goal-progress",
                  type: "progress",
                  title: "Campaign Goals",
                  position: { row: 2, col: 8, rowSpan: 4, colSpan: 4 },
                  visible: true,
                })}
              </div>
            </div>

            {/* Activity and Table Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderWidget({
                id: "activity-feed",
                type: "activity",
                title: "Recent Activity",
                position: { row: 6, col: 0, rowSpan: 4, colSpan: 6 },
                visible: true,
              })}
              {renderWidget({
                id: "donors-table",
                type: "table",
                title: "Top Donors",
                position: { row: 6, col: 6, rowSpan: 4, colSpan: 6 },
                visible: true,
              })}
            </div>
          </div>
        )}

        {activeView === "campaigns" && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Campaign Performance
            </h3>
            <p className="text-slate-300">
              Enhanced campaign analytics view coming soon. Switch to the
              Interactive Dashboard for comprehensive campaign insights.
            </p>
          </div>
        )}

        {activeView === "donors" && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Donor Insights
            </h3>
            <p className="text-slate-300">
              Enhanced donor analytics view coming soon. Check the Interactive
              Dashboard for donor data tables and insights.
            </p>
          </div>
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
