/**
 * useCampaignDesigner Hook
 *
 * Manages campaign designer state and generation workflow
 * Provides form state, validation, AI generation, and export
 */

import { useCallback, useMemo, useState } from "react";

import {
  type CampaignParams,
  type CampaignGenerationResult,
  downloadText,
  generateCampaign,
  toMarkdownBundle,
} from "@/services/campaignDesignService";

// ============================================================================
// TYPES
// ============================================================================

interface UseCampaignDesignerReturn {
  // State
  params: Partial<CampaignParams>;
  loading: boolean;
  error: string | null;
  result: CampaignGenerationResult | null;

  // Validation
  canGenerate: boolean;

  // Actions
  update: (patch: Partial<CampaignParams>) => void;
  run: () => Promise<void>;
  exportMd: () => void;
  reset: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useCampaignDesigner(
  initial?: Partial<CampaignParams>,
): UseCampaignDesignerReturn {
  const [params, setParams] = useState<Partial<CampaignParams>>({
    durationWeeks: 4,
    channels: { direct_mail: true, email: true, social: true },
    ...initial,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CampaignGenerationResult | null>(null);

  /**
   * Check if all required fields are filled
   */
  const canGenerate = useMemo(
    () =>
      Boolean(
        params.client_id &&
          params.brand_id &&
          params.name &&
          params.type &&
          params.season &&
          params.audience &&
          params.goal &&
          params.tone &&
          params.durationWeeks &&
          params.channels &&
          (params.channels.direct_mail ||
            params.channels.email ||
            params.channels.social),
      ),
    [params],
  );

  /**
   * Update campaign parameters
   */
  const update = useCallback((patch: Partial<CampaignParams>) => {
    setParams((p) => ({ ...p, ...patch }));
  }, []);

  /**
   * Generate campaign via AI
   */
  const run = useCallback(async () => {
    if (!canGenerate) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const full = await generateCampaign(params as CampaignParams);
      setResult(full);
    } catch (e: any) {
      const message = e instanceof Error ? e.message : "Generation failed";
      setError(message);
      console.error("Campaign generation error:", e);
    } finally {
      setLoading(false);
    }
  }, [canGenerate, params]);

  /**
   * Export result as Markdown file
   */
  const exportMd = useCallback(() => {
    if (!result) {
      console.warn("No result to export");
      return;
    }

    const md = toMarkdownBundle(result);
    const safeName = (params.name || "campaign")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .toLowerCase();
    downloadText(`${safeName}.md`, md);
  }, [result, params]);

  /**
   * Reset form and result
   */
  const reset = useCallback(() => {
    setParams({
      durationWeeks: 4,
      channels: { direct_mail: true, email: true, social: true },
      ...initial,
    });
    setResult(null);
    setError(null);
  }, [initial]);

  return {
    params,
    loading,
    error,
    result,
    canGenerate,
    update,
    run,
    exportMd,
    reset,
  };
}
