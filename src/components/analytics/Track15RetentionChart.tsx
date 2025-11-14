/**
 * Track15 Retention Chart
 *
 * Visualizes donor retention over time for Track15 campaigns vs baseline
 */

import { TrendingUp } from "lucide-react";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { Track15RetentionSeries } from "@/types/track15.types";

interface Track15RetentionChartProps {
  series: Track15RetentionSeries | null;
  isLoading: boolean;
  error?: string | null;
}

export default function Track15RetentionChart({
  series,
  isLoading,
  error,
}: Track15RetentionChartProps) {
  if (isLoading) {
    return (
      <div className="track15-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="track15-card p-6 border-red-200">
        <div className="text-sm text-red-600">
          Couldn't load retention data: {error}
        </div>
      </div>
    );
  }

  if (!series || series.points.length === 0) {
    return (
      <div className="track15-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold font-track15-heading text-track15-primary">
            Retention Over Time
          </h3>
        </div>
        <div className="text-center py-12 track15-text-muted">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            No retention data yet. Once this Track15 campaign runs for at least
            one period, retention will appear here.
          </p>
        </div>
      </div>
    );
  }

  const data = series.points.map((p) => ({
    period: p.period,
    campaignRetention: p.campaignRetention * 100,
    baselineRetention: p.baselineRetention * 100,
  }));

  // Calculate average retention lift
  const avgLift =
    series.points.reduce(
      (sum, p) => sum + (p.campaignRetention - p.baselineRetention),
      0,
    ) / series.points.length;
  const avgLiftPercent = (avgLift * 100).toFixed(1);

  return (
    <div className="track15-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold font-track15-heading text-track15-primary">
            Retention Over Time
          </h3>
          <span className="text-xs track15-text-muted">
            {series.label}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm track15-text-muted">
            Avg Lift
          </div>
          <div
            className={`text-lg font-bold ${
              avgLift >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {avgLift >= 0 ? "+" : ""}
            {avgLiftPercent}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              opacity={0.5}
            />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              stroke="#9CA3AF"
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              domain={[0, 100]}
              stroke="#9CA3AF"
            />
            <Tooltip
              formatter={(value) => `${(value as number).toFixed(1)}%`}
              labelFormatter={(label) => `Period: ${label}`}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "0.5rem",
                color: "#1F2933",
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "1rem",
              }}
            />
            <Line
              type="monotone"
              dataKey="campaignRetention"
              name="Track15 Campaign"
              stroke="rgb(13, 95, 168)"
              strokeWidth={3}
              dot={{ fill: "rgb(13, 95, 168)", r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="baselineRetention"
              name="Baseline"
              stroke="rgb(107, 114, 128)"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={{ fill: "rgb(107, 114, 128)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="mt-6 pt-6 border-t track15-border">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs track15-text-muted mb-1">
              Latest Period
            </div>
            <div className="text-lg font-semibold text-track15-primary">
              {(
                series.points[series.points.length - 1].campaignRetention * 100
              ).toFixed(1)}
              %
            </div>
          </div>
          <div>
            <div className="text-xs track15-text-muted mb-1">
              Baseline
            </div>
            <div className="text-lg font-semibold text-track15-primary">
              {(
                series.points[series.points.length - 1].baselineRetention * 100
              ).toFixed(1)}
              %
            </div>
          </div>
          <div>
            <div className="text-xs track15-text-muted mb-1">
              Trend
            </div>
            <div
              className={`text-lg font-semibold ${
                avgLift >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {avgLift >= 0 ? "↗ Improving" : "↘ Declining"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
