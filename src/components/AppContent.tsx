// src/components/AppContent.tsx
import {
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Bot,
  Plus,
  Bell,
  Building,
} from "lucide-react";
import React, { Suspense, useMemo, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/useUI";
import CampaignsPanel from "@/panels/CampaignsPanel";
// import Topbar from "@/components/Topbar"; // keep only if you render it

import LoadingSpinner from "./LoadingSpinner";

// Lazy loaded components
const ClaudePanel = React.lazy(() => import("../features/claude/ClaudePanel"));
const AnalyticsDashboard = React.lazy(
  () => import("@/panels/AnalyticsDashboard"),
);
// removed: DonorsPanel (unused)
const DashboardPanel = React.lazy(() => import("@/panels/DashboardPanel"));
const ClientList = React.lazy(() => import("@/pages/ClientList"));
const ClientDashboard = React.lazy(() => import("@/pages/ClientDashboard"));
const DonorsPlaceholder = React.lazy(
  () => import("@/components/DonorsPlaceholder"),
);

interface NavigationItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  description?: string;
  isClientScope?: boolean;
}

const AppContent: React.FC = () => {
  const { loading = false, error = null } = useUI();
  const { hasRole } = useAuth();
  const [showClaudePanel, setShowClaudePanel] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
      key: "clients",
      label: "Clients",
      icon: Building,
      path: "/clients",
      description: "Manage client organizations",
    },
    {
      key: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      path: "/dashboard",
      description: "Overview of key metrics and recent activity",
    },
    {
      key: "campaigns",
      label: "Campaigns",
      icon: Target,
      path: "/campaigns",
      description: "Manage fundraising campaigns",
    },
    {
      key: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      path: "/analytics",
      description: "Performance insights and reports",
    },
    {
      key: "donors",
      label: "Donors",
      icon: Users,
      path: "/donors",
      description: "Donor management and insights",
    },
  ];

  // Determine current page info based on route
  const getCurrentPageInfo = () => {
    const path = location.pathname;

    if (path.startsWith("/client/")) {
      if (path.includes("/campaigns")) {
        return {
          label: "Client Campaigns",
          description: "Manage client fundraising campaigns",
        };
      } else if (path.includes("/analytics")) {
        return {
          label: "Client Analytics",
          description: "Client performance insights and reports",
        };
      } else {
        return {
          label: "Client Dashboard",
          description: "Client overview and metrics",
        };
      }
    }

    const navItem = navigationItems.find((item) => item.path === path);
    return (
      navItem || {
        label: "Dashboard",
        description: "Overview of key metrics and recent activity",
      }
    );
  };

  const currentPageInfo = getCurrentPageInfo();

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
                const isActive =
                  location.pathname === item.path ||
                  (item.key === "clients" &&
                    location.pathname.startsWith("/client"));

                return (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.path)}
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
            <div className="flex-1">
              {/* Breadcrumb */}
              <div className="mb-3">
                <Breadcrumb />
              </div>

              <h1 className="text-2xl font-bold text-white mb-1">
                {currentPageInfo.label}
              </h1>
              <p className="text-slate-400">{currentPageInfo.description}</p>
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

        {/* Page Content with Routing */}
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
                <Routes>
                  {/* Client-first navigation */}
                  <Route path="/clients" element={<ClientList />} />
                  <Route path="/client/:id" element={<ClientDashboard />} />

                  {/* Client-scoped sections */}
                  <Route
                    path="/client/:id/campaigns"
                    element={<CampaignsPanel />}
                  />
                  <Route
                    path="/client/:id/analytics"
                    element={<AnalyticsDashboard />}
                  />

                  {/* Existing (org-wide) routes remain accessible */}
                  <Route path="/dashboard" element={<DashboardPanel />} />
                  <Route path="/campaigns" element={<CampaignsPanel />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/donors" element={<DonorsPlaceholder />} />

                  {/* Default */}
                  <Route
                    path="*"
                    element={<Navigate to="/clients" replace />}
                  />
                </Routes>
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
