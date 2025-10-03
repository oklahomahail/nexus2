// src/config/api.ts
// Central API configuration and client setup

import { ApiClient } from "@/services/apiClient";
import { getApiConfig } from "@/services/apiConfig";

// Get the current API configuration
const config = getApiConfig();

// Create and export the configured API client instance
export const apiClient = new ApiClient({
  baseUrl: config.baseUrl,
  timeout: config.timeout,
  retries: config.retries,
  retryDelay: config.retryDelay,
  defaultHeaders: config.headers,
});

// Re-export types for convenience
export type {
  ApiResponse,
  ApiError,
  ApiClientError,
} from "@/services/apiClient";

// Export configuration for external access if needed
export { config as apiConfig };
