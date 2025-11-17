import React, { useState, useCallback } from "react";

import {
  DEFAULT_SEGMENT_CATALOG,
  getDefaultVersionLabel,
  BehavioralSegment,
} from "../../services/campaignComposer/defaultSegmentCatalog";

/**
 * Deliverable interface with per-deliverable segmentation
 */
export interface Deliverable {
  deliverableId: string;
  campaignId: string;
  deliverableType: "direct_mail" | "email" | "sms" | "social" | "phone";
  deliverableName: string;
  versions: DeliverableVersion[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Individual version of a deliverable targeted to a specific segment
 */
export interface DeliverableVersion {
  versionId: string;
  deliverableId: string;
  versionLabel: string;
  segmentCriteriaId: string;
  contentDraft: string;
  subjectLine?: string;
  previewText?: string;
  estimatedRecipients?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface DeliverableSegmentationEditorProps {
  deliverable: Deliverable;
  onChange: (updatedDeliverable: Deliverable) => void;
  onAddVersion?: () => void;
  onRemoveVersion?: (versionId: string) => void;
  availableSegments?: BehavioralSegment[];
}

/**
 * DeliverableSegmentationEditor
 *
 * Per-deliverable segment assignment and content management.
 * Allows fundraisers to create multiple versions of a deliverable,
 * each targeted to different donor segments with customized content.
 *
 * Features:
 * - Drag-and-drop version reordering
 * - Segment selection per version
 * - Content editing per version
 * - Automatic version labeling
 */
export function DeliverableSegmentationEditor({
  deliverable,
  onChange,
  onAddVersion,
  onRemoveVersion,
  availableSegments = DEFAULT_SEGMENT_CATALOG,
}: DeliverableSegmentationEditorProps): React.JSX.Element {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    new Set(),
  );

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newVersions = [...deliverable.versions];
    const draggedItem = newVersions[draggedIndex];
    newVersions.splice(draggedIndex, 1);
    newVersions.splice(index, 0, draggedItem);

    // Update sort order
    const reorderedVersions = newVersions.map((version, idx) => ({
      ...version,
      sortOrder: idx,
    }));

    onChange({
      ...deliverable,
      versions: reorderedVersions,
    });

    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSegmentChange = (versionId: string, segmentId: string) => {
    const updatedVersions = deliverable.versions.map((version) =>
      version.versionId === versionId
        ? {
            ...version,
            segmentCriteriaId: segmentId,
            versionLabel: getDefaultVersionLabel(segmentId),
          }
        : version,
    );

    onChange({
      ...deliverable,
      versions: updatedVersions,
    });
  };

  const handleContentChange = (versionId: string, content: string) => {
    const updatedVersions = deliverable.versions.map((version) =>
      version.versionId === versionId
        ? { ...version, contentDraft: content }
        : version,
    );

    onChange({
      ...deliverable,
      versions: updatedVersions,
    });
  };

  const handleSubjectLineChange = (versionId: string, subjectLine: string) => {
    const updatedVersions = deliverable.versions.map((version) =>
      version.versionId === versionId ? { ...version, subjectLine } : version,
    );

    onChange({
      ...deliverable,
      versions: updatedVersions,
    });
  };

  const handlePreviewTextChange = (versionId: string, previewText: string) => {
    const updatedVersions = deliverable.versions.map((version) =>
      version.versionId === versionId ? { ...version, previewText } : version,
    );

    onChange({
      ...deliverable,
      versions: updatedVersions,
    });
  };

  const toggleVersionExpanded = (versionId: string) => {
    setExpandedVersions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else {
        newSet.add(versionId);
      }
      return newSet;
    });
  };

