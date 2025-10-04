import React, { useState } from "react";

import CampaignOverviewBuilder, {
  CampaignOverview,
} from "./CampaignOverviewBuilder";
import { Button, Progress } from "../ui-kit";

// Campaign builder steps
// eslint-disable-next-line react-refresh/only-export-components
export const CAMPAIGN_BUILDER_STEPS = [
  {
    id: "overview",
    name: "Campaign Overview",
    description: "Basic information and goals",
  },
  {
    id: "audience",
    name: "Audience Segmentation",
    description: "Target donor groups and segments",
  },
  {
    id: "messaging",
    name: "Messaging Framework",
    description: "Core story and talking points",
  },
  {
    id: "channels",
    name: "Channel Planning",
    description: "Email, social, and direct mail strategy",
  },
  {
    id: "timeline",
    name: "Timeline & Calendar",
    description: "Schedule and milestones",
  },
  {
    id: "tracking",
    name: "Match & Challenge",
    description: "Matching gifts and challenge setup",
  },
  {
    id: "reporting",
    name: "Reporting Dashboard",
    description: "Analytics and performance metrics",
  },
] as const;

export type CampaignBuilderStep = (typeof CAMPAIGN_BUILDER_STEPS)[number]["id"];

export interface CampaignBuilderData {
  overview?: CampaignOverview;
  // Additional step data will be added as we build out the other components
  // audience?: AudienceSegmentationData;
  // messaging?: MessagingFrameworkData;
  // etc...
}

interface CampaignBuilderWizardProps {
  onComplete: (data: CampaignBuilderData) => void;
  onCancel: () => void;
  initialStep?: CampaignBuilderStep;
}

