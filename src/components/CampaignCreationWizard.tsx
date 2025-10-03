import {
  ArrowLeft,
  ArrowRight,
  Target,
  Calendar,
  Palette,
  Eye,
  Rocket,
  DollarSign,
  Users,
  Heart,
  Building,
  Gift,
  Star,
} from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";

import Modal from "@/components/ui-kit/Modal";
import { useToast } from "@/context/ToastContext";
import { createCampaign } from "@/services/campaignService";
import { validateCampaign } from "@/utils/validation";

interface CampaignWizardProps {
  open: boolean;
  onClose: () => void;
  clientId?: string;
  onSaved?: (campaign: any) => void;
}

interface WizardFormData {
  name: string;
  type: string;
  description: string;
  goal: number;
  startDate: string;
  endDate: string;
  category:
    | "General"
    | "Education"
    | "Healthcare"
    | "Environment"
    | "Emergency";
  targetAudience: string;
  theme: string;
  isPublic: boolean;
  tags: string[];
}

const campaignTypes = [
  {
    id: "annual",
    name: "Annual Fund",
    icon: Calendar,
    description: "Ongoing general support campaign",
  },
  {
    id: "capital",
    name: "Capital Campaign",
    icon: Building,
    description: "Major infrastructure or building project",
  },
  {
    id: "emergency",
    name: "Emergency Fund",
    icon: Heart,
    description: "Urgent crisis response fundraising",
  },
  {
    id: "program",
    name: "Program Funding",
    icon: Users,
    description: "Specific program or service support",
  },
  {
    id: "event",
    name: "Event Fundraising",
    icon: Star,
    description: "Fundraising tied to specific events",
  },
  {
    id: "endowment",
    name: "Endowment",
    icon: Gift,
    description: "Long-term sustainability funding",
  },
];

const themes = [
  { id: "blue", name: "Ocean Blue", primary: "#3B82F6", secondary: "#EFF6FF" },
  {
    id: "green",
    name: "Forest Green",
    primary: "#10B981",
    secondary: "#ECFDF5",
  },
  {
    id: "purple",
    name: "Royal Purple",
    primary: "#8B5CF6",
    secondary: "#F5F3FF",
  },
  { id: "red", name: "Passion Red", primary: "#EF4444", secondary: "#FEF2F2" },
  {
    id: "orange",
    name: "Sunset Orange",
    primary: "#F97316",
    secondary: "#FFF7ED",
  },
  { id: "teal", name: "Ocean Teal", primary: "#14B8A6", secondary: "#F0FDFA" },
];

const defaultValues: WizardFormData = {
  name: "",
  type: "",
  description: "",
  goal: 10000,
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  category: "General",
  targetAudience: "",
  theme: "blue",
  isPublic: true,
  tags: [],
};

