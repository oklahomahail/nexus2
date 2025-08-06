// ✅ src/context/reducer.ts

import { AppState, AppAction } from './types';

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_ACTIVE_VIEW':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeView: action.payload, // ✅ payload must be of type ViewKey
        },
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarCollapsed: !state.ui.sidebarCollapsed,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.payload,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload,
        },
      };

    case 'TOGGLE_NOTIFICATIONS':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          open: !state.notifications.open,
        },
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

    default:
      return state;
  }
};
