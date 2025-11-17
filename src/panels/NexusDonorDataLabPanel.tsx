import React, { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { LabRecommendationsPanel } from "@/components/donorDataLab/LabRecommendationsPanel";
import { useNotifications } from "@/context/notifications/NotificationsContext";
import {
  runDonorDataLab,
  DonorRawRow,
  AnalysisResult,
  LabRecommendations,
  ColumnMapping,
} from "@/services/donorDataLab";
import {
  exportSuggestedSegmentCsv,
  exportUpgradeReadyCsv,
  exportMonthlyProspectsCsv,
  exportLookalikeSeedCsv,
} from "@/services/donorDataLabExport";
import { saveLabRun } from "@/services/donorDataLabPersistence";
import { promoteSuggestedSegmentToNexusSegment } from "@/services/donorDataLabSegmentPromotion";

type LabStep = "upload" | "mapping" | "results";

interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

export function NexusDonorDataLabPanel() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState<LabStep>("upload");

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);

  const [mapping, setMapping] = useState<ColumnMapping>({
    donorId: "",
  });

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [recommendations, setRecommendations] =
    useState<LabRecommendations | null>(null);
  const [analysisDate, setAnalysisDate] = useState<Date | null>(null);
  const [rowsProcessed, setRowsProcessed] = useState<number>(0);
  const [rowsIgnored, setRowsIgnored] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "upgrade" | "monthly" | "at-risk"
  >("all");
  const [createdSegmentIds, setCreatedSegmentIds] = useState<string[]>([]);

  const showError = useCallback(
    (message: string) => {
      addNotification({
        id: Date.now().toString(),
        message,
        read: false,
      });
    },
    [addNotification],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setLoading(true);

      try {
        const parsed = await parseCsvFile(file);
        if (!parsed.headers.length || !parsed.rows.length) {
          throw new Error("No data found in file");
        }
        setParsedCsv(parsed);
        // auto-guess donorId if possible
        const guessIdHeader =
          parsed.headers.find((h) =>
            ["id", "donor_id", "supporter_id", "anon_id"].includes(
              h.toLowerCase(),
            ),
          ) ?? parsed.headers[0];

        setMapping((prev) => ({ ...prev, donorId: guessIdHeader }));
        setStep("mapping");
      } catch (err) {
        console.error(err);
        showError(
          "Unable to parse CSV file. Please check the format and try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setMapping((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleRunAnalysis = async () => {
    if (!parsedCsv) return;
    if (!mapping.donorId) {
      showError("Please map a donor ID column before running analysis.");
      return;
    }

    setLoading(true);
    try {
      const donorRows: DonorRawRow[] = parsedCsv.rows.map((row) => ({
        donorId: row[mapping.donorId!],
        mostRecentGift: readNumber(row, mapping.mostRecentGift),
        lifetimeGiving: readNumber(row, mapping.lifetimeGiving),
        avgGift: readNumber(row, mapping.avgGift),
        giftCount: readNumber(row, mapping.giftCount),
        lastGiftDate: readString(row, mapping.lastGiftDate),
        firstGiftDate: readString(row, mapping.firstGiftDate),
      }));

      // Track valid vs ignored rows
      const validRows = donorRows.filter(
        (row) => row.donorId && row.donorId.trim(),
      );
      const ignoredCount = donorRows.length - validRows.length;

      const { analysis, recommendations } = runDonorDataLab(validRows);
      setAnalysis(analysis);
      setRecommendations(recommendations);
      setAnalysisDate(new Date());
      setRowsProcessed(validRows.length);
      setRowsIgnored(ignoredCount);

      // Save the Lab run for history and AI context enrichment
      if (clientId && fileName) {
        saveLabRun({
          clientId,
          fileName,
          rowsProcessed: validRows.length,
          rowsIgnored: ignoredCount,
          analysis,
          recommendations,
        });
      }

      setStep("results");
    } catch (err) {
      console.error(err);
      showError(
        "Failed to analyze donor data. Please check mappings and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setFileName(null);
    setParsedCsv(null);
    setAnalysis(null);
    setRecommendations(null);
    setAnalysisDate(null);
    setRowsProcessed(0);
    setRowsIgnored(0);
    setActiveFilter("all");
    setMapping({ donorId: "" });
  };

  const handleExportUpgradeReady = () => {
    if (!analysis) return;
    try {
      exportUpgradeReadyCsv(analysis);
      const count = analysis.donors.filter((d) => d.upgradeReady).length;
      addNotification({
        id: Date.now().toString(),
        message: `Exported ${count} upgrade-ready donors`,
        read: false,
      });
    } catch (err) {
      console.error("Export failed:", err);
      showError("Failed to export upgrade-ready donors.");
    }
  };

  const handleExportMonthlyProspects = () => {
    if (!analysis) return;
    try {
      exportMonthlyProspectsCsv(analysis);
      const count = analysis.donors.filter((d) => d.monthlyProspect).length;
      addNotification({
        id: Date.now().toString(),
        message: `Exported ${count} monthly prospect donors`,
        read: false,
      });
    } catch (err) {
      console.error("Export failed:", err);
      showError("Failed to export monthly prospects.");
    }
  };

  const handleExportLookalikeCore = () => {
    if (!analysis) return;
    try {
      exportLookalikeSeedCsv(analysis, "core_high_value_seed");
      const count = analysis.donors.filter((d) =>
        d.lookalikeCohorts.includes("core_high_value_seed"),
      ).length;
      addNotification({
        id: Date.now().toString(),
        message: `Exported ${count} core high-value seed donors`,
        read: false,
      });
    } catch (err) {
      console.error("Export failed:", err);
      showError("Failed to export lookalike seeds.");
    }
  };

  const handleExportLookalikeMonthly = () => {
    if (!analysis) return;
    try {
      exportLookalikeSeedCsv(analysis, "monthly_lookalike_seed");
      const count = analysis.donors.filter((d) =>
        d.lookalikeCohorts.includes("monthly_lookalike_seed"),
      ).length;
      addNotification({
        id: Date.now().toString(),
        message: `Exported ${count} monthly lookalike seed donors`,
        read: false,
      });
    } catch (err) {
      console.error("Export failed:", err);
      showError("Failed to export monthly lookalike seeds.");
    }
  };

  const handleExportSuggestedSegment = (segmentId: string) => {
    if (!analysis) return;
    try {
      exportSuggestedSegmentCsv(analysis, segmentId);
      const seg = analysis.suggestedSegments.find((s) => s.id === segmentId);
      const count = seg ? analysis.donors.filter(seg.filter).length : 0;
      addNotification({
        id: Date.now().toString(),
        message: `Exported ${count} donors from "${seg?.name}"`,
        read: false,
      });
    } catch (err) {
      console.error("Export failed:", err);
      showError("Failed to export segment.");
    }
  };

  const handleCreateSegment = async (
    segmentId: string,
    segmentName: string,
  ) => {
    if (!clientId || !analysis) return;

    try {
      const created = await promoteSuggestedSegmentToNexusSegment({
        clientId,
        analysis,
        suggestedSegmentId: segmentId,
      });

      // Track created segments for campaign integration
      setCreatedSegmentIds((prev) => [...prev, created.segmentId]);

      addNotification({
        id: Date.now().toString(),
        message: `Segment "${created.name}" created successfully! View it in the Segmentation tab.`,
        read: false,
      });
    } catch (err) {
      console.error("Failed to create segment:", err);
      addNotification({
        id: Date.now().toString(),
        message: `Failed to create segment "${segmentName}". Please try again.`,
        read: false,
      });
    }
  };

  const handleStartCampaign = () => {
    if (!clientId) return;

    // Navigate to campaign builder with pre-selected segments
    const segmentParams =
      createdSegmentIds.length > 0
        ? `?segments=${createdSegmentIds.join(",")}`
        : "";

    void navigate(`/clients/${clientId}/campaigns/new${segmentParams}`);
  };

  return (
    <div className="h-full overflow-auto bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-slate-50">
              The Nexus Donor Data Lab
            </h1>
            <p className="text-xs text-slate-400">
              Upload anonymized giving data. Get upgrade, monthly, reactivation,
              and acquisition strategy in minutes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <StepPill active={step === "upload"} label="Upload" />
            <span className="opacity-50">→</span>
            <StepPill active={step === "mapping"} label="Map columns" />
            <span className="opacity-50">→</span>
            <StepPill active={step === "results"} label="Results" />
          </div>
        </header>

        {/* Main content */}
        {step === "upload" && (
          <UploadStep
            loading={loading}
            fileName={fileName}
            onFileChange={handleFileChange}
          />
        )}

        {step === "mapping" && parsedCsv && (
          <MappingStep
            headers={parsedCsv.headers}
            mapping={mapping}
            loading={loading}
            onChange={handleMappingChange}
            onBack={() => setStep("upload")}
            onNext={handleRunAnalysis}
          />
        )}

        {step === "results" && analysis && recommendations && (
          <ResultsStep
            fileName={fileName}
            analysis={analysis}
            recommendations={recommendations}
            analysisDate={analysisDate}
            rowsProcessed={rowsProcessed}
            rowsIgnored={rowsIgnored}
            activeFilter={activeFilter}
            createdSegmentIds={createdSegmentIds}
            onFilterChange={setActiveFilter}
            onReset={handleReset}
            onExportUpgradeReady={handleExportUpgradeReady}
            onExportMonthlyProspects={handleExportMonthlyProspects}
            onExportLookalikeCore={handleExportLookalikeCore}
            onExportLookalikeMonthly={handleExportLookalikeMonthly}
            onExportSuggestedSegment={handleExportSuggestedSegment}
            onCreateSegment={handleCreateSegment}
            onStartCampaign={handleStartCampaign}
          />
        )}
      </div>
    </div>
  );
}

/**
 * STEP 1 — UPLOAD
 */
function UploadStep({
  loading,
  fileName,
  onFileChange,
}: {
  loading: boolean;
  fileName: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-xs text-slate-300">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-300">
        📊
      </div>
      <h2 className="mb-1 text-sm font-semibold text-slate-50">
        Drop in a donor file to get started
      </h2>
      <p className="mb-4 text-slate-400">
        Upload an anonymized CSV export with one row per donor. Include an ID
        column and any giving fields you have (recent gift, lifetime giving,
        dates, counts). No names or emails required.
      </p>

      <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-600 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800">
        {loading
          ? "Processing…"
          : fileName
            ? "Choose a different file"
            : "Select CSV file"}
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onFileChange}
          disabled={loading}
        />
      </label>

      {fileName && !loading && (
        <p className="mt-3 text-[11px] text-slate-400">Selected: {fileName}</p>
      )}

      <p className="mt-6 text-[11px] text-slate-500">
        Tip: Export just the fields you need: anonymous donor ID, gift dates,
        gift amounts, counts. Nexus will do the rest.
      </p>
    </section>
  );
}

/**
 * STEP 2 — COLUMN MAPPING
 */
function MappingStep({
  headers,
  mapping,
  loading,
  onChange,
  onBack,
  onNext,
}: {
  headers: string[];
  mapping: ColumnMapping;
  loading: boolean;
  onChange: (field: keyof ColumnMapping, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const requiredError = !mapping.donorId;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6 text-xs text-slate-200">
        <h2 className="mb-1 text-sm font-semibold text-slate-50">
          Map your columns
        </h2>
        <p className="mb-4 text-slate-400">
          Tell Nexus which columns represent donor IDs and giving metrics.
          Fields you don't have can be left as "Not available".
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <MappingSelect
            label="Donor ID"
            required
            value={mapping.donorId}
            headers={headers}
            onChange={(value) => onChange("donorId", value)}
          />
          <MappingSelect
            label="Most recent gift amount"
            value={mapping.mostRecentGift ?? ""}
            headers={headers}
            onChange={(value) => onChange("mostRecentGift", value)}
          />
          <MappingSelect
            label="Lifetime giving"
            value={mapping.lifetimeGiving ?? ""}
            headers={headers}
            onChange={(value) => onChange("lifetimeGiving", value)}
          />
          <MappingSelect
            label="Average gift amount"
            value={mapping.avgGift ?? ""}
            headers={headers}
            onChange={(value) => onChange("avgGift", value)}
          />
          <MappingSelect
            label="Gift count"
            value={mapping.giftCount ?? ""}
            headers={headers}
            onChange={(value) => onChange("giftCount", value)}
          />
          <MappingSelect
            label="Last gift date"
            value={mapping.lastGiftDate ?? ""}
            headers={headers}
            onChange={(value) => onChange("lastGiftDate", value)}
          />
          <MappingSelect
            label="First gift date"
            value={mapping.firstGiftDate ?? ""}
            headers={headers}
            onChange={(value) => onChange("firstGiftDate", value)}
          />
        </div>

        {requiredError && (
          <p className="mt-3 text-[11px] text-red-400">
            Donor ID is required. Please choose a column.
          </p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            className="rounded-md border border-slate-600 px-3 py-1.5 text-[11px] text-slate-200 hover:bg-slate-800"
            onClick={onBack}
            disabled={loading}
          >
            Back
          </button>

          <button
            type="button"
            className="rounded-md bg-sky-600 px-4 py-1.5 text-[11px] font-medium text-white disabled:opacity-60"
            onClick={onNext}
            disabled={loading || requiredError}
          >
            {loading ? "Analyzing…" : "Run analysis"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-[11px] text-slate-400">
        <p className="mb-1 font-medium text-slate-200">Privacy note</p>
        <p>
          The Data Lab works entirely on anonymized IDs and behavioral fields.
          Do not include names, emails, addresses, or other personal identifiers
          in your export.
        </p>
      </div>
    </section>
  );
}

function MappingSelect({
  label,
  required,
  value,
  headers,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  headers: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <select
        className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Not available</option>
        {headers.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * STEP 3 — RESULTS
 */
function ResultsStep({
  fileName,
  analysis,
  recommendations,
  analysisDate,
  rowsProcessed,
  rowsIgnored,
  activeFilter,
  onFilterChange,
  onReset,
  onExportUpgradeReady,
  onExportMonthlyProspects,
  onExportLookalikeCore,
  onExportLookalikeMonthly,
  onExportSuggestedSegment,
  onCreateSegment,
  createdSegmentIds,
  onStartCampaign,
}: {
  fileName: string | null;
  analysis: AnalysisResult;
  recommendations: LabRecommendations;
  analysisDate: Date | null;
  rowsProcessed: number;
  rowsIgnored: number;
  activeFilter: "all" | "upgrade" | "monthly" | "at-risk";
  onFilterChange: (filter: "all" | "upgrade" | "monthly" | "at-risk") => void;
  onReset: () => void;
  onExportUpgradeReady: () => void;
  onExportMonthlyProspects: () => void;
  onExportLookalikeCore: () => void;
  onExportLookalikeMonthly: () => void;
  onExportSuggestedSegment: (segmentId: string) => void;
  onCreateSegment: (segmentId: string, segmentName: string) => void;
  createdSegmentIds: string[];
  onStartCampaign: () => void;
}) {
  const { donors, stats, suggestedSegments } = analysis;

  // Apply active filter to donors
  const filteredDonors = donors.filter((d) => {
    switch (activeFilter) {
      case "upgrade":
        return d.upgradeReady;
      case "monthly":
        return d.monthlyProspect;
      case "at-risk":
        return (
          (d.valueTier === "large" || d.valueTier === "major") &&
          (d.recencyTier === "at_risk" || d.recencyTier === "lapsed")
        );
      default:
        return true;
    }
  });

  return (
    <section className="space-y-6">
      {/* Header with metadata */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="text-xs text-slate-300">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Analysis complete
          </p>
          <p>
            {rowsProcessed.toLocaleString()} donors analyzed
            {fileName ? ` from ${fileName}` : ""}
          </p>
          {analysisDate && (
            <p className="mt-0.5 text-[11px] text-slate-500">
              Run at {analysisDate.toLocaleTimeString()} on{" "}
              {analysisDate.toLocaleDateString()}
            </p>
          )}
          {rowsIgnored > 0 && (
            <p className="mt-0.5 text-[11px] text-amber-400">
              {rowsIgnored} row{rowsIgnored !== 1 ? "s" : ""} ignored (missing
              donor ID)
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {createdSegmentIds.length > 0 && (
            <button
              type="button"
              className="rounded-md bg-sky-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-sky-500"
              onClick={onStartCampaign}
            >
              Start Campaign ({createdSegmentIds.length} segment
              {createdSegmentIds.length !== 1 ? "s" : ""})
            </button>
          )}
          <button
            type="button"
            className="rounded-md border border-slate-600 px-3 py-1.5 text-[11px] text-slate-200 hover:bg-slate-800"
            onClick={onReset}
          >
            Start a new analysis
          </button>
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Quick exports:
        </span>
        <button
          type="button"
          className="rounded-md bg-emerald-900/70 px-3 py-1.5 text-[11px] font-medium text-emerald-200 hover:bg-emerald-900"
          onClick={onExportUpgradeReady}
        >
          Upgrade-ready ({donors.filter((d) => d.upgradeReady).length})
        </button>
        <button
          type="button"
          className="rounded-md bg-sky-900/70 px-3 py-1.5 text-[11px] font-medium text-sky-200 hover:bg-sky-900"
          onClick={onExportMonthlyProspects}
        >
          Monthly prospects ({donors.filter((d) => d.monthlyProspect).length})
        </button>
        <button
          type="button"
          className="rounded-md bg-purple-900/70 px-3 py-1.5 text-[11px] font-medium text-purple-200 hover:bg-purple-900"
          onClick={onExportLookalikeCore}
        >
          Core high-value (
          {
            donors.filter((d) =>
              d.lookalikeCohorts.includes("core_high_value_seed"),
            ).length
          }
          )
        </button>
        <button
          type="button"
          className="rounded-md bg-purple-900/70 px-3 py-1.5 text-[11px] font-medium text-purple-200 hover:bg-purple-900"
          onClick={onExportLookalikeMonthly}
        >
          Monthly seed (
          {
            donors.filter((d) =>
              d.lookalikeCohorts.includes("monthly_lookalike_seed"),
            ).length
          }
          )
        </button>
      </div>

      {/* Summary tiles */}
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryTile
          label="Donors analyzed"
          value={donors.length.toLocaleString()}
        />
        <SummaryTile
          label="Suggested segments"
          value={suggestedSegments.length.toString()}
        />
        <SummaryTile
          label="Median lifetime giving"
          value={
            stats.giftPercentiles.p50
              ? `$${Math.round(stats.giftPercentiles.p50).toLocaleString()}`
              : "—"
          }
        />
        <SummaryTile
          label="Median gift count"
          value={
            stats.giftCountPercentiles.p50
              ? Math.round(stats.giftCountPercentiles.p50).toString()
              : "—"
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
        {/* Donor table + segment summary */}
        <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-xs text-slate-200">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-50">
              Donor tiers & flags
            </h3>
            <p className="text-[11px] text-slate-400">
              Showing {Math.min(filteredDonors.length, 200)} of{" "}
              {filteredDonors.length.toLocaleString()} donors
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500">Filter:</span>
            <FilterPill
              label="All donors"
              count={donors.length}
              active={activeFilter === "all"}
              onClick={() => onFilterChange("all")}
            />
            <FilterPill
              label="Upgrade-ready"
              count={donors.filter((d) => d.upgradeReady).length}
              active={activeFilter === "upgrade"}
              onClick={() => onFilterChange("upgrade")}
              color="emerald"
            />
            <FilterPill
              label="Monthly prospects"
              count={donors.filter((d) => d.monthlyProspect).length}
              active={activeFilter === "monthly"}
              onClick={() => onFilterChange("monthly")}
              color="sky"
            />
            <FilterPill
              label="High-value at risk"
              count={
                donors.filter(
                  (d) =>
                    (d.valueTier === "large" || d.valueTier === "major") &&
                    (d.recencyTier === "at_risk" || d.recencyTier === "lapsed"),
                ).length
              }
              active={activeFilter === "at-risk"}
              onClick={() => onFilterChange("at-risk")}
              color="amber"
            />
          </div>

          <div className="max-h-[320px] overflow-auto rounded-lg border border-slate-800">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-950/70 text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">Donor ID</th>
                  <th className="px-3 py-2 text-left">Value</th>
                  <th className="px-3 py-2 text-left">Recency</th>
                  <th className="px-3 py-2 text-right">MRG</th>
                  <th className="px-3 py-2 text-right">Gifts</th>
                  <th className="px-3 py-2 text-center">Upgrade?</th>
                  <th className="px-3 py-2 text-center">Monthly?</th>
                  <th className="px-3 py-2 text-right">Ask ladder</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.slice(0, 200).map((row) => (
                  <tr
                    key={row.donorId}
                    className="border-t border-slate-800/60"
                  >
                    <td className="px-3 py-1.5 text-slate-300">
                      {row.donorId}
                    </td>
                    <td className="px-3 py-1.5 capitalize text-slate-100">
                      {row.valueTier}
                    </td>
                    <td className="px-3 py-1.5 text-slate-200">
                      {formatRecency(row.recencyTier, row.daysSinceLastGift)}
                    </td>
                    <td className="px-3 py-1.5 text-right text-slate-200">
                      {row.mostRecentGift
                        ? `$${Math.round(row.mostRecentGift).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-3 py-1.5 text-right text-slate-200">
                      {row.giftCount ?? "—"}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {row.upgradeReady && (
                        <span className="inline-flex rounded-full bg-emerald-900/70 px-2 py-0.5 text-[10px] text-emerald-200">
                          Upgrade
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {row.monthlyProspect && (
                        <span className="inline-flex rounded-full bg-sky-900/70 px-2 py-0.5 text-[10px] text-sky-200">
                          Monthly
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-right text-slate-300">
                      {row.askLadder.map((a) => `$${a}`).join(" • ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Suggested segments
            </h4>
            <div className="space-y-3">
              {suggestedSegments.map((seg) => {
                const count = analysis.donors.filter(seg.filter).length;
                const pct = Math.round(
                  (count / analysis.donors.length || 0) * 100,
                );
                return (
                  <div
                    key={seg.id}
                    className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3"
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-slate-100">
                          {seg.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {count.toLocaleString()} donors ({pct}%)
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-md border border-slate-600 px-2 py-1 text-[10px] text-slate-200 hover:bg-slate-800"
                          onClick={() => onExportSuggestedSegment(seg.id)}
                        >
                          Export CSV
                        </button>
                        <button
                          type="button"
                          className="rounded-md bg-sky-600/80 px-2 py-1 text-[10px] font-medium text-white hover:bg-sky-600"
                          onClick={() => onCreateSegment(seg.id, seg.name)}
                        >
                          Create segment
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {seg.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Strategy recommendations */}
        <LabRecommendationsPanel recs={recommendations} />
      </div>

      {/* How we classified explainer */}
      <details className="group rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-xs">
        <summary className="cursor-pointer text-sm font-semibold text-slate-100 marker:text-slate-500">
          How we classified this file
        </summary>
        <div className="mt-3 space-y-3 text-slate-300">
          <div>
            <h5 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Value Tiers
            </h5>
            <p className="text-[11px] leading-relaxed">
              Donors are classified into <strong>Small</strong>,{" "}
              <strong>Medium</strong>, <strong>Large</strong>, and{" "}
              <strong>Major</strong> tiers based on lifetime giving percentiles
              from your file. Small = below 25th percentile, Medium = 25th–75th,
              Large = 75th–90th, Major = above 90th percentile.
            </p>
          </div>
          <div>
            <h5 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Recency Tiers
            </h5>
            <p className="text-[11px] leading-relaxed">
              <strong>Recent</strong> = last gift within 90 days.{" "}
              <strong>At-risk</strong> = 91–365 days. <strong>Lapsed</strong> =
              366–730 days (1–2 years). <strong>Long-lapsed</strong> = over 730
              days.
            </p>
          </div>
          <div>
            <h5 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Upgrade-Ready Flag
            </h5>
            <p className="text-[11px] leading-relaxed">
              Donors marked upgrade-ready have: value tier of Medium or Large,
              recency of Recent or At-risk, 3+ gifts, and their most recent gift
              is ≥90% of their average gift (showing consistent or growing
              pattern).
            </p>
          </div>
          <div>
            <h5 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Monthly Prospect Flag
            </h5>
            <p className="text-[11px] leading-relaxed">
              Donors marked as monthly prospects have: 4+ gifts, recency of
              Recent or At-risk, and average gift size in the 25th–75th
              percentile range (not too small, not too large).
            </p>
          </div>
          <div>
            <h5 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Ask Ladders
            </h5>
            <p className="text-[11px] leading-relaxed">
              Ask ladders are calculated at 100%, 125%, 150%, and 200% of the
              donor's most recent gift, with smart rounding (nearest $5 for
              gifts under $200, nearest $10 for $200–$1000, nearest $50 for over
              $1000). Donors with no recent gift receive a starter ladder of
              $25, $50, $100.
            </p>
          </div>
        </div>
      </details>
    </section>
  );
}

/**
 * SMALL UI HELPERS
 */

function StepPill({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={`rounded-full px-2.5 py-1 text-[11px] ${
        active
          ? "bg-sky-600/80 text-white"
          : "border border-slate-600 bg-slate-800 text-slate-300"
      }`}
    >
      {label}
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
  color = "slate",
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color?: "slate" | "emerald" | "sky" | "amber";
}) {
  const colorClasses = {
    slate: active
      ? "bg-slate-600 text-white"
      : "border border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-800",
    emerald: active
      ? "bg-emerald-600 text-white"
      : "border border-emerald-700/50 bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50",
    sky: active
      ? "bg-sky-600 text-white"
      : "border border-sky-700/50 bg-sky-900/30 text-sky-300 hover:bg-sky-900/50",
    amber: active
      ? "bg-amber-600 text-white"
      : "border border-amber-700/50 bg-amber-900/30 text-amber-300 hover:bg-amber-900/50",
  };

  return (
    <button
      type="button"
      className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${colorClasses[color]}`}
      onClick={onClick}
    >
      {label} ({count.toLocaleString()})
    </button>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-50">{value}</p>
    </div>
  );
}

function formatRecency(
  tier: AnalysisResult["donors"][number]["recencyTier"],
  days?: number,
) {
  const base = tier.replace("_", " ");
  if (!days && days !== 0) return base;
  return `${base} (${days} days)`;
}

/**
 * CSV parsing helpers
 * (For production you may want PapaParse or a more robust parser)
 */

async function parseCsvFile(file: File): Promise<ParsedCsv> {
  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = splitCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? "";
    });
    rows.push(row);
  }

  return { headers, rows };
}

function splitCsvLine(line: string): string[] {
  // Very simple CSV splitter: for more complex data, use a real CSV parser.
  return line.split(",").map((c) => c.trim());
}

function readNumber(
  row: Record<string, string>,
  col?: string,
): number | undefined {
  if (!col) return undefined;
  const raw = row[col];
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : undefined;
}

function readString(
  row: Record<string, string>,
  col?: string,
): string | undefined {
  if (!col) return undefined;
  const raw = row[col];
  return raw || undefined;
}
