// ==============================
// Notifications
// ==============================

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface NotificationsState {
  open: boolean;
  items: AppNotification[];
}

// ==============================
// Filters
// ==============================

export interface InternalCampaignFilters {
  status?: string[];
  category?: string[];
  dateRange?: { start: string; end: string } | null;
  search?: string;
  tags?: string[];
}

export interface InternalDonorFilters {
  segment?: string[];
  giftRange?: { min: number; max: number };
  lastGiftDate?: { start: string; end: string };
}

// ==============================
// UI
// ==============================

export type ViewKey = 'dashboard' | 'campaigns' | 'donors' | 'analytics' | 'messaging';

export interface UIState {
  sidebarCollapsed: boolean;
  activeView: ViewKey;
  isSidebarOpen: boolean;
  loading: boolean;
  error: string | null;
  showNotifications: boolean;
}

// Matches the return value of useUI()
export interface UIContextType {
  activeView: string;
  loading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
  setActiveView: (view: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSidebar: () => void;
}

// ==============================
// Global App State
// ==============================

export interface AppState {
  user: any;
  campaigns: any;
  donors: any;
  analytics: any;
  ui: UIState;
  notifications: NotificationsState;
  filters: {
    campaigns: InternalCampaignFilters;
    donors: InternalDonorFilters;
  };
}

// ==============================
// Actions
// ==============================

export type AppAction =
  | { type: 'SET_ACTIVE_VIEW'; payload: ViewKey }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification };
