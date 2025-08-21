import {
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import React, { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";

import LiveCampaignDashboard from "../components/LiveCampaignDashboard";
import * as campaignService from "../services/campaignService";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color?: "blue" | "green" | "purple" | "indigo";
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
  };

  const iconColors = {
    blue: "text-blue-100",
    green: "text-green-100",
    purple: "text-purple-100",
    indigo: "text-indigo-100",
  };

  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-xl text-left transition-all duration-200 hover:scale-105 hover:shadow-lg ${
        colorClasses[color]
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-6 h-6 ${iconColors[color]}`} />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-white/80 text-sm">{description}</p>
    </button>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}> = ({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  loading = false,
}) => {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-slate-400",
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:scale-105 transition-transform duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        {change && !loading && (
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold">
        {loading ? (
          <div className="animate-pulse bg-slate-600 h-8 w-20 rounded"></div>
        ) : (
          value
        )}
      </p>
    </div>
  );
};

const ActivityItem: React.FC<{
  title: string;
  time: string;
  type: "donation" | "campaign" | "alert";
}> = ({ title, time, type }) => {
  const typeIcons = {
    donation: <DollarSign className="w-4 h-4 text-green-400" />,
    campaign: <Target className="w-4 h-4 text-blue-400" />,
    alert: <AlertCircle className="w-4 h-4 text-yellow-400" />,
  };

  const typeBg = {
    donation: "bg-green-400/10",
    campaign: "bg-blue-400/10",
    alert: "bg-yellow-400/10",
  };

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-slate-800/30 rounded-lg transition-colors">
      <div className={`p-2 rounded-lg ${typeBg[type]}`}>{typeIcons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{title}</p>
        <p className="text-slate-400 text-xs">{time}</p>
      </div>
    </div>
  );
};

interface DashboardPanelProps {
  totalDonors?: number;
  totalRevenue?: number;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({
  totalDonors = 1247,
  totalRevenue = 127500,
}) => {
  const { user } = useAuth();
  const [campaignStats, setCampaignStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real campaign data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [stats, campaignList] = await Promise.all([
          campaignService.getCampaignStats(),
          campaignService.getAllCampaigns(),
        ]);
        setCampaignStats(stats);
        setCampaigns(campaignList.slice(0, 3)); // Get top 3 campaigns for status
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      void loadData();
    }
  }, [user]);

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

  const quickActions = [
    {
      title: "Create Campaign",
      description: "Launch a new fundraising campaign",
      icon: Target,
      color: "green" as const,
      onClick: () => console.log("Navigate to campaign creation"),
    },
    {
      title: "View Analytics",
      description: "See performance insights",
      icon: BarChart3,
      color: "blue" as const,
      onClick: () => console.log("Navigate to analytics"),
    },
    {
      title: "Manage Donors",
      description: "View and organize donor data",
      icon: Users,
      color: "purple" as const,
      onClick: () => console.log("Navigate to donors"),
    },
    {
      title: "Schedule Outreach",
      description: "Plan communication campaigns",
      icon: Calendar,
      color: "indigo" as const,
      onClick: () => console.log("Navigate to messaging"),
    },
  ];

  const getCampaignStatusIcon = (campaign: any) => {
    if (campaign.progress >= 100) return CheckCircle;
    if (campaign.daysLeft <= 7) return Clock;
    return Target;
  };

  const getCampaignStatusColor = (campaign: any) => {
    if (campaign.progress >= 100) return "text-green-400";
    if (campaign.daysLeft <= 7) return "text-yellow-400";
    return "text-blue-400";
  };

  const getCampaignStatusBg = (campaign: any) => {
    if (campaign.progress >= 100) return "bg-green-600/10 border-green-600/20";
    if (campaign.daysLeft <= 7) return "bg-yellow-600/10 border-yellow-600/20";
    return "bg-blue-600/10 border-blue-600/20";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, Dave!
        </h1>
        <p className="text-slate-400">
          Here's what's happening with your nonprofit today.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Donors"
          value={totalDonors.toLocaleString()}
          change="+12% this month"
          trend="up"
          icon={Users}
          loading={loading}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change="+8% this month"
          trend="up"
          icon={DollarSign}
          loading={loading}
        />
        <MetricCard
          title="Active Campaigns"
          value={campaignStats?.activeCampaigns || 0}
          change={
            campaignStats?.activeCampaigns > 0
              ? "2 ending soon"
              : "No active campaigns"
          }
          trend="neutral"
          icon={Target}
          loading={loading}
        />
        <MetricCard
          title="Total Raised"
          value={
            campaignStats?.totalRaised
              ? `$${campaignStats.totalRaised.toLocaleString()}`
              : "$0"
          }
          change={
            campaignStats?.successRate
              ? `${campaignStats.successRate}% success rate`
              : "No data"
          }
          trend="up"
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      {/* Live Campaign Tracking Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Live Campaign Tracking
          </h2>
          <p className="text-slate-400">
            Real-time progress updates and milestone notifications for all
            active campaigns.
          </p>
        </div>

        <LiveCampaignDashboard />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              Recent Activity
            </h2>
          </div>
          <div className="space-y-2">
            {recentActivity.map((item, index) => (
              <ActivityItem key={index} {...item} />
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View all activity →
          </button>
        </div>
      </div>

      {/* Campaign Status */}
      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Campaign Status
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-slate-700/50 rounded-lg h-20"
              ></div>
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.map((campaign) => {
              const StatusIcon = getCampaignStatusIcon(campaign);
              return (
                <div
                  key={campaign.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border ${getCampaignStatusBg(campaign)}`}
                >
                  <StatusIcon
                    className={`w-5 h-5 ${getCampaignStatusColor(campaign)}`}
                  />
                  <div>
                    <p
                      className={`font-medium ${getCampaignStatusColor(campaign)}`}
                    >
                      {campaign.name}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {campaign.progress >= 100
                        ? `Goal achieved: $${campaign.raised.toLocaleString()}`
                        : `Progress: ${campaign.progress}% ($${campaign.raised.toLocaleString()})`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">
              No campaigns found. Create your first campaign to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPanel;
