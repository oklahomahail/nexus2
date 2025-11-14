/**
 * Track15 Retention Chart
 *
 * Visualizes donor retention over time for Track15 campaigns vs baseline
 */

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
import { TrendingUp } from "lucide-react";

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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-200 dark:border-red-800">
        <div className="text-sm text-red-600 dark:text-red-400">
          Couldn't load retention data: {error}
        </div>
      </div>
    );
  }

  if (!series || series.points.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Retention Over Time
          </h3>
        </div>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            No retention data yet. Once this Track15 campaign runs for at least one
            period, retention will appear here.
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
      0
    ) / series.points.length;
  const avgLiftPercent = (avgLift * 100).toFixed(1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Retention Over Time
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {series.label}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Lift</div>
          <div
            className={`text-lg font-bold ${
              avgLift >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
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
              stroke="#374151"
              opacity={0.2}
            />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              stroke="#6B7280"
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              domain={[0, 100]}
              stroke="#6B7280"
            />
            <Tooltip
              formatter={(value) => `${(value as number).toFixed(1)}%`}
              labelFormatter={(label) => `Period: ${label}`}
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                color: "#F9FAFB",
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
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ fill: "#8B5CF6", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="baselineRetention"
              name="Baseline"
              stroke="#6B7280"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={{ fill: "#6B7280", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Latest Period
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {(series.points[series.points.length - 1].campaignRetention * 100).toFixed(
                1
              )}
              %
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Baseline
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {(series.points[series.points.length - 1].baselineRetention * 100).toFixed(
                1
              )}
              %
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Trend</div>
            <div
              className={`text-lg font-semibold ${
                avgLift >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
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
