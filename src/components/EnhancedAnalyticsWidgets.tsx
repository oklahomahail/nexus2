import clsx from "clsx";
import React, { useState, useMemo } from "react";

import { Badge } from "./ui-kit/Badge";
import { DataTable, Column } from "./ui-kit/DataTable";
import { InteractiveChart, ChartDataPoint } from "./ui-kit/InteractiveChart";
import { Progress } from "./ui-kit/Progress";
import { Select, Option } from "./ui-kit/Select";
import { Tooltip } from "./ui-kit/Tooltip";

// Enhanced KPI Widget with interactive features
export interface EnhancedKPIData {
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
  trend?: ChartDataPoint[];
  clickable?: boolean;
  onClick?: () => void;
  helpText?: string;
  loading?: boolean;
  onExport?: (format?: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    type: string;
    options: string[];
    value: string;
  }>;
}

export const EnhancedKPIWidget: React.FC<EnhancedKPIData> = ({
  title,
  value,
  change,
  icon,
  color = "blue",
  format,
  trend,
  clickable = false,
  onClick,
  helpText,
  loading = false,
  onExport: _onExport,
  filters: _filters,
}) => {
  const [showTrend, setShowTrend] = useState(false);

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
    return typeof val === "number" ? val.toLocaleString() : val;
  };

  const widget = (
    <div
      className={clsx(
        "p-6 rounded-lg border transition-all duration-200",
        colorClasses[color],
        clickable && "cursor-pointer hover:scale-105 hover:shadow-lg",
      )}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-xl">
              {typeof icon === "string" ? icon : icon}
            </span>
          )}
          {trend && trend.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTrend(!showTrend);
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              📈
            </button>
          )}
        </div>
      </div>

      <div className="text-2xl font-bold text-white mb-1">
        {loading ? (
          <div className="animate-pulse bg-slate-700 h-8 w-24 rounded"></div>
        ) : (
          formatValue(value)
        )}
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

      {/* Mini trend chart */}
      {showTrend && trend && trend.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <InteractiveChart
            data={trend}
            type="line"
            height={60}
            showGrid={false}
            showTooltip={false}
            interactive={false}
            colors={[color === "green" ? "#10B981" : "#3B82F6"]}
          />
        </div>
      )}
    </div>
  );

  // Wrap with tooltip if help text provided
  if (helpText) {
    return (
      <Tooltip content={helpText} placement="top">
        {widget}
      </Tooltip>
    );
  }

  return widget;
};

// Enhanced Chart Widget with interactivity
export interface EnhancedChartData {
  title: string;
  data: ChartDataPoint[];
  type?: "bar" | "line" | "pie" | "donut" | "area";
  height?: string | number;
  showControls?: boolean;
  showExport?: boolean;
  onDataPointClick?: (point: ChartDataPoint, index: number) => void;
  onExport?: (format: "csv" | "png" | "pdf") => void;
  className?: string;
  loading?: boolean;
  filters?: Array<{
    key: string;
    label: string;
    type: string;
    options: string[];
    value: string;
  }>;
  chartType?: string;
}

