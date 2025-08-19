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

import LoadingSpinner from "./LoadingSpinner";

// Lazy loaded components
const ClaudePanel = React.lazy(() => import("../features/claude/ClaudePanel"));
const AnalyticsDashboard = React.lazy(
  () => import("@/panels/AnalyticsDashboard"),
);
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
    { key: "clients", label: "Clients", icon: Building, path: "/clients" },
    {
      key: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      path: "/dashboard",
    },
    { key: "campaigns", label: "Campaigns", icon: Target, path: "/campaigns" },
    {
      key: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      path: "/analytics",
    },
    { key: "donors", label: "Donors", icon: Users, path: "/donors" },
  ];

  // Determine current page info
  const getCurrentPageInfo = () => {
    const path = location.pathname;
    if (path.startsWith("/client/")) {
      if (path.includes("/campaigns")) return { label: "Client Campaigns" };
      if (path.includes("/analytics")) return { label: "Client Analytics" };
      return { label: "Client Dashboard" };
    }
    return (
      navigationItems.find((item) => item.path === path) || {
        label: "Dashboard",
        description: "Overview of key metrics",
      }
    );
  };

  const currentPageInfo = getCurrentPageInfo();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex">
      {/* Sidebar */}
      <div className="w-64 bg-surface-elevated border-r border-border backdrop-blur-md">
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-accent rounded-lg flex items-center justify-center">
              <span className="text-text-inverse font-bold text-sm">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Nexus</h1>
              <p className="text-text-secondary text-xs">Nonprofit Platform</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <div className="text-text-muted text-xs uppercase tracking-wider font-medium mb-3 px-2">
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
                        ? "bg-brand-primary text-text-inverse shadow-md"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setShowClaudePanel(true)}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 text-text-secondary hover:text-text-primary hover:bg-surface-muted"
              >
                <Bot className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </button>
            </nav>
          </div>
          <div className="border-t border-border pt-4">
            <div className="text-text-muted text-xs mb-2 px-2">Current:</div>
            <div className="text-text-secondary text-sm px-2">
              <div>Dave Hail</div>
              <div className="text-xs text-text-muted">Nexus Consulting</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-border bg-surface/50 backdrop-blur-md">
          <div className="px-8 py-6 flex justify-between items-center">
            <div className="flex-1">
              <div className="mb-3">
                <Breadcrumb />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-1">
                {currentPageInfo.label}
              </h1>
              <p className="text-text-secondary">
                {currentPageInfo.description}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="text-text-secondary hover:text-text-primary transition-colors p-2 hover:bg-surface-muted rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowClaudePanel(true)}
                className="bg-brand-accent hover:bg-brand-primary text-text-inverse px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <Bot className="w-4 h-4" />
                <span>AI Assistant</span>
              </button>
              {hasRole("admin") && (
                <button className="bg-success hover:bg-brand-primary text-text-inverse px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
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
            <div className="flex justify-center items-center py-12 text-text-secondary">
              <LoadingSpinner size="lg" />
              <span className="ml-3">Loading...</span>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="bg-error/10 border border-error/30 rounded-lg p-6">
                <h3 className="text-sm font-medium text-error mb-2">
                  Application Error
                </h3>
                <p className="text-sm text-text-secondary">{String(error)}</p>
              </div>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="flex justify-center items-center py-12 text-text-secondary">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3">Loading panel...</span>
                </div>
              }
            >
              <div className="p-8">
                <Routes>
                  <Route path="/clients" element={<ClientList />} />
                  <Route path="/client/:id" element={<ClientDashboard />} />
                  <Route
                    path="/client/:id/campaigns"
                    element={<CampaignsPanel />}
                  />
                  <Route
                    path="/client/:id/analytics"
                    element={<AnalyticsDashboard />}
                  />
                  <Route path="/dashboard" element={<DashboardPanel />} />
                  <Route path="/campaigns" element={<CampaignsPanel />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/donors" element={<DonorsPlaceholder />} />
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
