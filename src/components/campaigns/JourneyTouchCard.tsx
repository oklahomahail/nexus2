/**
 * Journey Touch Card
 *
 * Editable card for a single journey touch with subject, body, and AI draft button.
 * Shows segment targeting and integrates with journey AI coach.
 */

import type { LabRun } from "@/services/donorDataLabPersistence";
import type {
  JourneyTouchTemplate,
  JourneyType,
} from "@/utils/journeyTemplates";

import { JourneyTouchAiDraftButton } from "./JourneyTouchAiDraftButton";

// Temporary types - replace with actual imports when available
interface BehavioralSegment {
  segmentId: string;
  name: string;
  description?: string;
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

interface JourneyTouchCardProps {
  clientId: string | undefined;
  journeyType: JourneyType;
  touch: JourneyTouchTemplate;
  labRun: LabRun | null;
  segment: BehavioralSegment | null;
  version: DeliverableVersion;
  onChange: (patch: Partial<DeliverableVersion["content"]>) => void;
  onError?: (message: string) => void;
}

export function JourneyTouchCard({
  clientId,
  journeyType,
  touch,
  labRun,
  segment,
  version,
  onChange,
  onError,
}: JourneyTouchCardProps) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-xs text-slate-200">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {touch.label}
          </p>
          <p className="text-[11px] text-slate-500">{touch.description}</p>
          {segment && (
            <p className="mt-1 text-[11px] text-slate-400">
              Segment:{" "}
              <span className="font-medium text-slate-100">{segment.name}</span>
            </p>
          )}
        </div>
        <span className="rounded-full border border-slate-600 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
          {touch.channel.toUpperCase()}
        </span>
      </div>

      {/* Subject line (for email) */}
      {touch.channel === "email" && (
        <div className="mb-2">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Subject
          </label>
          <input
            value={version.content.subject ?? ""}
            onChange={(e) => onChange({ subject: e.target.value })}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Subject line for this touch"
          />
        </div>
      )}

      {/* Body */}
      <div>
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Body
        </label>
        <textarea
          value={version.content.body}
          onChange={(e) => onChange({ body: e.target.value })}
          className="h-32 w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
          placeholder="Write or generate the message for this touch."
        />
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
          <span>{version.content.body.length} characters</span>
        </div>
      </div>

      <JourneyTouchAiDraftButton
        clientId={clientId}
        journeyType={journeyType}
        touch={touch}
        labRun={labRun}
        segment={segment}
        version={version}
        onUpdate={(patch) => onChange(patch)}
        onError={onError}
      />
    </div>
  );
}
