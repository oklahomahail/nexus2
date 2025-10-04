import clsx from "clsx";
import React, { useState } from "react";

import {
  DateRangePicker,
  Select,
  RadioGroup,
  CheckboxGroup,
  Badge,
  Progress,
  Button,
} from "../ui-kit";

// Campaign data types
export interface CampaignOverview {
  name: string;
  type: "annual" | "giving-day" | "event" | "capital" | "endowment";
  season: string;
  theme?: string;
  startDate: Date | null;
  endDate: Date | null;
  phases: CampaignPhase[];
  goals: CampaignGoal[];
  description?: string;
  tags: string[];
}

export interface CampaignPhase {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  type: "cultivation" | "solicitation" | "stewardship";
  description?: string;
}

export interface CampaignGoal {
  id: string;
  type:
    | "revenue"
    | "donor-count"
    | "recurring-signups"
    | "retention"
    | "acquisition";
  target: number;
  unit: "dollars" | "count" | "percentage";
  priority: "primary" | "secondary";
  description?: string;
}

interface CampaignOverviewBuilderProps {
  initialData?: Partial<CampaignOverview>;
  onSave: (data: CampaignOverview) => void;
  onNext: (data: CampaignOverview) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CampaignOverviewBuilder: React.FC<
  CampaignOverviewBuilderProps
> = ({ initialData, onSave, onNext, onCancel, isLoading = false }) => {
  // Form state
  const [formData, setFormData] = useState<CampaignOverview>({
    name: initialData?.name || "",
    type: initialData?.type || "annual",
    season: initialData?.season || "",
    theme: initialData?.theme || "",
    startDate: initialData?.startDate || null,
    endDate: initialData?.endDate || null,
    phases: initialData?.phases || [],
    goals: initialData?.goals || [],
    description: initialData?.description || "",
    tags: initialData?.tags || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Campaign type options
  const campaignTypes = [
    {
      value: "annual",
      label: "Annual Campaign",
      description: "Yearly fundraising campaign for operational support",
    },
    {
      value: "giving-day",
      label: "Giving Day",
      description: "24-48 hour intensive fundraising campaign",
    },
    {
      value: "event",
      label: "Event Campaign",
      description: "Fundraising campaign tied to a specific event",
    },
    {
      value: "capital",
      label: "Capital Campaign",
      description: "Major campaign for building, equipment, or infrastructure",
    },
    {
      value: "endowment",
      label: "Endowment Campaign",
      description: "Long-term campaign for permanent fund establishment",
    },
  ];

  // Season/theme options
  const seasonOptions = [
    { label: "Spring Campaign", value: "spring" },
    { label: "Summer Appeal", value: "summer" },
    { label: "Fall Campaign", value: "fall" },
    { label: "Winter/Holiday Appeal", value: "winter" },
    { label: "Year-End Giving", value: "year-end" },
    { label: "Giving Tuesday", value: "giving-tuesday" },
    { label: "Custom/Other", value: "custom" },
  ];

  // Goal type options
  const goalTypes = [
    {
      value: "revenue",
      label: "Revenue Goal",
      description: "Total fundraising amount target",
    },
    {
      value: "donor-count",
      label: "Donor Count",
      description: "Number of donors participating",
    },
    {
      value: "recurring-signups",
      label: "Recurring Donors",
      description: "New monthly/recurring donor signups",
    },
    {
      value: "retention",
      label: "Donor Retention",
      description: "Percentage of previous donors retained",
    },
    {
      value: "acquisition",
      label: "New Donor Acquisition",
      description: "Number of first-time donors acquired",
    },
  ];

  // Tag options
  const tagOptions = [
    { value: "urgent", label: "Urgent" },
    { value: "major-gift", label: "Major Gift Focus" },
    { value: "peer-to-peer", label: "Peer-to-Peer" },
    { value: "corporate", label: "Corporate Partnership" },
    { value: "foundation", label: "Foundation Grants" },
    { value: "online", label: "Digital First" },
    { value: "traditional", label: "Traditional Media" },
    { value: "community", label: "Community Focused" },
  ];

  // Generate default phases based on campaign type and dates
  const generateDefaultPhases = (
    type: string,
    startDate: Date,
    endDate: Date,
  ): CampaignPhase[] => {
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (type === "giving-day") {
      return [
        {
          id: "1",
          name: "Pre-Campaign Cultivation",
          type: "cultivation",
          startDate: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before
          endDate: startDate,
          description: "Build excitement and prepare donors",
        },
        {
          id: "2",
          name: "Giving Day Solicitation",
          type: "solicitation",
          startDate,
          endDate,
          description: "Intensive 24-hour giving push",
        },
        {
          id: "3",
          name: "Post-Campaign Stewardship",
          type: "stewardship",
          startDate: new Date(endDate.getTime() + 24 * 60 * 60 * 1000), // 1 day after
          endDate: new Date(endDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks after
          description: "Thank donors and report results",
        },
      ];
    } else {
      // Standard three-phase campaign
      const cultivationDays = Math.floor(totalDays * 0.4);
      const solicitationDays = Math.floor(totalDays * 0.5);

      const cultivationEnd = new Date(
        startDate.getTime() + cultivationDays * 24 * 60 * 60 * 1000,
      );
      const solicitationEnd = new Date(
        cultivationEnd.getTime() + solicitationDays * 24 * 60 * 60 * 1000,
      );

      return [
        {
          id: "1",
          name: "Cultivation Phase",
          type: "cultivation",
          startDate,
          endDate: cultivationEnd,
          description: "Build relationships and educate donors about the need",
        },
        {
          id: "2",
          name: "Solicitation Phase",
          type: "solicitation",
          startDate: cultivationEnd,
          endDate: solicitationEnd,
          description: "Active asking and donor engagement",
        },
        {
          id: "3",
          name: "Stewardship Phase",
          type: "stewardship",
          startDate: solicitationEnd,
          endDate,
          description: "Thank donors and maintain relationships",
        },
      ];
    }
  };

  // Update phases when dates or type change
  const updatePhases = () => {
    if (formData.startDate && formData.endDate) {
      const newPhases = generateDefaultPhases(
        formData.type,
        formData.startDate,
        formData.endDate,
      );
      setFormData((prev) => ({ ...prev, phases: newPhases }));
    }
  };

  // Add a new goal
  const addGoal = () => {
    const newGoal: CampaignGoal = {
      id: Date.now().toString(),
      type: "revenue",
      target: 0,
      unit: "dollars",
      priority: formData.goals.length === 0 ? "primary" : "secondary",
      description: "",
    };
    setFormData((prev) => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  // Remove a goal
  const removeGoal = (goalId: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== goalId),
    }));
  };

  // Update a goal
  const updateGoal = (goalId: string, updates: Partial<CampaignGoal>) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId ? { ...g, ...updates } : g,
      ),
    }));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Campaign name is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      newErrors.dates = "End date must be after start date";
    }
    if (formData.goals.length === 0)
      newErrors.goals = "At least one goal is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Campaign Overview</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Set up the foundation of your campaign with basic details, timeline,
          and goals. This information will guide the rest of your campaign
          planning.
        </p>

        {/* Progress indicator */}
        <div className="max-w-md mx-auto">
          <Progress
            value={75}
            max={100}
            label="Campaign Setup Progress"
            showPercentage
            variant="info"
            size="sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
              📋 Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Campaign Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., 2024 Annual Appeal, Spring Giving Day"
                  className={clsx(
                    "w-full px-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    errors.name ? "border-red-500" : "border-slate-700",
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              <RadioGroup
                value={formData.type}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value as any }))
                }
                options={campaignTypes}
                name="campaignType"
                label="Campaign Type"
                description="Choose the type that best describes your campaign"
                columns={2}
                size="md"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  value={formData.season}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, season: value }))
                  }
                  options={seasonOptions}
                  label="Season/Timing"
                  placeholder="Select campaign season"
                  searchable
                />

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Theme (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.theme || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        theme: e.target.value,
                      }))
                    }
                    placeholder="e.g., 'Building Hope Together'"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the campaign purpose and strategy..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
              📅 Campaign Timeline
            </h2>

            <div className="space-y-4">
              <DateRangePicker
                startDate={formData.startDate}
                endDate={formData.endDate}
                onChange={(start, end) => {
                  setFormData((prev) => ({
                    ...prev,
                    startDate: start,
                    endDate: end,
                  }));
                  if (start && end) {
                    setTimeout(updatePhases, 100);
                  }
                }}
                label="Campaign Duration"
                placeholder="Select start and end dates"
                required
                error={errors.startDate || errors.endDate || errors.dates}
                minDate={new Date()}
              />

              {formData.startDate && formData.endDate && (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-200 mb-3">
                    Generated Campaign Phases
                  </h4>
                  <div className="space-y-2">
                    {formData.phases.map((phase, _index) => (
                      <div
                        key={phase.id}
                        className="flex items-center gap-3 text-sm"
                      >
                        <Badge
                          variant={
                            phase.type === "cultivation"
                              ? "info"
                              : phase.type === "solicitation"
                                ? "warning"
                                : "success"
                          }
                          size="sm"
                        >
                          {phase.type}
                        </Badge>
                        <span className="text-slate-300 flex-1">
                          {phase.name}
                        </span>
                        <span className="text-slate-400">
                          {phase.startDate.toLocaleDateString()} -{" "}
                          {phase.endDate.toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Campaign Goals */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
                🎯 Campaign Goals
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGoal}
              >
                + Add Goal
              </Button>
            </div>

            {formData.goals.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>
                  No goals defined yet. Add your first campaign goal to get
                  started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.goals.map((goal, _index) => (
                  <div
                    key={goal.id}
                    className="bg-slate-800/50 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          goal.priority === "primary" ? "info" : "secondary"
                        }
                        size="sm"
                      >
                        {goal.priority} goal
                      </Badge>
                      <button
                        onClick={() => removeGoal(goal.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select
                        value={goal.type}
                        onChange={(value) =>
                          updateGoal(goal.id, { type: value as any })
                        }
                        options={goalTypes.map((gt) => ({
                          label: gt.label,
                          value: gt.value,
                        }))}
                        label="Goal Type"
                        size="sm"
                      />

                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2">
                          Target{" "}
                          {goal.unit === "dollars"
                            ? "Amount"
                            : goal.unit === "percentage"
                              ? "Percentage"
                              : "Count"}
                        </label>
                        <input
                          type="number"
                          value={goal.target}
                          onChange={(e) =>
                            updateGoal(goal.id, {
                              target: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                          placeholder={
                            goal.unit === "dollars"
                              ? "50000"
                              : goal.unit === "percentage"
                                ? "85"
                                : "250"
                          }
                        />
                      </div>

                      <Select
                        value={goal.priority}
                        onChange={(value) =>
                          updateGoal(goal.id, { priority: value as any })
                        }
                        options={[
                          { label: "Primary Goal", value: "primary" },
                          { label: "Secondary Goal", value: "secondary" },
                        ]}
                        label="Priority"
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
                {errors.goals && (
                  <p className="text-sm text-red-400">{errors.goals}</p>
                )}
              </div>
            )}
          </section>

          {/* Tags */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
              🏷️ Campaign Tags
            </h2>

            <CheckboxGroup
              value={formData.tags}
              onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
              options={tagOptions}
              label="Campaign Characteristics"
              description="Select tags that describe your campaign approach and focus"
              columns={3}
              size="sm"
            />
          </section>
        </div>

        {/* Sidebar - Campaign Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Campaign Summary
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-slate-400">Name:</span>
                <p className="text-white font-medium">
                  {formData.name || "Untitled Campaign"}
                </p>
              </div>

              <div>
                <span className="text-slate-400">Type:</span>
                <p className="text-white">
                  {campaignTypes.find((t) => t.value === formData.type)?.label}
                </p>
              </div>

              {formData.season && (
                <div>
                  <span className="text-slate-400">Season:</span>
                  <p className="text-white">
                    {
                      seasonOptions.find((s) => s.value === formData.season)
                        ?.label
                    }
                  </p>
                </div>
              )}

              {formData.startDate && formData.endDate && (
                <div>
                  <span className="text-slate-400">Duration:</span>
                  <p className="text-white">
                    {formData.startDate.toLocaleDateString()} -{" "}
                    {formData.endDate.toLocaleDateString()}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {Math.ceil(
                      (formData.endDate.getTime() -
                        formData.startDate.getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </p>
                </div>
              )}

              {formData.goals.length > 0 && (
                <div>
                  <span className="text-slate-400">Goals:</span>
                  <div className="space-y-1 mt-1">
                    {formData.goals.map((goal) => (
                      <div key={goal.id} className="text-white">
                        {goal.unit === "dollars"
                          ? formatCurrency(goal.target)
                          : goal.unit === "percentage"
                            ? `${goal.target}%`
                            : goal.target.toLocaleString()}{" "}
                        {goalTypes.find((gt) => gt.value === goal.type)?.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.tags.length > 0 && (
                <div>
                  <span className="text-slate-400">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" size="sm">
                        {tagOptions.find((t) => t.value === tag)?.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-6 pt-6 border-t border-slate-700">
              <Button
                onClick={handleNext}
                variant="primary"
                size="md"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Next: Audience Segmentation →"}
              </Button>

              <Button
                onClick={handleSave}
                variant="outline"
                size="md"
                className="w-full"
                disabled={isLoading}
              >
                Save Draft
              </Button>

              <Button
                onClick={onCancel}
                variant="secondary"
                size="md"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignOverviewBuilder;
