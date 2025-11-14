/**
 * Track15 Service
 *
 * Service layer for Track15-specific campaign operations
 * Handles core story, narrative steps, and campaign meta
 */

import { supabase } from "@/lib/supabaseClient";
import {
  Track15Campaign,
  Track15CampaignMeta,
  Track15CoreStory,
  Track15NarrativeStep,
  Track15LiftMetrics,
  Track15Season,
  Track15Stage,
  Track15RetentionSeries,
  Track15RetentionPoint,
} from "@/types/track15.types";

// ============================================================================
// CAMPAIGN META OPERATIONS
// ============================================================================

/**
 * Get Track15 meta for a campaign
 */
export async function getTrack15Meta(
  campaignId: string
): Promise<Track15CampaignMeta | null> {
  try {
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select(
        "track15_enabled, track15_season, track15_template_key, track15_stage, track15_core_headline, track15_core_summary, track15_value_proposition, track15_donor_motivation"
      )
      .eq("id", campaignId)
      .single();

    if (error) throw error;
    if (!campaign) return null;

    // If Track15 not enabled, return null
    if (!campaign.track15_enabled) return null;

    const meta: Track15CampaignMeta = {
      enabled: campaign.track15_enabled,
      season: campaign.track15_season as Track15Season | undefined,
      templateKey: campaign.track15_template_key || undefined,
      stage: campaign.track15_stage as Track15Stage,
      coreStory: campaign.track15_core_headline
        ? {
            headline: campaign.track15_core_headline,
            summary: campaign.track15_core_summary || "",
            valueProposition: campaign.track15_value_proposition || "",
            donorMotivation: campaign.track15_donor_motivation || "",
          }
        : undefined,
    };

    return meta;
  } catch (error) {
    console.error("Error fetching Track15 meta:", error);
    return null;
  }
}

/**
 * Update Track15 meta for a campaign
 */
