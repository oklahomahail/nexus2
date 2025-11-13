// src/components/system/FeatureFlag.tsx
// Feature flag component for conditional rendering

import React from "react";

import { isFeatureEnabled, type FeatureFlags } from "@/config/features";

interface FeatureFlagProps {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  clientOverrides?: Partial<FeatureFlags>;
}

/**
 * Feature Flag component for conditional rendering
 *
 * Usage:
 * <FeatureFlag feature="campaignDesigner">
 *   <CampaignDesignerButton />
 * </FeatureFlag>
 *
 * With fallback:
 * <FeatureFlag
 *   feature="predictiveAnalytics"
 *   fallback={<ComingSoonBadge />}
 * >
 *   <PredictiveAnalyticsPanel />
 * </FeatureFlag>
 */
export function FeatureFlag({
  feature,
  children,
  fallback = null,
  clientOverrides,
}: FeatureFlagProps) {
  const enabled = isFeatureEnabled(feature, clientOverrides);

  if (!enabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook for programmatic feature flag checks
 *
 * Usage:
 * const { isEnabled, allFlags } = useFeatureFlags();
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
