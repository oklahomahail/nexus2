/**
 * Journey Overview Sidebar
 *
 * Visual map of the journey showing touches, segments, and Lab origin.
 * Helps users see the full journey structure at a glance.
 */

import type { LabRun } from "@/services/donorDataLabPersistence";
import type { JourneyTemplate } from "@/utils/journeyTemplates";

// Temporary types - replace with actual imports when available
interface Deliverable {
  deliverableId: string;
  name: string;
  type: string;
  scheduledSendAt?: Date | string;
  versions: DeliverableVersion[];
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

interface BehavioralSegment {
  segmentId: string;
  name: string;
  description?: string;
}

interface JourneyOverviewSidebarProps {
  journeyTemplate: JourneyTemplate | null;
  labRun: LabRun | null;
  deliverables: Deliverable[];
  segments: BehavioralSegment[];
}

export function JourneyOverviewSidebar({
  journeyTemplate,
  labRun,
  deliverables,
  segments,
}: JourneyOverviewSidebarProps) {
  if (!journeyTemplate) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-400">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Journey overview
        </p>
        <p className="mt-1">
          No journey template applied yet. Use the Journey Templates panel to
          scaffold a multi-touch series.
        </p>
      </div>
    );
  }

  const { name, summary, touches } = journeyTemplate;

  const touchCards = touches.map((touch) => {
    const matchingDeliverable = deliverables.find(
      (d) => d.name === touch.label,
    );
    const versions = matchingDeliverable?.versions ?? [];
    const versionSegments = versions
      .map((v) => segments.find((s) => s.segmentId === v.segmentCriteriaId))
      .filter(Boolean) as BehavioralSegment[];

    return { touch, deliverable: matchingDeliverable, versionSegments };
  });

  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-200">
      <div className="mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Journey overview
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-50">{name}</p>
        <p className="mt-1 text-slate-400">{summary}</p>

        {labRun && (
          <p className="mt-2 text-[11px] text-slate-400">
            ✨ Powered by Data Lab analysis from{" "}
            {new Date(labRun.runDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {touchCards.map(({ touch, deliverable, versionSegments }, idx) => (
          <div key={touch.id} className="flex gap-2">
            <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] text-slate-200">
              {idx + 1}
            </div>
            <div className="flex-1 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-slate-100">
                    {touch.label}
                  </p>
                  <p className="line-clamp-2 text-[11px] text-slate-500">
                    {touch.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                    {touch.channel.toUpperCase()}
                  </span>
                  {deliverable?.scheduledSendAt && (
                    <p className="mt-1 text-[10px] text-slate-500">
                      {new Date(
                        deliverable.scheduledSendAt,
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {versionSegments.length > 0 ? (
                <div className="mt-2">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Target segments
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {versionSegments.map((seg) => (
                      <span
                        key={seg.segmentId}
                        className="inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200"
                      >
                        {seg.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-[10px] text-amber-400">
                  No segments assigned yet. Add at least one version for this
                  touch.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
