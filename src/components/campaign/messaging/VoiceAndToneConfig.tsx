import React, { useState, useCallback } from "react";

import { Button, Card, Badge, Select, Progress } from "../../ui-kit";

import type { VoiceSettings, MessageTone } from "./types";

interface VoiceAndToneConfigProps {
  initialSettings?: Partial<VoiceSettings>;
  onSave: (settings: VoiceSettings) => void;
  onNext?: (settings: VoiceSettings) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

const TONE_OPTIONS = [
  {
    value: "urgent",
    label: "Urgent",
    description: "Time-sensitive, action-oriented messaging",
    icon: "⚡",
    color: "text-red-400",
    example: "Act now before it's too late - every moment counts!",
  },
  {
    value: "hopeful",
    label: "Hopeful",
    description: "Optimistic and inspiring messaging",
    icon: "🌟",
    color: "text-yellow-400",
    example: "Together, we can create a brighter future for everyone.",
  },
  {
    value: "celebratory",
    label: "Celebratory",
    description: "Joyful and uplifting messaging",
    icon: "🎉",
    color: "text-green-400",
    example: "What an incredible milestone - let's celebrate this achievement!",
  },
  {
    value: "inspiring",
    label: "Inspiring",
    description: "Motivational and empowering messaging",
    icon: "🚀",
    color: "text-blue-400",
    example: "Your support transforms lives and builds lasting change.",
  },
  {
    value: "conversational",
    label: "Conversational",
    description: "Friendly and approachable messaging",
    icon: "💬",
    color: "text-purple-400",
    example: "We wanted to share some exciting news with you...",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Formal and authoritative messaging",
    icon: "📋",
    color: "text-slate-400",
    example: "We are pleased to present our quarterly impact report.",
  },
];

const WRITING_STYLE_OPTIONS = [
  {
    value: "formal",
    label: "Formal",
    description: "Traditional, professional language",
  },
  {
    value: "conversational",
    label: "Conversational",
    description: "Friendly, approachable language",
  },
  {
    value: "friendly",
    label: "Friendly",
    description: "Warm, personal language",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Business-appropriate language",
  },
];

const VOCABULARY_LEVEL_OPTIONS = [
  {
    value: "simple",
    label: "Simple",
    description: "Easy to understand, accessible language",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Balanced complexity, general audience",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Sophisticated language for educated audiences",
  },
];

const PERSONALITY_TRAITS = [
  "Compassionate",
  "Trustworthy",
  "Innovative",
  "Collaborative",
  "Impact-focused",
  "Transparent",
  "Community-driven",
  "Solution-oriented",
  "Empowering",
  "Authentic",
  "Results-driven",
  "People-first",
];

export const VoiceAndToneConfig: React.FC<VoiceAndToneConfigProps> = ({
  initialSettings,
  onSave,
  onNext,
  onCancel,
  isLoading = false,
  readOnly = false,
}) => {
  const [settings, setSettings] = useState<Partial<VoiceSettings>>({
    brandPersonality: [],
    writingStyle: "conversational",
    vocabularyLevel: "moderate",
    primaryTone: "hopeful",
    allowedTones: ["hopeful", "inspiring"],
    attributes: {
      warmth: 4,
      authority: 3,
      enthusiasm: 4,
      urgency: 2,
    },
    dosList: [],
    dontsList: [],
    goodExamples: [],
    badExamples: [],
    ...initialSettings,
  });

  const [activeSection, setActiveSection] = useState<string>("personality");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate completion percentage
  const completionPercentage = useCallback(() => {
    let completed = 0;
    const total = 7;

    if (settings.brandPersonality && settings.brandPersonality.length > 0)
      completed++;
    if (settings.writingStyle) completed++;
    if (settings.vocabularyLevel) completed++;
    if (settings.primaryTone) completed++;
    if (settings.allowedTones && settings.allowedTones.length > 0) completed++;
    if (settings.attributes) completed++;
    if (
      (settings.dosList && settings.dosList.length > 0) ||
      (settings.dontsList && settings.dontsList.length > 0)
    )
      completed++;

    return Math.round((completed / total) * 100);
  }, [settings]);

  // Add/remove personality trait
  const togglePersonalityTrait = useCallback((trait: string) => {
    setSettings((prev) => ({
      ...prev,
      brandPersonality: prev.brandPersonality?.includes(trait)
        ? prev.brandPersonality.filter((t) => t !== trait)
        : [...(prev.brandPersonality || []), trait],
    }));
  }, []);

  // Update attribute slider
  const updateAttribute = useCallback(
    (attribute: keyof VoiceSettings["attributes"], value: number) => {
      setSettings((prev) => ({
        ...prev,
        attributes: {
          warmth: 3,
          authority: 3,
          enthusiasm: 3,
          urgency: 2,
          ...prev.attributes,
          [attribute]: value,
        },
      }));
    },
    [],
  );

  // Add/remove allowed tone
  const toggleAllowedTone = useCallback((tone: MessageTone) => {
    setSettings((prev) => ({
      ...prev,
      allowedTones: prev.allowedTones?.includes(tone)
        ? prev.allowedTones.filter((t) => t !== tone)
        : [...(prev.allowedTones || []), tone],
    }));
  }, []);

  // Add guideline item
  const addGuidelineItem = useCallback(
    (type: "dosList" | "dontsList", item: string) => {
      if (!item.trim()) return;

      setSettings((prev) => ({
        ...prev,
        [type]: [...(prev[type] || []), item.trim()],
      }));
    },
    [],
  );

  // Remove guideline item
  const removeGuidelineItem = useCallback(
    (type: "dosList" | "dontsList", index: number) => {
      setSettings((prev) => ({
        ...prev,
        [type]: prev[type]?.filter((_, i) => i !== index) || [],
      }));
    },
    [],
  );

  // Add example
  const addExample = useCallback(
    (type: "goodExamples" | "badExamples", example: string) => {
      if (!example.trim()) return;

      setSettings((prev) => ({
        ...prev,
        [type]: [...(prev[type] || []), example.trim()],
      }));
    },
    [],
  );

  // Remove example
  const removeExample = useCallback(
    (type: "goodExamples" | "badExamples", index: number) => {
      setSettings((prev) => ({
        ...prev,
        [type]: prev[type]?.filter((_, i) => i !== index) || [],
      }));
    },
    [],
  );

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!settings.brandPersonality || settings.brandPersonality.length === 0) {
      newErrors.personality = "Select at least one personality trait";
    }

