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
          <Library className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Knowledge Base
          </h2>
        </div>
        <button
          onClick={() => navigate(`/clients/${clientId}/knowledge`)}
          className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          Open
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Brand Profile
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {kbStats.brandProfile ? "Complete" : "Not Set"}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Voice & Tone
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {kbStats.voiceGuidelines ? "Defined" : "Pending"}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Messaging Pillars
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {kbStats.messagingPillars} pillars
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Library className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Donor Stories
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {kbStats.donorStories} stories
          </div>
        </div>
      </div>

      {/* Content Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Quick Access
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => navigate(`/clients/${clientId}/knowledge?tab=voice`)}
            className="w-full text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-sm text-gray-900 dark:text-white">
              Voice & Tone
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Communication guidelines
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/knowledge?tab=messaging`)
            }
            className="w-full text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-sm text-gray-900 dark:text-white">
              Messaging Pillars
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Core narrative themes
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/knowledge?tab=narratives`)
            }
            className="w-full text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-sm text-gray-900 dark:text-white">
              Donor Narratives
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {kbStats.donorStories} impact stories
            </div>
          </button>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Power Your Campaigns
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Your knowledge base feeds AI campaign generation with authentic
              brand voice and proven narratives.
            </p>
            <button
              onClick={() => navigate(`/clients/${clientId}/knowledge`)}
              className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              Build Knowledge Base →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
