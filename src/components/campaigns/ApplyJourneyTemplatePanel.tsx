/**
 * Apply Journey Template Panel
 *
 * Allows users to scaffold multi-touch journeys (upgrade, monthly, reactivation)
 * based on Data Lab analysis and recommendations.
 */

import { useState } from "react";

import type { LabRun } from "@/services/donorDataLabPersistence";
import {
  JourneyType,
  getJourneyTemplate,
  JOURNEY_TEMPLATES,
} from "@/utils/journeyTemplates";

interface ApplyJourneyTemplatePanelProps {
  labRun: LabRun | null;
  onApply: (journeyType: JourneyType) => void;
}

export function ApplyJourneyTemplatePanel({
  labRun,
  onApply,
}: ApplyJourneyTemplatePanelProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<JourneyType | null>(null);

  if (!labRun) {
    return null;
  }

  const handleApply = () => {
    if (!selectedType) return;
    onApply(selectedType);
    setOpen(false);
    setSelectedType(null);
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-xs text-slate-200">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Journey templates
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Use your latest Data Lab analysis to scaffold a multi-touch journey.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-slate-600 px-3 py-1.5 text-[11px] text-slate-200 hover:bg-slate-800"
          onClick={() => setOpen(true)}
        >
          Apply template
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-[11px] text-slate-400">
            Choose a journey type based on the segments you plan to target.
          </p>
          <div className="grid gap-2 md:grid-cols-3">
            {JOURNEY_TEMPLATES.map((t) => (
              <button
                key={t.journeyType}
                type="button"
                onClick={() => setSelectedType(t.journeyType)}
                className={`flex flex-col rounded-lg border px-3 py-2 text-left transition-colors ${
                  selectedType === t.journeyType
                    ? "border-sky-500 bg-sky-500/10"
                    : "border-slate-700 bg-slate-950/40 hover:border-slate-500"
                }`}
              >
                <span className="text-[11px] font-semibold text-slate-100">
                  {t.name}
                </span>
                <span className="mt-1 line-clamp-3 text-[11px] text-slate-400">
                  {t.summary}
                </span>
              </button>
            ))}
          </div>

          {selectedType && (
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <p className="mb-2 text-[11px] font-semibold text-slate-300">
                Journey touches:
              </p>
              <ul className="space-y-2">
                {getJourneyTemplate(selectedType)?.touches.map((touch) => (
                  <li key={touch.id} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[10px] text-sky-300">
                      {touch.offsetDays}
                    </span>
                    <div className="flex-1">
                      <p className="text-[11px] font-medium text-slate-200">
                        {touch.label}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {touch.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className="text-[11px] text-slate-400 hover:text-slate-300"
              onClick={() => {
                setOpen(false);
                setSelectedType(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-sky-600 px-3 py-1.5 text-[11px] font-medium text-white transition-opacity hover:bg-sky-500 disabled:opacity-60"
              disabled={!selectedType}
              onClick={handleApply}
            >
              Apply journey template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
