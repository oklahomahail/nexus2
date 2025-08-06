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
  loading: boolean;
  error: string | null;
  activeView: ViewKey;
  sidebarCollapsed: boolean;
}

// Notification state
export interface NotificationsState {
  open: boolean;
  items: AppNotification[];
}

// Global app state
export interface AppState {
  ui: UIState;
  notifications: NotificationsState;
  filters: {
    campaigns: InternalCampaignFilters;
    donors: InternalDonorFilters;
  };
  // Add future modules like campaigns, donors, analytics, etc.
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
  // Optional future expansion:
  // | { type: 'SET_CAMPAIGNS'; payload: Campaign[] }
  // | { type: 'SET_ANALYTICS'; payload: AnalyticsData }
  ;

// Context type
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions?: any;
}
