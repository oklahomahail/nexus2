// src/components/PerformanceChart.tsx - Recharts implementation with dark theme
import React from 'react';
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
} from 'recharts';

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

type ChartType = 'comparison' | 'success-rate' | 'roi' | 'trend';

interface PerformanceChartProps {
  title: string;
  type: ChartType;
  data: ComparisonData | CampaignSuccessData;
  className?: string;
  height?: number;
}

// Shared palette to echo your Tailwind brand colors
const palette = {
  blue: '#3B82F6',
  blueLite: '#60A5FA',
  violet: '#8B5CF6',
  violetLite: '#A78BFA',
  emerald: '#10B981',
  emeraldLite: '#34D399',
  green: '#22C55E',
  amber: '#F59E0B',
  slateBorder: 'rgba(71, 85, 105, 0.3)',
};

function buildChartData(
  type: ChartType,
  raw: ComparisonData | CampaignSuccessData
): { data: Array<Record<string, any>>; xKey: string; yKeys: string[]; kind: 'bar' | 'line' } {
  if (type === 'comparison') {
    const d = raw as ComparisonData;
    // We show growth across three metrics as a single series
    const rows = [
      { metric: 'Funds Raised', value: d.growthMetrics.raisedChange },
      { metric: 'Donors', value: d.growthMetrics.donorsChange },
      { metric: 'Campaigns', value: d.growthMetrics.campaignsChange },
    ];
    return { data: rows, xKey: 'metric', yKeys: ['value'], kind: 'bar' };
  }

  if (type === 'success-rate') {
    const d = raw as CampaignSuccessData;
    const rows = d.map(c => ({
      name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
      'Goal Achievement (%)': c.goalAchievement,
    }));
    return { data: rows, xKey: 'name', yKeys: ['Goal Achievement (%)'], kind: 'bar' };
  }

  if (type === 'roi') {
    const d = raw as CampaignSuccessData;
    const rows = d.map(c => ({
      name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
      'ROI (%)': c.roi,
    }));
    return { data: rows, xKey: 'name', yKeys: ['ROI (%)'], kind: 'bar' };
  }

  // trend
  // If you later supply time series, map to [{ period, valueA, valueB, ... }]
  // For now, render an empty safe structure.
  return { data: [], xKey: 'period', yKeys: ['value'], kind: 'line' };
}

const CustomTooltip = ({ active, payload, label, chartType }: any) => {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0].value as number;
  const title =
    chartType === 'comparison'
      ? 'Growth'
      : chartType === 'success-rate'
      ? 'Goal Achievement'
      : chartType === 'roi'
      ? 'ROI'
      : payload[0].name;

  const formatted =
    chartType === 'comparison' || chartType === 'success-rate' || chartType === 'roi'
      ? `${val > 0 ? '+' : ''}${val.toFixed(1)}%`
      : `${val}`;

  return (
    <div className="rounded-lg border border-slate-600/50 bg-slate-800/95 px-3 py-2 shadow-lg">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm text-slate-100">{title}: {formatted}</div>
    </div>
  );
};

const axisTickStyle = { fill: '#94A3B8', fontSize: 12, fontFamily: 'Inter, sans-serif' as const };

const gridStyle = { stroke: palette.slateBorder };

