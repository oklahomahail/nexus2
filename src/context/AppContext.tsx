// ✅ src/context/AppContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, AppContextType, UIState, NotificationsState } from './types';

// ---------------------------
// Initial States
// ---------------------------
const initialUIState: UIState = {
  sidebarCollapsed: false,
  activeView: 'dashboard',
  isSidebarOpen: true,
  loading: false,
  error: null,
  showNotifications: false,
};

const initialNotificationsState: NotificationsState = {
  open: false,
  items: [],
};

const initialAppState: AppState = {
  user: null,
  campaigns: null,
  donors: null,
  analytics: null,
  ui: initialUIState,
  notifications: initialNotificationsState,
  filters: {
    campaigns: {},
    donors: {},
  },
};

// ---------------------------
// Reducer
// ---------------------------
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_VIEW':
      return {
        ...state,
        ui: { ...state.ui, activeView: action.payload },
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, isSidebarOpen: !state.ui.isSidebarOpen },
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
    case 'TOGGLE_NOTIFICATIONS':
      return {
        ...state,
        ui: { ...state.ui, showNotifications: !state.ui.showNotifications },
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          items: state.notifications.items.map((n) =>
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
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          items: [action.payload, ...state.notifications.items],
        },
      };
    default:
      return state;
  }
}

// ---------------------------
// Context
// ---------------------------
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// ---------------------------
// Hooks
// ---------------------------
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}

export function useUI() {
  const { state } = useAppContext();
  return state.ui;
}

export function useNotifications() {
  const { state, dispatch } = useAppContext();
  return {
    show: state.ui.showNotifications,
    items: state.notifications.items,
    toggle: () => dispatch({ type: 'TOGGLE_NOTIFICATIONS' }),
    markAsRead: (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }),
    clear: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
    add: (notification: NotificationsState['items'][0]) =>
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
  };
}
