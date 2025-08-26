// src/panels/DashboardPanel.tsx
import clsx from "clsx";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Plus,
} from "lucide-react";
import React, { ComponentType } from "react";

import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/useUI";

/* ---------- Reusable Cards ---------- */

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  onClick?: () => void;
  color?: "blue" | "green" | "purple" | "indigo";
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  color = "blue",
}) => {
  type StatColor = "blue" | "green" | "purple" | "indigo";

  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
  } satisfies Record<StatColor, string>;

  const iconColors = {
    blue: "text-blue-100",
    green: "text-green-100",
    purple: "text-purple-100",
    indigo: "text-indigo-100",
  } satisfies Record<StatColor, string>;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "p-4 sm:p-6 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/20 w-full",
        colorClasses[color],
      )}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <Icon className={clsx("w-5 h-5 sm:w-6 sm:h-6", iconColors[color])} />
      </div>
      <h3 className="text-white font-semibold text-base sm:text-lg mb-1 sm:mb-2">
        {title}
      </h3>
      <p className="text-white/80 text-sm">{description}</p>
    </button>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: ComponentType<{ className?: string }>;
}> = ({ title, value, change, trend = "neutral", icon: Icon }) => {
  type Trend = "up" | "down" | "neutral";
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-slate-400",
  } satisfies Record<Trend, string>;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
        </div>
        {change && (
          <span
            className={clsx(
              "text-xs sm:text-sm font-medium",
              trendColors[trend],
            )}
          >
            {change}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-xs sm:text-sm font-medium mb-1">
        {title}
      </h3>
      <p className="text-white text-xl sm:text-2xl font-bold">{value}</p>
    </div>
  );
};

const ActivityItem: React.FC<{
  title: string;
  time: string;
  type: "donation" | "campaign" | "alert";
}> = ({ title, time, type }) => {
  type ActivityType = "donation" | "campaign" | "alert";

  const typeIcons = {
    donation: <DollarSign className="w-4 h-4 text-green-400" />,
    campaign: <Target className="w-4 h-4 text-blue-400" />,
    alert: <AlertCircle className="w-4 h-4 text-yellow-400" />,
  } satisfies Record<ActivityType, React.ReactElement>;

  const typeBg = {
    donation: "bg-green-400/10",
    campaign: "bg-blue-400/10",
    alert: "bg-yellow-400/10",
  } satisfies Record<ActivityType, string>;

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-slate-800/30 rounded-lg transition-colors">
      <div className={clsx("p-2 rounded-lg flex-shrink-0", typeBg[type])}>
        {typeIcons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium leading-tight">{title}</p>
        <p className="text-slate-400 text-xs mt-1">{time}</p>
      </div>
    </div>
  );
};

/* ---------- Panel ---------- */

interface DashboardPanelProps {
  totalDonors?: number;
  totalRevenue?: number;
  activeCampaigns?: number;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({
  totalDonors = 1247,
  totalRevenue = 127500,
  activeCampaigns = 4,
}) => {
  const { user } = useAuth();
  const { setActiveView } = useUI();

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return null;
  }

  // Mock data for recent activity
  const recentActivity = [
    {
      title: "New donation: $500 from John Smith",
      time: "2 minutes ago",
      type: "donation" as const,
    },
    {
      title: "End of Year Campaign reached 75% of goal",
      time: "1 hour ago",
      type: "campaign" as const,
    },
    {
      title: "Holiday Fundraiser launched successfully",
      time: "3 hours ago",
      type: "campaign" as const,
    },
    {
      title: "New donation: $250 from Sarah Johnson",
      time: "5 hours ago",
      type: "donation" as const,
    },
    {
      title: "Weekly goal deadline approaching",
      time: "1 day ago",
      type: "alert" as const,
    },
  ];

  const quickActions: QuickActionCardProps[] = [
    {
      title: "Create Campaign",
      description: "Launch a new fundraising campaign",
      icon: Plus,
      color: "green",
      onClick: () => setActiveView("campaigns"),
    },
    {
      title: "View Analytics",
      description: "See performance insights",
      icon: BarChart3,
      color: "blue",
      onClick: () => setActiveView("analytics"),
    },
    {
      title: "Manage Donors",
      description: "View and organize donor data",
      icon: Users,
      color: "purple",
      onClick: () => setActiveView("donors"),
    },
    {
      title: "Schedule Outreach",
      description: "Plan communication campaigns",
      icon: Calendar,
      color: "indigo",
      onClick: () => setActiveView("campaigns"),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Welcome back, {user.name || "Dave"}! 👋
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Here's what's happening with your nonprofit today.
        </p>
      </div>

      {/* Key Metrics - Responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <MetricCard
          title="Total Donors"
          value={totalDonors.toLocaleString()}
          change="+12% this month"
          trend="up"
          icon={Users}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change="+8% this month"
          trend="up"
          icon={DollarSign}
        />
        <MetricCard
          title="Active Campaigns"
          value={activeCampaigns}
          change="2 ending soon"
          trend="neutral"
          icon={Target}
        />
        <MetricCard
          title="Monthly Goal"
          value="78%"
          change="+5% this week"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Main Grid - Stack on mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Quick Actions - Take full width on mobile */}
        <div className="xl:col-span-2">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {quickActions.map((action) => (
              <QuickActionCard key={action.title} {...action} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-400" />
              Recent Activity
            </h2>
          </div>
          <div className="space-y-1 sm:space-y-2">
            {recentActivity.map((item) => (
              <ActivityItem key={`${item.type}-${item.time}`} {...item} />
            ))}
          </div>
          <button className="w-full mt-3 sm:mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View all activity →
          </button>
        </div>
      </div>

      {/* Campaign Status - Responsive grid */}
      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-4">
          Campaign Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 p-3 sm:p-4 bg-green-600/10 border border-green-600/20 rounded-lg">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-green-400 font-medium text-sm sm:text-base truncate">
                Spring Fundraiser
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">
                Goal achieved: $25,000
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 sm:p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-blue-400 font-medium text-sm sm:text-base truncate">
                End of Year Campaign
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">
                Progress: 75% ($37,500)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 sm:p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-yellow-400 font-medium text-sm sm:text-base truncate">
                Holiday Giving
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">
                Ending in 12 days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;
