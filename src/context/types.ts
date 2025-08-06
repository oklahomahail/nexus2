// ✅ src/context/types.ts

// Notification type
export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Filters
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

// UI state
export type ViewKey = 'dashboard' | 'campaigns' | 'donors' | 'analytics' | 'messaging';

export interface UIState {
  sidebarCollapsed: boolean;
  activeView: ViewKey;
  isSidebarOpen: boolean;
  loading: boolean;
  error: string | null;
  showNotifications: boolean;
}

// Notification state
export interface NotificationsState {
  open: boolean;
  items: AppNotification[];
}

// Global app state
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

// Action types
export type AppAction =
  | { type: 'SET_ACTIVE_VIEW'; payload: ViewKey }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }; // <- Note the correct `|` above and `;` at the end

// Context type
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions?: any;
}
