// src/utils/env.ts
const toBool = (v: unknown, def = false) =>
  String(v ?? (def ? "true" : "false")).toLowerCase() === "true";

export const REALTIME_ENABLED = toBool(
  import.meta.env.VITE_ENABLE_REAL_TIME,
  false,
);
export const ADVANCED_ANALYTICS_ENABLED = toBool(
  import.meta.env.VITE_ENABLE_ADVANCED_ANALYTICS,
  true,
);
export const INSIGHTS_ENABLED = toBool(
  import.meta.env.VITE_ENABLE_INSIGHTS,
  false,
);
export const DONOR_ANALYTICS_ENABLED = toBool(
  import.meta.env.VITE_ENABLE_DONOR_ANALYTICS,
  false,
);
export const EMAIL_CAMPAIGNS_ENABLED = toBool(
  import.meta.env.VITE_ENABLE_EMAIL_CAMPAIGNS,
  false,
);

// Optional: expose current mode for diagnostics
export const APP_MODE = import.meta.env.MODE; // "development" | "production" | "test"
