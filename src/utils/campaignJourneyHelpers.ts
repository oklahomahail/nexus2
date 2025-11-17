/**
 * Campaign Journey Helpers
 *
 * Utilities for saving and hydrating journey campaigns with deliverables.
 */

import type { Deliverable, JourneyType } from "@/types/campaign";

/**
 * Serialize deliverables for API submission
 * Converts Date objects to ISO strings
 */
export function serializeDeliverablesForApi(
  deliverables: Deliverable[],
): Deliverable[] {
  return deliverables.map((d) => ({
    ...d,
    scheduledSendAt: d.scheduledSendAt
      ? new Date(d.scheduledSendAt).toISOString()
      : undefined,
  }));
}

/**
 * Hydrate deliverables from API response
 * Converts ISO strings back to Date objects
 */
export function hydrateDeliverablesFromApi(
  deliverables: Deliverable[],
): Deliverable[] {
  return deliverables.map((d) => ({
    ...d,
    scheduledSendAt: d.scheduledSendAt
      ? new Date(d.scheduledSendAt)
      : undefined,
  }));
}

/**
 * Prepare campaign payload for saving
 * Includes journey-specific fields
 */
export interface SaveCampaignPayload {
  name: string;
  clientId: string;
  campaignType?: string;
  status?: string;
  journeyType?: JourneyType;
  deliverables?: Deliverable[];
  originLabRunId?: string;
  originLabRunSummary?: string;
  // ... other campaign fields
}

export function prepareCampaignSavePayload(params: {
  name: string;
  clientId: string;
  journeyType?: JourneyType | null;
  deliverables?: Deliverable[];
  originLabRunId?: string;
  originLabRunSummary?: string;
  // ... other fields
}): SaveCampaignPayload {
  const {
    name,
    clientId,
    journeyType,
    deliverables,
    originLabRunId,
    originLabRunSummary,
  } = params;

  const payload: SaveCampaignPayload = {
    name,
    clientId,
  };

  if (journeyType) {
    payload.journeyType = journeyType;
  }

  if (deliverables && deliverables.length > 0) {
    payload.deliverables = serializeDeliverablesForApi(deliverables);
  }

  if (originLabRunId) {
    payload.originLabRunId = originLabRunId;
  }

  if (originLabRunSummary) {
    payload.originLabRunSummary = originLabRunSummary;
  }

  return payload;
}

/**
 * Count total versions across all deliverables
 * Useful for UI summaries
 */
export function countTotalVersions(deliverables: Deliverable[]): number {
  return deliverables.reduce((acc, d) => acc + d.versions.length, 0);
}

/**
 * Count versions by status
 */
export function countVersionsByStatus(deliverables: Deliverable[]): {
  draft: number;
  scheduled: number;
  sent: number;
} {
  const counts = { draft: 0, scheduled: 0, sent: 0 };

  for (const d of deliverables) {
    const status = d.status || "draft";
    if (status in counts) {
      counts[status as keyof typeof counts] += d.versions.length;
    }
  }

  return counts;
}
