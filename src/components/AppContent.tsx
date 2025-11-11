// src/components/AppContent.tsx
import {
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Bot,
  Menu,
  X,
  Palette,
  Brain,
  Wand2,
} from "lucide-react";
import React, { Suspense, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/useUI";
import CampaignsPanel from "@/panels/CampaignsPanel";

import LoadingSpinner from "./LoadingSpinner";
import Topbar from "./Topbar";

const ClaudePanel = React.lazy(() => import("../features/claude/ClaudePanel"));
const AnalyticsDashboard = React.lazy(
  () => import("@/panels/AnalyticsDashboard"),
);
const DonorsPanel = React.lazy(() => import("@/panels/DonorsPanel"));
const DashboardPanel = React.lazy(() => import("@/panels/DashboardPanel"));
const BrandProfilePanel = React.lazy(() => import("@/panels/BrandProfilePanel"));
const DonorIntelligencePanel = React.lazy(() => import("@/panels/DonorIntelligencePanel"));
const CampaignDesignerWizard = React.lazy(() => import("@/panels/CampaignDesignerWizard"));

type ViewKey = "dashboard" | "campaigns" | "analytics" | "donors" | "brand" | "intelligence" | "designer";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handler for the New Campaign button
  const handleNewCampaign = () => {
    setActiveView("campaigns");
    setSidebarOpen(false); // Close mobile sidebar
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
      component: DonorsPanel,
      description: "Donor management and insights",
    },
    {
      key: "brand",
      label: "Brand Profile",
      icon: Palette,
      component: BrandProfilePanel,
      description: "Manage brand identity for AI-generated campaigns",
    },
    {
      key: "intelligence",
      label: "Donor Intelligence",
      icon: Brain,
      component: DonorIntelligencePanel,
      description: "AI-powered donor analytics with privacy enforcement",
    },
    {
      key: "designer",
      label: "Campaign Designer",
      icon: Wand2,
      component: CampaignDesignerWizard,
      description: "AI-powered campaign generation (direct mail, email, social)",
    },
  ];

  const currentNavItem =
    navigationItems.find((item) => item.key === activeView) ||
    navigationItems[0];
  const CurrentComponent = currentNavItem.component;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900/50 border-r border-slate-800/50 backdrop-blur-md
        transition-transform duration-300 ease-in-out
      `}
      >
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Nexus</h1>
                <p className="text-slate-400 text-xs">Nonprofit Platform</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
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
                const base =
                  "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200";
                const activeClasses =
                  "bg-blue-600 text-white shadow-lg shadow-blue-600/25";
                const inactiveClasses =
                  "text-slate-400 hover:text-white hover:bg-slate-800/50";
                return (
                  <button
                    key={item.key}
                    data-tour={`nav-${item.key}`}
                    onClick={() => {
                      setActiveView(item.key);
                      setSidebarOpen(false); // Close mobile sidebar
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      base,
                      isActive ? activeClasses : inactiveClasses,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setShowClaudePanel(true);
                  setSidebarOpen(false); // Close mobile sidebar
                }}
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
      <main className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Replace Topbar with mobile-aware version */}
        <Topbar
          title={currentNavItem.label}
          description={currentNavItem.description}
          showSearch={true}
          showNewCampaignButton={hasRole("admin")}
          onNewCampaign={handleNewCampaign}
          actions={
            <div className="flex items-center space-x-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* AI Assistant button */}
              <button
                onClick={() => setShowClaudePanel(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
            </div>
          }
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-slate-400">Loading...</span>
            </div>
          ) : error ? (
            <div className="p-4 sm:p-8">
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
              <div className="p-4 sm:p-8">
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
