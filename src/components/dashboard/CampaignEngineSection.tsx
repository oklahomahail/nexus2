/**
 * Campaign Engine Section
 *
 * Primary dashboard panel - Track15 campaign creation and management
 * Dominant panel in three-panel layout
 */

import { Plus, Calendar, TrendingUp, Target, Sparkles } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

import { useClient } from "@/context/ClientContext";

export default function CampaignEngineSection() {
  const navigate = useNavigate();
  const { currentClient } = useClient();
  const clientId = currentClient?.id;

  // Mock active campaigns - replace with real data
  const activeCampaigns = [
    {
      id: "1",
      name: "Spring Cultivation 2025",
      season: "spring",
      status: "active",
      progress: 68,
      raised: 45200,
      goal: 75000,
      daysRemaining: 12,
    },
    {
      id: "2",
      name: "End of Year Appeal",
      season: "eoy",
      status: "planning",
      progress: 0,
      raised: 0,
      goal: 150000,
      daysRemaining: 45,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Campaign Engine
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track15-powered campaign creation and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            New Track15 Campaign
          </button>
          <button
            onClick={() => navigate(`/clients/${clientId}/campaigns/new`)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Standard Campaign
          </button>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="grid gap-4">
        {activeCampaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/${campaign.id}`)
            }
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {campaign.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      campaign.status === "active"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {campaign.season.toUpperCase()} Season
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${(campaign.raised / 1000).toFixed(1)}k
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  of ${(campaign.goal / 1000).toFixed(0)}k goal
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-600 dark:text-gray-400">
                <span>{campaign.progress}% complete</span>
                <span>{campaign.daysRemaining} days remaining</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {campaign.daysRemaining}d left
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {campaign.progress}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ${((campaign.goal - campaign.raised) / 1000).toFixed(1)}k to
                  go
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions - Track15 Templates */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Track15 Quick Start
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors text-left"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Spring Cultivation
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Donor renewal sequence
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors text-left"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Summer Emergency
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Urgent appeal template
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors text-left"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Year-End Appeal
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Winter giving campaign
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors text-left"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Custom Track15
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Build from scratch
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
