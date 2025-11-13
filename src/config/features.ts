// src/config/features.ts
// Feature flag configuration for gradual rollout and A/B testing

/**
 * Feature flag configuration
 * Features can be enabled/disabled globally or per-client
 */
export interface FeatureFlags {
  // AI Features
  campaignDesigner: boolean;
  donorIntelligence: boolean;
  analyticsInsights: boolean;

  // Platform Features
  multiClientSupport: boolean;
  advancedReporting: boolean;
  exportScheduling: boolean;
  realTimeNotifications: boolean;

  // Experimental Features
  predictiveAnalytics: boolean;
  abTesting: boolean;
  customBranding: boolean;
  apiAccess: boolean;
}

/**
 * Default feature flags (global)
 * These apply to all users unless overridden per-client
 */
export const DEFAULT_FEATURES: FeatureFlags = {
  // AI Features - All enabled by default
  campaignDesigner: true,
  donorIntelligence: true,
  analyticsInsights: true,

  // Platform Features - Core features enabled
  multiClientSupport: true,
  advancedReporting: true,
  exportScheduling: false, // Not yet implemented
  realTimeNotifications: false, // Not yet implemented

  // Experimental Features - Disabled by default
  predictiveAnalytics: false,
  abTesting: false,
  customBranding: false,
  apiAccess: false,
};

/**
 * Environment-based feature overrides
 * Use these to enable features in specific environments
 */
const ENVIRONMENT_OVERRIDES: Partial<FeatureFlags> = {
  // Enable experimental features in development
  ...(import.meta.env.DEV
    ? {
        predictiveAnalytics: true,
        abTesting: true,
        customBranding: true,
        apiAccess: true,
      }
    : {}),
};

/**
 * Get merged feature flags with environment overrides
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    ...DEFAULT_FEATURES,
    ...ENVIRONMENT_OVERRIDES,
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(
  feature: keyof FeatureFlags,
  clientOverrides?: Partial<FeatureFlags>,
): boolean {
  const globalFlags = getFeatureFlags();

  // Client-specific overrides take precedence
  if (clientOverrides && feature in clientOverrides) {
    return clientOverrides[feature] ?? globalFlags[feature];
  }

  return globalFlags[feature];
}

/**
 * Feature flag metadata for UI display
 */
export interface FeatureMetadata {
  name: string;
  description: string;
  category: "ai" | "platform" | "experimental";
  requiresSetup?: boolean;
  docUrl?: string;
}

export const FEATURE_METADATA: Record<keyof FeatureFlags, FeatureMetadata> = {
  campaignDesigner: {
    name: "AI Campaign Designer",
    description:
      "Generate brand-aware fundraising campaigns with Claude AI integration",
    category: "ai",
    requiresSetup: true,
    docUrl: "/docs/campaign-designer",
  },
  donorIntelligence: {
    name: "Donor Intelligence Engine",
    description:
      "Privacy-safe analytics with retention, upgrade, velocity, and seasonality metrics",
    category: "ai",
    requiresSetup: false,
  },
  analyticsInsights: {
    name: "AI Analytics Insights",
    description: "Generate narrative summaries of donor analytics with Claude",
    category: "ai",
    requiresSetup: true,
  },
  multiClientSupport: {
    name: "Multi-Client Management",
    description: "Manage multiple nonprofit organizations in one account",
    category: "platform",
    requiresSetup: false,
  },
  advancedReporting: {
    name: "Advanced Reporting",
    description: "Detailed reports with custom filters and visualizations",
    category: "platform",
    requiresSetup: false,
  },
  exportScheduling: {
    name: "Scheduled Exports",
    description: "Automatically export data on a recurring schedule",
    category: "platform",
    requiresSetup: true,
  },
  realTimeNotifications: {
    name: "Real-Time Notifications",
    description: "Get instant alerts for important donor activities",
    category: "platform",
    requiresSetup: true,
  },
  predictiveAnalytics: {
    name: "Predictive Analytics",
    description: "ML-powered predictions for donor behavior and churn risk",
    category: "experimental",
    requiresSetup: true,
  },
  abTesting: {
    name: "A/B Testing",
    description: "Test different campaign variations to optimize performance",
    category: "experimental",
    requiresSetup: true,
  },
  customBranding: {
    name: "Custom Branding",
    description: "White-label the platform with your organization's branding",
    category: "experimental",
    requiresSetup: true,
  },
  apiAccess: {
    name: "API Access",
    description: "Integrate Nexus with your existing tools via REST API",
    category: "experimental",
    requiresSetup: true,
    docUrl: "/docs/api",
  },
};
