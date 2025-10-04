import React, { useState, useCallback, useMemo } from "react";

import {
  Button,
  Card,
  Badge,
  Select,
  CheckboxGroup,
  DataTable,
  Modal,
} from "../../ui-kit";

import type {
  TalkingPoint,
  TalkingPointCategory,
  AudienceSegment,
  MessageChannel,
} from "./types";

interface TalkingPointsRepositoryProps {
  initialTalkingPoints?: TalkingPoint[];
  campaignId: string;
  onSave: (talkingPoints: TalkingPoint[]) => void;
  onNext?: (talkingPoints: TalkingPoint[]) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

interface TalkingPointFormData {
  title: string;
  content: string;
  category: TalkingPointCategory;
  tags: string[];
  audiences: AudienceSegment[];
  channels: MessageChannel[];
  priority: "high" | "medium" | "low";

  // Optional fields for statistics and quotes
  statistic?: {
    value: string;
    source: string;
    date?: Date;
  };
  quote?: {
    text: string;
    author: string;
    title?: string;
    context?: string;
  };

  isVerified: boolean;
  verificationSource?: string;
}

const CATEGORY_OPTIONS = [
  { value: "impact", label: "Impact", icon: "🎯", color: "bg-green-600" },
  { value: "urgency", label: "Urgency", icon: "⏰", color: "bg-red-600" },
  {
    value: "statistics",
    label: "Statistics",
    icon: "📊",
    color: "bg-blue-600",
  },
  {
    value: "testimonial",
    label: "Testimonial",
    icon: "💬",
    color: "bg-purple-600",
  },
  {
    value: "financial",
    label: "Financial",
    icon: "💰",
    color: "bg-yellow-600",
  },
  { value: "timeline", label: "Timeline", icon: "📅", color: "bg-orange-600" },
  { value: "solution", label: "Solution", icon: "💡", color: "bg-cyan-600" },
] as const;

const AUDIENCE_OPTIONS = [
  { value: "major-donors", label: "Major Donors" },
  { value: "recurring-donors", label: "Recurring Donors" },
  { value: "lapsed-donors", label: "Lapsed Donors" },
  { value: "new-prospects", label: "New Prospects" },
  { value: "volunteers", label: "Volunteers" },
  { value: "community", label: "Community" },
  { value: "corporate", label: "Corporate" },
];

const CHANNEL_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "social-media", label: "Social Media" },
  { value: "direct-mail", label: "Direct Mail" },
  { value: "website", label: "Website" },
  { value: "phone", label: "Phone" },
  { value: "in-person", label: "In Person" },
  { value: "press", label: "Press" },
];

export const TalkingPointsRepository: React.FC<
  TalkingPointsRepositoryProps
