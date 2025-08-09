/* eslint-disable */
import React, { useState, useEffect } from "react";
import {
  X,
  Target,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Tag,
  Save,
  Loader2,
} from "lucide-react";

interface CampaignFormData {
  name: string;
  description: string;
  goal: string;
  startDate: string;
  endDate: string;
  category: string;
  targetAudience: string;
}

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: CampaignFormData) => Promise<void>;
  initialData?: Partial<CampaignFormData>;
  mode?: "create" | "edit";
}

const CampaignModal: React.FC<CampaignModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "create",
}) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    goal: "",
    startDate: "",
    endDate: "",
    category: "General",
    targetAudience: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CampaignFormData>>({});

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || "",
        description: initialData?.description || "",
        goal: initialData?.goal || "",
        startDate: initialData?.startDate || "",
        endDate: initialData?.endDate || "",
        category: initialData?.category || "General",
        targetAudience: initialData?.targetAudience || "",
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  const handleChange = (field: keyof CampaignFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CampaignFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Campaign name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.goal.trim()) {
      newErrors.goal = "Goal amount is required";
    } else {
      const goalNum = parseFloat(formData.goal.replace(/[^0-9.]/g, ""));
      if (isNaN(goalNum) || goalNum <= 0) {
        newErrors.goal = "Please enter a valid goal amount";
      }
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    if (!formData.targetAudience.trim()) {
      newErrors.targetAudience = "Target audience is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (onSave) {
        await onSave(formData);
      }

      // Close modal on success
      onClose();

      // Reset form
      setFormData({
        name: "",
        description: "",
        goal: "",
        startDate: "",
        endDate: "",
        category: "General",
        targetAudience: "",
      });
    } catch (error) {
      console.error("Failed to save campaign:", error);
      // Error handling could be improved here
    } finally {
      setIsLoading(false);
    }
  };

  const formatGoalInput = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    const number = parseFloat(numericValue);

    if (isNaN(number)) return "";

    // Format as currency without symbol for input
    return number.toLocaleString("en-US");
  };

  const categories = [
    "General",
    "Education",
    "Healthcare",
    "Environment",
    "Community",
    "Emergency Relief",
    "Arts & Culture",
    "Animal Welfare",
    "Religious",
    "Other",
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600/20 rounded-xl">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {mode === "create" ? "Create New Campaign" : "Edit Campaign"}
                </h2>
                <p className="text-sm text-slate-400">
                  Set up your fundraising campaign details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="overflow-y-auto max-h-[calc(90vh-120px)]"
          >
            <div className="p-6 space-y-6">
              {/* Campaign Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <Target className="w-4 h-4 mr-2 text-green-400" />
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., End of Year Giving Campaign"
                  className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all ${
                    errors.name
                      ? "border-red-500/50"
                      : "border-slate-700/50 focus:border-green-500/50"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-400 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <FileText className="w-4 h-4 mr-2 text-blue-400" />
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe your campaign goals, impact, and why people should support it..."
                  rows={4}
                  className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none transition-all ${
                    errors.description
                      ? "border-red-500/50"
                      : "border-slate-700/50 focus:border-blue-500/50"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-400 text-sm">{errors.description}</p>
                )}
              </div>

              {/* Goal and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-slate-300">
                    <DollarSign className="w-4 h-4 mr-2 text-yellow-400" />
                    Fundraising Goal *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                      $
                    </span>
                    <input
                      type="text"
                      value={formData.goal}
                      onChange={(e) => handleChange("goal", e.target.value)}
                      placeholder="50,000"
                      className={`w-full bg-slate-800/50 border rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all ${
                        errors.goal
                          ? "border-red-500/50"
                          : "border-slate-700/50 focus:border-yellow-500/50"
                      }`}
                    />
                  </div>
                  {errors.goal && (
                    <p className="text-red-400 text-sm">{errors.goal}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-slate-300">
                    <Tag className="w-4 h-4 mr-2 text-purple-400" />
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                  >
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="bg-slate-800"
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start and End Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-slate-300">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all ${
                      errors.startDate
                        ? "border-red-500/50"
                        : "border-slate-700/50 focus:border-indigo-500/50"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-400 text-sm">{errors.startDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-slate-300">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    min={
                      formData.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all ${
                      errors.endDate
                        ? "border-red-500/50"
                        : "border-slate-700/50 focus:border-indigo-500/50"
                    }`}
                  />
                  {errors.endDate && (
                    <p className="text-red-400 text-sm">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <Users className="w-4 h-4 mr-2 text-cyan-400" />
                  Target Audience *
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) =>
                    handleChange("targetAudience", e.target.value)
                  }
                  placeholder="e.g., Individual donors, corporate sponsors, community members"
                  className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all ${
                    errors.targetAudience
                      ? "border-red-500/50"
                      : "border-slate-700/50 focus:border-cyan-500/50"
                  }`}
                />
                {errors.targetAudience && (
                  <p className="text-red-400 text-sm">
                    {errors.targetAudience}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-700/50 bg-slate-800/30">
              <p className="text-sm text-slate-400">* Required fields</p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 border border-slate-700/50 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 flex items-center space-x-2 min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>
                        {mode === "create" ? "Create Campaign" : "Save Changes"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CampaignModal;
