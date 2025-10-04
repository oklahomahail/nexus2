import React, { useEffect, useRef, useState } from "react";

import Modal from "@/components/ui-kit/Modal";
import { useToast } from "@/hooks/useToast";
import type {
  Campaign,
  CreateCampaignData,
  UpdateCampaignData,
} from "@/models/campaign";
import { createCampaign, updateCampaign } from "@/services/campaignService";
import { validateCampaign } from "@/utils/validation";

export type CampaignModalMode = "create" | "edit";

interface CampaignModalProps {
  open: boolean;
  mode: CampaignModalMode;
  campaign?: Campaign | null; // only for edit mode
  clientId?: string; // Optional - will show error if not provided for create mode
  onClose: () => void;
  onSaved?: (campaign: Campaign) => void; // notify parent to refresh, navigate, etc.
}

const defaultValues: Omit<CreateCampaignData, "clientId"> = {
  name: "",
  description: "",
  goal: 10000,
  startDate: "",
  endDate: "",
  category: "General",
  targetAudience: "",
  tags: [],
  notes: "",
};

export default function CampaignModal({
  open,
  mode,
  campaign,
  clientId,
  onClose,
  onSaved,
}: CampaignModalProps) {
  const [values, setValues] =
    useState<Omit<CreateCampaignData, "clientId">>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const { success, error: toastError } = useToast();

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;
    if (isEdit && campaign) {
      setValues({
        name: campaign.name,
        description: campaign.description ?? "",
        goal: campaign.goal,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        category: campaign.category,
        targetAudience: campaign.targetAudience ?? "",
        tags: campaign.tags || [],
        notes: campaign.notes ?? "",
      });
    } else {
      // Set default dates for new campaigns
      const today = new Date().toISOString().split("T")[0];
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      const endDate = oneMonthLater.toISOString().split("T")[0];

      setValues({
        ...defaultValues,
        startDate: today,
        endDate: endDate,
      });
    }
    setError(null);

    const t = setTimeout(() => nameRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open, isEdit, campaign]);

  const validate = (): string[] => {
    // Use the comprehensive validation utility
    if (mode === "create" && !clientId) {
      return ["Please select a client to create a campaign."];
    }

    const campaignData = {
      clientId: clientId || "",
      name: values.name,
      description: values.description,
      goal: values.goal,
      startDate: values.startDate,
      endDate: values.endDate,
      category: values.category,
      targetAudience: values.targetAudience,
      tags: values.tags,
      notes: values.notes,
    };

    const validation = validateCampaign(campaignData);
    return validation.success ? [] : Object.values(validation.errors || {});
  };

  const handleChange =
    (key: keyof typeof values) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const value =
        key === "goal" ? parseFloat(e.target.value) || 0 : e.target.value;
      setValues((prev) => ({
        ...prev,
        [key]: value,
      }));
      // Clear errors when user makes changes
      setError(null);
      setValidationErrors([]);
    };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setValues((prev) => ({ ...prev, tags }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (saving) return;

    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      setError("Please fix the validation errors below");
      toastError("Validation Error", validationErrors[0]);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setValidationErrors([]);

      let saved: Campaign;
      if (isEdit && campaign) {
        const updates: UpdateCampaignData = { ...values };
        const updated = await updateCampaign(campaign.id, updates);
        if (!updated) throw new Error("Failed to update campaign.");
        saved = updated;
      } else {
        if (!clientId) {
          throw new Error("Client ID is required for creating campaigns.");
        }
        const campaignData: CreateCampaignData = { ...values, clientId };
        const created = await createCampaign(campaignData);
        saved = created;
      }

      // Success notification
      success(
        isEdit ? "Campaign Updated!" : "Campaign Created!",
        `"${saved.name}" has been successfully ${isEdit ? "updated" : "created"}.`,
        { duration: 4000 },
      );

      onSaved?.(saved);
      onClose();
    } catch (err: any) {
      console.error("CampaignModal save error", err);
      const errorMessage =
        err?.message || "An error occurred while saving the campaign.";
      setError(errorMessage);
      toastError(isEdit ? "Update Failed" : "Creation Failed", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Campaign" : "New Campaign"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {(error || validationErrors.length > 0) && (
          <div className="status-error rounded-lg border px-3 py-2 text-sm">
            {error && <p className="mb-2">{error}</p>}
            {validationErrors.length > 0 && (
              <div className="space-y-1">
                {validationErrors.map((err, i) => (
                  <p key={i} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-current rounded-full"></span>
                    {err}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="campaign-name"
              className="text-sm font-medium text-text-primary"
            >
              Campaign Name <span className="text-brand-accent">*</span>
            </label>
            <input
              id="campaign-name"
              ref={nameRef}
              type="text"
              value={values.name}
              onChange={handleChange("name")}
              placeholder="End of Year Giving Campaign"
              className="input-base"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="campaign-goal"
              className="text-sm font-medium text-text-primary"
            >
              Goal Amount <span className="text-brand-accent">*</span>
            </label>
            <input
              id="campaign-goal"
              type="number"
              min="1"
              step="0.01"
              value={values.goal}
              onChange={handleChange("goal")}
              placeholder="50000"
              className="input-base"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="campaign-start"
              className="text-sm font-medium text-text-primary"
            >
              Start Date <span className="text-brand-accent">*</span>
            </label>
            <input
              id="campaign-start"
              type="date"
              value={values.startDate}
              onChange={handleChange("startDate")}
              className="input-base"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="campaign-end"
              className="text-sm font-medium text-text-primary"
            >
              End Date <span className="text-brand-accent">*</span>
            </label>
            <input
              id="campaign-end"
              type="date"
              value={values.endDate}
              onChange={handleChange("endDate")}
              className="input-base"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="campaign-category"
              className="text-sm font-medium text-text-primary"
            >
              Category
            </label>
            <select
              id="campaign-category"
              value={values.category}
              onChange={handleChange("category")}
              className="input-base"
            >
              <option value="General">General</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Environment">Environment</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="campaign-audience"
              className="text-sm font-medium text-text-primary"
            >
              Target Audience
            </label>
            <input
              id="campaign-audience"
              type="text"
              value={values.targetAudience || ""}
              onChange={handleChange("targetAudience")}
              placeholder="Individual donors and families"
              className="input-base"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label
              htmlFor="campaign-tags"
              className="text-sm font-medium text-text-primary"
            >
              Tags{" "}
              <span className="text-text-muted text-xs">(comma-separated)</span>
            </label>
            <input
              id="campaign-tags"
              type="text"
              value={values.tags?.join(", ") || ""}
              onChange={handleTagsChange}
              placeholder="year-end, annual, major-gifts"
              className="input-base"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="campaign-description"
            className="text-sm font-medium text-text-primary"
          >
            Description
          </label>
          <textarea
            id="campaign-description"
            value={values.description || ""}
            onChange={handleChange("description")}
            placeholder="Describe the purpose and goals of this campaign..."
            className="input-base min-h-[90px] resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="campaign-notes"
            className="text-sm font-medium text-text-primary"
          >
            Internal Notes
          </label>
          <textarea
            id="campaign-notes"
            value={values.notes || ""}
            onChange={handleChange("notes")}
            placeholder="Internal notes about this campaign..."
            className="input-base min-h-[60px] resize-none"
          />
        </div>

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="button-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="button-primary">
            {saving
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
                ? "Save Changes"
                : "Create Campaign"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
