// src/components/AnalyticsWidgets.tsx - Specialized analytics and reporting components
import clsx from "clsx";
import React from "react";

// Types
interface KPIData {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    direction: "up" | "down" | "neutral";
    period: string;
  };
  icon?: string | React.ReactElement;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "orange";
  format?: "number" | "currency" | "percentage";
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

interface ActivityItem {
  id: string;
  type: "donation" | "campaign" | "donor" | "goal";
  title: string;
  description: string;
  timestamp: Date;
  amount?: number;
}

// KPI Widget Component
export const KPIWidget: React.FC<KPIData> = ({
  title,
  value,
  change,
  icon,
  color = "blue",
  format,
}) => {
  const colorClasses = {
    blue: "bg-blue-900/20 border-blue-800/50 text-blue-300",
    green: "bg-green-900/20 border-green-800/50 text-green-300",
    red: "bg-red-900/20 border-red-800/50 text-red-300",
    yellow: "bg-yellow-900/20 border-yellow-800/50 text-yellow-300",
    purple: "bg-purple-900/20 border-purple-800/50 text-purple-300",
    orange: "bg-orange-900/20 border-orange-800/50 text-orange-300",
  };

  const changeClasses = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-slate-400",
  };

  const formatValue = (val: string | number) => {
    if (format === "currency") {
      return `$${Number(val).toLocaleString()}`;
    }
    if (format === "percentage") {
      return `${val}%`;
    }
    return val.toLocaleString();
  };

  return (
    <div className={clsx("p-6 rounded-lg border", colorClasses[color])}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        {icon && (
          <span className="text-xl">
            {typeof icon === "string" ? icon : icon}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {formatValue(value)}
      </div>
      {change && (
        <div
          className={clsx(
            "text-sm flex items-center gap-1",
            changeClasses[change.direction],
          )}
        >
          <span>
            {change.direction === "up"
              ? "↑"
              : change.direction === "down"
                ? "↓"
                : "→"}
          </span>
          <span>
            {change.value} {change.period}
          </span>
        </div>
      )}
    </div>
  );
};

// Simple Chart Widget
export const ChartWidget: React.FC<{
  title: string;
  data: ChartData;
  type?: "line" | "bar";
  height?: string;
}> = ({ title, data, height = "200px" }) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div style={{ height }} className="flex items-end justify-between">
        {data.labels.map((label, index) => {
          const value = data.datasets[0]?.data[index] || 0;
          const maxValue = Math.max(...(data.datasets[0]?.data || [1]));
          const heightPercent = (value / maxValue) * 100;

          return (
            <div key={label} className="flex flex-col items-center space-y-2">
              <div
                className="bg-blue-500 rounded-t w-8 transition-all duration-300"
                style={{ height: `${heightPercent}%` }}
                title={`${label}: ${value}`}
              />
              <span className="text-xs text-slate-400 transform rotate-45 origin-left">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Real-time Activity Feed
export const ActivityFeed: React.FC<{
  activities: ActivityItem[];
  maxItems?: number;
}> = ({ activities, maxItems = 10 }) => {
  const displayActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "donation":
        return "💰";
      case "campaign":
        return "🎯";
      case "donor":
        return "👥";
      case "goal":
        return "🎉";
      default:
        return "📊";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>Recent Activity</span>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </h3>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {displayActivities.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No recent activity</p>
        ) : (
          displayActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg"
            >
              <span className="text-lg">{getActivityIcon(activity.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {activity.description}
                </p>
                {activity.amount && (
                  <p className="text-sm font-semibold text-green-400 mt-1">
                    ${activity.amount.toLocaleString()}
                  </p>
                )}
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {formatTimeAgo(activity.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Goal Progress Widget
export const GoalProgressWidget: React.FC<{
  title: string;
  current: number;
  goal: number;
  period: string;
}> = ({ title, current, goal, period }) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-slate-400">{period}</span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">Progress</span>
          <span
            className={clsx(
              "font-medium",
              isComplete ? "text-green-400" : "text-blue-400",
            )}
          >
            {percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className={clsx(
              "h-2 rounded-full transition-all duration-500",
              isComplete ? "bg-green-500" : "bg-blue-500",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-white">
            ${current.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">Current</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-slate-300">
            ${goal.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">Goal</p>
        </div>
      </div>

      {isComplete && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded-lg">
          <p className="text-green-300 text-sm font-medium flex items-center gap-2">
            <span>🎉</span>
            Goal achieved! Congratulations!
          </p>
        </div>
      )}
    </div>
  );
};

// Campaign Performance Summary
export const CampaignSummaryWidget: React.FC<{
  campaigns: {
    id: string;
    name: string;
    raised: number;
    goal: number;
    daysLeft: number;
    status: "active" | "completed" | "draft";
  }[];
}> = ({ campaigns }) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Campaign Overview
      </h3>

      <div className="space-y-3">
        {campaigns.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No active campaigns</p>
        ) : (
          campaigns.slice(0, 5).map((campaign) => {
            const progress = (campaign.raised / campaign.goal) * 100;
            const statusColors = {
              active: "text-green-400",
              completed: "text-blue-400",
              draft: "text-yellow-400",
            };

            return (
              <div key={campaign.id} className="p-3 bg-slate-800/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white truncate">
                    {campaign.name}
                  </h4>
                  <span
                    className={clsx(
                      "text-xs font-medium",
                      statusColors[campaign.status],
                    )}
                  >
                    {campaign.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">
                    ${campaign.raised.toLocaleString()} raised
                  </span>
                  <span className="text-slate-400">
                    {campaign.daysLeft} days left
                  </span>
                </div>

                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {campaigns.length > 5 && (
        <button className="w-full mt-4 text-sm text-blue-400 hover:text-blue-300 font-medium">
          View all campaigns ({campaigns.length})
        </button>
      )}
    </div>
  );
};
