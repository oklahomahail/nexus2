/**
 * Donor Data Lab Segment Promotion Service
 *
 * Converts Data Lab suggested segments into Nexus BehavioralSegments.
 * Maps lab-specific criteria (valueTier, recencyTier, flags) into
 * Nexus's standard SegmentCriteria model.
 */

import {
  BehavioralSegment,
  SegmentCriteria,
} from "./campaignComposer/defaultSegmentCatalog";
import { createSegment } from "./donorAnalyticsService";
import { AnalysisResult } from "./donorDataLab";

/**
 * Map a Data Lab suggested segment ID to Nexus SegmentCriteria.
 * This is intentionally coarse; we're capturing the behavioral intent,
 * not replicating the full filter function.
 */
function buildCriteriaForSuggested(suggestedId: string): SegmentCriteria & {
  labRule?: string;
} {
  switch (suggestedId) {
    case "high_value_at_risk":
      return {
        recency: "365-730_days", // maps to at-risk/lapsed
        engagement: "medium",
        labRule:
          "valueTier in {large,major} && recencyTier in {at_risk,lapsed}",
      };

    case "upgrade_ready_core":
      return {
        engagement: "high",
        frequency: "repeat",
        labRule: "upgradeReady = true",
      };

    case "monthly_candidates":
      return {
        frequency: "repeat",
        giving_type: "annual", // candidates for conversion to monthly
        labRule: "monthlyProspect = true",
      };

    case "reactivation_value":
      return {
        recency: "730+_days", // long-lapsed
        engagement: "dormant",
        labRule:
          "valueTier in {large,major} && recencyTier in {lapsed,long_lapsed}",
      };

    default:
      return {
        labRule: suggestedId,
      };
  }
}

/**
 * Compute donor count for a suggested segment, using its filter function.
 */
function countDonorsForSuggestedSegment(
  analysis: AnalysisResult,
  suggestedId: string,
): number {
  const seg = analysis.suggestedSegments.find((s) => s.id === suggestedId);
  if (!seg) return 0;
  return analysis.donors.filter(seg.filter).length;
}

/**
 * Map suggested segment to category
 */
function getCategoryForSuggested(
  suggestedId: string,
): BehavioralSegment["category"] {
  switch (suggestedId) {
    case "high_value_at_risk":
    case "reactivation_value":
      return "donor_status";
    case "upgrade_ready_core":
    case "monthly_candidates":
      return "giving_pattern";
    default:
      return "engagement";
  }
}

/**
 * Create a BehavioralSegment from a Data Lab suggested segment.
 * Returns a segment object ready to be saved (via API or local storage).
 *
 * Note: This returns a segment without segmentId - the calling code
 * should generate an ID or let the backend assign one.
 */
export function createBehavioralSegmentFromDataLab(params: {
  analysis: AnalysisResult;
  suggestedSegmentId: string;
}): Omit<BehavioralSegment, "segmentId"> {
  const { analysis, suggestedSegmentId } = params;

  const suggested = analysis.suggestedSegments.find(
    (s) => s.id === suggestedSegmentId,
  );

  if (!suggested) {
    throw new Error(`Suggested segment ${suggestedSegmentId} not found`);
  }

  const donorCount = countDonorsForSuggestedSegment(
    analysis,
    suggestedSegmentId,
  );
  const criteria = buildCriteriaForSuggested(suggested.id);
  const category = getCategoryForSuggested(suggested.id);

  return {
    name: suggested.name,
    description: `${suggested.description} (Created from Data Lab analysis; ${donorCount} donors matched at creation)`,
    criteria,
    isActive: true,
    isDefault: false,
    category,
  };
}

/**
 * Promote a Data Lab suggested segment to a Nexus BehavioralSegment.
 * Creates the segment via the donor analytics service.
 */
export async function promoteSuggestedSegmentToNexusSegment(params: {
  clientId: string;
  analysis: AnalysisResult;
  suggestedSegmentId: string;
}): Promise<BehavioralSegment> {
  const { clientId, analysis, suggestedSegmentId } = params;

  const segmentWithoutId = createBehavioralSegmentFromDataLab({
    analysis,
    suggestedSegmentId,
  });

  // Use the donor analytics service to create the segment
  // This will use the API when available, localStorage for now
  return createSegment(clientId, segmentWithoutId);
}