    if (!settings.primaryTone) {
      newErrors.primaryTone = "Primary tone is required";
    }

    if (!settings.allowedTones || settings.allowedTones.length === 0) {
      newErrors.allowedTones = "Select at least one allowed tone";
    }

    if (
      settings.primaryTone &&
      settings.allowedTones &&
      !settings.allowedTones.includes(settings.primaryTone)
    ) {
      newErrors.toneConsistency =
        "Primary tone must be included in allowed tones";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [settings]);

  // Handle save
  const handleSave = useCallback(() => {
    if (validateForm()) {
      const completeSettings: VoiceSettings = {
        brandPersonality: settings.brandPersonality || [],
        writingStyle: settings.writingStyle || "conversational",
        vocabularyLevel: settings.vocabularyLevel || "moderate",
        primaryTone: settings.primaryTone || "hopeful",
        allowedTones: settings.allowedTones || ["hopeful"],
        attributes: {
          warmth: 3,
          authority: 3,
          enthusiasm: 3,
          urgency: 2,
          ...settings.attributes,
        },
        dosList: settings.dosList || [],
        dontsList: settings.dontsList || [],
        goodExamples: settings.goodExamples || [],
        badExamples: settings.badExamples || [],
      };
      onSave(completeSettings);
    }
  }, [settings, validateForm, onSave]);

  const handleNext = useCallback(() => {
    if (validateForm()) {
      const completeSettings: VoiceSettings = {
        brandPersonality: settings.brandPersonality || [],
        writingStyle: settings.writingStyle || "conversational",
        vocabularyLevel: settings.vocabularyLevel || "moderate",
        primaryTone: settings.primaryTone || "hopeful",
        allowedTones: settings.allowedTones || ["hopeful"],
        attributes: {
          warmth: 3,
          authority: 3,
          enthusiasm: 3,
          urgency: 2,
          ...settings.attributes,
        },
        dosList: settings.dosList || [],
        dontsList: settings.dontsList || [],
        goodExamples: settings.goodExamples || [],
        badExamples: settings.badExamples || [],
      };
      onNext?.(completeSettings);
    }
  }, [settings, validateForm, onNext]);

