// src/components/LiveCampaignProgress.tsx
import { TrendingUp, Users, Target, Calendar, Sparkles } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

import { useCampaignUpdates, useMilestoneAlerts } from "../hooks/useWebSocket";

interface Campaign {
  id: string;
  name: string;
  goal: number;
  raised: number;
  donorCount: number;
  daysLeft: number;
  status: string;
}

interface LiveCampaignProgressProps {
  campaign: Campaign;
  showRecentActivity?: boolean;
  showMilestones?: boolean;
  compact?: boolean;
  className?: string;
}

interface RecentActivity {
  id: string;
  type: "donation" | "milestone" | "goal_reached";
  amount?: number;
  message: string;
  timestamp: number;
}

export const LiveCampaignProgress: React.FC<LiveCampaignProgressProps> = ({
  campaign: initialCampaign,
  showRecentActivity = true,
  showMilestones = true,
  compact = false,
  className = "",
}) => {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time updates for this campaign
  const { updates } = useCampaignUpdates(campaign.id);
  const { alerts } = useMilestoneAlerts();

  // Handle campaign updates
  useEffect(() => {
    updates.forEach((update) => {
      if (update.campaignId === campaign.id) {
        setCampaign((prev) => {
          const newCampaign = { ...prev };

          // Update the specific field
          switch (update.field) {
            case "raised":
              newCampaign.raised =
                typeof update.value === "number" ? update.value : prev.raised;
              break;
            case "donors":
              newCampaign.donorCount =
                typeof update.value === "number"
                  ? update.value
                  : prev.donorCount;
              break;
            case "goal":
              newCampaign.goal =
                typeof update.value === "number" ? update.value : prev.goal;
              break;
          }

          return newCampaign;
        });

        // Add to recent activity
        if (update.field === "raised" && typeof update.value === "number") {
          const activity: RecentActivity = {
            id: Math.random().toString(36).substr(2, 9),
            type: "donation",
            amount: update.value,
            message: `New donation of $${update.value.toLocaleString()}`,
            timestamp: Date.now(),
          };

          setRecentActivity((prev) => [activity, ...prev].slice(0, 10));
        }

        // Trigger animation
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }
    });
  }, [updates, campaign.id]);

  // Handle milestone alerts
  useEffect(() => {
    alerts.forEach((alert) => {
      if (alert.campaignId === campaign.id && showMilestones) {
        // Add milestone to recent activity
        const activity: RecentActivity = {
          id: Math.random().toString(36).substr(2, 9),
          type:
            alert.milestoneType === "goal_reached"
              ? "goal_reached"
              : "milestone",
          message: alert.message,
          timestamp: Date.now(),
        };

        setRecentActivity((prev) => [activity, ...prev].slice(0, 10));

        // Show celebration for major milestones
        if (alert.milestoneType === "goal_reached" || alert.value % 25 === 0) {
          setCelebrationVisible(true);
          setTimeout(() => setCelebrationVisible(false), 3000);
        }
      }
    });
  }, [alerts, campaign.id, showMilestones]);

  // Calculate progress
  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const progressColor =
    progress >= 100
      ? "bg-green-500"
      : progress >= 75
        ? "bg-blue-500"
        : "bg-brand-primary";

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format time ago
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        {/* Celebration Effect */}
        {celebrationVisible && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="animate-bounce">
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        )}

        <div className="space-y-2">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">
              {campaign.name}
            </span>
            <span className="text-xs text-text-secondary">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
              <div
                ref={progressBarRef}
                className={`h-full transition-all duration-500 ease-out ${progressColor} ${
                  isAnimating ? "animate-pulse" : ""
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between text-xs text-text-secondary">
            <span>{formatCurrency(campaign.raised)} raised</span>
            <span>{formatCurrency(campaign.goal)} goal</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-surface border border-border rounded-lg p-6 ${className}`}
    >
      {/* Celebration Effect */}
      {celebrationVisible && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="animate-bounce">
            <Sparkles className="h-12 w-12 text-yellow-500" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 to-orange-100/20 rounded-lg animate-pulse" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {campaign.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {campaign.daysLeft} days left
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {campaign.donorCount} donors
            </span>
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-2xl font-bold ${isAnimating ? "animate-pulse text-green-600" : "text-text-primary"}`}
          >
            {Math.round(progress)}%
          </div>
          <div className="text-xs text-text-secondary">complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-secondary">Progress</span>
          <span className="text-sm font-medium text-text-primary">
            {formatCurrency(campaign.raised)} / {formatCurrency(campaign.goal)}
          </span>
        </div>

        <div className="relative">
          <div className="h-3 bg-surface-muted rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              className={`h-full transition-all duration-700 ease-out ${progressColor} ${
                isAnimating ? "animate-pulse" : ""
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Milestone markers */}
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className="absolute top-0 h-3 w-0.5 bg-white/60"
              style={{ left: `${milestone}%` }}
            />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div
            className={`text-lg font-semibold ${isAnimating ? "animate-pulse text-green-600" : "text-text-primary"}`}
          >
            {formatCurrency(campaign.raised)}
          </div>
          <div className="text-xs text-text-secondary">Raised</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-text-primary">
            {campaign.donorCount}
          </div>
          <div className="text-xs text-text-secondary">Donors</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-text-primary">
            {formatCurrency(campaign.raised / campaign.donorCount || 0)}
          </div>
          <div className="text-xs text-text-secondary">Avg Gift</div>
        </div>
      </div>

      {/* Recent Activity */}
      {showRecentActivity && recentActivity.length > 0 && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">
              Recent Activity
            </span>
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentActivity.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className={`flex items-center justify-between p-2 rounded text-sm ${
                  activity.type === "goal_reached"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : activity.type === "milestone"
                      ? "bg-blue-50 text-blue-800 border border-blue-200"
                      : "bg-surface-muted text-text-secondary"
                }`}
              >
                <span className="flex items-center gap-2">
                  {activity.type === "goal_reached" && (
                    <Target className="h-3 w-3" />
                  )}
                  {activity.type === "milestone" && (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {activity.type === "donation" && (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  {activity.message}
                </span>
                <span className="text-xs opacity-60">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveCampaignProgress;
