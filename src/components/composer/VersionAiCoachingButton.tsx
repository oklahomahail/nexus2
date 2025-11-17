import React, { useState } from "react";

import { DeliverableVersion } from "./DeliverableSegmentationEditor";
import { getSegmentById } from "../../services/campaignComposer/defaultSegmentCatalog";
import {
  rewriteForSegment,
  AiCoachingResult,
} from "../../services/deliverableAiCoachService";

interface VersionAiCoachingButtonProps {
  version: DeliverableVersion;
  deliverableType: "direct_mail" | "email" | "sms" | "social" | "phone";
  onApplyRewrite: (
    versionId: string,
    newContent: string,
    newSubject?: string,
  ) => void;
}

/**
 * VersionAiCoachingButton
 *
 * "Rewrite for this segment" button that uses AI to optimize content
 * for the specific donor segment. Shows before/after comparison and
 * explains the techniques applied.
 *
 * Features:
 * - One-click AI rewrite
 * - Before/after comparison
 * - Technique explanation
 * - Accept/reject workflow
 */
export function VersionAiCoachingButton({
  version,
  deliverableType,
  onApplyRewrite,
}: VersionAiCoachingButtonProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [coachingResult, setCoachingResult] = useState<AiCoachingResult | null>(
    null,
  );

  const handleRewrite = async () => {
    setIsLoading(true);

    try {
      const result = await rewriteForSegment({
        originalContent: version.contentDraft,
        segmentId: version.segmentCriteriaId,
        deliverableType,
        subjectLine: version.subjectLine,
      });

      setCoachingResult(result);
      setShowComparison(true);
    } catch (error) {
      console.error("AI coaching error:", error);
      alert("Failed to generate rewrite. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (coachingResult) {
      onApplyRewrite(
        version.versionId,
        coachingResult.rewrittenContent,
        coachingResult.suggestedSubjectLine,
      );
      setShowComparison(false);
      setCoachingResult(null);
    }
  };

  const handleReject = () => {
    setShowComparison(false);
    setCoachingResult(null);
  };

  const segment = getSegmentById(version.segmentCriteriaId);
  const segmentName = segment?.name || "this segment";

  return (
    <>
      {/* AI Coaching Button */}
      <button
        onClick={handleRewrite}
        disabled={isLoading || !version.contentDraft.trim()}
        className="inline-flex items-center space-x-1.5 rounded-md border border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:from-purple-100 hover:to-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
        data-tour="ai-coach"
      >
        {isLoading ? (
          <>
            <svg
              className="h-3.5 w-3.5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Optimizing...</span>
          </>
        ) : (
          <>
            <svg
              className="h-3.5 w-3.5"
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
            <span>Rewrite for {segmentName}</span>
          </>
        )}
      </button>

      {/* Comparison Modal */}
      {showComparison && coachingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-5xl rounded-lg border border-gray-200 bg-white shadow-xl">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    AI Content Optimization
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Optimized for {segmentName}
                  </p>
                </div>
                <button
                  onClick={handleReject}
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

            {/* Body - Before/After Comparison */}
            <div className="max-h-[60vh] overflow-y-auto bg-gray-50 px-6 py-6">
              {/* Explanation */}
              <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-start space-x-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600"
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
                  <div>
                    <h4 className="text-sm font-semibold text-purple-900">
                      What Changed
                    </h4>
                    <p className="mt-1 text-sm text-purple-800">
                      {coachingResult.explanation}
                    </p>
                    {coachingResult.appliedTechniques.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {coachingResult.appliedTechniques.map(
                          (technique, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700"
                            >
                              {technique}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Subject Line Comparison (for email) */}
              {deliverableType === "email" &&
                coachingResult.suggestedSubjectLine && (
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Original Subject
                      </h4>
                      <div className="rounded-md border border-gray-200 bg-white p-3">
                        <p className="text-sm text-gray-900">
                          {version.subjectLine || "(no subject line)"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-600">
                        Optimized Subject
                      </h4>
                      <div className="rounded-md border border-green-200 bg-green-50 p-3">
                        <p className="text-sm font-medium text-green-900">
                          {coachingResult.suggestedSubjectLine}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Content Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Original Content
                  </h4>
                  <div className="rounded-md border border-gray-200 bg-white p-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900">
                      {version.contentDraft}
                    </pre>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {version.contentDraft.split(/\s+/).filter((w) => w).length}{" "}
                    words
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-600">
                    Optimized Content
                  </h4>
                  <div className="rounded-md border border-green-200 bg-green-50 p-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm font-medium text-green-900">
                      {coachingResult.rewrittenContent}
                    </pre>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {
                      coachingResult.rewrittenContent
                        .split(/\s+/)
                        .filter((w) => w).length
                    }{" "}
                    words
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 rounded-md bg-blue-50 p-4">
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
                    This is a suggestion based on fundraising best practices for{" "}
                    {segmentName}. You can accept it as-is, manually edit the
                    optimized version, or keep your original content.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleReject}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Keep Original
                </button>
                <button
                  onClick={handleAccept}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Use Optimized Version
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