  const sections = [
    { id: "personality", title: "Brand Personality", icon: "👥" },
    { id: "style", title: "Writing Style", icon: "✍️" },
    { id: "tone", title: "Tone Settings", icon: "🎵" },
    { id: "attributes", title: "Voice Attributes", icon: "⚖️" },
    { id: "guidelines", title: "Guidelines", icon: "📋" },
    { id: "examples", title: "Examples", icon: "💡" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">
          🎵 Voice & Tone Configuration
        </h1>
        <p className="text-slate-400 max-w-3xl mx-auto">
          Define your organization's voice and tone to ensure consistent,
          authentic messaging across all campaign communications.
        </p>

        <div className="max-w-md mx-auto">
          <Progress
            value={completionPercentage()}
            max={100}
            label="Configuration Completion"
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
            Configuration
          </h3>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              disabled={readOnly}
              className={`
                w-full p-3 rounded-lg text-left transition-colors
                ${
                  activeSection === section.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{section.icon}</span>
                <span className="font-medium text-sm">{section.title}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Brand Personality */}
          {activeSection === "personality" && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  👥 Brand Personality
                </h2>
                <p className="text-slate-400">
                  Select traits that best describe your organization's
                  personality and values.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PERSONALITY_TRAITS.map((trait) => (
                  <button
                    key={trait}
                    onClick={() => togglePersonalityTrait(trait)}
                    disabled={readOnly}
                    className={`
                      p-3 rounded-lg text-sm font-medium transition-colors border
                      ${
                        settings.brandPersonality?.includes(trait)
                          ? "bg-blue-600 text-white border-blue-500"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }
                    `}
                  >
                    {trait}
                  </button>
                ))}
              </div>

              {errors.personality && (
                <p className="text-red-400 text-sm">{errors.personality}</p>
              )}

              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <h4 className="text-blue-300 font-medium mb-2">
                  Selected Personality
                </h4>
                {settings.brandPersonality &&
                settings.brandPersonality.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {settings.brandPersonality.map((trait) => (
                      <Badge key={trait} variant="info">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">
                    No personality traits selected
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Writing Style */}
          {activeSection === "style" && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  ✍️ Writing Style
                </h2>
                <p className="text-slate-400">
                  Choose your preferred writing style and vocabulary level.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Select
                    value={settings.writingStyle || ""}
                    onChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        writingStyle: value as any,
                      }))
                    }
                    options={WRITING_STYLE_OPTIONS}
                    label="Writing Style"
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Select
                    value={settings.vocabularyLevel || ""}
                    onChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        vocabularyLevel: value as any,
                      }))
                    }
                    options={VOCABULARY_LEVEL_OPTIONS}
                    label="Vocabulary Level"
                    disabled={readOnly}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Tone Settings */}
          {activeSection === "tone" && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  🎵 Tone Settings
                </h2>
                <p className="text-slate-400">
                  Set your primary tone and define which tones are appropriate
                  for your campaigns.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Primary Tone <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          primaryTone: tone.value as MessageTone,
                        }))
                      }
                      disabled={readOnly}
                      className={`
                        p-4 rounded-lg text-left transition-colors border
                        ${
                          settings.primaryTone === tone.value
                            ? "bg-blue-600 text-white border-blue-500"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{tone.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium">{tone.label}</div>
                          <p className="text-sm opacity-80 mt-1">
                            {tone.description}
                          </p>
                          <p className="text-xs opacity-60 mt-2 italic">
                            "{tone.example}"
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.primaryTone && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.primaryTone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Allowed Tones <span className="text-red-400">*</span>
                </label>
                <p className="text-sm text-slate-400 mb-3">
                  Select all tones that are appropriate for your organization
                </p>
                <div className="flex flex-wrap gap-2">
                  {TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() =>
                        toggleAllowedTone(tone.value as MessageTone)
                      }
                      disabled={readOnly}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                        ${
                          settings.allowedTones?.includes(
                            tone.value as MessageTone,
                          )
                            ? "bg-green-600 text-white border-green-500"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                        }
                      `}
                    >
                      {tone.icon} {tone.label}
                    </button>
                  ))}
                </div>
                {errors.allowedTones && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.allowedTones}
                  </p>
                )}
                {errors.toneConsistency && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.toneConsistency}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Voice Attributes */}
          {activeSection === "attributes" && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  ⚖️ Voice Attributes
                </h2>
                <p className="text-slate-400">
                  Adjust these sliders to define the characteristics of your
                  voice.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    key: "warmth",
                    label: "Warmth",
                    description: "How friendly and approachable",
                  },
                  {
                    key: "authority",
                    label: "Authority",
                    description: "How knowledgeable and credible",
                  },
                  {
                    key: "enthusiasm",
                    label: "Enthusiasm",
                    description: "How energetic and passionate",
                  },
                  {
                    key: "urgency",
                    label: "Urgency",
                    description: "How time-sensitive and pressing",
                  },
                ].map((attribute) => (
                  <div key={attribute.key}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <label className="text-sm font-medium text-slate-200">
                          {attribute.label}
                        </label>
                        <p className="text-xs text-slate-400">
                          {attribute.description}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {settings.attributes?.[
                          attribute.key as keyof VoiceSettings["attributes"]
                        ] || 3}
                        /5
                      </Badge>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={
                        settings.attributes?.[
                          attribute.key as keyof VoiceSettings["attributes"]
                        ] || 3
                      }
                      onChange={(e) =>
                        updateAttribute(
                          attribute.key as keyof VoiceSettings["attributes"],
                          Number(e.target.value),
                        )
                      }
                      disabled={readOnly}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Guidelines */}
          {activeSection === "guidelines" && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  📋 Writing Guidelines
                </h2>
                <p className="text-slate-400">
                  Create do's and don'ts to guide your messaging consistency.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Do's */}
                <div>
                  <h4 className="font-medium text-green-300 mb-3">✅ Do's</h4>
                  <div className="space-y-3">
                    {(settings.dosList || []).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-slate-800 p-3 rounded"
                      >
                        <span className="flex-1 text-sm text-slate-200">
                          {item}
                        </span>
                        <button
                          onClick={() => removeGuidelineItem("dosList", index)}
                          className="text-red-400 hover:text-red-300"
                          disabled={readOnly}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <GuidelineInput
                      placeholder="Add a writing guideline..."
                      onAdd={(item) => addGuidelineItem("dosList", item)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                {/* Don'ts */}
                <div>
                  <h4 className="font-medium text-red-300 mb-3">❌ Don'ts</h4>
                  <div className="space-y-3">
                    {(settings.dontsList || []).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-slate-800 p-3 rounded"
                      >
                        <span className="flex-1 text-sm text-slate-200">
                          {item}
                        </span>
                        <button
                          onClick={() =>
                            removeGuidelineItem("dontsList", index)
                          }
                          className="text-red-400 hover:text-red-300"
                          disabled={readOnly}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <GuidelineInput
                      placeholder="Add what to avoid..."
                      onAdd={(item) => addGuidelineItem("dontsList", item)}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Examples */}
          {activeSection === "examples" && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  💡 Examples
                </h2>
                <p className="text-slate-400">
                  Provide examples of good and bad messaging to guide writers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Good Examples */}
                <div>
                  <h4 className="font-medium text-green-300 mb-3">
                    ✅ Good Examples
                  </h4>
                  <div className="space-y-3">
                    {(settings.goodExamples || []).map((example, index) => (
                      <div key={index} className="bg-slate-800 p-3 rounded">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm text-slate-200 flex-1">
                            "{example}"
                          </p>
                          <button
                            onClick={() => removeExample("goodExamples", index)}
                            className="text-red-400 hover:text-red-300 flex-shrink-0"
                            disabled={readOnly}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    <ExampleInput
                      placeholder="Add a good messaging example..."
                      onAdd={(example) => addExample("goodExamples", example)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                {/* Bad Examples */}
                <div>
                  <h4 className="font-medium text-red-300 mb-3">
                    ❌ Bad Examples
                  </h4>
                  <div className="space-y-3">
                    {(settings.badExamples || []).map((example, index) => (
                      <div key={index} className="bg-slate-800 p-3 rounded">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm text-slate-200 flex-1">
                            "{example}"
                          </p>
                          <button
                            onClick={() => removeExample("badExamples", index)}
                            className="text-red-400 hover:text-red-300 flex-shrink-0"
                            disabled={readOnly}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    <ExampleInput
                      placeholder="Add what NOT to write..."
                      onAdd={(example) => addExample("badExamples", example)}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
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
            {isLoading ? "Saving..." : "Next: Message Preview →"}
          </Button>
        )}
      </div>
    </div>
  );
};

// Helper components
const GuidelineInput: React.FC<{
  placeholder: string;
  onAdd: (item: string) => void;
  disabled?: boolean;
}> = ({ placeholder, onAdd, disabled }) => {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <Button
        onClick={handleAdd}
        size="sm"
        variant="outline"
        disabled={disabled}
      >
        Add
      </Button>
    </div>
  );
};

const ExampleInput: React.FC<{
  placeholder: string;
  onAdd: (example: string) => void;
  disabled?: boolean;
}> = ({ placeholder, onAdd, disabled }) => {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue("");
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
      />
      <Button
        onClick={handleAdd}
        size="sm"
        variant="outline"
        disabled={disabled}
        className="w-full"
      >
        Add Example
      </Button>
    </div>
  );
};

export default VoiceAndToneConfig;
