/**
 * Campaign Designer Wizard
 *
 * Multi-step UI for generating brand-aware fundraising campaigns
 * Generates direct mail, email sequences, and social posts with AI
 */

import { Wand2, Download, RefreshCw } from "lucide-react";
import React from "react";

import { GeneratedOutputViewer } from "@/components/campaign/GeneratedOutputViewer";
import { useClient } from "@/context/ClientContext";
import { useBrandProfile } from "@/hooks/useBrandProfile";
import { useCampaignDesigner } from "@/hooks/useCampaignDesigner";
// import { usePostalAssumptions } from '@/hooks/usePostalAssumptions' // TODO: Implement postal assumptions

// Stub hook until postal assumptions are implemented
const usePostalAssumptions = (_params: any) => ({
  estimateTotal: (_format?: string, _mailClass?: string, _qty?: number) => ({
    total: 0,
    savings: 0,
  }),
  formats: ["Postcard", "Letter"],
  classes: ["First Class", "Marketing Mail"],
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CampaignDesignerWizard() {
  const { currentClient } = useClient();
  const clientId = currentClient?.id;

  const { profile } = useBrandProfile(clientId || "");
  const brandId = profile?.id;

  const {
    params,
    update,
    canGenerate,
    loading,
    error,
    result,
    run,
    exportMd,
    reset,
  } = useCampaignDesigner({
    client_id: clientId,
    brand_id: brandId,
    channels: { direct_mail: true, email: true, social: true },
  });

  const { estimateTotal, formats, classes } = usePostalAssumptions({
    nonprofitEligible: true,
  });

  if (!clientId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>No client selected</p>
      </div>
    );
  }

  if (!brandId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg">No brand profile found</p>
          <p className="text-sm mt-2">Please create a brand profile first</p>
        </div>
      </div>
    );
  }

  const qty = params.mail?.quantity ?? 5000;
  const format = (params.mail?.format ?? "letter") as any;
  const mailClass = (params.mail?.mailClass ?? "nonprofit") as any;
  const postage = estimateTotal(String(qty), format, mailClass);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Campaign Designer
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Brand-aware generation of direct mail, email series, and social posts
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Step 1: Basics */}
        <section className="rounded-xl border border-gray-300 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            1. Basics
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Campaign Name"
              value={params.name || ""}
              onChange={(e) => update({ name: e.target.value })}
            />
            <select
              className="rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={params.type || "Appeal"}
              onChange={(e) => update({ type: e.target.value as any })}
            >
              {["Appeal", "Event", "Program", "Endowment", "Capital"].map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ),
              )}
            </select>
            <select
              className="rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={params.season || "Year-End"}
              onChange={(e) => update({ season: e.target.value as any })}
            >
              {["Spring", "Summer", "Fall", "Year-End"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={params.tone || "Inspiring"}
              onChange={(e) => update({ tone: e.target.value as any })}
            >
              {["Urgent", "Inspiring", "Reflective", "Grateful"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 md:col-span-2 text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Audience (e.g., Loyal donors, Volunteers, Year-end segment)"
              value={params.audience || ""}
              onChange={(e) => update({ audience: e.target.value })}
            />
            <input
              className="rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 md:col-span-2 text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Goal (short statement)"
              value={params.goal || ""}
              onChange={(e) => update({ goal: e.target.value })}
            />
          </div>
        </section>

        {/* Step 2: Channels */}
        <section className="rounded-xl border border-gray-300 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            2. Channels
          </h2>
          <div className="flex gap-6 flex-wrap">
            {(["direct_mail", "email", "social"] as const).map((ch) => (
              <label
                key={ch}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={Boolean((params.channels as any)?.[ch])}
                  onChange={(e) =>
                    update({
                      channels: {
                        ...(params.channels || {
                          direct_mail: true,
                          email: true,
                          social: true,
                        }),
                        [ch]: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="capitalize">{ch.replace("_", " ")}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Duration (weeks)
            </label>
            <input
              type="number"
              min={3}
              max={12}
              className="w-24 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={params.durationWeeks || 4}
              onChange={(e) =>
                update({
                  durationWeeks: Math.max(
                    3,
                    Math.min(12, parseInt(e.target.value, 10) || 4),
                  ),
                })
              }
            />
          </div>
        </section>

        {/* Step 3: Direct Mail Options */}
        {params.channels?.direct_mail && (
          <section className="rounded-xl border border-gray-300 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              3. Direct Mail Options
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <select
                className="rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={mailClass}
                onChange={(e) =>
                  update({
                    mail: {
                      ...(params.mail || {}),
                      mailClass: e.target.value as any,
                      format,
                      quantity: qty,
                    },
                  })
                }
              >
                {classes.map((c: string) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={format}
                onChange={(e) =>
                  update({
                    mail: {
                      ...(params.mail || {}),
                      mailClass,
                      format: e.target.value as any,
                      quantity: qty,
                    },
                  })
                }
              >
                {formats.map((f: string) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Quantity"
                value={qty}
                onChange={(e) =>
                  update({
                    mail: {
                      ...(params.mail || {}),
                      mailClass,
                      format,
                      quantity: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
              />
              <div className="text-sm text-gray-700 dark:text-gray-300 self-center">
                Postage:{" "}
                <span className="font-semibold">
                  $
                  {postage.total.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
                {postage.savings && (
                  <span className="text-green-600 dark:text-green-400 ml-2">
                    (Save ${postage.savings.toFixed(2)})
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Step 4: Generate */}
        <section className="rounded-xl border border-gray-300 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            4. Generate
          </h2>
          {!canGenerate && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Fill in the basics, audience, goal, tone, and select at least one
              channel.
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={run}
              disabled={!canGenerate || loading}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 border transition-all ${
                !canGenerate || loading
                  ? "opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500"
                  : "border-blue-500 bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Wand2 className="w-4 h-4" />
              {loading ? "Generating…" : "Generate Campaign"}
            </button>
            {result && (
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <RefreshCw className="w-4 h-4" />
                Start New
              </button>
            )}
          </div>
        </section>

        {/* Step 5: Results */}
        {result && (
          <section className="rounded-xl border border-gray-300 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                5. Results
              </h2>
              <button
                onClick={exportMd}
                className="flex items-center gap-2 rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Download className="w-4 h-4" />
                Export Markdown
              </button>
            </div>
            {result.postage && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Postage estimate: {result.postage.quantity} × $
                {result.postage.unit.toFixed(3)} →{" "}
                <strong>${result.postage.total.toFixed(2)}</strong> (
                {result.postage.mailClass})
                {result.postage.savings && (
                  <span className="text-green-600 dark:text-green-400 ml-2">
                    (Save ${result.postage.savings.toFixed(2)})
                  </span>
                )}
              </p>
            )}
            <GeneratedOutputViewer outputs={result.outputs} />
          </section>
        )}
      </div>
    </div>
  );
}
