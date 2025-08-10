export type UIView = "dashboard" | "campaigns" | "analytics" | "donors";

export interface AppUIState {
  activeView: UIView;
  loading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
}

export type AppUIAction =
  | { type: "SET_ACTIVE_VIEW"; payload: UIView }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "RESET_ERROR" };

export const initialUIState: AppUIState = {
  activeView: "dashboard",
  loading: false,
  error: null,
  sidebarCollapsed: false,
};

export function appReducer(state: AppUIState, action: AppUIAction): AppUIState {
  switch (action.type) {
    case "SET_ACTIVE_VIEW":
      return { ...state, activeView: action.payload, error: null };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "RESET_ERROR":
      return { ...state, error: null };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    default:
      return state;
  }
}
