// src/hooks/useFeatureFlags.ts
// Hook for programmatic feature flag checks

import { isFeatureEnabled, type FeatureFlags } from "@/config/features";

/**
 * Hook for programmatic feature flag checks
 *
 * Usage:
 * const { isEnabled } = useFeatureFlags();
 *
 * if (isEnabled('campaignDesigner')) {
 *   // Show campaign designer
 * }
 */
export function useFeatureFlags(clientOverrides?: Partial<FeatureFlags>) {
  const isEnabled = (feature: keyof FeatureFlags) => {
    return isFeatureEnabled(feature, clientOverrides);
  };

  return {
    isEnabled,
  };
}
