import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useUI } from '../hooks/useUI';
import { useCampaigns } from '../hooks/useCampaigns';
import { useAnalytics } from '../hooks/useAnalytics';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  navigationItems: {
    key: string;
    label: string;
    icon: string;
    description?: string;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ navigationItems }) => {
  const { state } = useAppContext();
  const { activeView, sidebarCollapsed, actions: uiActions } = useUI();
  const { stats: campaignStats } = useCampaigns();
  const { organization: orgAnalytics } = useAnalytics();

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} hidden sm:block relative`}>
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        {!sidebarCollapsed && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nexus</h1>
            <p className="text-sm text-gray-600">Nonprofit Platform</p>
          </div>
        )}
        <button onClick={uiActions.toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100">
          <svg className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {state.user.id && (
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">{state.user.name?.charAt(0) || 'U'}</span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{state.user.name || 'User'}</p>
              <p className="text-xs text-gray-600 truncate">{state.user.organizationName || 'Organization'}</p>
            </div>
          )}
        </div>
      )}

      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            description={item.description}
            isActive={activeView === item.key}
            onClick={() => uiActions.setActiveView(item.key)}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {!sidebarCollapsed && (
        <div className="absolute bottom-4 left-4 right-4 bg-gray-50 rounded-lg p-3">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Stats</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Campaigns</span>
              <span className="font-medium">{campaignStats.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Raised</span>
              <span className="font-medium">${campaignStats.totalRaised.toLocaleString()}</span>
            </div>
            {orgAnalytics && (
              <div className="flex justify-between">
                <span className="text-gray-600">Donors</span>
                <span className="font-medium">{orgAnalytics.overallMetrics.totalDonors.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
