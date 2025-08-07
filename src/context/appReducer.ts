// src/context/appReducer.ts
import { AppState, AppAction, AppNotification } from './uiTypes';

// UI Slice
const initialUIState = {
  activeView: 'dashboard',
  loading: false,
  error: null,
  sidebarCollapsed: false,
  isSidebarOpen: true,
  showNotifications: false,
};

// Notifications
const initialNotifications = {
  open: false,
  items: [],
};

// Filters
const initialFilters = {
  campaigns: {
    status: [],
    category: [],
    dateRange: null,
    search: '',
    tags: [],
  },
  donors: {
    segment: [],
    giftRange: { min: 0, max: 0 },
    lastGiftDate: { start: '', end: '' },
  },
};

export const initialState: AppState = {
  user: null,
  campaigns: [],
  donors: [],
  analytics: {},
  ui: initialUIState,
  notifications: initialNotifications,
  filters: initialFilters,
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_ACTIVE_VIEW':
      return {
        ...state,
        ui: { ...state.ui, activeView: action.payload },
      };

    case 'SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload },
      };

    case 'SET_ERROR':
      return {
        ...state,
        ui: { ...state.ui, error: action.payload },
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, isSidebarOpen: !state.ui.isSidebarOpen, sidebarCollapsed: !state.ui.sidebarCollapsed },
      };

    case 'TOGGLE_NOTIFICATIONS':
      return {
        ...state,
        ui: { ...state.ui, showNotifications: !state.ui.showNotifications },
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          items: [action.payload, ...state.notifications.items],
        },
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          items: state.notifications.items.map((n: AppNotification) =>
            n.id === action.payload ? { ...n, read: true } : n
          ),
        },
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          items: [],
        },
      };

    default:
      return state;
  }
};
