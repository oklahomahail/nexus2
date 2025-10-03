// src/config/runtime.ts
// Single source of truth for polling cadences across the app

export const POLLING = {
  // Notifications
  notifications: {
    visibleMs: 30000, // 30s when tab visible
    hiddenMs: 120000, // 2m when tab hidden
  },

  // Dashboard/Analytics (from your context doc)
  dashboard: {
    visibleMs: 20000, // 20s
    hiddenMs: 120000, // 2m
  },

  // Client list reload bootstrap
  clientList: {
    visibleMs: 60000, // 1m
    hiddenMs: 300000, // 5m
  },
} as const;

// Error retry configuration
export const RETRY = {
  backoffMs: 1000, // Base backoff
  maxRetries: 3, // Max automatic retries
  jitterFactor: 0.1, // 10% jitter
} as const;

// API configuration
export const API = {
  timeout: 10000, // 10s timeout
  retryStatus: [408, 429, 500, 502, 503, 504], // Retry these status codes
} as const;
