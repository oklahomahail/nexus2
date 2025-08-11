// src/components/AppContent.tsx
import {
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Bot,
  Plus,
  Bell,
} from "lucide-react";
import React, { Suspense, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/useUI";
import CampaignsPanel from "@/panels/CampaignsPanel";

import LoadingSpinner from "./LoadingSpinner";

const ClaudePanel = React.lazy(() => import("../features/claude/ClaudePanel"));
const AnalyticsDashboard = React.lazy(
  () => import("@/panels/AnalyticsDashboard"),
);
const DonorsPlaceholder = React.lazy(
  () => import("@/panels/DonorsPlaceholder"),
);
const DashboardPanel = React.lazy(() => import("@/panels/DashboardPanel"));

type ViewKey = "dashboard" | "campaigns" | "analytics" | "donors";

interface NavigationItem {
  key: ViewKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
  description?: string;
}

const AppContent: React.FC = () => {
  const { activeView, setActiveView, loading = false, error = null } = useUI();
  const { hasRole } = useAuth();
  const [showClaudePanel, setShowClaudePanel] = useState(false);

  const toggleNotifications = () => {
    // wire up to your notifications drawer when ready
    // keeping to avoid UI regressions
    /* no-op */
  };

  const currentCampaign = useMemo(
    () => ({
      id: "campaign_1",
      name: "End of Year Giving Campaign",
      description: "Annual fundraising campaign to support our programs",
      goal: 50000,
      raised: 15000,
      progress: 30,
      daysLeft: 45,
      startDate: "2024-11-01",
      endDate: "2024-12-31",
      status: "Active" as const,
      category: "General" as const,
      targetAudience: "Individual donors and families",
      donorCount: 125,
      averageGift: 120,
      totalRevenue: 15000,
      totalDonors: 125,
      roi: 30,
      lastUpdated: new Date(),
      createdAt: new Date("2024-10-15"),
      createdBy: "Dave Hail",
      tags: ["year-end", "annual"],
      emailsSent: 450,
      clickThroughRate: 12.5,
      conversionRate: 8.2,
    }),
    [],
  );

  const navigationItems: NavigationItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      component: DashboardPanel,
      description: "Overview of key metrics and recent activity",
    },
    {
      key: "campaigns",
      label: "Campaigns",
      icon: Target,
      component: CampaignsPanel,
      description: "Manage fundraising campaigns",
    },
    {
      key: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      component: AnalyticsDashboard,
      description: "Performance insights and reports",
    },
    {
      key: "donors",
      label: "Donors",
      icon: Users,
      component: DonorsPlaceholder,
      description: "Donor management and insights",
    },
  ];

  const currentNavItem =
    navigationItems.find((item) => item.key === activeView) ||
    navigationItems[0];
  const CurrentComponent = currentNavItem.component;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900/50 border-r border-slate-800/50 backdrop-blur-md">
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Nexus</h1>
              <p className="text-slate-400 text-xs">Nonprofit Platform</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <div className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-3 px-2">
              Navigation
            </div>
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.key === activeView;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveView(item.key)}
                    aria-current={isActive ? "page" : undefined}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => setShowClaudePanel(true)}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <Bot className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </button>
            </nav>
          </div>

          <div className="border-t border-slate-800/50 pt-4">
            <div className="text-slate-500 text-xs mb-2 px-2">Current:</div>
            <div className="text-slate-400 text-sm px-2">
              <div>Dave Hail</div>
              <div className="text-xs text-slate-500">Nexus Consulting</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-md">
          <div className="px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {currentNavItem.label}
              </h1>
              <p className="text-slate-400">{currentNavItem.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleNotifications}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800/50 rounded-lg"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowClaudePanel(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Bot className="w-4 h-4" />
                <span>AI Assistant</span>
              </button>
              {hasRole("admin") && (
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Campaign</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-slate-400">Loading...</span>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-red-400 mb-2">
                  Application Error
                </h3>
                <p className="text-sm text-red-300">{String(error)}</p>
              </div>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3 text-slate-400">Loading panel...</span>
                </div>
              }
            >
              <div className="p-8">
                <CurrentComponent />
              </div>
            </Suspense>
          )}
        </div>
      </main>

      {/* Claude AI Panel */}
      <Suspense fallback={null}>
        <ClaudePanel
          isOpen={showClaudePanel}
          onClose={() => setShowClaudePanel(false)}
          currentCampaign={currentCampaign}
        />
      </Suspense>
    </div>
  );
};

export default AppContent;
