import React, { useState, useCallback } from "react";

import { Button, Card, Progress, Badge } from "../../ui-kit";

import type { CampaignStory, ValidationResult } from "./types";

interface CoreStoryBuilderProps {
  initialStory?: Partial<CampaignStory>;
  campaignId: string;
  onSave: (story: CampaignStory) => void;
  onNext?: (story: CampaignStory) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

interface StorySection {
  key: keyof CampaignStory;
  title: string;
  description: string;
  placeholder: string;
  icon: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  tips: string[];
}

const STORY_SECTIONS: StorySection[] = [
  {
    key: "problemStatement",
    title: "Problem Statement",
    description: "Clearly define the problem or need your campaign addresses",
    placeholder:
      "Describe the specific challenge, gap, or urgent need that your campaign aims to solve. Be concrete and compelling.",
    icon: "⚠️",
    required: true,
    minLength: 50,
    maxLength: 500,
    tips: [
      "Use specific, measurable language",
      "Include emotional connection",
      "Avoid jargon or complex terminology",
      "Make it relatable to your audience",
    ],
  },
  {
    key: "solution",
    title: "Solution",
    description:
      "Explain how your campaign/organization addresses this problem",
    placeholder:
      "Describe your approach, methodology, or specific actions that will solve the identified problem.",
    icon: "💡",
    required: true,
    minLength: 50,
    maxLength: 500,
    tips: [
      "Be specific about your approach",
      "Highlight what makes your solution unique",
      "Connect directly to the problem stated above",
      "Include concrete steps or strategies",
    ],
  },
  {
    key: "impact",
    title: "Impact",
    description: "Describe the positive change and outcomes expected",
    placeholder:
      "Detail the specific, measurable impact that will result from your campaign's success.",
    icon: "🎯",
    required: true,
    minLength: 50,
    maxLength: 500,
    tips: [
      "Use specific numbers and metrics when possible",
      "Focus on beneficiary outcomes",
      "Include both short-term and long-term impact",
      "Make it inspiring and motivational",
    ],
  },
  {
    key: "callToAction",
    title: "Call to Action",
    description: "What specific action do you want donors to take?",
    placeholder:
      "Craft a clear, compelling ask that tells supporters exactly how they can help.",
    icon: "📢",
    required: true,
    minLength: 20,
    maxLength: 200,
    tips: [
      "Be specific and actionable",
      "Create urgency without pressure",
      "Make it easy to understand and follow",
      "Include donation amounts or other specific actions",
    ],
  },
  {
    key: "vision",
    title: "Vision",
    description: "Paint a picture of the ideal future state",
    placeholder:
      "Describe the long-term vision and the world you're working to create.",
    icon: "🌟",
    required: false,
    minLength: 30,
    maxLength: 300,
    tips: [
      "Think big picture and inspirational",
      "Make it aspirational but achievable",
      "Connect to your organization's mission",
      "Use vivid, compelling language",
    ],
  },
  {
    key: "urgency",
    title: "Urgency",
    description: "Why is action needed now? What's the timeline?",
    placeholder:
      "Explain why immediate action is critical and what happens if supporters delay.",
    icon: "⏰",
    required: false,
    minLength: 30,
    maxLength: 300,
    tips: [
      "Include specific deadlines or timeframes",
      "Explain consequences of inaction",
      "Balance urgency with authenticity",
      "Avoid manufactured pressure",
    ],
  },
];

export const CoreStoryBuilder: React.FC<CoreStoryBuilderProps> = ({
  initialStory,
  campaignId,
  onSave,
  onNext,
  onCancel,
  isLoading = false,
  readOnly = false,
}) => {
  // Form state
  const [story, setStory] = useState<Partial<CampaignStory>>({
    campaignId,
    problemStatement: "",
    solution: "",
    impact: "",
    callToAction: "",
    vision: "",
    mission: "",
    urgency: "",
    ...initialStory,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] =
    useState<keyof CampaignStory>("problemStatement");
  const [validationResults, setValidationResults] = useState<
    Record<string, ValidationResult>
  >({});

  // Calculate completion percentage
  const completionPercentage = useCallback(() => {
    const requiredSections = STORY_SECTIONS.filter((s) => s.required);
    const completedRequired = requiredSections.filter((section) => {
      const value = story[section.key] as string;
      return value && value.trim().length >= (section.minLength || 0);
    }).length;

    const optionalSections = STORY_SECTIONS.filter((s) => !s.required);
    const completedOptional = optionalSections.filter((section) => {
      const value = story[section.key] as string;
      return value && value.trim().length > 10;
    }).length;

    const requiredWeight = 0.8;
    const optionalWeight = 0.2;

    const requiredScore =
      (completedRequired / requiredSections.length) * requiredWeight;
    const optionalScore =
      (completedOptional / optionalSections.length) * optionalWeight;

    return Math.round((requiredScore + optionalScore) * 100);
  }, [story]);

  // Validate individual section
  const validateSection = useCallback(
    (section: StorySection, value: string): ValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      if (section.required && (!value || value.trim().length === 0)) {
        errors.push(`${section.title} is required`);
      }

      if (value && section.minLength && value.length < section.minLength) {
        errors.push(
          `${section.title} should be at least ${section.minLength} characters`,
        );
      }

      if (value && section.maxLength && value.length > section.maxLength) {
        errors.push(
          `${section.title} should not exceed ${section.maxLength} characters`,
        );
      }

      // Content-specific validation
      if (value) {
        if (section.key === "problemStatement") {
          if (
            !value.includes("need") &&
            !value.includes("problem") &&
            !value.includes("challenge")
          ) {
            warnings.push("Consider clearly stating the problem or need");
          }
          if (value.split(" ").length < 10) {
            warnings.push("Problem statement could be more detailed");
          }
        }

        if (section.key === "callToAction") {
          if (
            !value.toLowerCase().includes("donate") &&
            !value.toLowerCase().includes("give") &&
            !value.toLowerCase().includes("support")
          ) {
            warnings.push("Consider including a specific donation ask");
          }
          if (!value.includes("$") && !value.includes("dollar")) {
            suggestions.push("Consider including specific donation amounts");
          }
        }

        if (section.key === "impact") {
          const hasNumbers = /\d/.test(value);
          if (!hasNumbers) {
            suggestions.push("Consider including specific numbers or metrics");
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors: errors.map((e) => ({ type: "content" as const, message: e })),
        warnings: warnings.map((w) => ({
          type: "readability" as const,
          message: w,
          severity: "medium" as const,
        })),
        suggestions: suggestions.map((s) => ({
          type: "improvement" as const,
          message: s,
          confidence: 0.8,
        })),
      };
    },
    [],
  );

  // Update story section
  const updateStorySection = useCallback(
    (key: keyof CampaignStory, value: string) => {
      setStory((prev) => ({ ...prev, [key]: value }));

      // Clear errors for this field
      setErrors((prev) => ({ ...prev, [key]: "" }));

      // Validate section
      const section = STORY_SECTIONS.find((s) => s.key === key);
      if (section) {
        const validation = validateSection(section, value);
        setValidationResults((prev) => ({ ...prev, [key]: validation }));
      }
    },
    [validateSection],
  );

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    STORY_SECTIONS.forEach((section) => {
      const value = (story[section.key] as string) || "";
      const validation = validateSection(section, value);

      if (!validation.isValid) {
        newErrors[section.key] = validation.errors[0]?.message || "Invalid";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [story, validateSection]);

  // Handle form submission
  const handleSave = useCallback(() => {
    if (validateForm()) {
      const completeStory: CampaignStory = {
        id: initialStory?.id || `story_${Date.now()}`,
        campaignId,
        problemStatement: story.problemStatement || "",
        solution: story.solution || "",
        impact: story.impact || "",
        callToAction: story.callToAction || "",
        vision: story.vision || "",
        mission: story.mission || "",
        urgency: story.urgency || "",
        createdAt: initialStory?.createdAt || new Date(),
        updatedAt: new Date(),
        version: (initialStory?.version || 0) + 1,
      };
      onSave(completeStory);
    }
  }, [story, campaignId, initialStory, validateForm, onSave]);

  const handleNext = useCallback(() => {
    if (validateForm()) {
      const completeStory: CampaignStory = {
        id: initialStory?.id || `story_${Date.now()}`,
        campaignId,
        problemStatement: story.problemStatement || "",
        solution: story.solution || "",
        impact: story.impact || "",
        callToAction: story.callToAction || "",
        vision: story.vision || "",
        mission: story.mission || "",
        urgency: story.urgency || "",
        createdAt: initialStory?.createdAt || new Date(),
        updatedAt: new Date(),
        version: (initialStory?.version || 0) + 1,
      };
      onNext?.(completeStory);
    }
  }, [story, campaignId, initialStory, validateForm, onNext]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">
          📖 Core Campaign Story
        </h1>
        <p className="text-slate-400 max-w-3xl mx-auto">
          Craft the foundation of your campaign messaging. This core story will
          be the basis for all your communications across different channels and
          audiences.
        </p>

        {/* Progress */}
        <div className="max-w-md mx-auto">
          <Progress
            value={completionPercentage()}
            max={100}
            label="Story Completion"
            showPercentage
            variant="info"
            size="md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Section Navigation */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white mb-4">
            Story Sections
          </h3>
          {STORY_SECTIONS.map((section) => {
            const value = (story[section.key] as string) || "";
            const validation = validationResults[section.key];
            const isComplete = value.length >= (section.minLength || 0);
            const hasErrors = validation && !validation.isValid;

            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                disabled={readOnly}
                className={`
                  w-full p-3 rounded-lg text-left transition-colors group
                  ${
                    activeSection === section.key
                      ? "bg-blue-600 text-white"
                      : hasErrors
                        ? "bg-red-900/20 text-red-300 hover:bg-red-900/30"
                        : isComplete
                          ? "bg-green-900/20 text-green-300 hover:bg-green-900/30"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{section.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{section.title}</div>
                      {section.required && (
                        <span className="text-xs opacity-75">Required</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {hasErrors && <span className="text-red-400">⚠️</span>}
                    {isComplete && !hasErrors && (
                      <span className="text-green-400">✓</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {STORY_SECTIONS.map((section) => (
            <div
              key={section.key}
              className={`${activeSection === section.key ? "block" : "hidden"} space-y-6`}
            >
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <span className="text-2xl">{section.icon}</span>
                        {section.title}
                        {section.required && (
                          <Badge variant="warning" size="sm">
                            Required
                          </Badge>
                        )}
                      </h2>
                      <p className="text-slate-400 mt-1">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <textarea
                      value={(story[section.key] as string) || ""}
                      onChange={(e) =>
                        updateStorySection(section.key, e.target.value)
                      }
                      placeholder={section.placeholder}
                      disabled={readOnly}
                      rows={6}
                      className={`
                        w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical
                        ${errors[section.key] ? "border-red-500" : "border-slate-700"}
                        ${readOnly ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    />

                    {/* Character count */}
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>
                        {((story[section.key] as string) || "").length}
                        {section.minLength && ` / ${section.minLength} min`}
                        {section.maxLength && ` / ${section.maxLength} max`}
                      </span>
                    </div>

                    {/* Validation Messages */}
                    {validationResults[section.key] && (
                      <div className="space-y-2">
                        {validationResults[section.key].errors.map(
                          (error, idx) => (
                            <p key={idx} className="text-red-400 text-sm">
                              {error.message}
                            </p>
                          ),
                        )}
                        {validationResults[section.key].warnings.map(
                          (warning, idx) => (
                            <p key={idx} className="text-yellow-400 text-sm">
                              {warning.message}
                            </p>
                          ),
                        )}
                        {validationResults[section.key].suggestions.map(
                          (suggestion, idx) => (
                            <p key={idx} className="text-blue-400 text-sm">
                              💡 {suggestion.message}
                            </p>
                          ),
                        )}
                      </div>
                    )}

                    {errors[section.key] && (
                      <p className="text-red-400 text-sm">
                        {errors[section.key]}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Tips */}
              <Card className="p-4 bg-blue-900/20 border-blue-800">
                <h4 className="text-sm font-medium text-blue-300 mb-2">
                  💡 Writing Tips
                </h4>
                <ul className="space-y-1">
                  {section.tips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-blue-200 flex items-start gap-2"
                    >
                      <span className="text-blue-400 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 pt-6 border-t border-slate-800">
        {onCancel && (
          <Button onClick={onCancel} variant="secondary" size="lg">
            Cancel
          </Button>
        )}

        <Button
          onClick={handleSave}
          variant="outline"
          size="lg"
          disabled={isLoading || readOnly}
        >
          {isLoading ? "Saving..." : "Save Draft"}
        </Button>

        {onNext && (
          <Button
            onClick={handleNext}
            variant="primary"
            size="lg"
            disabled={isLoading || readOnly || completionPercentage() < 60}
          >
            {isLoading ? "Saving..." : "Next: Talking Points →"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CoreStoryBuilder;
