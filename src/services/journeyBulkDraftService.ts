/**
 * Journey Bulk Draft Service
 *
 * Draft all touches in a journey at once using AI.
 * Iterates through deliverables and generates content for each segment version.
 */

import type {
  JourneyTemplate,
  JourneyTouchTemplate,
  JourneyType,
} from "@/utils/journeyTemplates";

import { draftJourneyTouchContent } from "./journeyAiCoachService";

import type { LabRun } from "./donorDataLabPersistence";

// Temporary types - replace with actual imports when available
interface Deliverable {
  deliverableId: string;
  name: string;
  type: string;
  versions: DeliverableVersion[];
  [key: string]: any;
}

interface DeliverableVersion {
  versionId: string;
  label: string;
  segmentCriteriaId: string;
  content: {
    subject?: string;
    body: string;
  };
  [key: string]: any;
}

interface BehavioralSegment {
  segmentId: string;
  name: string;
  description?: string;
  criteria?: Record<string, any>;
}

export interface BulkDraftParams {
  clientId: string;
  journeyType: JourneyType;
  journeyTemplate: JourneyTemplate;
  labRun: LabRun;
  deliverables: Deliverable[];
  segments: BehavioralSegment[];
}

// Limit bulk AI drafts to prevent token quota abuse
const MAX_TOUCHES_FOR_BULK_DRAFT = 10;

/**
 * Draft content for all touches and all versions in a journey
 */
export async function draftEntireJourneyWithAi({
  clientId,
  journeyType,
  journeyTemplate,
  labRun,
  deliverables,
  segments,
}: BulkDraftParams): Promise<Deliverable[]> {
  const touchByLabel = new Map<string, JourneyTouchTemplate>();
  journeyTemplate.touches.forEach((t) => touchByLabel.set(t.label, t));

  // Count how many versions we would draft
  let plannedDrafts = 0;
  for (const d of deliverables) {
    const touch = touchByLabel.get(d.name);
    if (!touch || d.type !== touch.channel) continue;
    plannedDrafts += d.versions.length;
  }

  if (plannedDrafts > MAX_TOUCHES_FOR_BULK_DRAFT) {
    throw new Error(
      `Bulk AI draft limited to ${MAX_TOUCHES_FOR_BULK_DRAFT} versions at once. Currently: ${plannedDrafts}. Try drafting fewer segments or touches.`,
    );
  }

  const updatedDeliverables: Deliverable[] = [];

  for (const d of deliverables) {
    const touch = touchByLabel.get(d.name);
    if (!touch || d.type !== touch.channel) {
      // not part of this journey or mismatched channel; keep unchanged
      updatedDeliverables.push(d);
      continue;
    }

    const updatedVersions: DeliverableVersion[] = [];
    for (const v of d.versions) {
      const segment =
        segments.find((s) => s.segmentId === v.segmentCriteriaId) ?? null;

      // If there is no segment or no labRun, skip AI drafting and keep as is
      if (!segment) {
        updatedVersions.push(v);
        continue;
      }

      const result = await draftJourneyTouchContent({
        clientId,
        journeyType,
        touch,
        segment,
        labRun,
        existingSubject: v.content.subject,
        existingBody: v.content.body,
      });

      updatedVersions.push({
        ...v,
        content: {
          ...v.content,
          subject: result.subject ?? v.content.subject,
          body: result.body,
        },
      });
    }

    updatedDeliverables.push({
      ...d,
      versions: updatedVersions,
    });
  }

  return updatedDeliverables;
}
