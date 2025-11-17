/**
 * Recommended Segmentation Configuration
 *
 * Pre-configured segment combinations for common campaign types.
 * Based on fundraising best practices and Track15 methodology.
 */

export type CampaignKind =
  | "year_end"
  | "acquisition"
  | "recurring_upgrade"
  | "appeal"
  | "event"
  | "reactivation";

export interface RecommendedSegment {
  segmentId: string;
  label: string;
  priority: number; // 1 = highest priority
  rationale?: string;
}

export const RECOMMENDED_SEGMENTATION: Record<
  CampaignKind,
  RecommendedSegment[]
> = {
  year_end: [
    {
      segmentId: "donors_any",
      label: "All Donors",
      priority: 1,
      rationale:
        "Your core donor base. Lead with gratitude and year-end tax benefits.",
    },
    {
      segmentId: "lybunt",
      label: "LYBUNT (Gave Last Year)",
      priority: 2,
      rationale:
        "Critical reactivation opportunity. They gave last year but not yet this year.",
    },
    {
      segmentId: "sybunt",
      label: "SYBUNT (Gave in Past)",
      priority: 3,
      rationale:
        "Win-back opportunity. Lapsed donors who need urgency and renewed connection.",
    },
    {
      segmentId: "monthly_donors",
      label: "Monthly Sustainers",
      priority: 4,
      rationale:
        "Handle carefully - they already give monthly. Focus on impact reporting or year-end bonus gift.",
    },
  ],

  acquisition: [
    {
      segmentId: "high_engagement_non_donors",
      label: "Engaged Non-Donors",
      priority: 1,
      rationale:
        "Warm prospects. They're already engaged - convert interest into first gift.",
    },
    {
      segmentId: "never_given",
      label: "Cold Non-Donors",
      priority: 2,
      rationale:
        "Acquisition targets. Needs strong value proposition and low barriers.",
    },
  ],

  recurring_upgrade: [
    {
      segmentId: "annual_donors",
      label: "Annual Donors",
      priority: 1,
      rationale:
        "Prime upgrade targets. Convert one-time givers to monthly sustainers.",
    },
    {
      segmentId: "monthly_donors",
      label: "Current Monthly Donors",
      priority: 2,
      rationale:
        "Upgrade existing monthly donors to higher amounts. Handle with care.",
    },
    {
      segmentId: "donors_any",
      label: "All Donors (Low Priority)",
      priority: 3,
      rationale: "Broader pool. Test monthly giving appeal with proven donors.",
    },
  ],

  appeal: [
    {
      segmentId: "donors_any",
      label: "All Donors",
      priority: 1,
      rationale: "Your core audience. Customize urgency and ask amounts.",
    },
    {
      segmentId: "lybunt",
      label: "LYBUNT Donors",
      priority: 2,
      rationale:
        "Reactivation opportunity. Frame appeal as 'come back' moment.",
    },
    {
      segmentId: "monthly_donors",
      label: "Monthly Donors",
      priority: 3,
      rationale:
        "Avoid over-asking. Consider impact-only version or special project ask.",
    },
  ],

  event: [
    {
      segmentId: "donors_any",
      label: "Donors",
      priority: 1,
      rationale: "Your supporter base. Most likely to attend or sponsor.",
    },
    {
      segmentId: "high_engagement_non_donors",
      label: "Engaged Non-Donors",
      priority: 2,
      rationale:
        "Great acquisition channel. Events convert interest to action.",
    },
    {
      segmentId: "major_donors_behavioral",
      label: "Major Donors",
      priority: 3,
      rationale:
        "VIP experience. Consider personal outreach or exclusive seating.",
    },
  ],

  reactivation: [
    {
      segmentId: "lybunt",
      label: "LYBUNT",
      priority: 1,
      rationale:
        "Primary target. Gave last year, most likely to return with right message.",
    },
    {
      segmentId: "sybunt",
      label: "SYBUNT",
      priority: 2,
      rationale: "Harder to win back but worth trying. Use urgency.",
    },
    {
      segmentId: "donors_any",
      label: "All Lapsed Donors",
      priority: 3,
      rationale:
        "Broader reactivation pool. Test different time windows and messaging.",
    },
  ],
};

/**
 * Get recommended segments for a campaign type
 */
export function getRecommendedSegments(
  campaignType: CampaignKind,
): RecommendedSegment[] {
  return RECOMMENDED_SEGMENTATION[campaignType] || [];
}

/**
 * Get campaign type label for UI display
 */
export function getCampaignTypeLabel(campaignType: CampaignKind): string {
  const labels: Record<CampaignKind, string> = {
    year_end: "Year-End Campaign",
    acquisition: "Acquisition Campaign",
    recurring_upgrade: "Monthly Giving / Upgrade",
    appeal: "General Appeal",
    event: "Event Campaign",
    reactivation: "Donor Reactivation",
  };
  return labels[campaignType];
}

/**
 * Check if a campaign type has recommended segmentation
 */
export function hasRecommendedSegmentation(campaignType: string): boolean {
  return campaignType in RECOMMENDED_SEGMENTATION;
}