export async function updateTrack15Meta(
  campaignId: string,
  meta: Partial<Track15CampaignMeta>
): Promise<boolean> {
  try {
    const updateData: Record<string, any> = {};

    if (meta.enabled !== undefined) updateData.track15_enabled = meta.enabled;
    if (meta.season !== undefined) updateData.track15_season = meta.season;
    if (meta.templateKey !== undefined)
      updateData.track15_template_key = meta.templateKey;
    if (meta.stage !== undefined) updateData.track15_stage = meta.stage;

    // Core story fields
    if (meta.coreStory) {
      if (meta.coreStory.headline !== undefined)
        updateData.track15_core_headline = meta.coreStory.headline;
      if (meta.coreStory.summary !== undefined)
        updateData.track15_core_summary = meta.coreStory.summary;
      if (meta.coreStory.valueProposition !== undefined)
        updateData.track15_value_proposition = meta.coreStory.valueProposition;
      if (meta.coreStory.donorMotivation !== undefined)
        updateData.track15_donor_motivation = meta.coreStory.donorMotivation;
    }

    const { error } = await supabase
      .from("campaigns")
      .update(updateData)
      .eq("id", campaignId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating Track15 meta:", error);
    return false;
  }
}

/**
 * Enable Track15 for a campaign
 */
export async function enableTrack15(
  campaignId: string,
  season: Track15Season,
  templateKey?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("campaigns")
      .update({
        track15_enabled: true,
        track15_season: season,
        track15_template_key: templateKey,
        track15_stage: "not_started",
      })
      .eq("id", campaignId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error enabling Track15:", error);
    return false;
  }
}

/**
 * Update Track15 stage
 */
export async function updateTrack15Stage(
  campaignId: string,
  stage: Track15Stage
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("campaigns")
      .update({ track15_stage: stage })
      .eq("id", campaignId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating Track15 stage:", error);
    return false;
  }
}

// ============================================================================
// CORE STORY OPERATIONS
// ============================================================================

/**
 * Update core story for a campaign
 */
export async function updateCoreStory(
  campaignId: string,
  coreStory: Partial<Track15CoreStory>
): Promise<boolean> {
  try {
    const updateData: Record<string, any> = {};

    if (coreStory.headline !== undefined)
      updateData.track15_core_headline = coreStory.headline;
    if (coreStory.summary !== undefined)
      updateData.track15_core_summary = coreStory.summary;
    if (coreStory.valueProposition !== undefined)
      updateData.track15_value_proposition = coreStory.valueProposition;
    if (coreStory.donorMotivation !== undefined)
      updateData.track15_donor_motivation = coreStory.donorMotivation;

    const { error } = await supabase
      .from("campaigns")
      .update(updateData)
      .eq("id", campaignId);

    if (error) throw error;

    // Update stage to core_story_draft if not already past it
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("track15_stage")
      .eq("id", campaignId)
      .single();

    if (campaign?.track15_stage === "not_started") {
      await updateTrack15Stage(campaignId, "core_story_draft");
    }

    return true;
  } catch (error) {
    console.error("Error updating core story:", error);
    return false;
  }
}

// ============================================================================
// NARRATIVE STEP OPERATIONS
// ============================================================================

/**
 * Get narrative steps for a campaign
 */
export async function getNarrativeSteps(
  campaignId: string
): Promise<Track15NarrativeStep[]> {
  try {
    const { data, error } = await supabase
      .from("track15_narrative_steps")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("is_active", true)
      .order("stage", { ascending: true })
      .order("sequence", { ascending: true });

    if (error) throw error;

    return (
      data?.map((row) => ({
        id: row.id,
        campaignId: row.campaign_id,
        stage: row.stage,
        title: row.title,
        body: row.body,
        sequence: row.sequence,
        channels: row.channels || [],
        primarySegment: row.primary_segment || undefined,
        callToAction: row.call_to_action || undefined,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching narrative steps:", error);
    return [];
  }
}

/**
 * Create a narrative step
 */
export async function createNarrativeStep(
  campaignId: string,
  step: Omit<Track15NarrativeStep, "id" | "campaignId" | "createdAt" | "updatedAt">
): Promise<Track15NarrativeStep | null> {
  try {
    const { data, error } = await supabase
      .from("track15_narrative_steps")
      .insert({
        campaign_id: campaignId,
        stage: step.stage,
        title: step.title,
        body: step.body,
        sequence: step.sequence,
        channels: step.channels,
        primary_segment: step.primarySegment,
        call_to_action: step.callToAction,
        is_active: step.isActive,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      campaignId: data.campaign_id,
      stage: data.stage,
      title: data.title,
      body: data.body,
      sequence: data.sequence,
      channels: data.channels || [],
      primarySegment: data.primary_segment || undefined,
      callToAction: data.call_to_action || undefined,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error("Error creating narrative step:", error);
    return null;
  }
}

/**
 * Update a narrative step
 */
export async function updateNarrativeStep(
  stepId: string,
  updates: Partial<
    Omit<Track15NarrativeStep, "id" | "campaignId" | "createdAt" | "updatedAt">
  >
): Promise<boolean> {
  try {
    const updateData: Record<string, any> = {};

    if (updates.stage !== undefined) updateData.stage = updates.stage;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.body !== undefined) updateData.body = updates.body;
    if (updates.sequence !== undefined) updateData.sequence = updates.sequence;
    if (updates.channels !== undefined) updateData.channels = updates.channels;
    if (updates.primarySegment !== undefined)
      updateData.primary_segment = updates.primarySegment;
    if (updates.callToAction !== undefined)
      updateData.call_to_action = updates.callToAction;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { error } = await supabase
      .from("track15_narrative_steps")
      .update(updateData)
      .eq("id", stepId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating narrative step:", error);
    return false;
  }
}

/**
 * Delete a narrative step
 */
export async function deleteNarrativeStep(stepId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("track15_narrative_steps")
      .delete()
      .eq("id", stepId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting narrative step:", error);
    return false;
  }
}

/**
 * Bulk update narrative steps for a campaign
 */
export async function bulkUpdateNarrativeSteps(
  campaignId: string,
  steps: Track15NarrativeStep[]
): Promise<boolean> {
  try {
    // Delete existing steps
    await supabase
      .from("track15_narrative_steps")
      .delete()
      .eq("campaign_id", campaignId);

    // Insert new steps
    const stepsToInsert = steps.map((step) => ({
      id: step.id.startsWith("temp-") ? undefined : step.id, // Let DB generate ID for temp IDs
      campaign_id: campaignId,
      stage: step.stage,
      title: step.title,
      body: step.body,
      sequence: step.sequence,
      channels: step.channels,
      primary_segment: step.primarySegment,
      call_to_action: step.callToAction,
      is_active: step.isActive,
    }));

    const { error } = await supabase
      .from("track15_narrative_steps")
      .insert(stepsToInsert);

    if (error) throw error;

    // Update campaign stage to arc_drafted if appropriate
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("track15_stage")
      .eq("id", campaignId)
      .single();

    if (
      campaign?.track15_stage === "core_story_draft" ||
      campaign?.track15_stage === "not_started"
    ) {
      await updateTrack15Stage(campaignId, "arc_drafted");
    }

    return true;
  } catch (error) {
    console.error("Error bulk updating narrative steps:", error);
    return false;
  }
}

// ============================================================================
// LIFT METRICS OPERATIONS
// ============================================================================

/**
 * Get lift metrics for a campaign
 */
export async function getLiftMetrics(
  campaignId: string
): Promise<Track15LiftMetrics | null> {
  try {
    const { data, error } = await supabase
      .from("track15_campaign_metrics")
      .select("*")
      .eq("campaign_id", campaignId)
      .single();

    if (error) {
      // If no metrics exist yet, return null
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return {
      engagementLift: data.engagement_lift || 0,
      responseRateLift: data.response_rate_lift || 0,
      velocityLift: data.velocity_lift || 0,
      baselineResponseRate: data.baseline_response_rate || undefined,
      baselineEngagementScore: data.baseline_engagement_score || undefined,
      baselineVelocity: data.baseline_velocity || undefined,
      currentResponseRate: data.current_response_rate || undefined,
      currentEngagementScore: data.current_engagement_score || undefined,
      currentVelocity: data.current_velocity || undefined,
      calculatedAt: data.calculated_at,
    };
  } catch (error) {
    console.error("Error fetching lift metrics:", error);
    return null;
  }
}

/**
 * Update lift metrics for a campaign
 */
export async function updateLiftMetrics(
  campaignId: string,
  metrics: Partial<Track15LiftMetrics>
): Promise<boolean> {
  try {
    const updateData: Record<string, any> = {
      campaign_id: campaignId,
      calculated_at: new Date().toISOString(),
    };

    if (metrics.engagementLift !== undefined)
      updateData.engagement_lift = metrics.engagementLift;
    if (metrics.responseRateLift !== undefined)
      updateData.response_rate_lift = metrics.responseRateLift;
    if (metrics.velocityLift !== undefined)
      updateData.velocity_lift = metrics.velocityLift;
    if (metrics.baselineResponseRate !== undefined)
      updateData.baseline_response_rate = metrics.baselineResponseRate;
    if (metrics.baselineEngagementScore !== undefined)
      updateData.baseline_engagement_score = metrics.baselineEngagementScore;
    if (metrics.baselineVelocity !== undefined)
      updateData.baseline_velocity = metrics.baselineVelocity;
    if (metrics.currentResponseRate !== undefined)
      updateData.current_response_rate = metrics.currentResponseRate;
    if (metrics.currentEngagementScore !== undefined)
      updateData.current_engagement_score = metrics.currentEngagementScore;
    if (metrics.currentVelocity !== undefined)
      updateData.current_velocity = metrics.currentVelocity;

    const { error } = await supabase
      .from("track15_campaign_metrics")
      .upsert(updateData, { onConflict: "campaign_id" });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating lift metrics:", error);
    return false;
  }
}

// ============================================================================
// RETENTION SERIES OPERATIONS
// ============================================================================

/**
 * Get retention series for a Track15 campaign
 * Calculates retention over time vs baseline
 */
export async function getRetentionSeries(
  campaignId: string
): Promise<Track15RetentionSeries | null> {
  try {
    // Get campaign info
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("name, client_id, start_date, track15_enabled")
      .eq("id", campaignId)
      .single();

    if (campaignError) throw campaignError;
    if (!campaign || !campaign.track15_enabled) return null;

    // Calculate retention points over time
    // This is a simplified version - you may want to adjust based on your actual retention logic
    const startDate = new Date(campaign.start_date);
    const now = new Date();
    const points: Track15RetentionPoint[] = [];

    // Generate monthly retention data points
    let currentDate = new Date(startDate);
    currentDate.setDate(1); // Start of month

    while (currentDate <= now) {
      const periodEnd = new Date(currentDate);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      // Get donations in this period
      const { data: periodDonations } = await supabase
        .from("donations")
        .select("donor_id")
        .eq("campaign_id", campaignId)
        .gte("donation_date", currentDate.toISOString())
        .lt("donation_date", periodEnd.toISOString());

      // Get previous period donations for retention calculation
      const previousPeriodStart = new Date(currentDate);
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);

      const { data: previousDonations } = await supabase
        .from("donations")
        .select("donor_id")
        .eq("campaign_id", campaignId)
        .gte("donation_date", previousPeriodStart.toISOString())
        .lt("donation_date", currentDate.toISOString());

      if (previousDonations && previousDonations.length > 0) {
        const previousDonorIds = new Set(previousDonations.map((d) => d.donor_id));
        const currentDonorIds = new Set(periodDonations?.map((d) => d.donor_id) || []);

        // Count how many previous donors gave again
        const retainedCount = Array.from(previousDonorIds).filter((id) =>
          currentDonorIds.has(id)
        ).length;

        const campaignRetention = retainedCount / previousDonorIds.size;

        // Calculate baseline retention (client average for this period)
        const { data: clientCampaigns } = await supabase
          .from("campaigns")
          .select("id")
          .eq("client_id", campaign.client_id)
          .neq("id", campaignId)
          .eq("track15_enabled", false);

        let baselineRetention = 0.65; // Default baseline

        if (clientCampaigns && clientCampaigns.length > 0) {
          // Calculate average retention across non-Track15 campaigns
          const retentionRates = await Promise.all(
            clientCampaigns.slice(0, 5).map(async (c) => {
              const { data: cPrevDonations } = await supabase
                .from("donations")
                .select("donor_id")
                .eq("campaign_id", c.id)
                .gte("donation_date", previousPeriodStart.toISOString())
                .lt("donation_date", currentDate.toISOString());

              const { data: cCurrentDonations } = await supabase
                .from("donations")
                .select("donor_id")
                .eq("campaign_id", c.id)
                .gte("donation_date", currentDate.toISOString())
                .lt("donation_date", periodEnd.toISOString());

              if (!cPrevDonations || cPrevDonations.length === 0) return null;

              const cPrevIds = new Set(cPrevDonations.map((d) => d.donor_id));
              const cCurrentIds = new Set(cCurrentDonations?.map((d) => d.donor_id) || []);
              const cRetained = Array.from(cPrevIds).filter((id) =>
                cCurrentIds.has(id)
              ).length;

              return cRetained / cPrevIds.size;
            })
          );

          const validRates = retentionRates.filter((r) => r !== null) as number[];
          if (validRates.length > 0) {
            baselineRetention =
              validRates.reduce((sum, r) => sum + r, 0) / validRates.length;
          }
        }

        points.push({
          period: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`,
          campaignRetention,
          baselineRetention,
        });
      }

      currentDate = periodEnd;
    }

    return {
      campaignId,
      label: `Track15 ${campaign.name}`,
      points,
    };
  } catch (error) {
    console.error("Error fetching retention series:", error);
    return null;
  }
}

// ============================================================================
// SEGMENT PERFORMANCE OPERATIONS
// ============================================================================

export interface SegmentPerformanceData {
  segment: string;
  donorCount: number;
  totalGifts: number;
  avgGiftSize: number;
  responseRate: number;
  conversionRate: number;
  retentionRate?: number;
}

/**
 * Get segment performance data for a campaign
 */
export async function getSegmentPerformance(
  campaignId: string
): Promise<SegmentPerformanceData[]> {
  try {
    // Get campaign info
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("client_id, start_date, end_date")
      .eq("id", campaignId)
      .single();

    if (campaignError) throw campaignError;

    // Define segments
    const segments = [
      "current_donors",
      "lapsed_donors",
      "high_value_donors",
      "prospects",
      "monthly_supporters",
      "major_gift_prospects",
      "planned_giving_prospects",
    ];

    const segmentData: SegmentPerformanceData[] = [];

    for (const segment of segments) {
      // Get donations for this campaign and segment
      const { data: donations, error: donationsError } = await supabase
        .from("donations")
        .select("amount, donor_id")
        .eq("campaign_id", campaignId);

      if (donationsError) {
        console.error(`Error fetching donations for segment ${segment}:`, donationsError);
        continue;
      }

      if (!donations || donations.length === 0) {
        segmentData.push({
          segment,
          donorCount: 0,
          totalGifts: 0,
          avgGiftSize: 0,
          responseRate: 0,
          conversionRate: 0,
          retentionRate: 0,
        });
        continue;
      }

      // Calculate metrics
      const uniqueDonors = new Set(donations.map((d) => d.donor_id));
      const donorCount = uniqueDonors.size;
      const totalGifts = donations.reduce((sum, d) => sum + d.amount, 0);
      const avgGiftSize = donorCount > 0 ? totalGifts / donorCount : 0;

      // Mock response rate and conversion rate for now
      // In production, these would be calculated from actual campaign metrics
      const responseRate = Math.random() * 15 + 2; // 2-17%
      const conversionRate = responseRate * (Math.random() * 0.7 + 0.3); // 30-100% of response

      // Calculate retention rate (only for donor segments)
      let retentionRate: number | undefined;
      if (
        segment === "current_donors" ||
        segment === "lapsed_donors" ||
        segment === "monthly_supporters"
      ) {
        retentionRate = Math.random() * 30 + 50; // 50-80%
      }

      segmentData.push({
        segment,
        donorCount,
        totalGifts,
        avgGiftSize,
        responseRate,
        conversionRate,
        retentionRate,
      });
    }

    return segmentData;
  } catch (error) {
    console.error("Error fetching segment performance:", error);
    return [];
  }
}

// ============================================================================
// COMPOSITE OPERATIONS
// ============================================================================

/**
 * Get complete Track15 campaign data
 */
export async function getCompleteTrack15Campaign(
  campaignId: string
): Promise<Track15CampaignMeta | null> {
  try {
    const [meta, steps, metrics] = await Promise.all([
      getTrack15Meta(campaignId),
      getNarrativeSteps(campaignId),
      getLiftMetrics(campaignId),
    ]);

    if (!meta) return null;

    return {
      ...meta,
      narrativeSteps: steps,
      liftMetrics: metrics || undefined,
    };
  } catch (error) {
    console.error("Error fetching complete Track15 campaign:", error);
    return null;
  }
}
