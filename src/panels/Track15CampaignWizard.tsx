/**
 * Track15 Campaign Wizard
 *
 * Multi-step wizard for creating Track15 methodology campaigns
 * Steps: Basics → Season → Core Story → Narrative Arc → Review
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { useClient } from "@/context/ClientContext";
import { useToast } from "@/hooks/useToast";
import {
  Track15Season,
  Track15CoreStory,
  Track15NarrativeStep,
  Track15CampaignMeta,
} from "@/types/track15.types";
import {
  enableTrack15,
  updateCoreStory,
  bulkUpdateNarrativeSteps,
  updateTrack15Stage,
} from "@/services/track15Service";

// Import wizard steps
import SeasonSelectionStep from "@/components/campaign/wizard-steps/SeasonSelectionStep";
import CoreStoryBuilder from "@/components/campaign/wizard-steps/CoreStoryBuilder";
import NarrativeArcBuilder from "@/components/campaign/wizard-steps/NarrativeArcBuilder";

// ============================================================================
// TYPES
// ============================================================================

interface CampaignBasics {
  name: string;
  description: string;
  goalAmount: number;
  startDate: string;
  endDate: string;
}

interface WizardState {
  basics: CampaignBasics;
  season: Track15Season | null;
  templateKey?: string;
  coreStory: Partial<Track15CoreStory>;
  narrativeSteps: Track15NarrativeStep[];
}

type WizardStep = "basics" | "season" | "core-story" | "narrative-arc" | "review";

const STEPS: { id: WizardStep; label: string; order: number }[] = [
  { id: "basics", label: "Campaign Basics", order: 1 },
  { id: "season", label: "Track15 Season", order: 2 },
  { id: "core-story", label: "Core Story", order: 3 },
  { id: "narrative-arc", label: "Narrative Arc", order: 4 },
  { id: "review", label: "Review & Launch", order: 5 },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Track15CampaignWizard() {
  const { currentClient } = useClient();
  const navigate = useNavigate();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState<WizardStep>("basics");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [wizardState, setWizardState] = useState<WizardState>({
    basics: {
      name: "",
      description: "",
      goalAmount: 10000,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    },
    season: null,
    coreStory: {},
    narrativeSteps: [],
  });

  const clientId = currentClient?.id;

  if (!clientId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>No client selected</p>
      </div>
    );
  }

  // ============================================================================
  // STEP NAVIGATION
  // ============================================================================

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const canGoNext = () => {
    switch (currentStep) {
      case "basics":
        return wizardState.basics.name.trim().length > 0;
      case "season":
        return wizardState.season !== null;
      case "core-story":
        return (
          wizardState.coreStory.headline &&
          wizardState.coreStory.summary &&
          wizardState.coreStory.valueProposition &&
          wizardState.coreStory.donorMotivation
        );
      case "narrative-arc":
        return wizardState.narrativeSteps.length > 0;
      case "review":
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id);
    }
  };

  // ============================================================================
  // STATE UPDATES
  // ============================================================================

  const updateBasics = (updates: Partial<CampaignBasics>) => {
    setWizardState((prev) => ({
      ...prev,
      basics: { ...prev.basics, ...updates },
    }));
  };

  const selectSeason = (season: Track15Season) => {
    setWizardState((prev) => ({
      ...prev,
      season,
    }));
  };

  const updateCoreStoryData = (updates: Partial<Track15CoreStory>) => {
    setWizardState((prev) => ({
      ...prev,
      coreStory: { ...prev.coreStory, ...updates },
    }));
  };

  const updateNarrativeSteps = (steps: Track15NarrativeStep[]) => {
    setWizardState((prev) => ({
      ...prev,
      narrativeSteps: steps,
    }));
  };

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const handleSubmit = async () => {
    if (!wizardState.season) {
      toast.error("Error", "Please select a campaign season");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create base campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          client_id: clientId,
          name: wizardState.basics.name,
          description: wizardState.basics.description,
          goal_amount: wizardState.basics.goalAmount,
          start_date: wizardState.basics.startDate,
          end_date: wizardState.basics.endDate || null,
          status: "draft",
        })
        .select()
        .single();

      if (campaignError) throw campaignError;
      const campaignId = campaign.id;

      // 2. Enable Track15
      await enableTrack15(campaignId, wizardState.season, wizardState.templateKey);

      // 3. Save core story
      if (
        wizardState.coreStory.headline &&
        wizardState.coreStory.summary &&
        wizardState.coreStory.valueProposition &&
        wizardState.coreStory.donorMotivation
      ) {
        await updateCoreStory(campaignId, wizardState.coreStory as Track15CoreStory);
      }

      // 4. Save narrative steps
      if (wizardState.narrativeSteps.length > 0) {
        await bulkUpdateNarrativeSteps(campaignId, wizardState.narrativeSteps);
      }

      // 5. Update stage to ready_for_launch
      await updateTrack15Stage(campaignId, "ready_for_launch");

      toast.success("Success!", "Track15 campaign created successfully");

      // Navigate to campaign detail (or campaigns list)
      navigate(`/clients/${clientId}/campaigns`);
    } catch (error) {
      console.error("Error creating Track15 campaign:", error);
      toast.error(
        "Error",
        error instanceof Error ? error.message : "Failed to create campaign"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Track15 Campaign
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Step {currentStepIndex + 1} of {STEPS.length}:{" "}
              {STEPS[currentStepIndex].label}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? "bg-purple-600 border-purple-600 text-white"
                        : isActive
                        ? "bg-white dark:bg-gray-800 border-purple-600 text-purple-600"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.order}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      isActive
                        ? "text-purple-600 dark:text-purple-400 font-semibold"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isCompleted
                        ? "bg-purple-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {currentStep === "basics" && (
            <BasicsStep basics={wizardState.basics} onChange={updateBasics} />
          )}

          {currentStep === "season" && (
            <SeasonSelectionStep
              selectedSeason={wizardState.season}
              onSeasonSelect={selectSeason}
            />
          )}

          {currentStep === "core-story" && (
            <CoreStoryBuilder
              coreStory={wizardState.coreStory}
              onCoreStoryUpdate={updateCoreStoryData}
            />
          )}

          {currentStep === "narrative-arc" && (
            <NarrativeArcBuilder
              steps={wizardState.narrativeSteps}
              onStepsUpdate={updateNarrativeSteps}
            />
          )}

          {currentStep === "review" && (
            <ReviewStep wizardState={wizardState} />
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStepIndex + 1} of {STEPS.length}
          </div>

          {currentStep === "review" ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>Creating Campaign...</>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Campaign
                </>
              )}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canGoNext()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BASICS STEP
// ============================================================================

interface BasicsStepProps {
  basics: CampaignBasics;
  onChange: (updates: Partial<CampaignBasics>) => void;
}

function BasicsStep({ basics, onChange }: BasicsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Campaign Basics
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Start by defining the fundamental details of your campaign
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Campaign Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={basics.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g., Spring 2025 Annual Fund"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={basics.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Brief description of the campaign purpose and goals..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Goal Amount ($)
          </label>
          <input
            type="number"
            value={basics.goalAmount}
            onChange={(e) =>
              onChange({ goalAmount: parseInt(e.target.value) || 0 })
            }
            min={0}
            step={100}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={basics.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date (optional)
            </label>
            <input
              type="date"
              value={basics.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              min={basics.startDate}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// REVIEW STEP
// ============================================================================

interface ReviewStepProps {
  wizardState: WizardState;
}

function ReviewStep({ wizardState }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review & Launch
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review your Track15 campaign before creating it
        </p>
      </div>

      <div className="space-y-6">
        {/* Campaign Basics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Campaign Basics
          </h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Name</dt>
              <dd className="text-base font-medium text-gray-900 dark:text-white">
                {wizardState.basics.name}
              </dd>
            </div>
            {wizardState.basics.description && (
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">
                  Description
                </dt>
                <dd className="text-base text-gray-900 dark:text-white">
                  {wizardState.basics.description}
                </dd>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Goal</dt>
                <dd className="text-base font-medium text-gray-900 dark:text-white">
                  ${wizardState.basics.goalAmount.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">
                  Duration
                </dt>
                <dd className="text-base text-gray-900 dark:text-white">
                  {wizardState.basics.startDate}
                  {wizardState.basics.endDate &&
                    ` → ${wizardState.basics.endDate}`}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Track15 Season */}
        {wizardState.season && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Track15 Season
            </h3>
            <div className="text-base text-gray-900 dark:text-white capitalize">
              {wizardState.season}
            </div>
          </div>
        )}

        {/* Core Story */}
        {wizardState.coreStory.headline && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Core Story
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">
                  Headline
                </dt>
                <dd className="text-base font-medium text-gray-900 dark:text-white">
                  {wizardState.coreStory.headline}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">
                  Donor Motivation
                </dt>
                <dd className="text-base text-gray-900 dark:text-white capitalize">
                  {wizardState.coreStory.donorMotivation}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Narrative Arc */}
        {wizardState.narrativeSteps.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Narrative Arc
            </h3>
            <div className="text-base text-gray-900 dark:text-white">
              {wizardState.narrativeSteps.length} steps across{" "}
              {
                new Set(wizardState.narrativeSteps.map((s) => s.stage)).size
              }{" "}
              stages
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Ready to Launch
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Your Track15 campaign is configured and ready to be created. Click
              "Create Campaign" to save and begin using Track15 methodology for
              donor engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add missing import
import { supabase } from "@/lib/supabaseClient";
