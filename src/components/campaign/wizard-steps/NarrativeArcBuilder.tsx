/**
 * Narrative Arc Builder
 *
 * Track15 narrative arc creation interface
 * Build the donor journey through stages: awareness → engagement → consideration → conversion → gratitude
 */

import {
  Plus,
  Trash2,
  GripVertical,
  Mail,
  Share2,
  Mailbox,
  MessageSquare,
  Phone,
  Calendar,
  Globe,
  AlertCircle,
} from "lucide-react";
import React, { useState } from "react";

import {
  Track15NarrativeStep,
  Track15NarrativeStage,
  Track15Channel,
  NARRATIVE_STAGES,
  TRACK15_CHANNELS,
  SEGMENT_DEFINITIONS,
  DONOR_SEGMENTS,
} from "@/types/track15.types";

interface NarrativeArcBuilderProps {
  steps: Track15NarrativeStep[];
  onStepsUpdate: (steps: Track15NarrativeStep[]) => void;
}

const CHANNEL_ICONS: Record<Track15Channel, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  social: <Share2 className="w-4 h-4" />,
  direct_mail: <Mailbox className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  events: <Calendar className="w-4 h-4" />,
  web: <Globe className="w-4 h-4" />,
};

const STAGE_COLORS: Record<
  Track15NarrativeStage,
  { bg: string; border: string; text: string }
> = {
  awareness: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
  },
  engagement: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-300",
  },
  consideration: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-700 dark:text-yellow-300",
  },
  conversion: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
  },
  gratitude: {
    bg: "bg-pink-50 dark:bg-pink-900/20",
    border: "border-pink-200 dark:border-pink-800",
    text: "text-pink-700 dark:text-pink-300",
  },
};

