// src/components/Sidebar.tsx - Modernized with unified design system
import React from 'react';
import { useUI } from '@/context/useUI';
import { useAnalytics } from '@/context/analytics/AnalyticsContext';
import { useCampaigns } from '@/hooks/useCampaigns';
import SidebarItem from './SidebarItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  navigationItems: {
    key: string;
    label: string;
    icon: string;
    description?: string;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ navigationItems }) => {
  const { activeView, sidebarCollapsed, setActiveView, toggleSidebar } = useUI();
  const { stats: campaignStats } = useCampaigns();
  const { organization, user } = useAnalytics();

  return (
    <aside
      className={`bg-surface/50 border-r border-surface backdrop-blur-md transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
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
              {user.name?.charAt(0) || 'U'}
            </span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.organizationName || 'Organization'}
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
              collapsed={sidebarCollapsed}
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
                  {campaignStats.active}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Total Raised</span>
                <span className="text-sm font-semibold text-green-400">
                  ${campaignStats.totalRaised.toLocaleString()}
                </span>
              </div>
              {organization && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Donors</span>
                  <span className="text-sm font-semibold text-purple-400">
                    {organization.overallMetrics.totalDonors.toLocaleString()}
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
