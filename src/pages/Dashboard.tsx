import {
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Building,
  Calendar,
  Mail,
  BarChart3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAnalytics } from "@/context/analytics/AnalyticsContext";
import { useClient } from "@/context/ClientContext";

export default function Dashboard() {
  const { platformMetrics, platformLoading, platformError, recentActivity } =
    useAnalytics();
  const { clients } = useClient();

  // Get activity icon and color based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "donation":
        return { icon: DollarSign, color: "text-green-400" };
      case "campaign":
        return { icon: Target, color: "text-blue-400" };
      case "email":
        return { icon: Mail, color: "text-purple-400" };
      case "segment":
        return { icon: Users, color: "text-orange-400" };
      default:
        return { icon: Calendar, color: "text-slate-400" };
    }
  };

  // Get client name by ID
  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const quickActions = [
    {
      title: "Create New Client",
      description: "Add a new organization",
      icon: Building,
      color: "text-blue-500",
      href: "/clients",
    },
    {
      title: "View All Campaigns",
      description: "Manage active campaigns",
      icon: Target,
      color: "text-green-500",
      href: "/clients/regional-food-bank/campaigns",
    },
    {
      title: "Analytics Overview",
      description: "View performance metrics",
      icon: BarChart3,
      color: "text-purple-500",
      href: "/clients/regional-food-bank/analytics",
    },
    {
      title: "Generate Reports",
      description: "Create detailed reports",
      icon: TrendingUp,
      color: "text-orange-500",
      href: "/clients/regional-food-bank/reports",
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Header */}
      <section>
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Welcome to Nexus
        </h1>
        <p className="text-blue-700">
          Your comprehensive fundraising management platform
        </p>
      </section>

      {/* Client Manager - Moved to Top */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Client Manager
            </h3>
            <p className="text-blue-700 mb-4">
              Manage your clients and access their dashboards. View client
              details, campaigns, and performance metrics.
            </p>
            <div className="flex space-x-3">
              <Link
                to="/clients/regional-food-bank"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm shadow-sm"
              >
                View Client Dashboard
              </Link>
              <Link
                to="/clients"
                className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 font-medium text-sm shadow-sm"
              >
                Manage All Clients
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Grid */}
      <section>
        <h2 className="text-xl font-semibold text-blue-900 mb-6">
          Platform Overview
        </h2>
        {platformError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Failed to load metrics</p>
              <p className="text-red-600 text-sm">{platformError}</p>
            </div>
          </div>
        ) : platformLoading ? (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-slate-600">Loading metrics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <Building className="w-6 h-6 text-blue-500" />
                <span className="text-xs text-slate-500">Total</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {platformMetrics?.totalClients || 0}
              </div>
              <div className="text-slate-600 text-sm">Clients</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <Target className="w-6 h-6 text-green-500" />
                <span className="text-xs text-green-500">Active</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {platformMetrics?.activeCampaigns || 0}
              </div>
              <div className="text-slate-600 text-sm">Campaigns</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-6 h-6 text-purple-500" />
                {platformMetrics && platformMetrics.donorsChange !== 0 && (
                  <span
                    className={`text-xs ${platformMetrics.donorsChange > 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {platformMetrics.donorsChange > 0 ? "+" : ""}
                    {platformMetrics.donorsChange.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {platformMetrics?.totalDonors.toLocaleString() || 0}
              </div>
              <div className="text-slate-600 text-sm">Total Donors</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="w-6 h-6 text-emerald-500" />
                {platformMetrics && platformMetrics.revenueChange !== 0 && (
                  <span
                    className={`text-xs ${platformMetrics.revenueChange > 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {platformMetrics.revenueChange > 0 ? "+" : ""}
                    {platformMetrics.revenueChange.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                ${platformMetrics?.monthlyRevenue.toLocaleString() || 0}
              </div>
              <div className="text-slate-600 text-sm">Revenue (30d)</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                <span className="text-xs text-slate-500">Avg</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                ${platformMetrics?.avgGiftSize || 0}
              </div>
              <div className="text-slate-600 text-sm">Avg Gift Size</div>
            </div>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold text-blue-900 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="p-6 bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 text-left group"
              >
                <Icon
                  className={`w-8 h-8 ${action.color} mb-4 group-hover:scale-110 transition-transform duration-200`}
                />
                <div className="font-semibold text-blue-900 mb-2">
                  {action.title}
                </div>
                <div className="text-blue-700 text-sm">
                  {action.description}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-blue-900">
            Recent Activity
          </h2>
          <Link
            to="/clients"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-blue-200 shadow-sm">
          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <p className="text-blue-600">No recent activity</p>
            </div>
          ) : (
            <div className="divide-y divide-blue-100">
              {recentActivity.map((activity) => {
                const { icon: Icon, color } = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-6 hover:bg-blue-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-blue-100 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-blue-900 text-sm font-medium">
                        {activity.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-blue-600 text-xs">
                          {getClientName(activity.clientId)}
                        </p>
                        <span className="text-blue-400">•</span>
                        <p className="text-blue-600 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
