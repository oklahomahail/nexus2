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

// Generic types for flexible integration with different deliverable models
interface BaseDeliverable {
  deliverableId: string;
  name: string;
  type: string;
  versions: BaseDeliverableVersion[];
  [key: string]: any;
}

interface BaseDeliverableVersion {
  versionId: string;
  label: string;
  segmentCriteriaId: string;
  content: {
    subject?: string;
    body: string;
  };
  [key: string]: any;
}

interface BaseBehavioralSegment {
  segmentId: string;
  name: string;
  description?: string;
  criteria?: Record<string, any>;
}

interface GenerateJourneyWithAiButtonProps<
  T extends BaseDeliverable = BaseDeliverable,
> {
  clientId: string | undefined;
  journeyType: JourneyType | null;
  journeyTemplate: JourneyTemplate | null;
  labRun: LabRun | null;
  deliverables: T[];
  segments: BaseBehavioralSegment[];
  onUpdateDeliverables: (ds: T[]) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function GenerateJourneyWithAiButton<
  T extends BaseDeliverable = BaseDeliverable,
>({
  clientId,
  journeyType,
  journeyTemplate,
  labRun,
  deliverables,
  segments,
  onUpdateDeliverables,
  onSuccess,
  onError,
}: GenerateJourneyWithAiButtonProps<T>) {
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
      onUpdateDeliverables(updated as T[]);
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
    <div className="flex flex-col items-end gap-1">
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
      <p className="text-[10px] text-slate-500">
        AI may be imperfect. Please review all content before launch.
      </p>
    </div>
  );
}