const CampaignCreationWizard: React.FC<CampaignWizardProps> = ({
  open,
  onClose,
  clientId,
  onSaved,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const { success, error: toastError } = useToast();

  const totalSteps = 5;

  /* ------------------------------ Reset on open ------------------------------ */
  useEffect(() => {
    if (!open) return;

    // Reset form when modal opens
    setCurrentStep(1);
    setFormData(defaultValues);
    setError(null);
    setSaving(false);

    // Focus name input after a brief delay
    const timer = setTimeout(() => nameRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open]);

  /* ------------------------------ Helpers/State ------------------------------ */
  const updateFormData = (field: keyof WizardFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setValidationErrors([]); // Clear validation errors when user makes changes
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const nextStep = useCallback(() => {
    setCurrentStep((s) => (s < totalSteps ? s + 1 : s));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => (s > 1 ? s - 1 : s));
  }, []);

  const getStepValidation = useCallback(
    (step: number) => {
      switch (step) {
        case 1:
          return (
            formData.name.trim() && formData.type && formData.description.trim()
          );
        case 2:
          return formData.goal > 0;
        case 3:
          return !!formData.startDate && !!formData.endDate;
        case 4:
          return true; // Theme is optional
        case 5:
          return true; // Preview step
        default:
          return false;
      }
    },
    [formData],
  );

  const validate = (): string[] => {
    // Use the comprehensive validation utility
    const campaignData = {
      clientId: clientId || "",
      name: formData.name,
      description: formData.description,
      goal: formData.goal,
      startDate: formData.startDate,
      endDate: formData.endDate,
      category: formData.category,
      targetAudience: formData.targetAudience,
      tags: formData.tags,
    };

    const validation = validateCampaign(campaignData);
    return validation.success ? [] : Object.values(validation.errors || {});
  };

  const handleSubmit = async () => {
    if (saving) return;

    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      setError("Please fix the validation errors below");
      // Show first validation error as toast
      toastError("Validation Error", validationErrors[0]);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setValidationErrors([]);

      const campaignData = {
        clientId: clientId || "",
        name: formData.name,
        description: formData.description,
        goal: formData.goal,
        startDate: formData.startDate,
        endDate: formData.endDate,
        category: formData.category,
        targetAudience: formData.targetAudience,
        tags: formData.tags,
      };

      const newCampaign = await createCampaign(campaignData);
      onSaved?.(newCampaign);

      // Success feedback with toast
      success(
        "Campaign Created!",
        `"${formData.name}" has been successfully created and is ready to launch.`,
        { duration: 6000 },
      );
      onClose();
    } catch (err: any) {
      console.error("Campaign creation error:", err);
      const errorMessage = err?.message || "Failed to create campaign";
      setError(errorMessage);
      toastError("Campaign Creation Failed", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------- Keyboard navigation UX ------------------------- */
  useEffect(() => {
    if (!open) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Allow Escape to close
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Arrow keys for navigation (when not in input fields)
      if (
        e.target instanceof HTMLElement &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
      ) {
        if (
          e.key === "ArrowRight" &&
          currentStep < totalSteps &&
          getStepValidation(currentStep)
        ) {
          e.preventDefault();
          nextStep();
        } else if (e.key === "ArrowLeft" && currentStep > 1) {
          e.preventDefault();
          prevStep();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    open,
    currentStep,
    totalSteps,
    getStepValidation,
    nextStep,
    prevStep,
    onClose,
  ]);

  /* --------------------------------- Derived -------------------------------- */
  const currentTheme = themes.find((t) => t.id === formData.theme) || themes[0];
  const selectedType = campaignTypes.find((t) => t.id === formData.type);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  const calculateDaysLeft = () => {
    if (!formData.endDate) return null;
    const today = new Date();
    const endDate = new Date(formData.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /* ----------------------------- Small components ---------------------------- */
  const Progress = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          Create New Campaign
        </h2>
        <span className="text-sm text-slate-400">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <div className="text-xs text-slate-500 mt-2 text-center">
        Use ← → arrow keys to navigate steps, or Esc to close
      </div>
    </div>
  );

  const StepNavigation = () => (
    <div className="flex justify-between pt-6 border-t border-slate-700/50">
      <button
        type="button"
        onClick={prevStep}
        disabled={currentStep === 1}
        className="button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Previous
      </button>

      {currentStep < totalSteps ? (
        <button
          type="button"
          onClick={nextStep}
          disabled={!getStepValidation(currentStep)}
          className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="button-primary disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Launch Campaign
            </>
          )}
        </button>
      )}
    </div>
  );

  /* ---------------------------------- Render --------------------------------- */
  return (
    <Modal open={open} onClose={onClose}>
      <div className="max-w-2xl mx-auto">
        <Progress />

        {(error || validationErrors.length > 0) && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            {validationErrors.length > 0 && (
              <div className="space-y-1">
                {validationErrors.map((err, i) => (
                  <p
                    key={i}
                    className="text-red-400 text-sm flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {err}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">
                Campaign Basics
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Let's start with the fundamental details
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Campaign Name <span className="text-red-400">*</span>
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="e.g., Summer Learning Program 2024"
                  className="input-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Campaign Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {campaignTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        title={type.description}
                        onClick={() => updateFormData("type", type.id)}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          formData.type === type.id
                            ? "border-blue-500 bg-blue-500/10 text-blue-400"
                            : "border-slate-700 hover:border-slate-600 text-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon
                            className={`w-5 h-5 mt-0.5 ${
                              formData.type === type.id
                                ? "text-blue-400"
                                : "text-slate-400"
                            }`}
                          />
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-sm text-slate-400 mt-1">
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Campaign Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData("description", e.target.value)
                  }
                  placeholder="Describe what this campaign will accomplish and why it matters..."
                  rows={4}
                  className="input-base resize-none"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Goal Setting */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DollarSign className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">
                Set Your Goal
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                How much do you want to raise?
              </p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <label className="block text-sm font-medium text-text-primary mb-4">
                  Fundraising Goal
                </label>
                <div className="inline-flex items-center">
                  <span className="text-3xl font-bold text-white">$</span>
                  <input
                    type="number"
                    value={formData.goal}
                    onChange={(e) =>
                      updateFormData("goal", parseInt(e.target.value) || 0)
                    }
                    className="text-3xl font-bold text-white border-none focus:ring-0 bg-transparent w-40 text-center input-base"
                    min="0"
                    step="100"
                  />
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={formData.goal}
                  onChange={(e) =>
                    updateFormData("goal", parseInt(e.target.value))
                  }
                  className="w-full mt-4 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-slate-400 mt-2">
                  <span>$1,000</span>
                  <span>$100,000</span>
                </div>
              </div>

              {/* Goal Preview */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <h4 className="font-medium text-white mb-4">Goal Preview</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Goal Amount</span>
                    <span className="font-medium text-white">
                      {formatCurrency(formData.goal)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full relative transition-all duration-1000 ease-out"
                      style={{ width: "23%" }}
                    >
                      <span className="absolute right-2 top-0 text-xs text-white leading-3">
                        23%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>{formatCurrency(formData.goal * 0.23)} raised</span>
                    <span>47 donors</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-400">
                    {formatCurrency(formData.goal / 4)}
                  </div>
                  <div className="text-xs text-slate-400">25% Milestone</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-400">
                    {formatCurrency(formData.goal / 2)}
                  </div>
                  <div className="text-xs text-slate-400">50% Milestone</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-400">
                    {formatCurrency(formData.goal)}
                  </div>
                  <div className="text-xs text-slate-400">Final Goal</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Timeline */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">
                Campaign Timeline
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                When will your campaign run?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Start Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData("startDate", e.target.value)}
                  className="input-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  End Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateFormData("endDate", e.target.value)}
                  min={formData.startDate}
                  className="input-base"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    updateFormData(
                      "category",
                      e.target.value as
                        | "General"
                        | "Education"
                        | "Healthcare"
                        | "Environment"
                        | "Emergency",
                    )
                  }
                  className="input-base"
                >
                  <option value="General">General</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Environment">Environment</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) =>
                    updateFormData("targetAudience", e.target.value)
                  }
                  placeholder="e.g., Individual donors and families"
                  className="input-base"
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">
                  Timeline Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Campaign Duration</span>
                    <span className="text-white">
                      {Math.ceil(
                        (new Date(formData.endDate).getTime() -
                          new Date(formData.startDate).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Days until launch</span>
                    <span className="text-white">
                      {Math.max(
                        0,
                        Math.ceil(
                          (new Date(formData.startDate).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24),
                        ),
                      )}{" "}
                      days
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Campaign Visibility
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.isPublic}
                    onChange={() => updateFormData("isPublic", true)}
                    className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                  />
                  <div>
                    <div className="font-medium text-white">
                      Public Campaign
                    </div>
                    <div className="text-sm text-slate-400">
                      Anyone can view and donate to this campaign
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!formData.isPublic}
                    onChange={() => updateFormData("isPublic", false)}
                    className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                  />
                  <div>
                    <div className="font-medium text-white">
                      Private Campaign
                    </div>
                    <div className="text-sm text-slate-400">
                      Only people with the link can access this campaign
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Customization */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Palette className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">
                Customize Your Campaign
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Choose colors and add tags
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Color Theme
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      title={`${theme.name} theme - Primary: ${theme.primary}`}
                      onClick={() => updateFormData("theme", theme.id)}
                      className={`p-3 border rounded-lg transition-colors ${
                        formData.theme === theme.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: theme.secondary }}
                        />
                      </div>
                      <div className="text-sm font-medium text-white">
                        {theme.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Campaign Tags (Optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    "Education",
                    "Health",
                    "Environment",
                    "Arts",
                    "Community",
                    "Emergency",
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      title={`Add "${tag}" tag to help categorize your campaign`}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.tags.includes(tag)
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add custom tag..."
                  className="input-base text-sm"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      toggleTag(e.currentTarget.value.trim());
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>

              {/* Theme Preview */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <h4 className="font-medium text-white mb-4">Preview</h4>
                <div
                  className="rounded-lg p-4 text-white"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <h3 className="text-lg font-bold mb-2">
                    {formData.name || "Your Campaign Name"}
                  </h3>
                  <p className="opacity-90 text-sm">
                    {formData.description ||
                      "Your campaign description will appear here..."}
                  </p>
                  <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: "30%" }}
                    />
                  </div>
                  <div className="mt-2 text-sm opacity-90">
                    $3,000 raised of {formatCurrency(formData.goal)} goal
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Preview & Launch */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Eye className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white">
                Preview & Launch
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Review your campaign before launching
              </p>
            </div>

            {/* Campaign Preview */}
            <div className="border border-slate-700/50 rounded-lg overflow-hidden">
              <div
                className="h-24 relative"
                style={{ backgroundColor: currentTheme.secondary }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <h2
                    className="text-lg font-bold"
                    style={{ color: currentTheme.primary }}
                  >
                    {formData.name}
                  </h2>
                  {selectedType && (
                    <span
                      className="text-sm opacity-80"
                      style={{ color: currentTheme.primary }}
                    >
                      {selectedType.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <p className="text-slate-300 mb-4 text-sm">
                  {formData.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">
                      {formatCurrency(formData.goal * 0.27)}
                    </span>
                    <span className="text-slate-400 text-sm">
                      raised of {formatCurrency(formData.goal)} goal
                    </span>
                  </div>

                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        backgroundColor: currentTheme.primary,
                        width: "27%",
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-sm text-slate-400">
                    <span>27% complete</span>
                    <span>{calculateDaysLeft()} days left</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">52</div>
                    <div className="text-xs text-slate-400">Supporters</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">$127</div>
                    <div className="text-xs text-slate-400">Average Gift</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">73%</div>
                    <div className="text-xs text-slate-400">to Goal</div>
                  </div>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full text-xs text-white"
                        style={{ backgroundColor: currentTheme.primary }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  className="w-full py-2 rounded-lg text-white font-semibold text-sm"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  Donate Now
                </button>
              </div>
            </div>

            {/* Campaign Summary */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">
                Campaign Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Campaign Type</span>
                  <span className="text-white">{selectedType?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Goal Amount</span>
                  <span className="text-white">
                    {formatCurrency(formData.goal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white">
                    {Math.ceil(
                      (new Date(formData.endDate).getTime() -
                        new Date(formData.startDate).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Visibility</span>
                  <span className="text-white">
                    {formData.isPublic ? "Public" : "Private"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Theme</span>
                  <span className="text-white">{currentTheme.name}</span>
                </div>
                {formData.category && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category</span>
                    <span className="text-white">{formData.category}</span>
                  </div>
                )}
                {formData.targetAudience && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Audience</span>
                    <span className="text-white">
                      {formData.targetAudience}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <StepNavigation />
      </div>
    </Modal>
  );
};

export default CampaignCreationWizard;
