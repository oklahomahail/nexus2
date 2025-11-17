import React, { useState } from "react";

import { DeliverableVersion } from "../../components/composer/DeliverableSegmentationEditor";
import { getDefaultVersionLabel } from "../../services/campaignComposer/defaultSegmentCatalog";
import {
  getRecommendedSegments,
  getCampaignTypeLabel,
  CampaignKind,
} from "../../utils/recommendedSegmentation";

interface ApplyRecommendedSegmentationWizardProps {
  campaignType: CampaignKind;
  deliverableType: "direct_mail" | "email" | "sms" | "social" | "phone";
  onApply: (versions: DeliverableVersion[]) => void;
}

/**
 * ApplyRecommendedSegmentationWizard
 *
 * One-click wizard to apply recommended segment versions based on campaign type.
 * Uses Track15 best practices to suggest the most effective segment combinations.
 */
export function ApplyRecommendedSegmentationWizard({
  campaignType,
  deliverableType,
  onApply,
}: ApplyRecommendedSegmentationWizardProps): React.JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(
    new Set(),
  );

  const recommendedSegments = getRecommendedSegments(campaignType);

  // Auto-select high priority segments (priority 1-2)
  React.useEffect(() => {
    const highPriority = recommendedSegments
      .filter((seg) => seg.priority <= 2)
      .map((seg) => seg.segmentId);
    setSelectedSegments(new Set(highPriority));
  }, [campaignType, recommendedSegments]);

  if (!recommendedSegments || recommendedSegments.length === 0) {
    return null;
  }

  const handleToggleSegment = (segmentId: string) => {
    setSelectedSegments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(segmentId)) {
        newSet.delete(segmentId);
      } else {
        newSet.add(segmentId);
      }
      return newSet;
    });
  };

  const handleApply = () => {
    const versions: DeliverableVersion[] = Array.from(selectedSegments).map(
      (segmentId) => {
        const recommendedSeg = recommendedSegments.find(
          (seg) => seg.segmentId === segmentId,
        );
        return {
          versionId: crypto.randomUUID(),
          deliverableId: "", // Will be set by parent
          versionLabel:
            recommendedSeg?.label || getDefaultVersionLabel(segmentId),
          segmentCriteriaId: segmentId,
          contentDraft: "",
          subjectLine:
            deliverableType === "email"
              ? `[${recommendedSeg?.label || segmentId}] `
              : undefined,
          sortOrder: recommendedSeg?.priority || 99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      },
    );

    // Sort by priority
    versions.sort((a, b) => a.sortOrder - b.sortOrder);

    onApply(versions);
    setOpen(false);
  };

  const campaignLabel = getCampaignTypeLabel(campaignType);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
        data-tour="seg-wizard"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <span>Apply recommended segmentation</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-xl">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recommended Segmentation
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {campaignLabel} • Best practice segment combinations
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md text-gray-400 hover:text-gray-500"
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
            <div className="max-h-96 overflow-y-auto px-6 py-4">
              <p className="mb-4 text-sm text-gray-700">
                Based on your campaign type, we recommend creating versions for
                these segments. Select which ones to include:
              </p>

              <div className="space-y-3">
                {recommendedSegments.map((recommendedSeg) => {
                  const isSelected = selectedSegments.has(
                    recommendedSeg.segmentId,
                  );
                  const isHighPriority = recommendedSeg.priority <= 2;

                  return (
                    <div
                      key={recommendedSeg.segmentId}
                      className={`rounded-lg border p-4 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <label className="flex cursor-pointer items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            handleToggleSegment(recommendedSeg.segmentId)
                          }
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {recommendedSeg.label}
                            </span>
                            {isHighPriority && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                Recommended
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              Priority {recommendedSeg.priority}
                            </span>
                          </div>
                          {recommendedSeg.rationale && (
                            <p className="mt-1 text-xs text-gray-600">
                              {recommendedSeg.rationale}
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Info box */}
              <div className="mt-4 rounded-md bg-blue-50 p-3">
                <div className="flex items-start space-x-2">
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600"
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
                  <p className="text-xs text-blue-700">
                    These recommendations are based on Track15 fundraising best
                    practices. You can customize the content for each version
                    after creating them.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  {selectedSegments.size}{" "}
                  {selectedSegments.size === 1 ? "version" : "versions"}{" "}
                  selected
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={selectedSegments.size === 0}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Create {selectedSegments.size}{" "}
                    {selectedSegments.size === 1 ? "version" : "versions"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
