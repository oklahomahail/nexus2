import React, { useEffect, useRef, useState } from "react";

import Modal from "@/components/ui-kit/Modal";
import type {
  Campaign,
  CreateCampaignData,
  UpdateCampaignData,
} from "@/models/campaign";
import { createCampaign, updateCampaign } from "@/services/campaignService";

export type CampaignModalMode = "create" | "edit";

interface CampaignModalProps {
  open: boolean;
  mode: CampaignModalMode;
  campaign?: Campaign | null; // only for edit mode
  clientId: string; // Required for creating campaigns
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
  const nameRef = useRef<HTMLInputElement | null>(null);

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

  const validate = (): string | null => {
    if (!values.name.trim()) return "Campaign name is required.";
    if (values.goal <= 0) return "Goal amount must be greater than 0.";
    if (!values.startDate) return "Start date is required.";
    if (!values.endDate) return "End date is required.";
    if (new Date(values.endDate) <= new Date(values.startDate)) {
      return "End date must be after start date.";
    }
    return null;
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

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      let saved: Campaign;
      if (isEdit && campaign) {
        const updates: UpdateCampaignData = { ...values };
        const updated = await updateCampaign(campaign.id, updates);
        if (!updated) throw new Error("Failed to update campaign.");
        saved = updated;
      } else {
        const campaignData: CreateCampaignData = { ...values, clientId };
        const created = await createCampaign(campaignData);
        saved = created;
      }

      onSaved?.(saved);
      onClose();
    } catch (err: any) {
      console.error("CampaignModal save error", err);
      setError(err?.message || "An error occurred while saving the campaign.");
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
        {error && (
          <div className="status-error rounded-lg border px-3 py-2 text-sm">
            {error}
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
