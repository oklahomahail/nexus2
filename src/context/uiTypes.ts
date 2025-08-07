// src/context/uiTypes.ts

// ----------------------------------------
// Notification Types
// ----------------------------------------

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

// ----------------------------------------
// Filters
// ----------------------------------------

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

// ----------------------------------------
// UI State
// ----------------------------------------

export interface UIState {
  activeView: string;
  loading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
  isSidebarOpen: boolean;
  showNotifications: boolean;
}

// ----------------------------------------
// AppState
// ----------------------------------------

export interface AppState {
  user: { id: string; name: string } | null;
  campaigns: any[]; // Replace with your actual Campaign type
  donors: any[];    // Replace with your actual Donor type
  analytics: Record<string, any>; // Or your specific Analytics type
  ui: UIState;
  notifications: NotificationsState;
  filters: {
    campaigns: InternalCampaignFilters;
    donors: InternalDonorFilters;
  };
}

// ----------------------------------------
// App Actions
// ----------------------------------------

export type AppAction =
  | { type: 'SET_ACTIVE_VIEW'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' };
