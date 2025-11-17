/**
 * Generate Journey With AI Button
 *
 * Bulk "generate all touches" button for entire journeys.
 * Drafts content for all touches and all segments in one operation.
 */

import { Sparkles } from "lucide-react";
import { useState } from "react";

import type { LabRun } from "@/services/donorDataLabPersistence";
import { draftEntireJourneyWithAi } from "@/services/journeyBulkDraftService";
import type { JourneyTemplate, JourneyType } from "@/utils/journeyTemplates";

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

interface GenerateJourneyWithAiButtonProps {
  clientId: string | undefined;
  journeyType: JourneyType | null;
  journeyTemplate: JourneyTemplate | null;
  labRun: LabRun | null;
  deliverables: Deliverable[];
  segments: BehavioralSegment[];
  onUpdateDeliverables: (ds: Deliverable[]) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function GenerateJourneyWithAiButton({
  clientId,
  journeyType,
  journeyTemplate,
  labRun,
  deliverables,
  segments,
  onUpdateDeliverables,
  onSuccess,
  onError,
}: GenerateJourneyWithAiButtonProps) {
  const [loading, setLoading] = useState(false);

  const disabledReason = !clientId
    ? "Missing client context."
    : !journeyType || !journeyTemplate
      ? "Apply a journey template first."
      : !labRun
        ? "Run the Donor Data Lab first."
        : deliverables.length === 0
          ? "No deliverables to draft."
          : null;

  const handleClick = async () => {
    if (
      disabledReason ||
      !clientId ||
      !journeyType ||
      !journeyTemplate ||
      !labRun
    ) {
      return;
    }

    try {
      setLoading(true);
      const updated = await draftEntireJourneyWithAi({
        clientId,
        journeyType,
        journeyTemplate,
        labRun,
        deliverables,
        segments,
      });
      onUpdateDeliverables(updated);
      if (onSuccess) {
        onSuccess("AI drafted content for your journey touches.");
      }
    } catch (err) {
      console.error(err);
      if (onError) {
        onError("Failed to generate journey content with AI.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || !!disabledReason}
      className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] ${
        disabledReason
          ? "cursor-not-allowed border border-slate-700 text-slate-500"
          : "border border-purple-500/70 text-purple-100 hover:bg-purple-500/10"
      }`}
      title={
        disabledReason ??
        "Use AI to draft content for all journey touches and segments at once."
      }
    >
      <Sparkles className="h-3 w-3" />
      {loading ? "Drafting full journey…" : "Generate journey with AI"}
    </button>
  );
}