export const EnhancedChartWidget: React.FC<EnhancedChartData> = ({
  title,
  data,
  type = "bar",
  height = 300,
  showControls = true,
  showExport = false,
  onDataPointClick,
  onExport,
  className,
  loading = false,
  filters: _filters,
  chartType: initialChartType,
}) => {
  const [chartType, setChartType] = useState(initialChartType || type);
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");

  const chartTypeOptions: Option[] = [
    { label: "Bar Chart", value: "bar", icon: "📊" },
    { label: "Line Chart", value: "line", icon: "📈" },
    { label: "Area Chart", value: "area", icon: "🏔️" },
    { label: "Pie Chart", value: "pie", icon: "🥧" },
    { label: "Donut Chart", value: "donut", icon: "🍩" },
  ];

  const timeRangeOptions: Option[] = [
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "Last 90 Days", value: "90d" },
    { label: "Last Year", value: "1y" },
  ];

  const exportOptions: Option[] = [
    { label: "Export as CSV", value: "csv", icon: "📄" },
    { label: "Export as PNG", value: "png", icon: "🖼️" },
    { label: "Export as PDF", value: "pdf", icon: "📋" },
  ];

  return (
    <div
      className={clsx(
        "bg-slate-900/40 border border-slate-800 rounded-lg p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>

        {(showControls || showExport) && (
          <div className="flex items-center gap-3">
            {showControls && (
              <>
                <Select
                  options={timeRangeOptions}
                  value={selectedTimeRange}
                  onChange={setSelectedTimeRange}
                  size="sm"
                  className="w-32"
                />
                <Select
                  options={chartTypeOptions}
                  value={chartType}
                  onChange={setChartType}
                  size="sm"
                  className="w-32"
                />
              </>
            )}

            {showExport && (
              <Select
                options={exportOptions}
                placeholder="Export..."
                onChange={(format) => onExport?.(format)}
                size="sm"
                className="w-32"
              />
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="animate-pulse bg-slate-700 h-full w-full rounded"></div>
        </div>
      ) : (
        <InteractiveChart
          data={data}
          type={chartType as any}
          height={height}
          interactive
          showTooltip
          showLegend={chartType === "pie" || chartType === "donut"}
          enableDrillDown
          onPointClick={onDataPointClick}
        />
      )}
    </div>
  );
};

// Enhanced Activity Feed with real-time updates
export interface ActivityItem {
  id: string;
  type: "donation" | "campaign" | "donor" | "goal" | "system";
  title: string;
  description: string;
  timestamp: Date;
  amount?: number;
  status?: "success" | "warning" | "error" | "info";
  metadata?: Record<string, any>;
}

export interface EnhancedActivityFeedProps {
  title?: string;
  activities: ActivityItem[];
  maxItems?: number;
  showFilters?: boolean;
  realTime?: boolean;
  onItemClick?: (item: ActivityItem) => void;
  loading?: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
  onLoadMore?: () => void;
  filters?: Array<{
    key: string;
    label: string;
    type: string;
    options: string[];
    value: string;
  }>;
}

export const EnhancedActivityFeed: React.FC<EnhancedActivityFeedProps> = ({
  title = "Recent Activity",
  activities,
  maxItems = 10,
  showFilters = true,
  realTime = false,
  onItemClick,
  loading: _loading = false,
  onActivityClick,
  onLoadMore: _onLoadMore,
  filters: _filters,
}) => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const typeOptions: Option[] = [
    { label: "All Activities", value: "all" },
    { label: "Donations", value: "donation", icon: "💰" },
    { label: "Campaigns", value: "campaign", icon: "🎯" },
    { label: "Donors", value: "donor", icon: "👥" },
    { label: "Goals", value: "goal", icon: "🎉" },
    { label: "System", value: "system", icon: "⚙️" },
  ];

  const statusOptions: Option[] = [
    { label: "All Status", value: "all" },
    { label: "Success", value: "success" },
    { label: "Warning", value: "warning" },
    { label: "Error", value: "error" },
    { label: "Info", value: "info" },
  ];

  const filteredActivities = useMemo(() => {
    return activities
      .filter((item) => typeFilter === "all" || item.type === typeFilter)
      .filter((item) => statusFilter === "all" || item.status === statusFilter)
      .slice(0, maxItems);
  }, [activities, typeFilter, statusFilter, maxItems]);

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
      case "system":
        return "⚙️";
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>{title}</span>
          {realTime && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </h3>
      </div>

      {showFilters && (
        <div className="flex gap-3 mb-4">
          <Select
            options={typeOptions}
            value={typeFilter}
            onChange={setTypeFilter}
            size="sm"
            className="flex-1"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            size="sm"
            className="flex-1"
          />
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No recent activity</p>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className={clsx(
                "flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg transition-colors",
                onItemClick && "cursor-pointer hover:bg-slate-800/50",
              )}
              onClick={() => (onItemClick || onActivityClick)?.(activity)}
            >
              <span className="text-lg flex-shrink-0">
                {getActivityIcon(activity.type)}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {activity.status && (
                      <Badge
                        variant={
                          activity.status === "success"
                            ? "success"
                            : activity.status === "warning"
                              ? "warning"
                              : activity.status === "error"
                                ? "error"
                                : "info"
                        }
                        size="sm"
                      >
                        {activity.status}
                      </Badge>
                    )}
                    <span className="text-xs text-slate-500">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  {activity.description}
                </p>

                {activity.amount && (
                  <p className="text-sm font-semibold text-green-400 mt-1">
                    ${activity.amount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Enhanced Goal Progress Widget
export interface EnhancedGoalProgressProps {
  title: string;
  current: number;
  target: number;
  period?: string;
  showPercentage?: boolean;
  showAmount?: boolean;
  color?: "blue" | "green" | "purple" | "orange";
  milestones?: { value: number; label: string; reached: boolean }[];
  onGoalClick?: () => void;
  loading?: boolean;
  goals?: Array<{
    id: string;
    name: string;
    current: number;
    target: number;
    deadline: string;
  }>;
}

export const EnhancedGoalProgressWidget: React.FC<
  EnhancedGoalProgressProps
> = ({
  title,
  current,
  target,
  period = "this month",
  showPercentage = true,
  showAmount = true,
  color = "green",
  milestones = [],
  onGoalClick,
  loading: _loading = false,
  goals: _goals,
}) => {
  // const _percentage = Math.min((current / target) * 100, 100);
  const remaining = target - current;

  const colorVariants = {
    blue: "default",
    green: "success",
    purple: "info",
    orange: "warning",
  };

  return (
    <div
      className={clsx(
        "bg-slate-900/40 border border-slate-800 rounded-lg p-6 transition-all duration-200",
        onGoalClick && "cursor-pointer hover:border-slate-700",
      )}
      onClick={onGoalClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <Badge variant="secondary" size="sm">
          {period}
        </Badge>
      </div>

      <div className="space-y-4">
        {showAmount && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Current</span>
            <span className="text-white font-medium">
              ${current.toLocaleString()} / ${target.toLocaleString()}
            </span>
          </div>
        )}

        <Progress
          value={current}
          max={target}
          variant={colorVariants[color] as any}
          showPercentage={showPercentage}
          showLabel
          label="Progress"
          striped
          animated
        />

        {remaining > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Remaining</span>
            <span className="text-red-300">${remaining.toLocaleString()}</span>
          </div>
        )}

        {milestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">Milestones</h4>
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span
                  className={clsx(
                    milestone.reached ? "text-green-400" : "text-slate-400",
                  )}
                >
                  {milestone.reached ? "✓" : "○"} {milestone.label}
                </span>
                <span className="text-slate-400">
                  ${milestone.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Data Table Widget for analytics
export interface DataTableWidgetProps<T = any> {
  title: string;
  data: T[];
  columns: Column<T>[];
  showSearch?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onRowClick?: (record: T) => void;
  onExport?: (format: "csv" | "excel") => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const DataTableWidget = <T extends Record<string, any>>({
  title,
  data,
  columns,
  showSearch = true,
  showExport = false,
  showRefresh = true,
  pagination,
  onRowClick,
  onExport,
  onRefresh,
  loading = false,
}: DataTableWidgetProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
  }, [data, searchQuery]);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>

        <div className="flex items-center gap-3">
          {showSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
            </div>
          )}

          {showExport && (
            <Select
              options={[
                { label: "Export CSV", value: "csv", icon: "📄" },
                { label: "Export Excel", value: "excel", icon: "📊" },
              ]}
              placeholder="Export..."
              onChange={(format) => onExport?.(format)}
              size="sm"
            />
          )}

          {showRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-3 py-2 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "⏳" : "🔄"}
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        pagination={pagination}
        onRow={
          onRowClick
            ? (record) => ({ onClick: () => onRowClick(record) })
            : undefined
        }
        hoverable
        sticky
        maxHeight="600px"
      />
    </div>
  );
};

export default {
  EnhancedKPIWidget,
  EnhancedChartWidget,
  EnhancedActivityFeed,
  EnhancedGoalProgressWidget,
  DataTableWidget,
};