> = ({
  initialTalkingPoints = [],
  campaignId: _campaignId,
  onSave,
  onNext,
  onCancel,
  isLoading = false,
  readOnly = false,
}) => {
  const [talkingPoints, setTalkingPoints] =
    useState<TalkingPoint[]>(initialTalkingPoints);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<TalkingPoint | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<
    TalkingPointCategory | "all"
  >("all");
  const [filterPriority, setFilterPriority] = useState<
    "all" | "high" | "medium" | "low"
  >("all");

  // Form state for modal
  const [formData, setFormData] = useState<TalkingPointFormData>({
    title: "",
    content: "",
    category: "impact",
    tags: [],
    audiences: [],
    channels: [],
    priority: "medium",
    isVerified: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter and search talking points
  const filteredTalkingPoints = useMemo(() => {
    return talkingPoints.filter((point) => {
      const matchesSearch =
        searchQuery === "" ||
        point.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        point.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        point.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesCategory =
        filterCategory === "all" || point.category === filterCategory;
      const matchesPriority =
        filterPriority === "all" || point.priority === filterPriority;

      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [talkingPoints, searchQuery, filterCategory, filterPriority]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      content: "",
      category: "impact",
      tags: [],
      audiences: [],
      channels: [],
      priority: "medium",
      isVerified: false,
    });
    setFormErrors({});
    setEditingPoint(null);
  }, []);

  // Open modal for creating/editing
  const openModal = useCallback(
    (point?: TalkingPoint) => {
      if (point) {
        setEditingPoint(point);
        setFormData({
          title: point.title,
          content: point.content,
          category: point.category,
          tags: point.tags,
          audiences: point.audiences,
          channels: point.channels,
          priority: point.priority,
          statistic: point.statistic,
          quote: point.quote,
          isVerified: point.isVerified,
          verificationSource: point.verificationSource,
        });
      } else {
        resetForm();
      }
      setIsModalOpen(true);
    },
    [resetForm],
  );

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.content.trim()) errors.content = "Content is required";
    if (formData.audiences.length === 0)
      errors.audiences = "At least one audience is required";
    if (formData.channels.length === 0)
      errors.channels = "At least one channel is required";

    // Validate statistic if provided
    if (formData.statistic) {
      if (!formData.statistic.value.trim())
        errors.statisticValue = "Statistic value is required";
      if (!formData.statistic.source.trim())
        errors.statisticSource = "Statistic source is required";
    }

    // Validate quote if provided
    if (formData.quote) {
      if (!formData.quote.text.trim())
        errors.quoteText = "Quote text is required";
      if (!formData.quote.author.trim())
        errors.quoteAuthor = "Quote author is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Save talking point
  const saveTalkingPoint = useCallback(() => {
    if (!validateForm()) return;

    const now = new Date();
    const newPoint: TalkingPoint = {
      id: editingPoint?.id || `talking_point_${Date.now()}`,
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      tags: formData.tags,
      audiences: formData.audiences,
      channels: formData.channels,
      priority: formData.priority,
      statistic: formData.statistic,
      quote: formData.quote,
      isVerified: formData.isVerified,
      verificationSource: formData.verificationSource,
      createdAt: editingPoint?.createdAt || now,
      updatedAt: now,
    };

    if (editingPoint) {
      setTalkingPoints((points) =>
        points.map((p) => (p.id === editingPoint.id ? newPoint : p)),
      );
    } else {
      setTalkingPoints((points) => [...points, newPoint]);
    }

    closeModal();
  }, [formData, editingPoint, validateForm, closeModal]);

  // Delete talking point
  const deleteTalkingPoint = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this talking point?")) {
      setTalkingPoints((points) => points.filter((p) => p.id !== id));
    }
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    onSave(talkingPoints);
  }, [talkingPoints, onSave]);

  const handleNext = useCallback(() => {
    onNext?.(talkingPoints);
  }, [talkingPoints, onNext]);

  // Table columns
  const columns = [
    {
      key: "title",
      title: "Talking Point",
      header: "Talking Point",
      render: (point: TalkingPoint) => (
        <div className="space-y-1">
          <div className="font-medium text-white">{point.title}</div>
          <div className="text-sm text-slate-400 line-clamp-2">
            {point.content}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      title: "Category",
      header: "Category",
      render: (point: TalkingPoint) => {
        const category = CATEGORY_OPTIONS.find(
          (c) => c.value === point.category,
        );
        return (
          <Badge
            variant="secondary"
            className={`${category?.color} text-white`}
          >
            {category?.icon} {category?.label}
          </Badge>
        );
      },
    },
    {
      key: "priority",
      title: "Priority",
      header: "Priority",
      render: (point: TalkingPoint) => (
        <Badge
          variant={
            point.priority === "high"
              ? "error"
              : point.priority === "medium"
                ? "warning"
                : "secondary"
          }
        >
          {point.priority}
        </Badge>
      ),
    },
    {
      key: "audiences",
      title: "Audiences",
      header: "Audiences",
      render: (point: TalkingPoint) => (
        <div className="flex flex-wrap gap-1">
          {point.audiences.slice(0, 3).map((audience) => (
            <Badge key={audience} variant="info" size="sm">
              {AUDIENCE_OPTIONS.find((a) => a.value === audience)?.label ||
                audience}
            </Badge>
          ))}
          {point.audiences.length > 3 && (
            <Badge variant="secondary" size="sm">
              +{point.audiences.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "verified",
      title: "Status",
      header: "Status",
      render: (point: TalkingPoint) => (
        <div className="flex items-center gap-2">
          {point.isVerified ? (
            <Badge variant="success" size="sm">
              ✓ Verified
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              ⚠ Unverified
            </Badge>
          )}
          {(point.statistic || point.quote) && (
            <Badge variant="info" size="sm">
              {point.statistic ? "📊" : "💬"}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "",
      header: "",
      render: (point: TalkingPoint) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal(point)}
            className="text-blue-400 hover:text-blue-300"
            disabled={readOnly}
          >
            Edit
          </button>
          <button
            onClick={() => deleteTalkingPoint(point.id)}
            className="text-red-400 hover:text-red-300"
            disabled={readOnly}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">
          🗂️ Talking Points Repository
        </h1>
        <p className="text-slate-400 max-w-3xl mx-auto">
          Build a comprehensive library of key talking points, statistics,
          quotes, and supporting evidence that can be used across different
          channels and audiences.
        </p>

        <div className="flex items-center justify-center gap-4 text-sm text-slate-300">
          <span>
            📊 {talkingPoints.filter((p) => p.statistic).length} Statistics
          </span>
          <span>💬 {talkingPoints.filter((p) => p.quote).length} Quotes</span>
          <span>
            ✓ {talkingPoints.filter((p) => p.isVerified).length} Verified
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search talking points..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <Select
            value={filterCategory}
            onChange={(value) => setFilterCategory(value as any)}
            options={[
              { label: "All Categories", value: "all" },
              ...CATEGORY_OPTIONS.map((c) => ({
                label: c.label,
                value: c.value,
              })),
            ]}
            label="Category"
          />

          <Select
            value={filterPriority}
            onChange={(value) => setFilterPriority(value as any)}
            options={[
              { label: "All Priorities", value: "all" },
              { label: "High", value: "high" },
              { label: "Medium", value: "medium" },
              { label: "Low", value: "low" },
            ]}
            label="Priority"
          />

          <Button
            onClick={() => openModal()}
            variant="primary"
            disabled={readOnly}
          >
            + Add Talking Point
          </Button>
        </div>
      </Card>

      {/* Talking Points Table */}
      <Card>
        <DataTable
          data={filteredTalkingPoints}
          columns={columns}
          emptyText="No talking points found. Create your first talking point to get started."
          loading={isLoading}
        />
      </Card>

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
            disabled={isLoading || readOnly}
          >
            {isLoading ? "Saving..." : "Next: Message Variations →"}
          </Button>
        )}
      </div>

      {/* Modal for Creating/Editing Talking Points */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={editingPoint ? "Edit Talking Point" : "Add Talking Point"}
        size="lg"
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Brief, descriptive title for this talking point"
                className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.title ? "border-red-500" : "border-slate-700"}`}
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-400">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Content <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="The main talking point content..."
                rows={4}
                className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${formErrors.content ? "border-red-500" : "border-slate-700"}`}
              />
              {formErrors.content && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.content}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={formData.category}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: value as TalkingPointCategory,
                  }))
                }
                options={CATEGORY_OPTIONS.map((c) => ({
                  label: `${c.icon} ${c.label}`,
                  value: c.value,
                }))}
                label="Category"
              />

              <Select
                value={formData.priority}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, priority: value as any }))
                }
                options={[
                  { label: "High Priority", value: "high" },
                  { label: "Medium Priority", value: "medium" },
                  { label: "Low Priority", value: "low" },
                ]}
                label="Priority"
              />
            </div>
          </div>

          {/* Targeting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <CheckboxGroup
                value={formData.audiences}
                onChange={(audiences) =>
                  setFormData((prev) => ({
                    ...prev,
                    audiences: audiences as AudienceSegment[],
                  }))
                }
                options={AUDIENCE_OPTIONS}
                label="Target Audiences *"
                description="Who should hear this talking point?"
                columns={1}
              />
              {formErrors.audiences && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.audiences}
                </p>
              )}
            </div>

            <div>
              <CheckboxGroup
                value={formData.channels}
                onChange={(channels) =>
                  setFormData((prev) => ({
                    ...prev,
                    channels: channels as MessageChannel[],
                  }))
                }
                options={CHANNEL_OPTIONS}
                label="Channels *"
                description="Where will this be used?"
                columns={1}
              />
              {formErrors.channels && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.channels}
                </p>
              )}
            </div>
          </div>

          {/* Optional: Statistic */}
          <div className="space-y-4">
            <h4 className="font-medium text-white">
              📊 Include Statistic (Optional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Value
                </label>
                <input
                  type="text"
                  value={formData.statistic?.value || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      statistic: prev.statistic
                        ? { ...prev.statistic, value: e.target.value }
                        : { value: e.target.value, source: "" },
                    }))
                  }
                  placeholder="e.g., 85%, $50,000, 1,200 families"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Source
                </label>
                <input
                  type="text"
                  value={formData.statistic?.source || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      statistic: prev.statistic
                        ? { ...prev.statistic, source: e.target.value }
                        : { value: "", source: e.target.value },
                    }))
                  }
                  placeholder="Data source or study name"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Optional: Quote */}
          <div className="space-y-4">
            <h4 className="font-medium text-white">
              💬 Include Quote (Optional)
            </h4>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Quote Text
              </label>
              <textarea
                value={formData.quote?.text || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quote: prev.quote
                      ? { ...prev.quote, text: e.target.value }
                      : { text: e.target.value, author: "" },
                  }))
                }
                placeholder="The quote text..."
                rows={2}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.quote?.author || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quote: prev.quote
                        ? { ...prev.quote, author: e.target.value }
                        : { text: "", author: e.target.value },
                    }))
                  }
                  placeholder="Quote author name"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.quote?.title || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quote: prev.quote
                        ? { ...prev.quote, title: e.target.value }
                        : { text: "", author: "", title: e.target.value },
                    }))
                  }
                  placeholder="Author's title or role"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isVerified: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-700 rounded focus:ring-blue-500"
              />
              <span className="text-slate-200">Mark as verified</span>
            </label>

            {formData.isVerified && (
              <input
                type="text"
                value={formData.verificationSource || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    verificationSource: e.target.value,
                  }))
                }
                placeholder="Verification source"
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-700">
            <Button onClick={closeModal} variant="secondary">
              Cancel
            </Button>
            <Button onClick={saveTalkingPoint} variant="primary">
              {editingPoint ? "Update" : "Add"} Talking Point
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TalkingPointsRepository;
