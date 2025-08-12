// src/components/CampaignModal.tsx
import { X } from "lucide-react";
import React, { useState, useEffect } from "react";

import { Campaign } from "../models/campaign";

export interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: Campaign;
  mode: "create" | "edit";
  clientId?: string; // NEW: Add clientId prop
}

const CampaignModal: React.FC<CampaignModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
  clientId, // NEW: Accept clientId prop
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "",
    startDate: "",
    endDate: "",
    category: "General" as Campaign["category"],
    targetAudience: "",
    tags: [] as string[],
    clientId: clientId || "", // NEW: Set clientId in form data
  });

  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData({
          name: initialData.name,
          description: initialData.description || "",
          goal: initialData.goal.toString(),
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          category: initialData.category,
          targetAudience: initialData.targetAudience || "",
          tags: initialData.tags || [],
          clientId: initialData.clientId || clientId || "", // Preserve existing clientId
        });
      } else {
        // Reset form for create mode
        setFormData({
          name: "",
          description: "",
          goal: "",
          startDate: "",
          endDate: "",
          category: "General",
          targetAudience: "",
          tags: [],
          clientId: clientId || "", // Use provided clientId for new campaigns
        });
      }
      setTagInput("");
      setErrors({});
    }
  }, [isOpen, mode, initialData, clientId]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Campaign name is required";
    }

    if (!formData.goal || parseFloat(formData.goal) <= 0) {
      newErrors.goal = "Goal must be a positive number";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      newErrors.endDate = "End date must be after start date";
    }

    // Validate clientId for new campaigns
    if (mode === "create" && !formData.clientId) {
      newErrors.clientId = "Client selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        goal: parseFloat(formData.goal),
        tags: formData.tags,
      };

      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error("Failed to save campaign:", error);
      setErrors({ submit: "Failed to save campaign. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            {mode === "create" ? "Create New Campaign" : "Edit Campaign"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Campaign Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white mb-2"
            >
              Campaign Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-slate-600"
              }`}
              placeholder="Enter campaign name"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-white mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your campaign..."
            />
          </div>

          {/* Goal and Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="goal"
                className="block text-sm font-medium text-white mb-2"
              >
                Goal Amount *
              </label>
              <input
                type="number"
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.goal ? "border-red-500" : "border-slate-600"
                }`}
                placeholder="0.00"
              />
              {errors.goal && (
                <p className="text-red-400 text-sm mt-1">{errors.goal}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-white mb-2"
              >
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? "border-red-500" : "border-slate-600"
                }`}
              />
              {errors.startDate && (
                <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-white mb-2"
              >
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? "border-red-500" : "border-slate-600"
                }`}
              />
              {errors.endDate && (
                <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Category and Target Audience Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-white mb-2"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="General">General</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Environment">Environment</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="targetAudience"
                className="block text-sm font-medium text-white mb-2"
              >
                Target Audience
              </label>
              <input
                type="text"
                id="targetAudience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Individual donors, Corporate sponsors"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-slate-700 text-slate-300 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Create Campaign"
                  : "Update Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignModal;
