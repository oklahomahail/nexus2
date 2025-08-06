import React, { useState } from 'react';
import { AppProvider, useAppContext, useUI, useNotifications, useCampaigns, useAnalytics } from './context/AppContext';
import { CampaignsPanel } from './panels/CampaignsPanel
import { AnalyticsDashboard } from './panels/AnalyticsDashboard';
import MessagingAssistantPanel from './panels/MessagingAssistPanel';
import { LoadingSpinner } from './components/LoadingSpinner';

// Navigation Item Interface
interface NavigationItem {
  key: string;
  label: string;
  icon: string;
  component: React.ComponentType;
  description?: string;
}

// Main App Content Component (inside provider)
const AppContent: React.FC = () => {
  const { state } = useAppContext();
  const { activeView, loading, error, sidebarCollapsed, actions: uiActions } = useUI();
  const { notifications, unreadCount, actions: notificationActions } = useNotifications();
  const { stats: campaignStats } = useCampaigns();
  const { organization: orgAnalytics } = useAnalytics();

  // Navigation configuration
  const navigationItems: NavigationItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      component: DashboardOverview,
      description: 'Overview of key metrics and recent activity'
    },
    {
      key: 'campaigns',
      label: 'Campaigns',
      icon: '🎯',
      component: CampaignsPanel,
      description: 'Manage fundraising campaigns'
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: '📈',
      component: AnalyticsDashboard,
      description: 'Performance insights and reports'
    },
    {
      key: 'messaging',
      label: 'AI Assistant',
      icon: '🤖',
      component: MessagingAssistantPanel,
      description: 'AI-powered content generation'
    },
    {
      key: 'donors',
      label: 'Donors',
      icon: '👥',
      component: DonorsPlaceholder,
      description: 'Donor management and insights'
    }
  ];

  const currentNavItem = navigationItems.find(item => item.key === activeView) || navigationItems[0];
  const CurrentComponent = currentNavItem.component;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } hidden sm:block relative`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nexus</h1>
                <p className="text-sm text-gray-600">Nonprofit Platform</p>
              </div>
            )}
            <button
              onClick={uiActions.toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* User Info */}
        {state.user.id && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {state.user.name?.charAt(0) || 'U'}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {state.user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {state.user.organizationName || 'Organization'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => uiActions.setActiveView(item.key as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 truncate">
                        {item.description}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Stats */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Stats</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Campaigns</span>
                  <span className="font-medium">{campaignStats.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Raised</span>
                  <span className="font-medium">
                    ${campaignStats.totalRaised.toLocaleString()}
                  </span>
                </div>
                {orgAnalytics && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Donors</span>
                    <span className="font-medium">
                      {orgAnalytics.overallMetrics.totalDonors.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentNavItem.label}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentNavItem.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  className="p-2 rounded-lg hover:bg-gray-100 relative"
                  onClick={() => useNotifications(!notifications)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 17h5l-5 5v-5zM10.97 4.757l-1.414 1.414A7.5 7.5 0 003 12.5v5a1 1 0 001 1h6c0-1.5-2-3-2-3s2-1.5 2-3v-5a7.5 7.5 0 00-6.556-7.443z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User menu */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {state.user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {state.user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 capitalize">
                    {state.user.role || 'Member'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" text="Loading..." />
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Application Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <CurrentComponent />
            </div>
          )}
        </div>
      </main>

      {/* Notifications Panel */}
      <NotificationsPanel 
        show={notifications} 
        onClose={() => useNotifications(false)} 
      />
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview: React.FC = () => {
  const { stats: campaignStats } = useCampaigns();
  const { organization: orgAnalytics } = useAnalytics();

  const StatCard: React.FC<{ title: string; value: string; icon: string; color: string }> = ({ 
    title, value, icon, color 
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-xl`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Campaigns"
            value={campaignStats.total.toString()}
            icon="🎯"
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Active Campaigns"
            value={campaignStats.active.toString()}
            icon="🚀"
            color="bg-green-100 text-green-600"
          />
          <StatCard
            title="Total Raised"
            value={`$${campaignStats.totalRaised.toLocaleString()}`}
            icon="💰"
            color="bg-purple-100 text-purple-600"
          />
          <StatCard
            title="Total Donors"
            value={orgAnalytics?.overallMetrics.totalDonors.toLocaleString() || '0'}
            icon="👥"
            color="bg-orange-100 text-orange-600"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">✅</span>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Campaign Goal Reached</p>
              <p className="text-xs text-green-700">Youth Sports Program exceeded its goal by 15%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">📧</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Email Campaign Sent</p>
              <p className="text-xs text-blue-700">Back to School Drive update sent to 1,200 subscribers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600">👤</span>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">New Major Donor</p>
              <p className="text-xs text-purple-700">$2,500 donation received for Emergency Food Relief</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for future development
const DonorsPlaceholder: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
    <div className="text-6xl mb-4">👥</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Donor Management</h3>
    <p className="text-gray-600 mb-4">
      Comprehensive donor tracking and relationship management coming soon.
    </p>
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-700">
        This section will include donor profiles, gift history, segmentation, and communication tracking.
      </p>
    </div>
  </div>
);

// Notifications Panel Component
const NotificationsPanel: React.FC<{ show: boolean; onClose: () => void }> = ({ show, onClose }) => {
  const { notifications, actions } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto h-full pb-20">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-gray-600">No notifications yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification: { id: React.Key | null | undefined; read: any; title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; message: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; timestamp: { toLocaleTimeString: () => string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }; }) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => actions.markRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <button
              onClick={actions.clear}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear All Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component with Provider
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;