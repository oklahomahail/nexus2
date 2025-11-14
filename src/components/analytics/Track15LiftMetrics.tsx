/**
 * Track15 Lift Metrics Component
 *
 * Displays engagement lift, response rate lift, and velocity lift
 * Core Track15 performance indicators
 */

import React from "react";
import { TrendingUp, TrendingDown, Activity, Target, Zap } from "lucide-react";
import type { Track15LiftMetrics } from "@/types/track15.types";

interface Track15LiftMetricsProps {
  metrics: Track15LiftMetrics;
  loading?: boolean;
}

export default function Track15LiftMetrics({
  metrics,
  loading = false,
}: Track15LiftMetricsProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const liftMetrics = [
    {
      label: "Engagement Lift",
      value: metrics.engagementLift,
      icon: Activity,
      color: "purple",
      baseline: metrics.baselineEngagementScore,
      current: metrics.currentEngagementScore,
      description: "Increase in donor engagement",
    },
    {
      label: "Response Rate Lift",
      value: metrics.responseRateLift,
      icon: Target,
      color: "blue",
      baseline: metrics.baselineResponseRate,
      current: metrics.currentResponseRate,
      description: "Increase in campaign response rate",
    },
    {
      label: "Velocity Lift",
      value: metrics.velocityLift,
      icon: Zap,
      color: "orange",
      baseline: metrics.baselineVelocity,
      current: metrics.currentVelocity,
      description: "Increase in giving velocity (gifts/day)",
    },
  ];

  const colorClasses = {
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-800",
      text: "text-purple-600 dark:text-purple-400",
      icon: "text-purple-600 dark:text-purple-400",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-600 dark:text-blue-400",
      icon: "text-blue-600 dark:text-blue-400",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800",
      text: "text-orange-600 dark:text-orange-400",
      icon: "text-orange-600 dark:text-orange-400",
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Track15 Performance Lift
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            vs. baseline metrics
          </p>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Last calculated:{" "}
          {new Date(metrics.calculatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Lift Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {liftMetrics.map((metric) => {
          const Icon = metric.icon;
          const colors = colorClasses[metric.color as keyof typeof colorClasses];
          const isPositive = metric.value > 0;
          const isNegative = metric.value < 0;

          return (
            <div
              key={metric.label}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4`}
            >
              {/* Icon and Label */}
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${colors.icon}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {metric.label}
                </span>
              </div>

              {/* Lift Value */}
              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metric.value > 0 ? "+" : ""}
                    {metric.value.toFixed(1)}%
                  </span>
                  {isPositive && (
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                  {isNegative && (
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {metric.description}
                </p>
              </div>

              {/* Baseline vs Current */}
              {metric.baseline !== undefined && metric.current !== undefined && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Baseline</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {metric.baseline.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Current</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {metric.current.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Performance Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Track15 Impact
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {metrics.engagementLift > 0 &&
                metrics.responseRateLift > 0 &&
                metrics.velocityLift > 0
                  ? "Campaign is outperforming baseline across all Track15 metrics"
                  : metrics.engagementLift < 0 ||
                    metrics.responseRateLift < 0 ||
                    metrics.velocityLift < 0
                  ? "Some metrics are below baseline - review narrative arc and segmentation"
                  : "Campaign performance is mixed - optimize underperforming areas"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {(
                  (metrics.engagementLift +
                    metrics.responseRateLift +
                    metrics.velocityLift) /
                  3
                ).toFixed(1)}
                %
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Avg Lift
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
