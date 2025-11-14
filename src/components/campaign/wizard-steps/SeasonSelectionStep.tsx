/**
 * Season Selection Step
 *
 * First step in Track15 campaign workflow
 * Allows selection from 5 campaign seasons with metadata
 */

import React from "react";
import { Calendar, Target, Heart, Zap, Sparkles } from "lucide-react";
import { CampaignSeason, CAMPAIGN_SEASONS } from "@/types/track15.types";

interface SeasonSelectionStepProps {
  selectedSeason: CampaignSeason | null;
  onSeasonSelect: (season: CampaignSeason) => void;
}

const SEASON_ICONS: Record<CampaignSeason, React.ReactNode> = {
  spring: <Sparkles className="w-8 h-8" />,
  summer: <Target className="w-8 h-8" />,
  ntxgd: <Heart className="w-8 h-8" />,
  eoy: <Zap className="w-8 h-8" />,
  custom: <Calendar className="w-8 h-8" />,
};

const SEASON_COLORS: Record<
  CampaignSeason,
  { bg: string; border: string; text: string; icon: string }
> = {
  spring: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-900 dark:text-green-100",
    icon: "text-green-600 dark:text-green-400",
  },
  summer: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-900 dark:text-yellow-100",
    icon: "text-yellow-600 dark:text-yellow-400",
  },
  ntxgd: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-900 dark:text-red-100",
    icon: "text-red-600 dark:text-red-400",
  },
  eoy: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-900 dark:text-purple-100",
    icon: "text-purple-600 dark:text-purple-400",
  },
  custom: {
    bg: "bg-gray-50 dark:bg-gray-800",
    border: "border-gray-200 dark:border-gray-700",
    text: "text-gray-900 dark:text-gray-100",
    icon: "text-gray-600 dark:text-gray-400",
  },
};

export default function SeasonSelectionStep({
  selectedSeason,
  onSeasonSelect,
}: SeasonSelectionStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Campaign Season
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Each season follows Track15's proven fundraising methodology
        </p>
      </div>

      {/* Season Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(CAMPAIGN_SEASONS).map(([key, season]) => {
          const seasonKey = key as CampaignSeason;
          const colors = SEASON_COLORS[seasonKey];
          const isSelected = selectedSeason === seasonKey;

          return (
            <button
              key={seasonKey}
              onClick={() => onSeasonSelect(seasonKey)}
              className={`
                relative p-6 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? `${colors.border} ${colors.bg} ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-900`
                    : `border-gray-200 dark:border-gray-700 hover:${colors.border} hover:${colors.bg}`
                }
              `}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={`mb-4 ${colors.icon}`}>
                {SEASON_ICONS[seasonKey]}
              </div>

              {/* Title */}
              <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>
                {season.name}
              </h3>

              {/* Timing */}
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {season.timing}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {season.description}
              </p>

              {/* Focus */}
              <div className={`text-xs font-medium ${colors.text}`}>
                Focus: {season.focus}
              </div>
            </button>
          );
        })}
      </div>

      {/* Season Details Panel */}
      {selectedSeason && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {CAMPAIGN_SEASONS[selectedSeason].name} Campaign Strategy
          </h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>Timing:</strong> {CAMPAIGN_SEASONS[selectedSeason].timing}
            </p>
            <p>
              <strong>Focus:</strong> {CAMPAIGN_SEASONS[selectedSeason].focus}
            </p>
            <p>
              <strong>Default Duration:</strong>{" "}
              {CAMPAIGN_SEASONS[selectedSeason].defaultDuration} days
            </p>
            <p className="pt-2 border-t border-indigo-200 dark:border-indigo-700">
              Your campaign will be pre-configured with Track15's proven
              narrative framework, donor segmentation rules, and channel strategy
              for this season.
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          What is a Campaign Season?
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Track15 organizes fundraising into strategic seasons aligned with donor
          psychology and giving patterns. Each season has a unique narrative
          approach, optimal timing, and proven engagement strategies.
        </p>
      </div>
    </div>
  );
}
