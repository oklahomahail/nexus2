/**
 * Knowledge Base Section
 *
 * Quick access to knowledge base from dashboard
 * Compact summary view
 */

import {
  Library,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useClient } from "@/context/ClientContext";

export default function KnowledgeBaseSection() {
  const navigate = useNavigate();
  const { currentClient } = useClient();
  const clientId = currentClient?.id;

  const kbStats = {
    brandProfile: true,
    voiceGuidelines: true,
    messagingPillars: 4,
    donorStories: 12,
    assets: 23,
    sops: 5,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Library className="w-5 h-5 text-[rgb(var(--nexus-blue-600))]" />
          <h2 className="text-xl font-bold text-[rgb(var(--nexus-slate-900))] tracking-tight">
            Knowledge Base
          </h2>
        </div>
        <button
          onClick={() => navigate(`/clients/${clientId}/knowledge`)}
          className="flex items-center gap-1 text-sm text-[rgb(var(--nexus-blue-600))] hover:text-[rgb(var(--nexus-blue-700))] font-medium"
        >
          Open
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-[rgb(var(--nexus-slate-200))] shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs font-medium text-[rgb(var(--nexus-slate-700))]">
              Brand Profile
            </span>
          </div>
          <div className="text-sm font-semibold text-[rgb(var(--nexus-slate-900))]">
            {kbStats.brandProfile ? "Complete" : "Not Set"}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[rgb(var(--nexus-slate-200))] shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-3.5 h-3.5 text-[rgb(var(--nexus-blue-600))]" />
            <span className="text-xs font-medium text-[rgb(var(--nexus-slate-700))]">
              Voice & Tone
            </span>
          </div>
          <div className="text-sm font-semibold text-[rgb(var(--nexus-slate-900))]">
            {kbStats.voiceGuidelines ? "Defined" : "Pending"}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[rgb(var(--nexus-slate-200))] shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3.5 h-3.5 text-[rgb(var(--nexus-green-500))]" />
            <span className="text-xs font-medium text-[rgb(var(--nexus-slate-700))]">
              Messaging Pillars
            </span>
          </div>
          <div className="text-sm font-semibold text-[rgb(var(--nexus-slate-900))]">
            {kbStats.messagingPillars} pillars
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[rgb(var(--nexus-slate-200))] shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Library className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-xs font-medium text-[rgb(var(--nexus-slate-700))]">
              Donor Stories
            </span>
          </div>
          <div className="text-sm font-semibold text-[rgb(var(--nexus-slate-900))]">
            {kbStats.donorStories} stories
          </div>
        </div>
      </div>

      {/* Content Summary */}
      <div className="bg-white rounded-2xl p-5 border border-[rgb(var(--nexus-slate-200))] shadow-sm">
        <h3 className="text-sm font-semibold text-[rgb(var(--nexus-slate-900))] mb-3">
          Quick Access
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => navigate(`/clients/${clientId}/knowledge?tab=voice`)}
            className="w-full text-left p-3 rounded-xl hover:bg-[rgb(var(--nexus-slate-100))] transition-colors"
          >
            <div className="text-sm text-[rgb(var(--nexus-slate-900))] font-medium">
              Voice & Tone
            </div>
            <div className="text-xs text-[rgb(var(--nexus-slate-700))]">
              Communication guidelines
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/knowledge?tab=messaging`)
            }
            className="w-full text-left p-3 rounded-xl hover:bg-[rgb(var(--nexus-slate-100))] transition-colors"
          >
            <div className="text-sm text-[rgb(var(--nexus-slate-900))] font-medium">
              Messaging Pillars
            </div>
            <div className="text-xs text-[rgb(var(--nexus-slate-700))]">
              Core narrative themes
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/knowledge?tab=narratives`)
            }
            className="w-full text-left p-3 rounded-xl hover:bg-[rgb(var(--nexus-slate-100))] transition-colors"
          >
            <div className="text-sm text-[rgb(var(--nexus-slate-900))] font-medium">
              Donor Narratives
            </div>
            <div className="text-xs text-[rgb(var(--nexus-slate-700))]">
              {kbStats.donorStories} impact stories
            </div>
          </button>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-[rgb(var(--nexus-slate-900))] mb-1">
              Power Your Campaigns
            </h4>
            <p className="text-xs text-[rgb(var(--nexus-slate-700))] mb-2">
              Your knowledge base feeds AI campaign generation with authentic
              brand voice and proven narratives.
            </p>
            <button
              onClick={() => navigate(`/clients/${clientId}/knowledge`)}
              className="text-xs font-medium text-purple-600 hover:text-purple-700"
            >
              Build Knowledge Base →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
