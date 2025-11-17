import React, { useEffect, useState } from "react";

import { getSegmentById } from "../../services/campaignComposer/defaultSegmentCatalog";
import {
  getSegmentMessagingRecommendations,
  SegmentMessagingRecommendation,
} from "../../services/segmentMessagingService";

interface SegmentContentRecommendationsProps {
  segmentId: string;
  compact?: boolean;
}

/**
 * SegmentContentRecommendations
 *
 * Displays AI-powered messaging recommendations for a specific donor segment.
 * Shows what messaging tends to work best based on segment characteristics
 * and historical performance.
 */
export function SegmentContentRecommendations({
  segmentId,
  compact = false,
}: SegmentContentRecommendationsProps): React.JSX.Element | null {
  const [data, setData] = useState<SegmentMessagingRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const segment = getSegmentById(segmentId);
        if (!segment) {
          throw new Error(`Segment ${segmentId} not found`);
        }

        // In production, this would include clientId
        const recommendations = await getSegmentMessagingRecommendations(
          "demo-client",
          segment,
        );
        setData(recommendations);
      } catch (err) {
        console.error("Failed to load messaging recommendations:", err);
        setError("Unable to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    void fetchRecommendations();
  }, [segmentId]);

  if (loading) {
    return (
      <div className="rounded-md bg-blue-50 p-3">
        <p className="text-xs text-blue-600">
          Analyzing what works for this segment...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  if (compact) {
    return (
      <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
        <div className="flex items-start space-x-2">
          <svg
            className="h-4 w-4 flex-shrink-0 text-blue-600"
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
          <div className="flex-1">
            <p className="text-xs font-medium text-blue-900">Messaging Tip</p>
            <p className="mt-1 text-xs text-blue-700">{data.headline}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center space-x-2">
        <svg
          className="h-5 w-5 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h4 className="text-sm font-semibold text-gray-900">
          AI Messaging Recommendations
        </h4>
      </div>

      {/* Headline */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-900">{data.headline}</p>
      </div>

      {/* Key Points */}
      <div className="mb-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-600">
          Key Points
        </p>
        <ul className="space-y-1.5">
          {data.bullets.map((bullet, index) => (
            <li key={index} className="flex items-start space-x-2">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-700">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tone Guidance */}
      <div className="mb-3 rounded-md bg-gray-50 p-3">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-600">
          Tone & Framing
        </p>
        <p className="text-sm text-gray-800">{data.toneGuidance}</p>
      </div>

      {/* Timing Notes */}
      {data.timingNotes && (
        <div className="rounded-md bg-purple-50 p-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-purple-700">
            Timing & Channel Notes
          </p>
          <p className="text-sm text-purple-900">{data.timingNotes}</p>
        </div>
      )}
    </div>
  );
}
