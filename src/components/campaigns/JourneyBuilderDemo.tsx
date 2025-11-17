/**
 * Journey Builder Demo
 *
 * Complete example showing how to wire up all journey components.
 * This demonstrates the full user flow from template selection to AI-drafted content.
 *
 * Integration pattern for deliverable-based campaign builders.
 */

import { useState, useEffect } from "react";

import { useClient } from "@/context/ClientContext";
import type { LabRun } from "@/services/donorDataLabPersistence";
import { getLatestLabRun } from "@/services/donorDataLabPersistence";
import type { JourneyType } from "@/utils/journeyTemplates";
import { getJourneyTemplate } from "@/utils/journeyTemplates";

import { ApplyJourneyTemplatePanel } from "./ApplyJourneyTemplatePanel";
import { GenerateJourneyWithAiButton } from "./GenerateJourneyWithAiButton";
import { JourneyOverviewSidebar } from "./JourneyOverviewSidebar";
import { JourneyTouchCard } from "./JourneyTouchCard";

// Demo-specific types (not production types)
interface DemoDeliverable {
  deliverableId: string;
  name: string;
  type: string;
  phase: string;
  scheduledSendAt: Date;
  status: string;
  versions: DemoDeliverableVersion[];
}

interface DemoDeliverableVersion {
  versionId: string;
  label: string;
  segmentCriteriaId: string;
  content: {
    subject?: string;
    body: string;
  };
}

interface DemoBehavioralSegment {
  segmentId: string;
  name: string;
  description?: string;
  criteria?: Record<string, any>;
}

/**
 * Example: How to integrate journey components into a campaign builder
 */
