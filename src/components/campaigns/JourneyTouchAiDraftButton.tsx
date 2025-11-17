/**
 * Journey Touch AI Draft Button
 *
 * "Draft with AI" button for individual journey touches.
 * Uses Data Lab insights to generate segment-specific content.
 */

import { Sparkles } from "lucide-react";
import { useState } from "react";

import type { LabRun } from "@/services/donorDataLabPersistence";
import { draftJourneyTouchContent } from "@/services/journeyAiCoachService";
import type {
  JourneyTouchTemplate,
  JourneyType,
} from "@/utils/journeyTemplates";

// Temporary types - replace with actual imports when available
interface BehavioralSegment {
  segmentId: string;
  name: string;
  description?: string;
  criteria?: Record<string, any>;
}

interface DeliverableVersion {
  versionId: string;
  label: string;
  segmentCriteriaId: string;
  content: {
    subject?: string;
    body: string;
  };
}

interface JourneyTouchAiDraftButtonProps {
  clientId: string | undefined;
  journeyType: JourneyType;
  touch: JourneyTouchTemplate;
  labRun: LabRun | null;
  segment: BehavioralSegment | null;
  version: DeliverableVersion;
  onUpdate: (content: { subject?: string; body: string }) => void;
  onError?: (message: string) => void;
}

export function JourneyTouchAiDraftButton({
  clientId,
  journeyType,
  touch,
  labRun,
  segment,
  version,
  onUpdate,
  onError,
}: JourneyTouchAiDraftButtonProps) {
  const [loading, setLoading] = useState(false);

  const disabledReason = !labRun
    ? "Run the Donor Data Lab first."
    : !segment
      ? "Select a segment for this version first."
      : !clientId
        ? "Missing client context."
        : null;

  const handleClick = async () => {
    if (disabledReason || !labRun || !segment || !clientId) return;

    try {
      setLoading(true);
      const result = await draftJourneyTouchContent({
        clientId,
        journeyType,
        touch,
        segment,
        labRun,
        existingSubject: version.content.subject,
        existingBody: version.content.body,
      });

      onUpdate(result);
    } catch (err) {
      console.error(err);
      if (onError) {
        onError("Failed to draft content with AI. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || !!disabledReason}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
          disabledReason
            ? "cursor-not-allowed border border-slate-700 text-slate-500"
            : "border border-purple-500/70 text-purple-100 hover:bg-purple-500/10"
        }`}
        title={
          disabledReason ??
          "Use AI to draft this touch using your Data Lab insights."
        }
      >
        <Sparkles className="h-3 w-3" />
        {loading ? "Drafting…" : "Draft with AI for this journey"}
      </button>
      <p className="text-[10px] text-slate-500">
        AI can make mistakes. Always review and edit before sending.
      </p>
    </div>
  );
}
