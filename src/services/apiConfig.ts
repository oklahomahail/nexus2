// src/services/apiConfig.ts - API configuration management system

import React from "react";

export interface ApiEndpoints {
  campaigns: string;
  clients: string;
  donors: string;
  analytics: string;
  auth: string;
  users: string;
  notifications: string;
}

export interface ApiConfiguration {
  name: string;
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
  endpoints: ApiEndpoints;
  authType: "bearer" | "api-key" | "basic" | "none";
  authHeader?: string;
}

// Configuration presets for different environments
export const apiConfigurations: Record<string, ApiConfiguration> = {
  development: {
    name: "Development Server",
    baseUrl: "http://localhost:4000/api",
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
    headers: {
      "Content-Type": "application/json",
    },
    endpoints: {
      campaigns: "/campaigns",
      clients: "/clients",
      donors: "/donors",
      analytics: "/analytics",
      auth: "/auth",
      users: "/users",
      notifications: "/notifications",
    },
    authType: "bearer",
    authHeader: "Authorization",
  },

  staging: {
    name: "Staging Server",
    baseUrl: "https://api-staging.nexus.com/v1",
    timeout: 15000,
    retries: 3,
    retryDelay: 2000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    endpoints: {
      campaigns: "/campaigns",
      clients: "/clients",
      donors: "/donors",
      analytics: "/analytics",
      auth: "/auth",
      users: "/users",
      notifications: "/notifications",
    },
    authType: "bearer",
    authHeader: "Authorization",
  },

  production: {
    name: "Production Server",
    baseUrl: "https://api.nexus.com/v1",
    timeout: 20000,
    retries: 5,
    retryDelay: 3000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Client-Version": "1.0.0",
    },
    endpoints: {
      campaigns: "/campaigns",
      clients: "/clients",
      donors: "/donors",
      analytics: "/analytics",
      auth: "/auth",
      users: "/users",
      notifications: "/notifications",
    },
    authType: "bearer",
    authHeader: "Authorization",
  },

  mock: {
    name: "Mock Server",
    baseUrl: "http://localhost:3001/api",
    timeout: 5000,
    retries: 1,
    retryDelay: 500,
    headers: {
      "Content-Type": "application/json",
      "X-Mock": "true",
    },
    endpoints: {
      campaigns: "/mock/campaigns",
      clients: "/mock/clients",
      donors: "/mock/donors",
      analytics: "/mock/analytics",
      auth: "/mock/auth",
      users: "/mock/users",
      notifications: "/mock/notifications",
    },
    authType: "none",
  },

  supabase: {
    name: "Supabase Backend",
    baseUrl: "https://your-project.supabase.co/rest/v1",
    timeout: 15000,
    retries: 3,
    retryDelay: 1000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
    },
    endpoints: {
      campaigns: "/campaigns",
      clients: "/clients",
      donors: "/donors",
      analytics: "/analytics",
      auth: "/auth/v1",
      users: "/auth/v1/users",
      notifications: "/notifications",
    },
    authType: "bearer",
    authHeader: "Authorization",
  },

  firebase: {
    name: "Firebase Backend",
    baseUrl: "https://your-project-default-rtdb.firebaseio.com",
    timeout: 15000,
    retries: 3,
    retryDelay: 1000,
    headers: {
      "Content-Type": "application/json",
    },
    endpoints: {
      campaigns: "/campaigns.json",
      clients: "/clients.json",
      donors: "/donors.json",
      analytics: "/analytics.json",
      auth: "/auth",
      users: "/users.json",
      notifications: "/notifications.json",
    },
    authType: "api-key",
    authHeader: "Authorization",
  },

  graphql: {
    name: "GraphQL Backend",
    baseUrl: "https://api.nexus.com/graphql",
    timeout: 20000,
    retries: 3,
    retryDelay: 2000,
    headers: {
      "Content-Type": "application/json",
    },
    endpoints: {
      campaigns: "/graphql",
      clients: "/graphql",
      donors: "/graphql",
      analytics: "/graphql",
      auth: "/graphql",
      users: "/graphql",
      notifications: "/graphql",
    },
    authType: "bearer",
    authHeader: "Authorization",
  },
};

// Environment-based configuration selection
export function getApiConfig(): ApiConfiguration {
  const environment = import.meta.env.VITE_API_ENVIRONMENT || "development";
  const customBaseUrl = import.meta.env.VITE_API_BASE_URL;

  let config = apiConfigurations[environment] || apiConfigurations.development;

  // Override with custom base URL if provided
  if (customBaseUrl) {
    config = {
      ...config,
      baseUrl: customBaseUrl,
    };
  }

  return config;
}

// Service for managing API configuration
export class ApiConfigService {
  private currentConfig: ApiConfiguration;
  private listeners: ((config: ApiConfiguration) => void)[] = [];

  constructor(initialConfig?: ApiConfiguration) {
    this.currentConfig = initialConfig || getApiConfig();
  }

  getCurrentConfig(): ApiConfiguration {
    return this.currentConfig;
  }

  setConfig(configName: string): void {
    const config = apiConfigurations[configName];
    if (!config) {
      throw new Error(`Unknown API configuration: ${configName}`);
    }

    this.currentConfig = config;
    this.notifyListeners();
  }

  setCustomConfig(config: ApiConfiguration): void {
    this.currentConfig = config;
    this.notifyListeners();
  }

  getEndpoint(endpoint: keyof ApiEndpoints): string {
    return `${this.currentConfig.baseUrl}${this.currentConfig.endpoints[endpoint]}`;
  }

  getAvailableConfigurations(): Array<{
    key: string;
    config: ApiConfiguration;
  }> {
    return Object.entries(apiConfigurations).map(([key, config]) => ({
      key,
      config,
    }));
  }

  onConfigChange(callback: (config: ApiConfiguration) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.currentConfig));
  }

  // Helper methods for authentication
  getAuthHeaders(token?: string): Record<string, string> {
    const headers = { ...this.currentConfig.headers };

    if (token && this.currentConfig.authType !== "none") {
      const authHeader = this.currentConfig.authHeader || "Authorization";

      switch (this.currentConfig.authType) {
        case "bearer":
          headers[authHeader] = `Bearer ${token}`;
          break;
        case "api-key":
          headers[authHeader] = token;
          break;
        case "basic":
          headers[authHeader] = `Basic ${token}`;
          break;
      }
    }

    return headers;
  }
}

// Singleton instance
export const apiConfigService = new ApiConfigService();

// React hook for using API configuration in components
export function useApiConfig() {
  const [config, setConfig] = React.useState(
    apiConfigService.getCurrentConfig(),
  );

  React.useEffect(() => {
    const unsubscribe = apiConfigService.onConfigChange(setConfig);
    return unsubscribe;
  }, []);

  return {
    config,
    setConfig: (configName: string) => apiConfigService.setConfig(configName),
    setCustomConfig: (config: ApiConfiguration) =>
      apiConfigService.setCustomConfig(config),
    getEndpoint: (endpoint: keyof ApiEndpoints) =>
      apiConfigService.getEndpoint(endpoint),
    availableConfigurations: apiConfigService.getAvailableConfigurations(),
  };
}
