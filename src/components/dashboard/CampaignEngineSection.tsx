/**
 * Campaign Engine Section
 *
 * Primary dashboard panel - Track15 campaign creation and management
 * Dominant panel in three-panel layout
 */

import { Plus, Calendar, TrendingUp, Target, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "@/components/ui-kit/Button";
import { SectionBlock } from "@/components/ui-kit/SectionBlock";
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
      <SectionBlock
        title="Campaign Engine"
        description="Track15-powered campaign creation and management"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                navigate(`/clients/${clientId}/campaigns/new/track15`)
              }
            >
              <Sparkles className="w-4 h-4 mr-2" />
              New Track15
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/clients/${clientId}/campaigns/new`)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Standard
            </Button>
          </div>
        }
      >
        {/* Active Campaigns */}
        <div className="grid gap-4">
          {activeCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="p-6 border border-[var(--nx-border)] rounded-[var(--nx-radius-md)] hover:border-[var(--nx-blue-deep)] hover:shadow-[var(--nx-shadow-md)] transition-all cursor-pointer"
              onClick={() =>
                navigate(`/clients/${clientId}/campaigns/${campaign.id}`)
              }
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[18px] font-semibold text-[var(--nx-charcoal)]">
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
                  <p className="text-[13px] text-[var(--nx-text-muted)]">
                    {campaign.season.toUpperCase()} Season
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[24px] font-bold text-[var(--nx-blue-deep)]">
                    ${(campaign.raised / 1000).toFixed(1)}k
                  </div>
                  <div className="text-[13px] text-[var(--nx-text-muted)]">
                    of ${(campaign.goal / 1000).toFixed(0)}k goal
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-[var(--nx-bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--nx-blue-deep)] rounded-full transition-all"
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-[var(--nx-text-muted)]">
                  <span>{campaign.progress}% complete</span>
                  <span>{campaign.daysRemaining} days remaining</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--nx-text-muted)]" />
                  <span className="text-[13px] text-[var(--nx-text-muted)]">
                    {campaign.daysRemaining}d left
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[var(--nx-text-muted)]" />
                  <span className="text-[13px] text-[var(--nx-text-muted)]">
                    {campaign.progress}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[var(--nx-text-muted)]" />
                  <span className="text-[13px] text-[var(--nx-text-muted)]">
                    ${((campaign.goal - campaign.raised) / 1000).toFixed(1)}k to
                    go
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionBlock>

      {/* Quick Actions - Track15 Templates */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-[var(--nx-radius-md)] p-6 border border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-[18px] font-semibold text-[var(--nx-charcoal)]">
            Track15 Quick Start
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="p-4 bg-white rounded-[var(--nx-radius-sm)] border border-[var(--nx-border)] hover:border-purple-300 hover:shadow-[var(--nx-shadow-sm)] transition-all text-left"
          >
            <div className="text-[13px] font-medium text-[var(--nx-charcoal)] mb-1">
              Spring Cultivation
            </div>
            <div className="text-xs text-[var(--nx-text-muted)]">
              Donor renewal sequence
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="p-4 bg-white rounded-[var(--nx-radius-sm)] border border-[var(--nx-border)] hover:border-purple-300 hover:shadow-[var(--nx-shadow-sm)] transition-all text-left"
          >
            <div className="text-[13px] font-medium text-[var(--nx-charcoal)] mb-1">
              Summer Emergency
            </div>
            <div className="text-xs text-[var(--nx-text-muted)]">
              Urgent appeal template
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="p-4 bg-white rounded-[var(--nx-radius-sm)] border border-[var(--nx-border)] hover:border-purple-300 hover:shadow-[var(--nx-shadow-sm)] transition-all text-left"
          >
            <div className="text-[13px] font-medium text-[var(--nx-charcoal)] mb-1">
              Year-End Appeal
            </div>
            <div className="text-xs text-[var(--nx-text-muted)]">
              Winter giving campaign
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="p-4 bg-white rounded-[var(--nx-radius-sm)] border border-[var(--nx-border)] hover:border-purple-300 hover:shadow-[var(--nx-shadow-sm)] transition-all text-left"
          >
            <div className="text-[13px] font-medium text-[var(--nx-charcoal)] mb-1">
              Custom Track15
            </div>
            <div className="text-xs text-[var(--nx-text-muted)]">
              Build from scratch
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
