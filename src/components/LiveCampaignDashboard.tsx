// src/components/LiveCampaignDashboard.tsx
import { Zap, Play, Pause, RotateCw, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

import LiveCampaignProgress from "./LiveCampaignProgress";
import { useNotifications } from "../hooks/useWebSocket";

interface Campaign {
  id: string;
  name: string;
  goal: number;
  raised: number;
  donorCount: number;
  daysLeft: number;
  status: string;
}

interface LiveCampaignDashboardProps {
  campaigns?: Campaign[];
  className?: string;
}

// Mock campaigns for development
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "campaign_1",
    name: "End of Year Giving Campaign",
    goal: 50000,
    raised: 15000,
    donorCount: 125,
    daysLeft: 45,
    status: "Active",
  },
  {
    id: "campaign_2",
    name: "Emergency Relief Fund",
    goal: 25000,
    raised: 18500,
    donorCount: 89,
    daysLeft: 12,
    status: "Active",
  },
  {
    id: "campaign_3",
    name: "Education Program Support",
    goal: 75000,
    raised: 32000,
    donorCount: 210,
    daysLeft: 67,
    status: "Active",
  },
  {
    id: "campaign_4",
    name: "Building Renovation",
    goal: 100000,
    raised: 95000,
    donorCount: 156,
    daysLeft: 8,
    status: "Active",
  },
];

export const LiveCampaignDashboard: React.FC<LiveCampaignDashboardProps> = ({
  campaigns = MOCK_CAMPAIGNS,
  className = "",
}) => {
  const [isLiveMode, _setIsLiveMode] = useState(true);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const { notifications, unreadCount } = useNotifications();

  // Development simulation controls
  const startSimulation = () => {
    if (typeof window !== "undefined" && (window as any).mockServer) {
      campaigns.forEach((campaign) => {
        (window as any).mockServer.startCampaignSimulation(campaign.id, 3000);
      });
      setSimulationRunning(true);
    }
  };

  const stopSimulation = () => {
    if (typeof window !== "undefined" && (window as any).mockServer) {
      campaigns.forEach((campaign) => {
        (window as any).mockServer.stopCampaignSimulation(campaign.id);
      });
      setSimulationRunning(false);
    }
  };

  const simulateRandomUpdate = () => {
    if (typeof window !== "undefined" && (window as any).mockServer) {
      const randomCampaign =
        campaigns[Math.floor(Math.random() * campaigns.length)];
      const amount = Math.floor(Math.random() * 1000) + 50;
      (window as any).mockServer.simulateCampaignUpdate(
        randomCampaign.id,
        "raised",
        amount,
      );
    }
  };

  // Calculate total stats
  const totalStats = campaigns.reduce(
    (acc, campaign) => ({
      raised: acc.raised + campaign.raised,
      goal: acc.goal + campaign.goal,
      donors: acc.donors + campaign.donorCount,
    }),
    { raised: 0, goal: 0, donors: 0 },
  );

  const overallProgress = (totalStats.raised / totalStats.goal) * 100;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap
                className={`h-5 w-5 ${isLiveMode ? "text-green-500" : "text-gray-400"}`}
              />
              <h2 className="text-xl font-semibold text-text-primary">
                Live Campaign Dashboard
              </h2>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} alerts
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompactView(!compactView)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-border rounded-lg hover:bg-surface-muted transition-colors"
            >
              {compactView ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              {compactView ? "Detailed" : "Compact"}
            </button>

            {import.meta.env.DEV && (
              <>
                <button
                  onClick={simulateRandomUpdate}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-border rounded-lg hover:bg-surface-muted transition-colors"
                >
                  <RotateCw className="h-4 w-4" />
                  Simulate
                </button>

                <button
                  onClick={simulationRunning ? stopSimulation : startSimulation}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${
                    simulationRunning
                      ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  }`}
                >
                  {simulationRunning ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Stop Live Demo
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Live Demo
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-muted rounded-lg p-4">
            <div className="text-2xl font-bold text-text-primary">
              ${totalStats.raised.toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary">Total Raised</div>
          </div>

          <div className="bg-surface-muted rounded-lg p-4">
            <div className="text-2xl font-bold text-text-primary">
              ${totalStats.goal.toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary">Total Goal</div>
          </div>

          <div className="bg-surface-muted rounded-lg p-4">
            <div className="text-2xl font-bold text-text-primary">
              {Math.round(overallProgress)}%
            </div>
            <div className="text-sm text-text-secondary">Progress</div>
          </div>

          <div className="bg-surface-muted rounded-lg p-4">
            <div className="text-2xl font-bold text-text-primary">
              {totalStats.donors}
            </div>
            <div className="text-sm text-text-secondary">Total Donors</div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary">
              Overall Campaign Progress
            </span>
            <span className="text-sm font-medium text-text-primary">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-700 ease-out"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Live Status Indicator */}
      {isLiveMode && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          Live updates enabled - campaigns will update in real-time
          {simulationRunning && (
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
              Demo running
            </span>
          )}
        </div>
      )}

      {/* Campaign Grid */}
      <div
        className={`grid gap-6 ${
          compactView
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 lg:grid-cols-2"
        }`}
      >
        {campaigns.map((campaign) => (
          <LiveCampaignProgress
            key={campaign.id}
            campaign={campaign}
            compact={compactView}
            showRecentActivity={!compactView}
            showMilestones={isLiveMode}
            className="hover:shadow-lg transition-shadow"
          />
        ))}
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Recent Alerts ({notifications.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.read
                    ? "bg-surface-muted border-border opacity-60"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm text-text-primary">
                      {notification.title}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {notification.message}
                    </div>
                  </div>
                  <div className="text-xs text-text-muted">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Development Helper */}
      {import.meta.env.DEV && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="text-sm font-medium text-slate-700 mb-2">
            🚀 Development Tools
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <div>
              • Click "Start Live Demo" to simulate continuous donations
            </div>
            <div>• Use "Simulate" for one-time donation events</div>
            <div>
              • Try console commands:{" "}
              <code>
                mockServer.simulateMilestone("campaign_1", "goal_reached", 100)
              </code>
            </div>
            <div>• Switch between compact and detailed views</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveCampaignDashboard;
