/**
 * Track15 Campaign Wizard
 *
 * Multi-step wizard for creating Track15 methodology campaigns
 * Steps: Basics → Season → Core Story → Narrative Arc → Review
 */

import { Check } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import CoreStoryBuilder from "@/components/campaign/wizard-steps/CoreStoryBuilder";
import NarrativeArcBuilder from "@/components/campaign/wizard-steps/NarrativeArcBuilder";
import SeasonSelectionStep from "@/components/campaign/wizard-steps/SeasonSelectionStep";
import { useClient } from "@/context/ClientContext";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabaseClient";
import {
  enableTrack15,
  updateCoreStory,
  bulkUpdateNarrativeSteps,
  updateTrack15Stage,
} from "@/services/track15Service";
import {
  Track15Season,
  Track15CoreStory,
  Track15NarrativeStep,
} from "@/types/track15.types";

// Import wizard steps

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

type WizardStep =
  | "basics"
  | "season"
  | "core-story"
  | "narrative-arc"
  | "review";

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
      await enableTrack15(
        campaignId,
        wizardState.season,
        wizardState.templateKey,
      );

      // 3. Save core story
      if (
        wizardState.coreStory.headline &&
        wizardState.coreStory.summary &&
        wizardState.coreStory.valueProposition &&
        wizardState.coreStory.donorMotivation
      ) {
        await updateCoreStory(
          campaignId,
          wizardState.coreStory as Track15CoreStory,
        );
      }

      // 4. Save narrative steps
      if (wizardState.narrativeSteps.length > 0) {
        await bulkUpdateNarrativeSteps(campaignId, wizardState.narrativeSteps);
      }

      // 5. Update stage to ready_for_launch
      await updateTrack15Stage(campaignId, "ready_for_launch");

      toast.success("Success!", "Track15 campaign created successfully");

      // Navigate to campaign detail (or campaigns list)
      void navigate(`/clients/${clientId}/campaigns`);
    } catch (error) {
      console.error("Error creating Track15 campaign:", error);
      toast.error(
        "Error",
        error instanceof Error ? error.message : "Failed to create campaign",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen track15-bg px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold font-track15-heading text-track15-primary">
            Your Track15 Campaign Builder
          </h1>
          <p className="text-sm track15-text-muted max-w-2xl">
            Design a donor journey that mirrors Track15's consulting approach:
            clear seasons, a strong core story, and a consistent five-stage
            narrative.
          </p>
        </header>

        {/* Progress Stepper */}
        <nav className="flex items-center gap-4 overflow-x-auto rounded-2xl track15-surface px-4 py-3 border track15-border shadow-sm">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <div
                key={step.id}
                className="flex items-center gap-2 text-xs whitespace-nowrap"
              >
                <div
                  className={`
                  track15-stepper-step
                  ${isActive ? "active" : isCompleted ? "completed" : "pending"}
                `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{step.order}</span>
                  )}
                </div>
                <span
                  className={
                    isActive ? "font-medium track15-text" : "track15-text-muted"
                  }
                >
                  {step.label}
                </span>
                {index < STEPS.length - 1 && (
                  <span className="mx-1 h-px w-6 bg-gray-300" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Card */}
        <div className="track15-card">
          <div className="p-6 space-y-6">
            {/* Step content */}
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

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={goBack}
                disabled={currentStepIndex === 0 || isSubmitting}
                className="track15-text-muted hover:track15-text hover:bg-track15-bg transition-colors px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Back
              </button>

              {currentStep === "review" ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="track15-primary px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>Creating Campaign...</>
                  ) : (
                    <>
                      <Check className="w-4 h-4 inline mr-2" />
                      Launch Campaign
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={!canGoNext()}
                  className="track15-primary px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
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
        <h2 className="text-2xl font-semibold font-track15-heading text-track15-primary mb-2">
          Campaign Basics
        </h2>
        <p className="text-sm track15-text-muted">
          Start by defining the fundamental details of your campaign
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium track15-text mb-2">
            Campaign Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={basics.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g., Spring 2025 Annual Fund"
            className="w-full px-4 py-2.5 rounded-lg border track15-border track15-surface track15-text focus:outline-none focus:ring-2 focus:ring-track15-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium track15-text mb-2">
            Description
          </label>
          <textarea
            value={basics.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Brief description of the campaign purpose and goals..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border track15-border track15-surface track15-text focus:outline-none focus:ring-2 focus:ring-track15-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium track15-text mb-2">
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
            className="w-full px-4 py-2.5 rounded-lg border track15-border track15-surface track15-text focus:outline-none focus:ring-2 focus:ring-track15-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium track15-text mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={basics.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border track15-border track15-surface track15-text focus:outline-none focus:ring-2 focus:ring-track15-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium track15-text mb-2">
              End Date (optional)
            </label>
            <input
              type="date"
              value={basics.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              min={basics.startDate}
              className="w-full px-4 py-2.5 rounded-lg border track15-border track15-surface track15-text focus:outline-none focus:ring-2 focus:ring-track15-primary/20"
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
        <h2 className="text-2xl font-semibold font-track15-heading text-track15-primary mb-2">
          Review & Launch
        </h2>
        <p className="text-sm track15-text-muted">
          Review your Track15 campaign before creating it
        </p>
      </div>

      <div className="space-y-6">
        {/* Campaign Basics */}
        <div className="track15-surface rounded-lg p-6 border track15-border">
          <h3 className="text-lg font-semibold font-track15-heading text-track15-primary mb-4">
            Campaign Basics
          </h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm track15-text-muted">Name</dt>
              <dd className="text-base font-medium track15-text">
                {wizardState.basics.name}
              </dd>
            </div>
            {wizardState.basics.description && (
              <div>
                <dt className="text-sm track15-text-muted">Description</dt>
                <dd className="text-base track15-text">
                  {wizardState.basics.description}
                </dd>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm track15-text-muted">Goal</dt>
                <dd className="text-base font-medium track15-text">
                  ${wizardState.basics.goalAmount.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm track15-text-muted">Duration</dt>
                <dd className="text-base track15-text">
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
          <div className="track15-surface rounded-lg p-6 border track15-border">
            <h3 className="text-lg font-semibold font-track15-heading text-track15-primary mb-4">
              Track15 Season
            </h3>
            <div className="text-base track15-text capitalize">
              {wizardState.season}
            </div>
          </div>
        )}

        {/* Core Story */}
        {wizardState.coreStory.headline && (
          <div className="track15-surface rounded-lg p-6 border track15-border">
            <h3 className="text-lg font-semibold font-track15-heading text-track15-primary mb-4">
              Core Story
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm track15-text-muted">Headline</dt>
                <dd className="text-base font-medium track15-text">
                  {wizardState.coreStory.headline}
                </dd>
              </div>
              <div>
                <dt className="text-sm track15-text-muted">Donor Motivation</dt>
                <dd className="text-base track15-text capitalize">
                  {wizardState.coreStory.donorMotivation}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Narrative Arc */}
        {wizardState.narrativeSteps.length > 0 && (
          <div className="track15-surface rounded-lg p-6 border track15-border">
            <h3 className="text-lg font-semibold font-track15-heading text-track15-primary mb-4">
              Narrative Arc
            </h3>
            <div className="text-base track15-text">
              {wizardState.narrativeSteps.length} steps across{" "}
              {new Set(wizardState.narrativeSteps.map((s) => s.stage)).size}{" "}
              stages
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold track15-text mb-1">
              Ready to Launch
            </h4>
            <p className="text-xs track15-text-muted">
              Your Track15 campaign is configured and ready to be created. Click
              "Launch Campaign" to save and begin using Track15 methodology for
              donor engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add missing import
