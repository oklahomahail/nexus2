/**
 * Donor Intelligence Panel
 *
 * AI-powered analysis of anonymized donor data
 * Supports natural language queries with privacy enforcement (N ≥ 50)
 */

import {
  BarChart,
  Activity,
  TrendingUp,
  Clock,
  Calendar,
  Download,
} from "lucide-react";
import { useState } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import { PageHeading } from "@/components/ui-kit/PageHeading";
import { SectionBlock } from "@/components/ui-kit/SectionBlock";
import { useClient } from "@/context/ClientContext";
import {
  useRetainedDonors,
  useYoyUpgrade,
  useGiftVelocity,
  useSeasonality,
} from "@/hooks/useDonorIntelligence";
import { useToast } from "@/hooks/useToast";
import {
  type SeasonalityResult,
  formatCurrency,
  formatPercent,
  summarizeRetention,
  summarizeVelocity,
} from "@/services/donorIntelService";
import {
  downloadCsv,
  exportRetentionData,
  exportUpgradeData,
  exportGiftVelocityData,
  exportSeasonalityData,
} from "@/utils/export";

// ============================================================================
// TYPES
// ============================================================================

type MetricView = "retention" | "upgrade" | "velocity" | "seasonality" | null;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DonorIntelligencePanel() {
  const { currentClient } = useClient();
  const clientId = currentClient?.id;

  const [activeView, setActiveView] = useState<MetricView>(null);

  // Metric-specific state
  const [retentionYears, setRetentionYears] = useState(5);
  const [upgradeYearFrom, setUpgradeYearFrom] = useState(2023);
  const [upgradeYearTo, setUpgradeYearTo] = useState(2024);
  const [seasonalityYear, setSeasonalityYear] = useState<number | undefined>(
    undefined,
  );

  if (!clientId) {
    return (
      <div className="px-8 py-10 editorial-flow">
        <PageHeading
          title="Donor Intelligence"
          subtitle="AI-powered analysis of anonymized donor behavior"
        />
        <SectionBlock>
          <div className="text-center py-12 text-[var(--nx-text-muted)]">
            <p>No client selected</p>
          </div>
        </SectionBlock>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 editorial-flow">
      {/* Header */}
      <PageHeading
        title="Donor Intelligence"
        subtitle="AI-powered analysis of anonymized donor behavior (privacy-safe, N ≥ 50)"
      />

      {/* Metric Selector */}
      <SectionBlock title="Select Metric">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            icon={Activity}
            label="Retention"
            description="Consecutive giving years"
            active={activeView === "retention"}
            onClick={() => setActiveView("retention")}
          />
          <MetricCard
            icon={TrendingUp}
            label="Upgrade Velocity"
            description="Year-over-year growth"
            active={activeView === "upgrade"}
            onClick={() => setActiveView("upgrade")}
          />
          <MetricCard
            icon={Clock}
            label="Gift Velocity"
            description="Time between gifts"
            active={activeView === "velocity"}
            onClick={() => setActiveView("velocity")}
          />
          <MetricCard
            icon={Calendar}
            label="Seasonality"
            description="Quarterly trends"
            active={activeView === "seasonality"}
            onClick={() => setActiveView("seasonality")}
          />
        </div>
      </SectionBlock>

      {/* Content Area */}
      {activeView === null && (
        <SectionBlock>
          <div className="text-center py-12 text-[var(--nx-text-muted)]">
            <BarChart className="w-16 h-16 mx-auto mb-4" />
            <p className="text-[18px] mb-2">
              Select a metric above to get started
            </p>
            <p className="text-[13px]">
              All queries enforce privacy threshold (minimum 50 donors)
            </p>
          </div>
        </SectionBlock>
      )}

      {activeView === "retention" && (
        <RetentionView
          clientId={clientId}
          numYears={retentionYears}
          onYearsChange={setRetentionYears}
        />
      )}

      {activeView === "upgrade" && (
        <UpgradeView
          clientId={clientId}
          yearFrom={upgradeYearFrom}
          yearTo={upgradeYearTo}
          onYearFromChange={setUpgradeYearFrom}
          onYearToChange={setUpgradeYearTo}
        />
      )}

      {activeView === "velocity" && <VelocityView clientId={clientId} />}

      {activeView === "seasonality" && (
        <SeasonalityView
          clientId={clientId}
          year={seasonalityYear}
          onYearChange={setSeasonalityYear}
        />
      )}
    </div>
  );
}

// ============================================================================
// METRIC CARD
// ============================================================================

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function MetricCard({
  icon: Icon,
  label,
  description,
  active,
  onClick,
}: MetricCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        p-4 rounded-lg border-2 text-left transition-all
        ${
          active
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        }
      `}
    >
      <Icon
        className={`w-6 h-6 mb-2 ${active ? "text-blue-600" : "text-gray-500"}`}
      />
      <div className="font-semibold text-gray-900 dark:text-white">{label}</div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {description}
      </div>
    </button>
  );
}

// ============================================================================
// RETENTION VIEW
// ============================================================================

interface RetentionViewProps {
  clientId: string;
  numYears: number;
  onYearsChange: (years: number) => void;
}

function RetentionView({
  clientId,
  numYears,
  onYearsChange,
}: RetentionViewProps) {
  const { data, isLoading, error, privacyEnforced, fetch } =
    useRetainedDonors(clientId);

  const handleFetch = () => {
    void fetch(numYears);
  };

  const summary = data ? summarizeRetention(data) : null;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Minimum Consecutive Years
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={numYears}
            onChange={(e) => onYearsChange(parseInt(e.target.value) || 1)}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={handleFetch}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Loading..." : "Analyze"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          {privacyEnforced && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Privacy threshold not met. Try broadening your query.
            </p>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {summary && (
        <>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Summary
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => data && downloadCsv("retention_data", data)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() =>
                  data && summary && exportRetentionData(data, summary)
                }
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <Download className="w-4 h-4" />
                Report
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Total Donors"
              value={summary.total_donors.toLocaleString()}
            />
            <StatCard
              label="Avg Consecutive Years"
              value={summary.avg_consecutive_years.toFixed(1)}
            />
            <StatCard
              label="Max Streak"
              value={`${summary.max_consecutive_years} years`}
            />
          </div>
        </>
      )}

      {/* Chart */}
      {data && data.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Donor Retention Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="consecutive_years"
                label={{
                  value: "Consecutive Years",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                label={{
                  value: "Donor Count",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Bar dataKey="donor_count" fill="#3b82f6" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// UPGRADE VIEW
// ============================================================================

interface UpgradeViewProps {
  clientId: string;
  yearFrom: number;
  yearTo: number;
  onYearFromChange: (year: number) => void;
  onYearToChange: (year: number) => void;
}

function UpgradeView({
  clientId,
  yearFrom,
  yearTo,
  onYearFromChange,
  onYearToChange,
}: UpgradeViewProps) {
  const toast = useToast();
  const { data, isLoading, error, fetch } = useYoyUpgrade(clientId);

  const handleFetch = () => {
    if (yearFrom >= yearTo) {
      toast.warning(
        "Invalid Year Range",
        "Year From must be less than Year To",
      );
      return;
    }
    void fetch(yearFrom, yearTo);
  };

  const top10 = data?.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Year From
          </label>
          <input
            type="number"
            min={2000}
            max={2030}
            value={yearFrom}
            onChange={(e) => onYearFromChange(parseInt(e.target.value) || 2023)}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Year To
          </label>
          <input
            type="number"
            min={2000}
            max={2030}
            value={yearTo}
            onChange={(e) => onYearToChange(parseInt(e.target.value) || 2024)}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={handleFetch}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Loading..." : "Analyze"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Top 10 Leaderboard */}
      {top10 && top10.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top 10 Donors by Growth ({yearFrom} → {yearTo})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  data &&
                  downloadCsv(`upgrade_leaderboard_${yearFrom}_${yearTo}`, data)
                }
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() =>
                  data && exportUpgradeData(data, yearFrom, yearTo)
                }
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <Download className="w-4 h-4" />
                Report
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {top10.map((row, idx) => (
              <div
                key={row.anon_id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-gray-500 dark:text-gray-400 w-6">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                      {row.anon_id.slice(0, 16)}...
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(row.amount_from)} →{" "}
                      {formatCurrency(row.amount_to)}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ${
                    row.pct_change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {row.pct_change >= 0 ? "+" : ""}
                  {formatPercent(row.pct_change, 1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VELOCITY VIEW
// ============================================================================

interface VelocityViewProps {
  clientId: string;
}

function VelocityView({ clientId }: VelocityViewProps) {
  const { data, isLoading, error, fetch } = useGiftVelocity(clientId);

  const summary = data ? summarizeVelocity(data) : null;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div>
        <button
          onClick={() => fetch()}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Loading..." : "Analyze Gift Velocity"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      {summary && (
        <>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Summary
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => data && downloadCsv("gift_velocity", data)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() =>
                  data && summary && exportGiftVelocityData(data, summary)
                }
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <Download className="w-4 h-4" />
                Report
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Repeat Donors"
              value={summary.total_repeat_donors.toLocaleString()}
            />
            <StatCard
              label="Avg Days Between Gifts"
              value={`${summary.avg_days_between} days`}
            />
            <StatCard
              label="Median Days Between Gifts"
              value={`${summary.median_days_between} days`}
            />
          </div>
        </>
      )}

      {/* Distribution Chart */}
      {data && data.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Gift Velocity Distribution (Top 50 Donors)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={data.slice(0, 50)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="anon_id" hide />
              <YAxis
                label={{
                  value: "Days Between Gifts",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value.toFixed(0)} days`,
                  "Median Days",
                ]}
                labelFormatter={(label: string) =>
                  `Donor: ${label.slice(0, 16)}...`
                }
              />
              <Bar dataKey="median_days_between" fill="#10b981" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SEASONALITY VIEW