const legendFormatter = (value: string) => <span className="text-slate-300 text-xs">{value}</span>;

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  title,
  type,
  data,
  className = '',
  height = 300,
}) => {
  const { data: rows, xKey, yKeys, kind } = buildChartData(type, data);

  // Choose colors per series (supports multi-series later)
  const seriesColors =
    type === 'comparison'
      ? [palette.blue]
      : type === 'success-rate'
      ? [palette.violet]
      : type === 'roi'
      ? [palette.green]
      : [palette.blue, palette.violet, palette.emerald, palette.amber];

  const isPercent = type === 'comparison' || type === 'success-rate' || type === 'roi';

  return (
    <div className={`card-base p-6 ${className}`}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400">
            {type === 'comparison' && 'Period-over-period growth metrics'}
            {type === 'success-rate' && 'Campaign goal achievement rates'}
            {type === 'roi' && 'Return on investment by campaign'}
            {type === 'trend' && 'Performance trends over time'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white" aria-label="Download">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          {kind === 'bar' ? (
            <BarChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid stroke={gridStyle.stroke} strokeDasharray="3 3" />
              <XAxis dataKey={xKey} tick={axisTickStyle} tickMargin={8} axisLine={false} />
              <YAxis
                tick={axisTickStyle}
                axisLine={false}
                tickFormatter={v => (isPercent ? `${v}%` : `${v}`)}
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
            <LineChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid stroke={gridStyle.stroke} strokeDasharray="3 3" />
              <XAxis dataKey={xKey} tick={axisTickStyle} tickMargin={8} axisLine={false} />
              <YAxis
                tick={axisTickStyle}
                axisLine={false}
                tickFormatter={v => (isPercent ? `${v}%` : `${v}`)}
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
            {type === 'comparison' && 'Growth vs previous period'}
            {type === 'success-rate' && `${rows.length} campaigns analyzed`}
            {type === 'roi' &&
              `Average ROI: ${
                rows.length
                  ? (
                      rows.reduce((a, r) => a + (Number(r['ROI (%)']) || 0), 0) / rows.length
                    ).toFixed(1)
                  : '0.0'
              }%`}
          </span>

          {type === 'comparison' && (
            <div className="flex items-center space-x-4">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: seriesColors[0] }}
                  />
                  <span
                    className={`text-xs font-medium ${
                      r.value > 0 ? 'text-green-400' : r.value < 0 ? 'text-red-400' : 'text-slate-400'
                    }`}
                  >
                    {r.value > 0 ? '+' : ''}
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

/* ─────────────────────────────────────────────────────────── *
 * Enhanced Campaign Performance Table (unchanged API)
 * ─────────────────────────────────────────────────────────── */
interface CampaignPerformanceTableProps {
  campaigns: Array<{
    id: string;
    name: string;
    status: 'Active' | 'Planned' | 'Completed' | 'Cancelled';
    totalDonors: number;
    totalRevenue: number;
    roi: number;
    goal?: number;
    progress?: number;
  }>;
  className?: string;
}

export const CampaignPerformanceTable: React.FC<CampaignPerformanceTableProps> = ({
  campaigns,
  className = '',
}) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Active: 'bg-green-500/20 text-green-400 border-green-500/30',
      Planned: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      Completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || colors.Active;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className={`card-base overflow-hidden ${className}`}>
      <div className="border-b border-slate-700/50 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">Campaign Performance</h3>
        <p className="mt-1 text-sm text-slate-400">Track the success of your fundraising campaigns</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Campaign</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Donors</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Raised</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Progress</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">ROI</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="transition-colors hover:bg-slate-800/30">
                <td className="px-6 py-4">
                  <div className="max-w-48 truncate font-medium text-white">
                    {campaign.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300">{campaign.totalDonors.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-green-400">{formatCurrency(campaign.totalRevenue)}</span>
                </td>
                <td className="px-6 py-4">
                  {campaign.goal && campaign.progress ? (
                    <div className="w-24">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-slate-400">{campaign.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-700/50">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`font-semibold ${
                      campaign.roi > 0
                        ? 'text-green-400'
                        : campaign.roi < 0
                        ? 'text-red-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {campaign.roi > 0 ? '+' : ''}
                    {campaign.roi.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
                      aria-label="View"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-blue-400"
                      aria-label="Edit"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {campaigns.length === 0 && (
        <div className="p-12 text-center">
          <div className="mb-4 text-slate-400">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-slate-300">No campaign data available</h3>
          <p className="text-slate-400">Start tracking your campaigns to see performance metrics here.</p>
        </div>
      )}
    </div>
  );
};
