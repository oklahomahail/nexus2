import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Campaign, CampaignFilters } from '../models/campaign';
import { Donor } from '../models/donor';
import { OrganizationAnalytics, DonorInsights } from '../models/analytics'; 

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface NotificationsState {
  notifications: AppNotification[];
  addNotification: (n: AppNotification) => void;
  markAsRead: (id: string) => void;
  clear: () => void;
}

interface AppContextType {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  donors: Donor[];
  setDonors: React.Dispatch<React.SetStateAction<Donor[]>>;
  filters: CampaignFilters;
  setFilters: React.Dispatch<React.SetStateAction<CampaignFilters>>;
  orgAnalytics: OrganizationAnalytics | null;
  setOrgAnalytics: (value: OrganizationAnalytics | null) => void;
  donorInsights: DonorInsights | null;
  setDonorInsights: (value: DonorInsights | null) => void;
  ui: UIState;
  notifications: NotificationsState;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filters, setFilters] = useState<CampaignFilters>({});
  const [orgAnalytics, setOrgAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [donorInsights, setDonorInsights] = useState<DonorInsights | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>([]);

  const addNotification = (n: AppNotification) => {
    setNotificationsList((prev) => [...prev, n]);
  };

  const markAsRead = (id: string) => {
    setNotificationsList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clear = () => setNotificationsList([]);

  return (
    <AppContext.Provider
      value={{
        campaigns,
        setCampaigns,
        donors,
        setDonors,
        filters,
        setFilters,
        orgAnalytics,
        setOrgAnalytics,
        donorInsights,
        setDonorInsights,
        ui: {
          sidebarOpen,
          setSidebarOpen,
        },
        notifications: {
          notifications: notificationsList,
          addNotification,
          markAsRead,
          clear,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hooks
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

export const useUI = () => useAppContext().ui;

export const useNotifications = () => useAppContext().notifications;

export const useCampaigns = () => {
  const { campaigns, setCampaigns, filters, setFilters } = useAppContext();
  return { campaigns, setCampaigns, filters, setFilters };
};

export const useAnalytics = () => {
  const { orgAnalytics, donorInsights, setOrgAnalytics, setDonorInsights } = useAppContext();
  return { orgAnalytics, donorInsights, setOrgAnalytics, setDonorInsights };
};
