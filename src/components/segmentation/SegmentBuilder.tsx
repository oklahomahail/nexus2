// src/components/segmentation/SegmentBuilder.tsx

import {
  Plus,
  Trash2,
  Eye,
  Save,
  Play,
  Settings,
  Users,
  Target,
  Brain,
  Filter,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

import type { Donor } from "@/models/donors";
import type {
  AudienceSegment,
  SegmentRule,
  RuleGroup,
  SegmentType,
  UpdateFrequency,
} from "@/models/segmentation";
import { createSegment, updateSegment } from "@/services/segmentationEngine";

// Component interfaces
interface FieldDefinition {
  id: string;
  name: string;
  type: "number" | "string" | "date" | "boolean" | "list";
  category: "basic" | "donation" | "engagement" | "demographic" | "behavioral";
  description: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    required?: boolean;
  };
}

interface OperatorDefinition {
  id: string;
  name: string;
  symbol: string;
  description: string;
  supportedTypes: ("number" | "string" | "date" | "boolean" | "list")[];
  requiresValue: boolean;
  valueType?: "single" | "range" | "list";
}

interface SegmentBuilderProps {
  initialSegment?: AudienceSegment;
  onSave?: (segment: AudienceSegment) => void;
  onCancel?: () => void;
  mode?: "create" | "edit" | "clone";
}

interface PreviewResult {
  estimatedSize: number;
  sampleDonors: Donor[];
  confidence: number;
  warnings: string[];
  recommendations: string[];
}

// Field definitions for rule building
const FIELD_DEFINITIONS: FieldDefinition[] = [
  // Basic fields
  {
    id: "firstName",
    name: "First Name",
    type: "string",
    category: "basic",
    description: "Donor first name",
  },
  {
    id: "lastName",
    name: "Last Name",
    type: "string",
    category: "basic",
    description: "Donor last name",
  },
  {
    id: "email",
    name: "Email",
    type: "string",
    category: "basic",
    description: "Email address",
  },
  {
    id: "age",
    name: "Age",
    type: "number",
    category: "demographic",
    description: "Donor age in years",
    validation: { min: 0, max: 120 },
  },

  // Donation fields
  {
    id: "total_donated",
    name: "Total Donated",
    type: "number",
    category: "donation",
    description: "Lifetime total donation amount",
    validation: { min: 0 },
  },
  {
    id: "donation_count",
    name: "Number of Donations",
    type: "number",
    category: "donation",
    description: "Total number of donations made",
    validation: { min: 0 },
  },
  {
    id: "avg_donation_amount",
    name: "Average Donation",
    type: "number",
    category: "donation",
    description: "Average donation amount",
    validation: { min: 0 },
  },
  {
    id: "max_donation_amount",
    name: "Largest Donation",
    type: "number",
    category: "donation",
    description: "Largest single donation amount",
    validation: { min: 0 },
  },
  {
    id: "days_since_first_donation",
    name: "Days Since First Gift",
    type: "number",
    category: "donation",
    description: "Days since first donation",
    validation: { min: 0 },
  },
  {
    id: "days_since_last_donation",
    name: "Days Since Last Gift",
    type: "number",
    category: "donation",
    description: "Days since most recent donation",
    validation: { min: 0 },
  },

  // Engagement fields
  {
    id: "engagement_score",
    name: "Engagement Score",
    type: "number",
    category: "engagement",
    description: "Overall engagement score (0-100)",
    validation: { min: 0, max: 100 },
  },
  {
    id: "email_open_rate",
    name: "Email Open Rate",
    type: "number",
    category: "engagement",
    description: "Email open rate percentage",
    validation: { min: 0, max: 100 },
  },
  {
    id: "campaign_response_rate",
    name: "Campaign Response Rate",
    type: "number",
    category: "engagement",
    description: "Campaign response rate percentage",
    validation: { min: 0, max: 100 },
  },

  // Behavioral fields
  {
    id: "preferred_channel",
    name: "Preferred Channel",
    type: "list",
    category: "behavioral",
    description: "Preferred communication channel",
    options: ["email", "direct_mail", "phone", "social_media"],
  },
  {
    id: "donation_frequency",
    name: "Giving Frequency",
    type: "list",
    category: "behavioral",
    description: "How often donor gives",
    options: ["monthly", "quarterly", "annually", "occasional"],
  },
];

