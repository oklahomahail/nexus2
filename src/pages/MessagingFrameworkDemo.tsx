import React, { useState } from "react";

import {
  CoreStoryBuilder,
  TalkingPointsRepository,
  VoiceAndToneConfig,
  type CampaignStory,
  type TalkingPoint,
  type VoiceSettings,
  type MessagingFramework,
} from "../components/campaign/messaging";
import { Button, Card, Badge, Progress } from "../components/ui-kit";

type MessagingStep = "story" | "talking-points" | "voice-tone" | "preview";

const MESSAGING_STEPS = [
  {
    id: "story" as MessagingStep,
    title: "Core Story",
    description: "Define your campaign narrative",
    icon: "📖",
  },
  {
    id: "talking-points" as MessagingStep,
    title: "Talking Points",
    description: "Build your content repository",
    icon: "🗂️",
  },
  {
    id: "voice-tone" as MessagingStep,
    title: "Voice & Tone",
    description: "Set your messaging consistency",
    icon: "🎵",
  },
  {
    id: "preview" as MessagingStep,
    title: "Preview",
    description: "Review your messaging framework",
    icon: "👁️",
  },
];

const MessagingFrameworkDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<MessagingStep>("story");
  const [completedSteps, setCompletedSteps] = useState<Set<MessagingStep>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);

  // Framework data
  const [story, setStory] = useState<CampaignStory | null>(null);
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoint[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings | null>(
    null,
  );

  const currentStepIndex = MESSAGING_STEPS.findIndex(
    (step) => step.id === currentStep,
  );
  const progress = (completedSteps.size / MESSAGING_STEPS.length) * 100;

  // Sample initial data
  const sampleStoryData = {
    problemStatement:
      "Thousands of families in our community lack access to nutritious meals, with 1 in 4 children experiencing food insecurity.",
    solution:
      "Our community food program provides fresh, healthy meals and nutrition education to families in need.",
    impact:
      "With your support, we can serve 500 more families each month and help break the cycle of food insecurity.",
    callToAction:
      "Join us today with a donation of $50 to feed a family for a week.",
  };

  // Navigation helpers
  const goToStep = (stepId: MessagingStep) => {
    setCurrentStep(stepId);
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < MESSAGING_STEPS.length) {
      setCurrentStep(MESSAGING_STEPS[nextIndex].id);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(MESSAGING_STEPS[prevIndex].id);
    }
  };

  // Step completion handlers
  const handleStorySave = (storyData: CampaignStory) => {
    setStory(storyData);
    setCompletedSteps((prev) => new Set(prev).add("story"));
    console.log("Story saved:", storyData);
  };

  const handleStoryNext = (storyData: CampaignStory) => {
    setStory(storyData);
    setCompletedSteps((prev) => new Set(prev).add("story"));
    goToNextStep();
  };

  const handleTalkingPointsSave = (points: TalkingPoint[]) => {
    setTalkingPoints(points);
    setCompletedSteps((prev) => new Set(prev).add("talking-points"));
    console.log("Talking points saved:", points);
  };

  const handleTalkingPointsNext = (points: TalkingPoint[]) => {
    setTalkingPoints(points);
    setCompletedSteps((prev) => new Set(prev).add("talking-points"));
    goToNextStep();
  };

  const handleVoiceToneSave = (settings: VoiceSettings) => {
    setVoiceSettings(settings);
    setCompletedSteps((prev) => new Set(prev).add("voice-tone"));
    console.log("Voice settings saved:", settings);
  };

  const handleVoiceToneNext = (settings: VoiceSettings) => {
    setVoiceSettings(settings);
    setCompletedSteps((prev) => new Set(prev).add("voice-tone"));
    goToNextStep();
  };

  const handleCancel = () => {
    if (
      confirm("Are you sure you want to cancel? All progress will be lost.")
    ) {
      // Reset everything
      setCurrentStep("story");
      setCompletedSteps(new Set());
      setStory(null);
      setTalkingPoints([]);
      setVoiceSettings(null);
    }
  };

  const handleComplete = async () => {
    if (!story || !voiceSettings) {
      alert(
        "Please complete at least the story and voice settings before finishing.",
      );
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const framework: MessagingFramework = {
        id: `framework_${Date.now()}`,
        campaignId: story.campaignId,
        story,
        talkingPoints,
        variations: [], // Would be generated based on story + talking points
        voiceSettings,
        templates: [], // Would be created separately
        performance: {
          totalMessages: 0,
          totalSent: 0,
          totalEngagement: 0,
          channelMetrics: {} as any,
          audienceMetrics: {} as any,
          talkingPointMetrics: {},
          abTests: [],
          trends: {
            engagement: [],
            conversion: [],
            reach: [],
          },
        },
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "demo-user",
      };

      console.log("Complete messaging framework:", framework);
      alert(
        "Messaging framework created successfully! Check console for complete structure.",
      );

      setCompletedSteps(new Set(MESSAGING_STEPS.map((s) => s.id)));
    } finally {
      setIsLoading(false);
    }
  };

  const resetDemo = () => {
    setCurrentStep("story");
    setCompletedSteps(new Set());
    setStory(null);
    setTalkingPoints([]);
    setVoiceSettings(null);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "story":
        return (
          <CoreStoryBuilder
            initialStory={story ? { ...story } : sampleStoryData}
            campaignId="demo-campaign"
            onSave={handleStorySave}
            onNext={handleStoryNext}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        );

      case "talking-points":
        return (
          <TalkingPointsRepository
            initialTalkingPoints={talkingPoints}
            campaignId="demo-campaign"
            onSave={handleTalkingPointsSave}
            onNext={handleTalkingPointsNext}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        );

      case "voice-tone":
        return (
          <VoiceAndToneConfig
            initialSettings={voiceSettings || undefined}
            onSave={handleVoiceToneSave}
            onNext={handleVoiceToneNext}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        );

      case "preview":
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-white">
                📋 Messaging Framework Preview
              </h1>
              <p className="text-slate-400">
                Review your complete messaging framework before finalizing.
              </p>
            </div>

            {/* Story Summary */}
            {story && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  📖 Core Campaign Story
                  <Badge variant="success">Complete</Badge>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-200 mb-2">
                      Problem Statement
                    </h4>
                    <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded">
                      {story.problemStatement}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-200 mb-2">
                      Solution
                    </h4>
                    <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded">
                      {story.solution}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-200 mb-2">Impact</h4>
                    <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded">
                      {story.impact}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-200 mb-2">
                      Call to Action
                    </h4>
                    <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded">
                      {story.callToAction}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Talking Points Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                🗂️ Talking Points Repository
                <Badge
                  variant={talkingPoints.length > 0 ? "success" : "warning"}
                >
                  {talkingPoints.length} Points
                </Badge>
              </h2>

              {talkingPoints.length > 0 ? (
                <div className="space-y-3">
                  {talkingPoints.slice(0, 3).map((point) => (
                    <div key={point.id} className="bg-slate-800/50 p-3 rounded">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-200">
                            {point.title}
                          </h4>
                          <p className="text-slate-400 text-sm mt-1">
                            {point.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="info" size="sm">
                              {point.category}
                            </Badge>
                            <Badge variant="secondary" size="sm">
                              {point.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {talkingPoints.length > 3 && (
                    <p className="text-slate-400 text-sm">
                      ...and {talkingPoints.length - 3} more talking points
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">
                  No talking points created yet.
                </p>
              )}
            </Card>

            {/* Voice & Tone Summary */}
            {voiceSettings && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  🎵 Voice & Tone Configuration
                  <Badge variant="success">Complete</Badge>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-200 mb-2">
                      Brand Personality
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {voiceSettings.brandPersonality.map((trait) => (
                        <Badge key={trait} variant="info" size="sm">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-200 mb-2">
                      Writing Style
                    </h4>
                    <Badge variant="secondary">
                      {voiceSettings.writingStyle}
                    </Badge>
                    <span className="text-slate-400 mx-2">•</span>
                    <Badge variant="secondary">
                      {voiceSettings.vocabularyLevel}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-200 mb-2">
                      Primary Tone
                    </h4>
                    <Badge variant="warning">{voiceSettings.primaryTone}</Badge>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-200 mb-2">
                      Allowed Tones
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {voiceSettings.allowedTones.map((tone) => (
                        <Badge key={tone} variant="success" size="sm">
                          {tone}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button onClick={goToPrevStep} variant="outline" size="lg">
                ← Back to Edit
              </Button>

              <Button
                onClick={handleComplete}
                variant="primary"
                size="lg"
                disabled={isLoading || !story || !voiceSettings}
              >
                {isLoading
                  ? "Creating Framework..."
                  : "Complete Messaging Framework ✓"}
              </Button>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {currentStep !== "preview" && (
        <div className="bg-slate-900/40 border-b border-slate-800 px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Messaging Framework Builder
                </h1>
                <p className="text-slate-400">
                  Step {currentStepIndex + 1} of {MESSAGING_STEPS.length}:{" "}
                  {MESSAGING_STEPS[currentStepIndex].title}
                </p>
              </div>
              <button
                onClick={handleCancel}
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
              label={`Messaging Framework Progress - ${MESSAGING_STEPS[currentStepIndex].description}`}
            />

            {/* Step Navigation */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto">
              {MESSAGING_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  disabled={
                    index > currentStepIndex && !completedSteps.has(step.id)
                  }
                  className={`
                    flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-colors flex items-center gap-2
                    ${
                      step.id === currentStep
                        ? "bg-blue-600 text-white"
                        : completedSteps.has(step.id)
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-slate-700 text-slate-400 cursor-not-allowed"
                    }
                  `}
                >
                  <span>{step.icon}</span>
                  <span>
                    {completedSteps.has(step.id) ? "✓" : index + 1}.{" "}
                    {step.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className={currentStep !== "preview" ? "p-8" : "py-8"}>
        {renderStepContent()}
      </div>

      {/* Demo Reset (only show in preview) */}
      {currentStep === "preview" &&
        completedSteps.size === MESSAGING_STEPS.length && (
          <div className="text-center pb-8">
            <Button onClick={resetDemo} variant="secondary" size="lg">
              🔄 Start Over
            </Button>
          </div>
        )}
    </div>
  );
};

export default MessagingFrameworkDemo;
