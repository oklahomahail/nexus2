import React, { useState } from "react";

import {
  BehavioralSegment,
  SegmentCriteria,
  SEGMENT_CRITERIA_OPTIONS,
  isValidSegmentCriteria,
} from "../../services/campaignComposer/defaultSegmentCatalog";

interface NewSegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (segment: BehavioralSegment) => void;
  existingSegments?: BehavioralSegment[];
}

/**
 * NewSegmentModal
 *
 * Modal for creating custom donor segments inline during campaign workflow.
 * Allows fundraisers to define segment criteria using behavioral attributes
 * without touching code or database queries.
 *
 * Features:
 * - Multi-criteria segment builder
 * - Real-time validation
 * - Category selection
 * - Privacy-first (behavioral only)
 */
export function NewSegmentModal({
  isOpen,
  onClose,
  onSave,
  existingSegments = [],
}: NewSegmentModalProps): React.JSX.Element | null {
  const [segmentName, setSegmentName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<BehavioralSegment["category"]>("donor_status");
  const [criteria, setCriteria] = useState<SegmentCriteria>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleAddCriterion = (key: keyof SegmentCriteria, value: string) => {
    setCriteria((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  const handleRemoveCriterion = (key: keyof SegmentCriteria) => {
    setCriteria((prev) => {
      const newCriteria = { ...prev };
      delete newCriteria[key];
      return newCriteria;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!segmentName.trim()) {
      newErrors.segmentName = "Segment name is required";
    }

    if (segmentName.length > 50) {
      newErrors.segmentName = "Segment name must be 50 characters or less";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (Object.keys(criteria).length === 0) {
      newErrors.criteria = "At least one criterion is required";
    }

    if (!isValidSegmentCriteria(criteria)) {
      newErrors.criteria = "Invalid segment criteria";
    }

    // Check for duplicate segment ID
    const segmentId = segmentName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    if (existingSegments.some((seg) => seg.segmentId === segmentId)) {
      newErrors.segmentName = "A segment with this name already exists";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const segmentId = segmentName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    const newSegment: BehavioralSegment = {
      segmentId,
      name: segmentName,
      description,
      criteria,
      category,
      isActive: true,
      isDefault: false,
    };

    onSave(newSegment);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setSegmentName("");
    setDescription("");
    setCategory("donor_status");
    setCriteria({});
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New Segment
              </h3>
              <button
                onClick={handleClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-gray-50 px-6 py-6">
            <div className="space-y-5">
              {/* Segment Name */}
              <div>
                <label
                  htmlFor="segmentName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Segment Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="segmentName"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  placeholder="e.g., High-Value Recent Donors"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.segmentName ? "border-red-300" : "border-gray-300"
                  }`}
                  maxLength={50}
                />
                {errors.segmentName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.segmentName}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {segmentName.length}/50 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe who this segment includes and why..."
                  rows={3}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.description ? "border-red-300" : "border-gray-300"
                  }`}
                  maxLength={200}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {description.length}/200 characters
                </p>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as BehavioralSegment["category"])
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="donor_status">Donor Status</option>
                  <option value="giving_pattern">Giving Pattern</option>
                  <option value="engagement">Engagement</option>
                  <option value="channel_preference">Channel Preference</option>
                </select>
              </div>

              {/* Criteria Builder */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Segment Criteria <span className="text-red-600">*</span>
                </label>
                <p className="mt-1 text-xs text-gray-600">
                  Add one or more behavioral criteria to define this segment.
                  All criteria must be met (AND logic).
                </p>

                {/* Existing Criteria */}
                {Object.keys(criteria).length > 0 && (
                  <div className="mt-3 space-y-2">
                    {Object.entries(criteria).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {key.replace(/_/g, " ")}
                          </div>
                          <div className="text-sm text-gray-600">{value}</div>
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveCriterion(key as keyof SegmentCriteria)
                          }
                          className="ml-3 text-red-600 hover:text-red-700"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Criterion */}
                <div className="mt-3 rounded-lg border-2 border-dashed border-gray-300 bg-white p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        "recency",
                        "frequency",
                        "engagement",
                        "channel_preference",
                        "giving_type",
                        "loyalty_score",
                      ] as const
                    ).map((criterionKey) => {
                      const alreadyAdded = criterionKey in criteria;
                      return (
                        <div key={criterionKey}>
                          <label className="block text-xs font-medium text-gray-700">
                            {criterionKey.replace(/_/g, " ")}
                          </label>
                          <select
                            value={alreadyAdded ? criteria[criterionKey] : ""}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAddCriterion(
                                  criterionKey,
                                  e.target.value,
                                );
                              }
                            }}
                            disabled={alreadyAdded}
                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                          >
                            <option value="">
                              {alreadyAdded ? "Added ✓" : "-- Select --"}
                            </option>
                            {SEGMENT_CRITERIA_OPTIONS[criterionKey]?.map(
                              (option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {errors.criteria && (
                  <p className="mt-1 text-sm text-red-600">{errors.criteria}</p>
                )}
              </div>

              {/* Privacy Notice */}
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Privacy-First:</strong> Segments use only
                      behavioral criteria (engagement, recency, giving
                      patterns). No PII or dollar amounts are stored.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Segment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
