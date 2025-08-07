// src/context/AppProviders.tsx
import React from 'react';
import { UIProvider } from './ui/UIContext';
import { NotificationsProvider } from './notifications/NotificationsContext';

export { useUI, UIProvider } from './ui/UIContext';
export { useNotifications, NotificationsProvider } from './notifications/NotificationsContext';
export { useCampaigns } from '../hooks/useCampaigns';
export { useAnalytics } from './analytics/AnalyticsContext'; // ✅ new modular version


export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <NotificationsProvider>
    <UIProvider>
      {children}
    </UIProvider>
  </NotificationsProvider>
);
