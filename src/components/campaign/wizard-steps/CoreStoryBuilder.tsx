/**
 * Core Story Builder
 *
 * Track15 core story creation interface
 * Defines the campaign's narrative foundation
 */

import React, { useState } from "react";
import { Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import {
  Track15CoreStory,
  DONOR_MOTIVATIONS,
  DonorMotivation,
} from "@/types/track15.types";

interface CoreStoryBuilderProps {
  coreStory: Partial<Track15CoreStory>;
  onCoreStoryUpdate: (coreStory: Partial<Track15CoreStory>) => void;
  templateDefaults?: Partial<Track15CoreStory>;
}

const MOTIVATION_DESCRIPTIONS: Record<DonorMotivation, string> = {
  hope: "Inspire donors with possibility and positive change",
  urgency: "Drive action with time-sensitive needs",
  gratitude: "Thank donors and celebrate their impact",
  belonging: "Create community and shared identity",
  empowerment: "Enable donors to make meaningful change",
  compassion: "Connect to human stories and suffering",
  justice: "Address systemic issues and fairness",
  celebration: "Mark achievements and milestones",
  legacy: "Build lasting impact across generations",
  impact: "Demonstrate concrete, measurable results",
};

export default function CoreStoryBuilder({
  coreStory,
  onCoreStoryUpdate,
  templateDefaults,
}: CoreStoryBuilderProps) {
  const [formData, setFormData] = useState<Partial<Track15CoreStory>>({
    ...templateDefaults,
    ...coreStory,
  });

  const updateField = (field: keyof Track15CoreStory, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onCoreStoryUpdate(updated);
  };

  const isComplete =
    formData.headline &&
    formData.summary &&
    formData.valueProposition &&
    formData.donorMotivation;

  const completionScore = [
    formData.headline,
    formData.summary,
    formData.valueProposition,
    formData.donorMotivation,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Build Your Core Story
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Define the narrative foundation that will power your entire campaign
        </p>
      </div>

      {/* Completion Status */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Core Story Completion
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {completionScore}/4
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 transition-all duration-300"
            style={{ width: `${(completionScore / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Campaign Headline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Campaign Headline
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={formData.headline || ""}
            onChange={(e) => updateField("headline", e.target.value)}
            placeholder="e.g., 'Transform Lives This Spring'"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            The central narrative hook that captures your campaign's essence
          </p>
        </div>

        {/* Campaign Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Campaign Summary
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            value={formData.summary || ""}
            onChange={(e) => updateField("summary", e.target.value)}
            placeholder="Provide a brief overview of your campaign's purpose and goals..."
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            A concise description (2-3 sentences) of what this campaign is about
          </p>
        </div>

        {/* Value Proposition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Donor Value Proposition
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            value={formData.valueProposition || ""}
            onChange={(e) => updateField("valueProposition", e.target.value)}
            placeholder="What will donors accomplish by giving? What impact will they create?"
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Clearly articulate what donors will achieve through their support
          </p>
        </div>

        {/* Donor Motivation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Primary Donor Motivation
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DONOR_MOTIVATIONS.map((motivation) => (
              <button
                key={motivation}
                onClick={() => updateField("donorMotivation", motivation)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${
                    formData.donorMotivation === motivation
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                  }
                `}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">
                    {motivation}
                  </span>
                  {formData.donorMotivation === motivation && (
                    <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {MOTIVATION_DESCRIPTIONS[motivation]}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tips & Best Practices */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Track15 Core Story Best Practices
            </h4>
            <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Keep your headline clear, compelling, and emotionally resonant</li>
              <li>• Focus on donor impact, not organizational needs</li>
              <li>• Choose one primary motivation - trying to hit multiple dilutes impact</li>
              <li>
                • Your value proposition should answer: "What will I accomplish by
                giving?"
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Assistance Hint */}
      {isComplete && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Core Story Complete!
              </h4>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Your core story will now inform AI-generated campaign content,
                narrative arc suggestions, and messaging across all channels.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