// Operator definitions
const OPERATORS: OperatorDefinition[] = [
  {
    id: "equals",
    name: "Equals",
    symbol: "=",
    description: "Exactly matches the value",
    supportedTypes: ["number", "string", "boolean", "list"],
    requiresValue: true,
  },
  {
    id: "not_equals",
    name: "Not Equals",
    symbol: "≠",
    description: "Does not match the value",
    supportedTypes: ["number", "string", "boolean", "list"],
    requiresValue: true,
  },
  {
    id: "greater_than",
    name: "Greater Than",
    symbol: ">",
    description: "Greater than the value",
    supportedTypes: ["number", "date"],
    requiresValue: true,
  },
  {
    id: "less_than",
    name: "Less Than",
    symbol: "<",
    description: "Less than the value",
    supportedTypes: ["number", "date"],
    requiresValue: true,
  },
  {
    id: "greater_equal",
    name: "Greater or Equal",
    symbol: "≥",
    description: "Greater than or equal to the value",
    supportedTypes: ["number", "date"],
    requiresValue: true,
  },
  {
    id: "less_equal",
    name: "Less or Equal",
    symbol: "≤",
    description: "Less than or equal to the value",
    supportedTypes: ["number", "date"],
    requiresValue: true,
  },
  {
    id: "contains",
    name: "Contains",
    symbol: "⊃",
    description: "Contains the text",
    supportedTypes: ["string"],
    requiresValue: true,
  },
  {
    id: "not_contains",
    name: "Does Not Contain",
    symbol: "⊅",
    description: "Does not contain the text",
    supportedTypes: ["string"],
    requiresValue: true,
  },
  {
    id: "in",
    name: "In List",
    symbol: "∈",
    description: "Matches any of the values",
    supportedTypes: ["string", "number", "list"],
    requiresValue: true,
    valueType: "list",
  },
  {
    id: "not_in",
    name: "Not In List",
    symbol: "∉",
    description: "Does not match any values",
    supportedTypes: ["string", "number", "list"],
    requiresValue: true,
    valueType: "list",
  },
  {
    id: "between",
    name: "Between",
    symbol: "⟷",
    description: "Between two values",
    supportedTypes: ["number", "date"],
    requiresValue: true,
    valueType: "range",
  },
  {
    id: "is_null",
    name: "Is Empty",
    symbol: "∅",
    description: "Field is empty or null",
    supportedTypes: ["string", "number", "date"],
    requiresValue: false,
  },
  {
    id: "is_not_null",
    name: "Is Not Empty",
    symbol: "∅̄",
    description: "Field has a value",
    supportedTypes: ["string", "number", "date"],
    requiresValue: false,
  },
];