// ============================================================================

interface SeasonalityViewProps {
  clientId: string;
  year?: number;
  onYearChange: (year: number | undefined) => void;
}

function SeasonalityView({
  clientId,
  year,
  onYearChange,
}: SeasonalityViewProps) {
  const { data, isLoading, error, fetch } = useSeasonality(clientId);

  const handleFetch = () => {
    void fetch(year);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Year (optional)
          </label>
          <input
            type="number"
            min={2000}
            max={2030}
            value={year || ""}
            placeholder="All years"
            onChange={(e) =>
              onYearChange(
                e.target.value ? parseInt(e.target.value) : undefined,
              )
            }
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={handleFetch}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Loading..." : "Analyze"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Chart */}
      {data && data.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Seasonal Gift Trends
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  data &&
                  downloadCsv(
                    year ? `seasonality_${year}` : "seasonality_all",
                    data,
                  )
                }
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => data && exportSeasonalityData(data, year)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <Download className="w-4 h-4" />
                Report
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={(row: SeasonalityResult[number]) =>
                  `${row.year} Q${row.quarter}`
                }
                label={{
                  value: "Quarter",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: "Gift Count",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Total Amount ($)",
                  angle: 90,
                  position: "insideRight",
                }}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "gift_count")
                    return [value.toLocaleString(), "Gifts"];
                  return [formatCurrency(value), "Amount"];
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="gift_count"
                stroke="#3b82f6"
                strokeWidth={2}
                name="gift_count"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="total_amount"
                stroke="#10b981"
                strokeWidth={2}
                name="total_amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
        {value}
      </div>
    </div>
  );
}
