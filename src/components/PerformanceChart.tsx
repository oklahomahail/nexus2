// src/components/PerformanceChart.tsx - Recharts implementation with dark theme
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type ComparisonData = {
  currentPeriod: {
    startDate: string;
    endDate: string;
    totalRaised: number;
    donorCount: number;
    campaignCount: number;
  };
  previousPeriod: {
    startDate: string;
    endDate: string;
    totalRaised: number;
    donorCount: number;
    campaignCount: number;
  };
  growthMetrics: {
    raisedChange: number;
    donorsChange: number;
    campaignsChange: number;
  };
};

type CampaignSuccessData = {
  campaignId: string;
  name: string;
  totalRaised: number;
  goalAchievement: number;
  donorCount: number;
  roi: number;
}[];

type ChartType = "comparison" | "success-rate" | "roi" | "trend";

interface PerformanceChartProps {
  title: string;
  type: ChartType;
  data: ComparisonData | CampaignSuccessData;
  className?: string;
  height?: number;
}

// Shared palette to echo your Tailwind brand colors
const palette = {
  blue: "#3B82F6",
  blueLite: "#60A5FA",
  violet: "#8B5CF6",
  violetLite: "#A78BFA",
  emerald: "#10B981",
  emeraldLite: "#34D399",
  green: "#22C55E",
  amber: "#F59E0B",
  slateBorder: "rgba(71, 85, 105, 0.3)",
};

function buildChartData(
  _type: ChartType,
  _raw: ComparisonData | CampaignSuccessData,
): {
  data: Array<Record<string, any>>;
  xKey: string;
  yKeys: string[];
  kind: "bar" | "line";
} {
  if (type === "comparison") {
    const d = raw as ComparisonData;
    // We show growth across three metrics as a single series
    const rows = [
      { metric: "Funds Raised", value: d.growthMetrics.raisedChange },
      { metric: "Donors", value: d.growthMetrics.donorsChange },
      { metric: "Campaigns", value: d.growthMetrics.campaignsChange },
    ];
    return { data: rows, xKey: "metric", yKeys: ["value"], kind: "bar" };
  }

  if (type === "success-rate") {
    const d = raw as CampaignSuccessData;
    const rows = d.map((c) => ({
      name: c.name.length > 15 ? c.name.substring(0, 15) + "..." : c.name,
      "Goal Achievement (%)": c.goalAchievement,
    }));
    return {
      data: rows,
      xKey: "name",
      yKeys: ["Goal Achievement (%)"],
      kind: "bar",
    };
  }

  if (type === "roi") {
    const d = raw as CampaignSuccessData;
    const rows = d.map((c) => ({
      name: c.name.length > 15 ? c.name.substring(0, 15) + "..." : c.name,
      "ROI (%)": c.roi,
    }));
    return { data: rows, xKey: "name", yKeys: ["ROI (%)"], kind: "bar" };
  }

  // trend
  // If you later supply time series, map to [{ period, valueA, valueB, ... }]
  // For now, render an empty safe structure.
  return { data: [], xKey: "period", yKeys: ["value"], kind: "line" };
}

const CustomTooltip = ({ active, _payload, _label, chartType }: any) => {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0].value as number;
  const title =
    chartType === "comparison"
      ? "Growth"
      : chartType === "success-rate"
        ? "Goal Achievement"
        : chartType === "roi"
          ? "ROI"
          : payload[0].name;

  const formatted =
    chartType === "comparison" ||
    chartType === "success-rate" ||
    chartType === "roi"
      ? `${val > 0 ? "+" : ""}${val.toFixed(1)}%`
      : `${val}`;

  return (
    <div className="rounded-lg border border-slate-600/50 bg-slate-800/95 px-3 py-2 shadow-lg">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm text-slate-100">
        {title}: {formatted}
      </div>
    </div>
  );
};

const axisTickStyle = {
  fill: "#94A3B8",
  fontSize: 12,
  fontFamily: "Inter, sans-serif" as const,
};

const gridStyle = { stroke: palette.slateBorder };

const legendFormatter = (value: string) => (
  <span className="text-slate-300 text-xs">{value}</span>
);

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  title,
  _type,
  _data,
  _className = "",
  _height = 300,
}) => {
  const { data: rows, xKey, yKeys, kind } = buildChartData(type, data);

  // Choose colors per series (supports multi-series later)
  const seriesColors =
    type === "comparison"
      ? [palette.blue]
      : type === "success-rate"
        ? [palette.violet]
        : type === "roi"
          ? [palette.green]
          : [palette.blue, palette.violet, palette.emerald, palette.amber];

  const isPercent =
    type === "comparison" || type === "success-rate" || type === "roi";

  return (
    <div className={`card-base p-6 ${className}`}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400">
            {type === "comparison" && "Period-over-period growth metrics"}
            {type === "success-rate" && "Campaign goal achievement rates"}
            {type === "roi" && "Return on investment by campaign"}
            {type === "trend" && "Performance trends over time"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
            aria-label="Download"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "bar" ? (
            <BarChart
              data={rows}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid stroke={gridStyle.stroke} strokeDasharray="3 3" />
              <XAxis
                dataKey={xKey}
                tick={axisTickStyle}
                tickMargin={8}
                axisLine={false}
              />
              <YAxis
                tick={axisTickStyle}
                axisLine={false}
                tickFormatter={(v) => (isPercent ? `${v}%` : `${v}`)}
              />
              <Tooltip content={<CustomTooltip chartType={type} />} />
              {yKeys.map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={seriesColors[idx % seriesColors.length]}
                  radius={6}
                />
              ))}
              <Legend formatter={legendFormatter} />
            </BarChart>
          ) : (
            <LineChart
              data={rows}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid stroke={gridStyle.stroke} strokeDasharray="3 3" />
              <XAxis
                dataKey={xKey}
                tick={axisTickStyle}
                tickMargin={8}
                axisLine={false}
              />
              <YAxis
                tick={axisTickStyle}
                axisLine={false}
                tickFormatter={(v) => (isPercent ? `${v}%` : `${v}`)}
              />
              <Tooltip content={<CustomTooltip chartType={type} />} />
              {yKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={seriesColors[idx % seriesColors.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
              <Legend formatter={legendFormatter} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 border-t border-slate-700/50 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            {type === "comparison" && "Growth vs previous period"}
            {type === "success-rate" && `${rows.length} campaigns analyzed`}
            {type === "roi" &&
              `Average ROI: ${
                rows.length
                  ? (
                      rows.reduce(
                        (a, r) => a + (Number(r["ROI (%)"]) || 0),
                        0,
                      ) / rows.length
                    ).toFixed(1)
                  : "0.0"
              }%`}
          </span>

          {type === "comparison" && (
            <div className="flex items-center space-x-4">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: seriesColors[0] }}
                  />
                  <span
                    className={`text-xs font-medium ${
                      r.value > 0
                        ? "text-green-400"
                        : r.value < 0
                          ? "text-red-400"
                          : "text-slate-400"
                    }`}
                  >
                    {r.value > 0 ? "+" : ""}
                    {Number(r.value).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;

export {};
