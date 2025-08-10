// src/components/Sidebar.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

import { useAnalytics } from "@/context/analytics/AnalyticsContext";
import { useUI } from "@/context/useUI";
import { useCampaigns } from "@/hooks/useCampaigns";

import SidebarItem from "./SidebarItem";

interface SidebarProps {
  navigationItems: {
    key: string;
    label: string;
    icon: string;
    description?: string;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ navigationItems }) => {
  const { activeView, sidebarCollapsed, setActiveView, toggleSidebar } =
    useUI();

  // Loosen types here to avoid breaking on evolving hook shapes
  const campaignsAny = useCampaigns() as any;
  const analyticsAny = useAnalytics() as any;

  const campaignStats = campaignsAny?.stats ?? { active: 0, totalRaised: 0 };
  const organization = analyticsAny?.organization ?? null;
  const user = analyticsAny?.user ?? null;

  return (
    <aside
      className={`bg-surface/50 border-r border-surface backdrop-blur-md transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-64"
      } hidden sm:block relative flex flex-col h-screen`}
    >
      {/* Header */}
      <div className="p-6 border-b border-surface/50 flex items-center justify-between flex-shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Nexus</h1>
              <p className="text-slate-400 text-xs">Nonprofit Platform</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all duration-200"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* User Profile */}
      {user?.id && (
        <div className="p-4 border-b border-surface/50 flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {(user.name?.charAt(0) as string) || "U"}
            </span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.organizationName || "Organization"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          {!sidebarCollapsed && (
            <div className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-3 px-2">
              Navigation
            </div>
          )}
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              description={item.description}
              isActive={activeView === item.key}
              onClick={() => setActiveView(item.key)}
              collapsed={!!sidebarCollapsed}
            />
          ))}
        </div>
      </nav>

      {/* Quick Stats Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-surface/50 flex-shrink-0">
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">
              Quick Stats
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Active Campaigns</span>
                <span className="text-sm font-semibold text-white bg-blue-500/20 px-2 py-0.5 rounded-full">
                  {Number(campaignStats.active) || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Total Raised</span>
                <span className="text-sm font-semibold text-green-400">
                  ${(Number(campaignStats.totalRaised) || 0).toLocaleString()}
                </span>
              </div>
              {organization && organization.overallMetrics && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Donors</span>
                  <span className="text-sm font-semibold text-purple-400">
                    {Number(
                      organization.overallMetrics.totalDonors,
                    ).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
