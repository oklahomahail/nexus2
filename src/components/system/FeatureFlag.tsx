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