export function JourneyBuilderDemo() {
  const { currentClient } = useClient();

  // State
  const [journeyType, setJourneyType] = useState<JourneyType | null>(null);
  const [deliverables, setDeliverables] = useState<DemoDeliverable[]>([]);
  const [segments, setSegments] = useState<DemoBehavioralSegment[]>([]);
  const [labRun, setLabRun] = useState<LabRun | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load Data Lab run
  useEffect(() => {
    if (currentClient?.id) {
      const run = getLatestLabRun(currentClient.id);
      setLabRun(run);

      // Load mock segments (replace with actual segment loading)
      if (run) {
        setSegments([
          {
            segmentId: "seg_upgrade_core",
            name: "Upgrade-ready core donors",
            description: "Recent donors with strong giving patterns",
            criteria: { labRule: "upgradeReady = true" },
          },
          {
            segmentId: "seg_monthly_prospects",
            name: "Monthly giving prospects",
            description: "Multi-gift donors ideal for recurring",
            criteria: { labRule: "monthlyProspect = true" },
          },
        ]);
      }
    }
  }, [currentClient?.id]);

  // Get journey template
  const journeyTemplate = journeyType ? getJourneyTemplate(journeyType) : null;

  // Handle applying journey template
  const handleApplyTemplate = (type: JourneyType) => {
    const template = getJourneyTemplate(type);
    if (!template) return;

    setJourneyType(type);

    // Create deliverables from template
    const baseDate = new Date();
    const newDeliverables: DemoDeliverable[] = template.touches.map((touch) => {
      const scheduledDate = new Date(
        baseDate.getTime() + touch.offsetDays * 24 * 60 * 60 * 1000,
      );

      // Create one version per relevant segment
      const relevantSegments = pickSegmentsForJourney(type, segments);
      const versions: DemoDeliverableVersion[] = relevantSegments.map(
        (seg) => ({
          versionId: crypto.randomUUID(),
          label: seg.name,
          segmentCriteriaId: seg.segmentId,
          content: {
            subject: "",
            body: "",
          },
        }),
      );

      return {
        deliverableId: crypto.randomUUID(),
        name: touch.label,
        type: touch.channel,
        phase: template.name,
        scheduledSendAt: scheduledDate,
        status: "draft",
        versions:
          versions.length > 0
            ? versions
            : [
                {
                  versionId: crypto.randomUUID(),
                  label: "All donors",
                  segmentCriteriaId: "",
                  content: { subject: "", body: "" },
                },
              ],
      };
    });

    setDeliverables(newDeliverables);
    setSuccessMessage(
      `Applied ${template.name} template with ${newDeliverables.length} touches`,
    );
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Update version content
  const handleUpdateVersion = (
    deliverableId: string,
    versionId: string,
    patch: Partial<DemoDeliverableVersion["content"]>,
  ) => {
    setDeliverables((prev) =>
      prev.map((d) =>
        d.deliverableId === deliverableId
          ? {
              ...d,
              versions: d.versions.map((v) =>
                v.versionId === versionId
                  ? {
                      ...v,
                      content: { ...v.content, ...patch },
                    }
                  : v,
              ),
            }
          : d,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-50">
            Journey Builder Demo
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Complete integration example for AI-powered multi-touch journeys
          </p>
        </header>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            ✓ {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            ✗ {errorMessage}
          </div>
        )}

        {/* Step 1: Apply Template */}
        {!journeyType && (
          <div className="mb-6">
            <ApplyJourneyTemplatePanel
              labRun={labRun}
              onApply={handleApplyTemplate}
            />
          </div>
        )}

        {/* Step 2: Journey Editor */}
        {journeyType && journeyTemplate && (
          <div className="grid gap-6 lg:grid-cols-[2fr_1.25fr]">
            {/* Left: Touch editors */}
            <div className="space-y-4">
              {/* Bulk draft button */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {journeyTemplate.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {deliverables.length} touches,{" "}
                    {deliverables.reduce(
                      (acc, d) => acc + d.versions.length,
                      0,
                    )}{" "}
                    versions total
                  </p>
                </div>
                <GenerateJourneyWithAiButton
                  clientId={currentClient?.id || ""}
                  journeyType={journeyType}
                  journeyTemplate={journeyTemplate}
                  labRun={labRun}
                  deliverables={deliverables}
                  segments={segments}
                  onUpdateDeliverables={(ds) => setDeliverables(ds)}
                  onSuccess={(msg) => {
                    setSuccessMessage(msg);
                    setTimeout(() => setSuccessMessage(null), 3000);
                  }}
                  onError={(msg) => {
                    setErrorMessage(msg);
                    setTimeout(() => setErrorMessage(null), 3000);
                  }}
                />
              </div>

              {/* Touch cards */}
              {deliverables.map((deliverable) => {
                const touch = journeyTemplate.touches.find(
                  (t) => t.label === deliverable.name,
                );
                if (!touch) return null;

                return (
                  <div key={deliverable.deliverableId} className="space-y-3">
                    {deliverable.versions.map((version) => {
                      const segment =
                        segments.find(
                          (s) => s.segmentId === version.segmentCriteriaId,
                        ) ?? null;

                      return (
                        <JourneyTouchCard
                          key={version.versionId}
                          clientId={currentClient?.id || ""}
                          journeyType={journeyType}
                          touch={touch}
                          labRun={labRun}
                          segment={segment}
                          version={version}
                          onChange={(patch) =>
                            handleUpdateVersion(
                              deliverable.deliverableId,
                              version.versionId,
                              patch,
                            )
                          }
                          onError={(msg) => {
                            setErrorMessage(msg);
                            setTimeout(() => setErrorMessage(null), 3000);
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Right: Journey overview */}
            <JourneyOverviewSidebar
              journeyTemplate={journeyTemplate}
              labRun={labRun}
              deliverables={deliverables}
              segments={segments}
            />
          </div>
        )}

        {/* Debug info */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <summary className="cursor-pointer text-xs font-medium text-slate-400">
              Debug State
            </summary>
            <pre className="mt-2 overflow-auto text-[10px] text-slate-500">
              {JSON.stringify(
                {
                  journeyType,
                  deliverablesCount: deliverables.length,
                  segmentsCount: segments.length,
                  hasLabRun: !!labRun,
                  deliverables: deliverables.map((d) => ({
                    name: d.name,
                    type: d.type,
                    versionsCount: d.versions.length,
                    hasDraftedContent: d.versions.some(
                      (v) => v.content.body.length > 0,
                    ),
                  })),
                },
                null,
                2,
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * Helper: Pick relevant segments for a journey type
 */
function pickSegmentsForJourney(
  type: JourneyType,
  segments: DemoBehavioralSegment[],
): DemoBehavioralSegment[] {
  const labRuleIncludes = (seg: DemoBehavioralSegment, needle: string) =>
    typeof (seg.criteria as any)?.labRule === "string" &&
    (seg.criteria as any).labRule.includes(needle);

  if (type === "upgrade") {
    return segments.filter(
      (seg) =>
        labRuleIncludes(seg, "upgradeReady") || /upgrade/i.test(seg.name),
    );
  }

  if (type === "monthly") {
    return segments.filter(
      (seg) =>
        labRuleIncludes(seg, "monthlyProspect") || /monthly/i.test(seg.name),
    );
  }

  if (type === "reactivation") {
    return segments.filter(
      (seg) => labRuleIncludes(seg, "lapsed") || /lapsed/i.test(seg.name),
    );
  }

  return [];
}
