// src/context/appReducer.ts

// UI Slice

// Notifications

// Filters

export {};

export {};

export const initialState = {
  activeView: "dashboard",
  sidebarCollapsed: false,
  campaigns: [],
  notifications: []
};

export const appReducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_ACTIVE_VIEW":
      return { ...state, activeView: action.payload };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    default:
      return state;
  }
};