export default function NarrativeArcBuilder({
  steps,
  onStepsUpdate,
}: NarrativeArcBuilderProps) {
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [_newStepStage, _setNewStepStage] =
    useState<Track15NarrativeStage>("awareness");

  const addNewStep = (stage: Track15NarrativeStage) => {
    const stageSteps = steps.filter((s) => s.stage === stage);
    const newSequence =
      stageSteps.length > 0
        ? Math.max(...stageSteps.map((s) => s.sequence)) + 1
        : 1;

    const newStep: Track15NarrativeStep = {
      id: `temp-${Date.now()}`,
      campaignId: "", // Will be set when campaign is created
      stage,
      title: "",
      body: "",
      sequence: newSequence,
      channels: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onStepsUpdate([...steps, newStep]);
    setEditingStep(steps.length);
  };

  const updateStep = (
    index: number,
    updates: Partial<Track15NarrativeStep>,
  ) => {
    const updated = [...steps];
    updated[index] = {
      ...updated[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    onStepsUpdate(updated);
  };

  const deleteStep = (index: number) => {
    onStepsUpdate(steps.filter((_, i) => i !== index));
    setEditingStep(null);
  };

  const toggleChannel = (index: number, channel: Track15Channel) => {
    const step = steps[index];
    const channels = step.channels.includes(channel)
      ? step.channels.filter((c) => c !== channel)
      : [...step.channels, channel];
    updateStep(index, { channels });
  };

  // Group steps by stage
  const stepsByStage = Object.keys(NARRATIVE_STAGES).reduce(
    (acc, stage) => {
      acc[stage as Track15NarrativeStage] = steps
        .filter((s) => s.stage === stage)
        .sort((a, b) => a.sequence - b.sequence);
      return acc;
    },
    {} as Record<Track15NarrativeStage, Track15NarrativeStep[]>,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Build Your Narrative Arc
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Design the donor journey through the Track15 narrative stages
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(NARRATIVE_STAGES).map(([key, stage]) => {
          const stageKey = key as Track15NarrativeStage;
          const stageSteps = stepsByStage[stageKey] || [];
          const colors = STAGE_COLORS[stageKey];

          return (
            <div
              key={key}
              className={`${colors.bg} ${colors.border} border-2 rounded-lg p-3 text-center`}
            >
              <div className={`text-xs font-medium ${colors.text} mb-1`}>
                {stage.name}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stageSteps.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stageSteps.length === 1 ? "step" : "steps"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stages with Steps */}
      <div className="space-y-6">
        {Object.entries(NARRATIVE_STAGES).map(([key, stage]) => {
          const stageKey = key as Track15NarrativeStage;
          const stageSteps = stepsByStage[stageKey] || [];
          const colors = STAGE_COLORS[stageKey];

          return (
            <div key={key} className="space-y-3">
              {/* Stage Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-semibold ${colors.text}`}>
                    {stage.order}. {stage.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stage.description}
                  </p>
                </div>
                <button
                  onClick={() => addNewStep(stageKey)}
                  className={`flex items-center gap-2 px-3 py-2 ${colors.bg} ${colors.border} border rounded-lg ${colors.text} hover:opacity-80 transition-opacity text-sm font-medium`}
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </button>
              </div>

              {/* Steps in this stage */}
              <div className="space-y-2">
                {stageSteps.length === 0 ? (
                  <div
                    className={`${colors.bg} ${colors.border} border-2 border-dashed rounded-lg p-6 text-center`}
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No steps yet. Click "Add Step" to create your first
                      touchpoint.
                    </p>
                  </div>
                ) : (
                  stageSteps.map((step, _idx) => {
                    const globalIndex = steps.indexOf(step);
                    const isEditing = editingStep === globalIndex;

                    return (
                      <div
                        key={step.id}
                        className={`${colors.bg} ${colors.border} border rounded-lg p-4`}
                      >
                        {isEditing ? (
                          /* Edit Mode */
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={step.title}
                                onChange={(e) =>
                                  updateStep(globalIndex, {
                                    title: e.target.value,
                                  })
                                }
                                placeholder="Step title..."
                                className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                              <div className="flex items-center gap-2 ml-3">
                                <button
                                  onClick={() => setEditingStep(null)}
                                  className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                  Done
                                </button>
                                <button
                                  onClick={() => deleteStep(globalIndex)}
                                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <textarea
                              value={step.body}
                              onChange={(e) =>
                                updateStep(globalIndex, {
                                  body: e.target.value,
                                })
                              }
                              placeholder="Step content/messaging..."
                              rows={3}
                              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />

                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Channels
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(TRACK15_CHANNELS).map(
                                  ([key, channel]) => {
                                    const channelKey = key as Track15Channel;
                                    const isSelected =
                                      step.channels.includes(channelKey);
                                    return (
                                      <button
                                        key={key}
                                        onClick={() =>
                                          toggleChannel(globalIndex, channelKey)
                                        }
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                          isSelected
                                            ? "bg-indigo-600 text-white"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                        }`}
                                      >
                                        {CHANNEL_ICONS[channelKey]}
                                        {channel.name}
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Target Segment (optional)
                                </label>
                                <select
                                  value={step.primarySegment || ""}
                                  onChange={(e) =>
                                    updateStep(globalIndex, {
                                      primarySegment:
                                        e.target.value || undefined,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                >
                                  <option value="">All segments</option>
                                  {DONOR_SEGMENTS.map((seg) => (
                                    <option key={seg} value={seg}>
                                      {SEGMENT_DEFINITIONS[seg].name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Call to Action (optional)
                                </label>
                                <input
                                  type="text"
                                  value={step.callToAction || ""}
                                  onChange={(e) =>
                                    updateStep(globalIndex, {
                                      callToAction: e.target.value || undefined,
                                    })
                                  }
                                  placeholder="e.g., Donate Now"
                                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div
                            className="cursor-pointer"
                            onClick={() => setEditingStep(globalIndex)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {step.title || (
                                    <span className="text-gray-400 italic">
                                      Untitled Step
                                    </span>
                                  )}
                                </h4>
                                {step.body && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {step.body}
                                  </p>
                                )}
                              </div>
                              <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            </div>

                            {step.channels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {step.channels.map((channel) => (
                                  <span
                                    key={channel}
                                    className="flex items-center gap-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                  >
                                    {CHANNEL_ICONS[channel]}
                                    {TRACK15_CHANNELS[channel].name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {step.callToAction && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                CTA:{" "}
                                <span className="font-medium">
                                  {step.callToAction}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Track15 Narrative Arc Best Practices
            </h4>
            <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
              <li>
                • Build momentum: start soft (awareness), increase intensity
                toward conversion
              </li>
              <li>
                • Use multiple channels per stage for better reach and
                reinforcement
              </li>
              <li>• Tailor messaging to specific segments when needed</li>
              <li>
                • Always close with gratitude - donor retention starts after the
                gift
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