  const getSegmentById = useCallback(
    (segmentId: string): BehavioralSegment | undefined => {
      return availableSegments.find((seg) => seg.segmentId === segmentId);
    },
    [availableSegments],
  );

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getDeliverableTypeLabel = (
    type: Deliverable["deliverableType"],
  ): string => {
    const labels: Record<Deliverable["deliverableType"], string> = {
      direct_mail: "Direct Mail",
      email: "Email",
      sms: "SMS",
      social: "Social Media",
      phone: "Phone Script",
    };
    return labels[type];
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {deliverable.deliverableName}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {getDeliverableTypeLabel(deliverable.deliverableType)} •{" "}
              {deliverable.versions.length} version
              {deliverable.versions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onAddVersion}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Add Version
          </button>
        </div>
      </div>

      {/* Versions List */}
      <div className="flex-1 overflow-y-auto p-6">
        {deliverable.versions.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No versions yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a version for a specific segment.
              </p>
              <div className="mt-6">
                <button
                  onClick={onAddVersion}
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  + Add First Version
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {deliverable.versions.map((version, index) => {
              const segment = getSegmentById(version.segmentCriteriaId);
              const isExpanded = expandedVersions.has(version.versionId);

              return (
                <div
                  key={version.versionId}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`rounded-lg border bg-white shadow-sm transition-all ${
                    draggedIndex === index
                      ? "border-blue-500 opacity-50"
                      : "border-gray-200 hover:shadow-md"
                  }`}
                >
                  {/* Version Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div className="flex flex-1 items-center space-x-4">
                      {/* Drag Handle */}
                      <button className="cursor-move text-gray-400 hover:text-gray-600">
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
                            d="M4 8h16M4 16h16"
                          />
                        </svg>
                      </button>

                      {/* Version Label */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                            Version {index + 1}
                          </span>
                          <h3 className="text-base font-semibold text-gray-900">
                            {version.versionLabel}
                          </h3>
                        </div>
                        {segment && (
                          <p className="mt-1 text-sm text-gray-600">
                            {segment.description}
                          </p>
                        )}
                      </div>

                      {/* Estimated Recipients */}
                      {version.estimatedRecipients !== undefined && (
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Est. Recipients
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatNumber(version.estimatedRecipients)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => toggleVersionExpanded(version.versionId)}
                        className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                      >
                        <svg
                          className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => onRemoveVersion?.(version.versionId)}
                        className="rounded-md p-2 text-red-600 hover:bg-red-50"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="space-y-4 p-5">
                      {/* Segment Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Target Segment
                        </label>
                        <select
                          value={version.segmentCriteriaId}
                          onChange={(e) =>
                            handleSegmentChange(
                              version.versionId,
                              e.target.value,
                            )
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          {availableSegments.map((seg) => (
                            <option key={seg.segmentId} value={seg.segmentId}>
                              {seg.name} - {seg.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Email-specific fields */}
                      {deliverable.deliverableType === "email" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Subject Line
                            </label>
                            <input
                              type="text"
                              value={version.subjectLine || ""}
                              onChange={(e) =>
                                handleSubjectLineChange(
                                  version.versionId,
                                  e.target.value,
                                )
                              }
                              placeholder="Enter subject line (30-60 characters)"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              maxLength={80}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              {version.subjectLine?.length || 0}/80 characters
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Preview Text
                            </label>
                            <input
                              type="text"
                              value={version.previewText || ""}
                              onChange={(e) =>
                                handlePreviewTextChange(
                                  version.versionId,
                                  e.target.value,
                                )
                              }
                              placeholder="Enter preview text (40-100 characters)"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              maxLength={130}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              {version.previewText?.length || 0}/130 characters
                            </p>
                          </div>
                        </>
                      )}

                      {/* Content Draft */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Content Draft
                        </label>
                        <textarea
                          value={version.contentDraft}
                          onChange={(e) =>
                            handleContentChange(
                              version.versionId,
                              e.target.value,
                            )
                          }
                          rows={12}
                          placeholder="Enter content for this version..."
                          className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {
                            version.contentDraft.split(/\s+/).filter((w) => w)
                              .length
                          }{" "}
                          words
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white px-6 py-3">
        <p className="text-xs text-gray-500">
          Tip: Drag versions to reorder them. Each version targets a different
          segment with customized content.
        </p>
      </div>
    </div>
  );
}
