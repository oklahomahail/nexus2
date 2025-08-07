export { useUI, UIProvider, AppContext } from './ui/UIContext';
export { useNotifications, NotificationsProvider } from './notifications/NotificationsContext';
export { useAppContext } from '../hooks/useAppContext';
export { useCampaigns } from '../hooks/useCampaigns';
export { useAnalytics } from '../hooks/useAnalytics';
import React from 'react';
import { UIProvider } from './ui/UIContext';
import { NotificationsProvider } from './notifications/NotificationsContext';

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <NotificationsProvider>
    <UIProvider>
      {children}
    </UIProvider>
  </NotificationsProvider>
);