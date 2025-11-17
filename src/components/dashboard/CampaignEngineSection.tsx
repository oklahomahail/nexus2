/**
 * Campaign Engine Section
 *
 * Primary dashboard panel - Track15 campaign creation and management
 * Dominant panel in three-panel layout
 */

import { Plus, Calendar, TrendingUp, Target, Sparkles } from "lucide-react";
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
          <h2 className="text-2xl font-bold text-[rgb(var(--nexus-slate-900))] tracking-tight">
            Campaign Engine
          </h2>
          <p className="text-sm text-[rgb(var(--nexus-slate-700))] mt-1">
            Track15-powered campaign creation and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
          >
            <Sparkles className="w-4 h-4" />
            New Track15 Campaign
          </button>
          <button
            onClick={() => navigate(`/clients/${clientId}/campaigns/new`)}
            className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--nexus-blue-600))] text-white rounded-xl hover:bg-[rgb(var(--nexus-blue-700))] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(var(--nexus-blue-600))] focus:ring-offset-2"
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
            className="bg-white rounded-2xl p-6 border border-[rgb(var(--nexus-slate-200))] hover:border-[rgb(var(--nexus-blue-600))] hover:shadow-md transition-all cursor-pointer shadow-sm"
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/${campaign.id}`)
            }
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-[rgb(var(--nexus-slate-900))]">
                    {campaign.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      campaign.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <p className="text-sm text-[rgb(var(--nexus-slate-700))]">
                  {campaign.season.toUpperCase()} Season
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[rgb(var(--nexus-blue-600))]">
                  ${(campaign.raised / 1000).toFixed(1)}k
                </div>
                <div className="text-sm text-[rgb(var(--nexus-slate-700))]">
                  of ${(campaign.goal / 1000).toFixed(0)}k goal
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-[rgb(var(--nexus-slate-200))] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[rgb(var(--nexus-blue-600))] rounded-full transition-all"
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-[rgb(var(--nexus-slate-700))]">
                <span>{campaign.progress}% complete</span>
                <span>{campaign.daysRemaining} days remaining</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[rgb(var(--nexus-slate-700))]" />
                <span className="text-sm text-[rgb(var(--nexus-slate-700))]">
                  {campaign.daysRemaining}d left
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[rgb(var(--nexus-slate-700))]" />
                <span className="text-sm text-[rgb(var(--nexus-slate-700))]">
                  {campaign.progress}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[rgb(var(--nexus-slate-700))]" />
                <span className="text-sm text-[rgb(var(--nexus-slate-700))]">
                  ${((campaign.goal - campaign.raised) / 1000).toFixed(1)}k to
                  go
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions - Track15 Templates */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-[rgb(var(--nexus-slate-900))]">
            Track15 Quick Start
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="p-4 bg-white rounded-xl border border-[rgb(var(--nexus-slate-200))] hover:border-purple-300 hover:shadow-sm transition-all text-left"
          >
            <div className="text-sm font-medium text-[rgb(var(--nexus-slate-900))] mb-1">
              Spring Cultivation
            </div>
            <div className="text-xs text-[rgb(var(--nexus-slate-700))]">
              Donor renewal sequence
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="p-4 bg-white rounded-xl border border-[rgb(var(--nexus-slate-200))] hover:border-purple-300 hover:shadow-sm transition-all text-left"
          >
            <div className="text-sm font-medium text-[rgb(var(--nexus-slate-900))] mb-1">
              Summer Emergency
            </div>
            <div className="text-xs text-[rgb(var(--nexus-slate-700))]">
              Urgent appeal template
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="p-4 bg-white rounded-xl border border-[rgb(var(--nexus-slate-200))] hover:border-purple-300 hover:shadow-sm transition-all text-left"
          >
            <div className="text-sm font-medium text-[rgb(var(--nexus-slate-900))] mb-1">
              Year-End Appeal
            </div>
            <div className="text-xs text-[rgb(var(--nexus-slate-700))]">
              Winter giving campaign
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="p-4 bg-white rounded-xl border border-[rgb(var(--nexus-slate-200))] hover:border-purple-300 hover:shadow-sm transition-all text-left"
          >
            <div className="text-sm font-medium text-[rgb(var(--nexus-slate-900))] mb-1">
              Custom Track15
            </div>
            <div className="text-xs text-[rgb(var(--nexus-slate-700))]">
              Build from scratch
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
