// src/config/api.ts
// Central API configuration and client setup

// Re-export the standardized API client
export { apiClient } from "@/services/apiClient";

// Re-export types for convenience
export type {
  ApiResponse,
  ApiError,
  ApiClientError,
  IApiClient,
  RequestOptions,
  ApiClientConfig,
} from "@/services/apiClient";

// Re-export API configuration utilities
export {
  getApiConfig,
  apiConfigService,
  useApiConfig,
} from "@/services/apiConfig";
export type { ApiConfiguration, ApiEndpoints } from "@/services/apiConfig";

// Deprecated: Use ApiResponse instead
// @deprecated Use ApiResponse from @/services/apiClient
export type APIResponse<T = any> = {
  data: T;
  success: boolean;
  message?: string;
};
