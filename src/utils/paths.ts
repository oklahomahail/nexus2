// Centralized helpers for client-scoped routing

// Human-friendly pattern (safe for docs/UI)
export const CLIENT_SCOPED_PATTERN = "/client/:id";

// Actual matcher used in code
export const CLIENT_SCOPED_REGEX = /^\/client\/([^/]+)(?:\/|$)/;

export function isClientScopedPath(path: string): boolean {
  return CLIENT_SCOPED_REGEX.test(path);
}

export function extractClientId(path: string): string | undefined {
  const m = path.match(CLIENT_SCOPED_REGEX);
  return m?.[1];
}

export const pathClient = (id: string) => `/client/${id}`;
export const pathClientCampaigns = (id: string) => `/client/${id}/campaigns`;
export const pathClientAnalytics = (id: string) => `/client/${id}/analytics`;
