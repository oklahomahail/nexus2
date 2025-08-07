// ✅ src/components/AppContent.tsx
import React, { Suspense, lazy } from 'react';
import { useUI, useNotifications } from '@/context/AppProviders';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import NotificationsPanel from './NotificationsPanel';
import LoadingSpinner from './LoadingSpinner';
import DashboardOverview from './DashboardOverview';

// Lazy-load panel components
const CampaignsPanel = lazy(() =>
  import('@/panels/CampaignsPanel').then((mod) => ({ default: mod.default }))
);
const AnalyticsDashboard = lazy(() =>
  import('@/panels/AnalyticsDashboard').then((mod) => ({ default: mod.default }))
);
const MessagingAssistantPanel = lazy(() =>
  import('@/panels/MessagingAssistPanel').then((mod) => ({ default: mod.default }))
);
const DonorsPlaceholder = lazy(() =>
  import('@/panels/DonorsPlaceholder').then((mod) => ({ default: mod.default }))
);

interface NavigationItem {
  key: string;
  label: string;
  icon: string;
  component: React.ComponentType;
  description?: string;
}

const AppContent: React.FC = () => {
  const { activeView, loading, error } = useUI();
  const { show, toggle, markAsRead, clear } = useNotifications();

  const navigationItems: NavigationItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      component: DashboardOverview, // not lazy, likely small
      description: 'Overview of key metrics and recent activity',
    },
    {
      key: 'campaigns',
      label: 'Campaigns',
      icon: '🎯',
      component: CampaignsPanel,
      description: 'Manage fundraising campaigns',
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: '📈',
      component: AnalyticsDashboard,
      description: 'Performance insights and reports',
    },
    {
      key: 'messaging',
      label: 'AI Assistant',
      icon: '🤖',
      component: MessagingAssistantPanel,
      description: 'AI-powered content generation',
    },
    {
      key: 'donors',
      label: 'Donors',
      icon: '👥',
      component: DonorsPlaceholder,
      description: 'Donor management and insights',
    },
  ];

  const currentNavItem =
    navigationItems.find((item) => item.key === activeView) || navigationItems[0];
  const CurrentComponent = currentNavItem.component;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <Sidebar navigationItems={navigationItems} />
      <main className="flex-1 flex flex-col min-h-screen">
        <Topbar
          title={currentNavItem.label}
          description={currentNavItem.description}
        />
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" text="Loading..." />
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-red-800">
                  Application Error
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner size="lg" text="Loading panel..." />
                </div>
              }
            >
              <div className="p-6">
                <CurrentComponent />
              </div>
            </Suspense>
          )}
        </div>
      </main>
      <NotificationsPanel
        show={show}
        onClose={toggle}
        markAsRead={markAsRead}
        clear={clear}
      />
    </div>
  );
};

export default AppContent;