export const CampaignBuilderWizard: React.FC<CampaignBuilderWizardProps> = ({
  onComplete,
  onCancel,
  initialStep = "overview",
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(
    CAMPAIGN_BUILDER_STEPS.findIndex((step) => step.id === initialStep),
  );
  const [campaignData, setCampaignData] = useState<CampaignBuilderData>({});
  const [isLoading, setIsLoading] = useState(false);

  const currentStep = CAMPAIGN_BUILDER_STEPS[currentStepIndex];
  const progress =
    ((currentStepIndex + 1) / CAMPAIGN_BUILDER_STEPS.length) * 100;

  const goToNextStep = () => {
    if (currentStepIndex < CAMPAIGN_BUILDER_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleOverviewSave = (overviewData: CampaignOverview) => {
    setCampaignData((prev) => ({ ...prev, overview: overviewData }));
  };

  const handleOverviewNext = (overviewData: CampaignOverview) => {
    setCampaignData((prev) => ({ ...prev, overview: overviewData }));
    goToNextStep();
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      onComplete(campaignData);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep.id) {
      case "overview":
        return (
          <CampaignOverviewBuilder
            initialData={campaignData.overview}
            onSave={handleOverviewSave}
            onNext={handleOverviewNext}
            onCancel={onCancel}
            isLoading={isLoading}
          />
        );

      case "audience":
        return (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">👥</div>
            <h2 className="text-2xl font-bold text-white">
              Audience Segmentation Tool
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              This step will help you define and segment your target donors
              based on giving history, demographics, and engagement levels.
            </p>
            <div className="space-y-3 pt-4">
              <p className="text-sm text-slate-500">
                Coming in Phase 2 of development
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={goToPrevStep} variant="outline">
                  ← Previous
                </Button>
                <Button onClick={goToNextStep} variant="primary">
                  Skip for now →
                </Button>
              </div>
            </div>
          </div>
        );

      case "messaging":
        return (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">💬</div>
            <h2 className="text-2xl font-bold text-white">
              Messaging Framework
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Develop your core campaign story, key talking points, and
              messaging variations for different audience segments.
            </p>
            <div className="space-y-3 pt-4">
              <p className="text-sm text-slate-300">
                ✅ <strong>Phase 3: Complete!</strong>
              </p>
              <div className="space-y-2 text-sm text-slate-400">
                <p>• Core Story Builder with narrative validation</p>
                <p>• Talking Points Repository with statistics & quotes</p>
                <p>• Voice & Tone Configuration with brand consistency</p>
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <Button
                  onClick={() =>
                    window.open("/demo/messaging-framework", "_blank")
                  }
                  variant="primary"
                >
                  🚀 Try Messaging Framework
                </Button>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={goToPrevStep} variant="outline">
                  ← Previous
                </Button>
                <Button onClick={goToNextStep} variant="primary">
                  Continue to Channels →
                </Button>
              </div>
            </div>
          </div>
        );

      case "channels":
        return (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">📧</div>
            <h2 className="text-2xl font-bold text-white">
              Channel Planning Dashboard
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Plan your multi-channel approach including email sequences, social
              media campaigns, and direct mail strategy.
            </p>
            <div className="space-y-3 pt-4">
              <p className="text-sm text-slate-500">
                Coming in Phase 3 of development
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={goToPrevStep} variant="outline">
                  ← Previous
                </Button>
                <Button onClick={goToNextStep} variant="primary">
                  Skip for now →
                </Button>
              </div>
            </div>
          </div>
        );

      case "timeline":
        return (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">📅</div>
            <h2 className="text-2xl font-bold text-white">
              Timeline & Calendar
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Create detailed timelines, set milestones, and integrate with your
              organization's calendar system.
            </p>
            <div className="space-y-3 pt-4">
              <p className="text-sm text-slate-500">
                Coming in Phase 4 of development
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={goToPrevStep} variant="outline">
                  ← Previous
                </Button>
                <Button onClick={goToNextStep} variant="primary">
                  Skip for now →
                </Button>
              </div>
            </div>
          </div>
        );

      case "tracking":
        return (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">🎯</div>
            <h2 className="text-2xl font-bold text-white">
              Match & Challenge Tracker
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Set up matching gift campaigns, challenge goals, and automated
              tracking for donor incentives.
            </p>
            <div className="space-y-3 pt-4">
              <p className="text-sm text-slate-500">
                Coming in Phase 5 of development
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={goToPrevStep} variant="outline">
                  ← Previous
                </Button>
                <Button onClick={goToNextStep} variant="primary">
                  Skip for now →
                </Button>
              </div>
            </div>
          </div>
        );

      case "reporting":
        return (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">📊</div>
            <h2 className="text-2xl font-bold text-white">
              Basic Reporting Dashboard
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Configure your campaign analytics, performance metrics, and
              automated reporting dashboards.
            </p>
            <div className="space-y-3 pt-4">
              <p className="text-sm text-slate-500">
                Coming in Phase 6 of development
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={goToPrevStep} variant="outline">
                  ← Previous
                </Button>
                <Button
                  onClick={handleComplete}
                  variant="primary"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Creating Campaign..."
                    : "Complete Campaign Setup ✓"}
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header with Progress */}
      <div className="bg-slate-900/40 border-b border-slate-800 px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Campaign Builder
              </h1>
              <p className="text-slate-400">
                Step {currentStepIndex + 1} of {CAMPAIGN_BUILDER_STEPS.length}:{" "}
                {currentStep.name}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white transition-colors"
              title="Cancel and exit"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <Progress
            value={progress}
            max={100}
            showPercentage
            variant="info"
            size="md"
            label={`Campaign Setup Progress - ${currentStep.description}`}
          />

          {/* Step Navigation */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto">
            {CAMPAIGN_BUILDER_STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(index)}
                disabled={index > currentStepIndex}
                className={`
                  flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${
                    index === currentStepIndex
                      ? "bg-blue-600 text-white"
                      : index < currentStepIndex
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-slate-700 text-slate-400 cursor-not-allowed"
                  }
                `}
              >
                {index < currentStepIndex ? "✓" : index + 1}. {step.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-8">{renderCurrentStep()}</div>
    </div>
  );
};

export default CampaignBuilderWizard;