export const SegmentBuilder: React.FC<SegmentBuilderProps> = ({
  initialSegment,
  onSave,
  onCancel,
  mode = "create",
}) => {
  // State management
  const [_segment, _setSegment] = useState<AudienceSegment | null>(initialSegment || null);
    initialSegment || null,
  );
  const [segmentName, setSegmentName] = useState(initialSegment?.name || "");
  const [segmentDescription, setSegmentDescription] = useState(
    initialSegment?.description || "",
  );
  const [segmentType, setSegmentType] = useState<SegmentType>(
    initialSegment?.type || "dynamic",
  );
  const [updateFrequency, setUpdateFrequency] = useState<UpdateFrequency>(
    initialSegment?.config?.updateFrequency || "daily",
  );

  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([
    {
      id: "main_group",
      name: "Main Rules",
      rules: [],
      logicalOperator: "AND",
    },
  ]);

  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(
    null,
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [_showAdvanced, _setShowAdvanced] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "rules" | "preview" | "settings"
  >("rules");

  // Load initial data
  useEffect(() => {
    if (initialSegment) {
      setRuleGroups(initialSegment.rules ? [initialSegment.rules] : ruleGroups);
    }
  }, [initialSegment]);

  // Validation
  const validateSegment = useCallback((): string[] => {
    const validationErrors: string[] = [];

    if (!segmentName.trim()) {
      validationErrors.push("Segment name is required");
    }

    if (segmentName.trim().length < 3) {
      validationErrors.push("Segment name must be at least 3 characters");
    }

    const hasRules = ruleGroups.some((group) => group.rules.length > 0);
    if (!hasRules) {
      validationErrors.push("At least one rule is required");
    }

    // Validate individual rules
    ruleGroups.forEach((group, groupIndex) => {
      group.rules.forEach((rule, ruleIndex) => {
        if (!rule.field) {
          validationErrors.push(
            `Rule ${ruleIndex + 1} in group ${groupIndex + 1} is missing a field`,
          );
        }
        if (!rule.operator) {
          validationErrors.push(
            `Rule ${ruleIndex + 1} in group ${groupIndex + 1} is missing an operator`,
          );
        }

        const operator = OPERATORS.find((op) => op.id === rule.operator);
        if (
          operator?.requiresValue &&
          (rule.value === null || rule.value === undefined || rule.value === "")
        ) {
          validationErrors.push(
            `Rule ${ruleIndex + 1} in group ${groupIndex + 1} is missing a value`,
          );
        }
      });
    });

    return validationErrors;
  }, [segmentName, ruleGroups]);

  // Update errors when validation changes
  useEffect(() => {
    const validationErrors = validateSegment();
    setErrors(validationErrors);
  }, [validateSegment]);

  // Rule management functions
  const addRule = useCallback((groupId: string) => {
    setRuleGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: [
                ...group.rules,
                {
                  id: `rule_${Date.now()}`,
                  field: "",
                  operator: "equals",
                  value: "",
                  logicalOperator: group.rules.length > 0 ? "AND" : undefined,
                },
              ],
            }
          : group,
      ),
    );
  }, []);

  const removeRule = useCallback((groupId: string, ruleId: string) => {
    setRuleGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: group.rules.filter((rule) => rule.id !== ruleId),
            }
          : group,
      ),
    );
  }, []);

  const updateRule = useCallback(
    (groupId: string, ruleId: string, updates: Partial<SegmentRule>) => {
      setRuleGroups((groups) =>
        groups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                rules: group.rules.map((rule) =>
                  rule.id === ruleId ? { ...rule, ...updates } : rule,
                ),
              }
            : group,
        ),
      );
    },
    [],
  );

  const addRuleGroup = useCallback(() => {
    const newGroup: RuleGroup = {
      id: `group_${Date.now()}`,
      name: `Group ${ruleGroups.length + 1}`,
      rules: [],
      logicalOperator: "AND",
    };
    setRuleGroups([...ruleGroups, newGroup]);
  }, [ruleGroups]);

  const removeRuleGroup = useCallback(
    (groupId: string) => {
      if (ruleGroups.length > 1) {
        setRuleGroups((groups) =>
          groups.filter((group) => group.id !== groupId),
        );
      }
    },
    [ruleGroups],
  );

  const updateRuleGroup = useCallback(
    (groupId: string, updates: Partial<RuleGroup>) => {
      setRuleGroups((groups) =>
        groups.map((group) =>
          group.id === groupId ? { ...group, ...updates } : group,
        ),
      );
    },
    [],
  );

  // Preview functionality
  const generatePreview = useCallback(async () => {
    if (errors.length > 0) return;

    setIsPreviewLoading(true);
    try {
      // Simulate preview generation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockPreview: PreviewResult = {
        estimatedSize: Math.floor(Math.random() * 1000) + 50,
        sampleDonors: [], // Would be populated with actual donor samples
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        warnings:
          ruleGroups.length > 3
            ? ["Complex rule structure may affect performance"]
            : [],
        recommendations: [
          "Consider adding engagement criteria for better targeting",
          "Test this segment with a small campaign before full deployment",
        ],
      };

      setPreviewResult(mockPreview);
    } catch (error) {
      console.error("Error generating preview:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  }, [errors, ruleGroups]);

  // Auto-generate preview when rules change
  useEffect(() => {
    if (selectedTab === "preview" && errors.length === 0) {
      const timeoutId = setTimeout(() => {
        generatePreview();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedTab, errors, generatePreview]);

  // Save functionality
  const handleSave = useCallback(async () => {
    const validationErrors = validateSegment();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    try {
      const segmentData: Partial<AudienceSegment> = {
        name: segmentName,
        description: segmentDescription,
        type: segmentType,
        rules: ruleGroups.length > 0 ? ruleGroups[0] : undefined, // Use first group as main rules
        config: {
          updateFrequency,
          autoUpdate: true,
          includeCriteria: ruleGroups[0] || {
            id: "main",
            name: "Main",
            rules: [],
            logicalOperator: "AND",
          },
          duplicateHandling: "prioritize_newest",
        },
        metadata: {
          size: previewResult?.estimatedSize || 0,
          lastUpdated: new Date(),
          createdBy: "user",
          tags: [],
          priority: "medium",
        },
        personalization: {
          dynamicContent: false,
          personalizedAmounts: false,
          optimizedTiming: false,
          channelPreference: false,
          customVariables: {},
        },
      };

      let savedSegment: AudienceSegment;
      if (mode === "edit" && initialSegment) {
        const result = await updateSegment(initialSegment.id, segmentData);
        if (!result) throw new Error("Failed to update segment");
        savedSegment = result;
      } else {
        savedSegment = await createSegment(segmentData);
      }

      if (onSave) {
        onSave(savedSegment);
      }
    } catch (error) {
      console.error("Error saving segment:", error);
      setErrors(["Failed to save segment. Please try again."]);
    } finally {
      setIsSaving(false);
    }
  }, [
    segmentName,
    segmentDescription,
    segmentType,
    updateFrequency,
    ruleGroups,
    previewResult,
    mode,
    initialSegment,
    onSave,
    validateSegment,
  ]);

  // Get field definition by ID
  const getFieldDefinition = useCallback(
    (fieldId: string): FieldDefinition | null => {
      return FIELD_DEFINITIONS.find((field) => field.id === fieldId) || null;
    },
    [],
  );

  // Get available operators for field type
  const getAvailableOperators = useCallback(
    (fieldType: string): OperatorDefinition[] => {
      return OPERATORS.filter((op) =>
        op.supportedTypes.includes(fieldType as any),
      );
    },
    [],
  );

  // Render rule component
  const renderRule = useCallback(
    (groupId: string, rule: SegmentRule, index: number) => {
      const fieldDef = getFieldDefinition(rule.field);
      const availableOperators = fieldDef
        ? getAvailableOperators(fieldDef.type)
        : [];
      const operator = OPERATORS.find((op) => op.id === rule.operator);

      return (
        <div
          key={rule.id}
          className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3"
        >
          {/* Logical operator (for rules after the first) */}
          {index > 0 && (
            <div className="flex items-center space-x-2 mb-2">
              <select
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white"
                value={rule.logicalOperator || "AND"}
                onChange={(e) =>
                  updateRule(groupId, rule.id, {
                    logicalOperator: e.target.value as "AND" | "OR",
                  })
                }
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-end">
            {/* Field selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={rule.field}
                onChange={(e) =>
                  updateRule(groupId, rule.id, {
                    field: e.target.value,
                    operator: "equals",
                    value: "",
                  })
                }
              >
                <option value="">Select field...</option>
                {Object.values(
                  FIELD_DEFINITIONS.reduce(
                    (acc, field) => {
                      if (!acc[field.category]) acc[field.category] = [];
                      acc[field.category].push(field);
                      return acc;
                    },
                    {} as Record<string, FieldDefinition[]>,
                  ),
                ).map((categoryFields) => (
                  <optgroup
                    key={categoryFields[0].category}
                    label={categoryFields[0].category.toUpperCase()}
                  >
                    {categoryFields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Operator selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={rule.operator}
                onChange={(e) =>
                  updateRule(groupId, rule.id, {
                    operator: e.target.value as any,
                    value: "",
                  })
                }
                disabled={!fieldDef}
              >
                <option value="">Select operator...</option>
                {availableOperators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.symbol} {op.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Value input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              {operator?.requiresValue ? (
                operator.valueType === "range" ? (
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={Array.isArray(rule.value) ? rule.value[0] : ""}
                      onChange={(e) => {
                        const currentValue = Array.isArray(rule.value)
                          ? rule.value
                          : ["", ""];
                        updateRule(groupId, rule.id, {
                          value: [e.target.value, currentValue[1]],
                        });
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={Array.isArray(rule.value) ? rule.value[1] : ""}
                      onChange={(e) => {
                        const currentValue = Array.isArray(rule.value)
                          ? rule.value
                          : ["", ""];
                        updateRule(groupId, rule.id, {
                          value: [currentValue[0], e.target.value],
                        });
                      }}
                    />
                  </div>
                ) : operator.valueType === "list" ? (
                  <input
                    type="text"
                    placeholder="Enter values separated by commas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={
                      Array.isArray(rule.value)
                        ? rule.value.join(", ")
                        : rule.value
                    }
                    onChange={(e) =>
                      updateRule(groupId, rule.id, {
                        value: e.target.value.split(",").map((v) => v.trim()),
                      })
                    }
                  />
                ) : fieldDef?.type === "list" && fieldDef.options ? (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={rule.value}
                    onChange={(e) =>
                      updateRule(groupId, rule.id, { value: e.target.value })
                    }
                  >
                    <option value="">Select value...</option>
                    {fieldDef.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={fieldDef?.type === "number" ? "number" : "text"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={rule.value}
                    onChange={(e) =>
                      updateRule(groupId, rule.id, { value: e.target.value })
                    }
                    min={fieldDef?.validation?.min}
                    max={fieldDef?.validation?.max}
                  />
                )
              ) : (
                <div className="px-3 py-2 bg-gray-100 text-gray-500 rounded-md text-sm">
                  No value needed
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => removeRule(groupId, rule.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Remove rule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Field description */}
          {fieldDef && (
            <p className="text-xs text-gray-500 mt-2">{fieldDef.description}</p>
          )}
        </div>
      );
    },
    [getFieldDefinition, getAvailableOperators, updateRule, removeRule],
  );

  // Render rule group
  const renderRuleGroup = useCallback(
    (group: RuleGroup, index: number) => {
      return (
        <div
          key={group.id}
          className="border border-gray-300 rounded-lg p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="font-medium text-gray-900">{group.name}</h3>
              {ruleGroups.length > 1 && (
                <select
                  className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                  value={group.logicalOperator}
                  onChange={(e) =>
                    updateRuleGroup(group.id, {
                      logicalOperator: e.target.value as "AND" | "OR",
                    })
                  }
                >
                  <option value="AND">Match ALL rules</option>
                  <option value="OR">Match ANY rule</option>
                </select>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => addRule(group.id)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Rule</span>
              </button>

              {ruleGroups.length > 1 && (
                <button
                  onClick={() => removeRuleGroup(group.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {group.rules.map((rule, ruleIndex) =>
              renderRule(group.id, rule, ruleIndex),
            )}

            {group.rules.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No rules yet. Click "Add Rule" to get started.</p>
              </div>
            )}
          </div>
        </div>
      );
    },
    [ruleGroups, renderRule, addRule, removeRuleGroup, updateRuleGroup],
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "create"
                ? "Create New Segment"
                : mode === "edit"
                  ? "Edit Segment"
                  : "Clone Segment"}
            </h1>
            <p className="text-gray-600">
              Define rules to automatically group your audience
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={errors.length > 0 || isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Segment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error display */}
        {errors.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Please fix the following errors:
                </h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Segment Information
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Segment Name *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              placeholder="e.g., High-Value Donors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Segment Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={segmentType}
              onChange={(e) => setSegmentType(e.target.value as SegmentType)}
            >
              <option value="dynamic">Dynamic (Updates automatically)</option>
              <option value="static">Static (Fixed membership)</option>
              <option value="behavioral">Behavioral (Based on patterns)</option>
              <option value="predictive">Predictive (ML-based)</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            value={segmentDescription}
            onChange={(e) => setSegmentDescription(e.target.value)}
            placeholder="Describe this segment and how it will be used..."
          />
        </div>

        {segmentType === "dynamic" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Frequency
            </label>
            <select
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={updateFrequency}
              onChange={(e) =>
                setUpdateFrequency(e.target.value as UpdateFrequency)
              }
            >
              <option value="real_time">Real-time</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: "rules", label: "Rules", icon: Filter },
          { key: "preview", label: "Preview", icon: Eye },
          { key: "settings", label: "Settings", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setSelectedTab(tab.key as any)}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === "rules" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Segment Rules
            </h2>

            <div className="flex items-center space-x-3">
              <button
                onClick={addRuleGroup}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Group</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {ruleGroups.map((group, index) => renderRuleGroup(group, index))}
          </div>

          {ruleGroups.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No rule groups yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first rule group to start building your segment
              </p>
              <button
                onClick={addRuleGroup}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Rule Group</span>
              </button>
            </div>
          )}
        </div>
      )}

      {selectedTab === "preview" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Segment Preview
            </h2>

            <button
              onClick={generatePreview}
              disabled={isPreviewLoading || errors.length > 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isPreviewLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Generate Preview</span>
                </>
              )}
            </button>
          </div>

          {errors.length > 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cannot Generate Preview
              </h3>
              <p className="text-gray-600">
                Please fix the validation errors first
              </p>
            </div>
          ) : previewResult ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Estimated Size
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {previewResult.estimatedSize.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Confidence
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {(previewResult.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Target className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Coverage
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {((previewResult.estimatedSize / 5000) * 100).toFixed(
                          1,
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {previewResult.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">
                    Warnings
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {previewResult.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {previewResult.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Recommendations
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {previewResult.recommendations.map(
                      (recommendation, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{recommendation}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Preview Generated
              </h3>
              <p className="text-gray-600">
                Click "Generate Preview" to see estimated segment size and
                sample data
              </p>
            </div>
          )}
        </div>
      )}

      {selectedTab === "settings" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Advanced Settings
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Auto-Update</h3>
                <p className="text-sm text-gray-600">
                  Automatically update segment membership based on rule changes
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">
                Personalization
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">
                    Enable dynamic content personalization
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">
                    Enable personalized donation amounts
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">
                    Optimize communication timing
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">
                    Apply channel preferences
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
