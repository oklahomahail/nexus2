/**
 * Track15 Lift Metrics Component
 *
 * Displays engagement lift, response rate lift, and velocity lift
 * Core Track15 performance indicators
 */

import { TrendingUp, TrendingDown, Activity, Target, Zap } from "lucide-react";

import type { Track15LiftMetrics } from "@/types/track15.types";

interface Track15LiftMetricsProps {
  metrics: Track15LiftMetrics;
  loading?: boolean;
}

export default function Track15LiftMetricsComponent({
  metrics,
  loading = false,
}: Track15LiftMetricsProps) {
  if (loading) {
    return (
      <div className="track15-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
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
      bg: "track15-primary-soft",
      border: "border-blue-200",
      text: "text-track15-primary",
      icon: "text-track15-primary",
    },
    blue: {
      bg: "track15-primary-soft",
      border: "border-blue-200",
      text: "text-track15-primary",
      icon: "text-track15-primary",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-track15-accent",
      icon: "text-track15-accent",
    },
  };

  return (
    <div className="track15-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold font-track15-heading text-track15-primary">
            Track15 Performance Lift
          </h3>
          <p className="text-sm track15-text-muted mt-1">
            vs. baseline metrics
          </p>
        </div>
        <div className="text-xs track15-text-muted">
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
          const colors =
            colorClasses[metric.color as keyof typeof colorClasses];
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
                <span className="text-sm font-medium track15-text">
                  {metric.label}
                </span>
              </div>

              {/* Lift Value */}
              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-track15-primary">
                    {metric.value > 0 ? "+" : ""}
                    {metric.value.toFixed(1)}%
                  </span>
                  {isPositive && (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  )}
                  {isNegative && (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <p className="text-xs track15-text-muted mt-1">
                  {metric.description}
                </p>
              </div>

              {/* Baseline vs Current */}
              {metric.baseline !== undefined &&
                metric.current !== undefined && (
                  <div className="pt-3 border-t track15-border">
                    <div className="flex justify-between text-xs">
                      <span className="track15-text-muted">Baseline</span>
                      <span className="font-medium track15-text">
                        {metric.baseline.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="track15-text-muted">Current</span>
                      <span className="font-medium track15-text">
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
      <div className="mt-6 pt-6 border-t track15-border">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold track15-text mb-1">
                Track15 Impact
              </h4>
              <p className="text-xs track15-text-muted">
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
              <div className="text-2xl font-bold text-track15-primary">
                {(
                  (metrics.engagementLift +
                    metrics.responseRateLift +
                    metrics.velocityLift) /
                  3
                ).toFixed(1)}
                %
              </div>
              <div className="text-xs track15-text-muted">Avg Lift</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
