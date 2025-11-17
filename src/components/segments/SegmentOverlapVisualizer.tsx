import React, { useState, useMemo } from "react";

import {
  SegmentOverlapSankey,
  SegmentOverlapFlow,
} from "./SegmentOverlapSankey";
import {
  SegmentOverlapVenn,
  SegmentOverlap,
  OverlapIntersection,
} from "./SegmentOverlapVenn";
import { BehavioralSegment } from "../../services/campaignComposer/defaultSegmentCatalog";

interface SegmentOverlapVisualizerProps {
  segments: BehavioralSegment[];
}

/**
 * SegmentOverlapVisualizer
 *
 * Combined visualization component showing segment overlaps using:
 * 1. Venn diagram for top 3 segments (simple, intuitive)
 * 2. Sankey diagram for all segment flows (detailed, comprehensive)
 *
 * Helps fundraisers understand:
 * - Which donors appear in multiple segments
 * - How to avoid over-messaging
 * - Audience composition and distribution
 */
export function SegmentOverlapVisualizer({
  segments,
}: SegmentOverlapVisualizerProps): React.JSX.Element {
  const [activeView, setActiveView] = useState<"venn" | "sankey">("venn");

  // Mock data for visualization
  // In production, this would come from actual segment overlap analysis
  const mockOverlapData = useMemo(() => {
    const segmentColors = [
      "#3b82f6", // blue
      "#10b981", // green
      "#f59e0b", // amber
      "#8b5cf6", // purple
      "#ef4444", // red
      "#06b6d4", // cyan
      "#ec4899", // pink
      "#84cc16", // lime
    ];

    const vennSegments: SegmentOverlap[] = segments
      .slice(0, 3)
      .map((seg, i) => ({
        segmentId: seg.segmentId,
        segmentName: seg.name,
        totalRecipients: Math.floor(Math.random() * 5000) + 1000,
        color: segmentColors[i],
      }));

    // Generate intersection data
    const intersections: OverlapIntersection[] = [];

    if (vennSegments.length >= 2) {
      // Two-way intersections
      intersections.push({
        segments: [vennSegments[0].segmentId, vennSegments[1].segmentId],
        count: Math.floor(Math.random() * 500) + 100,
      });

      if (vennSegments.length === 3) {
        intersections.push({
          segments: [vennSegments[0].segmentId, vennSegments[2].segmentId],
          count: Math.floor(Math.random() * 400) + 80,
        });
        intersections.push({
          segments: [vennSegments[1].segmentId, vennSegments[2].segmentId],
          count: Math.floor(Math.random() * 350) + 70,
        });

        // Three-way intersection
        intersections.push({
          segments: vennSegments.map((s) => s.segmentId),
          count: Math.floor(Math.random() * 200) + 50,
        });
      }
    }

    // Sankey flow data
    const sankeySegments = segments.slice(0, 5).map((seg, i) => ({
      segmentId: seg.segmentId,
      segmentName: seg.name,
      color: segmentColors[i],
    }));

    const flows: SegmentOverlapFlow[] = [];
    for (let i = 0; i < sankeySegments.length - 1; i++) {
      for (let j = i + 1; j < sankeySegments.length; j++) {
        if (Math.random() > 0.5) {
          // Only create some flows
          flows.push({
            source: sankeySegments[i].segmentId,
            target: sankeySegments[j].segmentId,
            value: Math.floor(Math.random() * 800) + 100,
          });
        }
      }
    }

    return {
      vennSegments,
      intersections,
      sankeySegments,
      flows,
    };
  }, [segments]);

  if (segments.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No segments available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create segments to see overlap visualization
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Segment Overlap Analysis
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Understand how your segments overlap to avoid over-messaging
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-300 bg-white p-1">
          <button
            onClick={() => setActiveView("venn")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeView === "venn"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            data-tour="overlap-venn"
          >
            Venn Diagram
          </button>
          <button
            onClick={() => setActiveView("sankey")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeView === "sankey"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            data-tour="overlap-sankey"
          >
            Flow Diagram
          </button>
        </div>
      </div>

      {/* Visualization */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {activeView === "venn" ? (
          <SegmentOverlapVenn
            segments={mockOverlapData.vennSegments}
            intersections={mockOverlapData.intersections}
          />
        ) : (
          <SegmentOverlapSankey
            segments={mockOverlapData.sankeySegments}
            flows={mockOverlapData.flows}
          />
        )}
      </div>

      {/* Key Insights */}
      <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-5">
        <h4 className="text-sm font-semibold text-gray-900">Key Insights</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-white p-3 shadow-sm">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-xs font-medium text-gray-900">
                  Unique Recipients
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  Recipients who appear in only one segment receive focused,
                  targeted messaging
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-white p-3 shadow-sm">
            <div className="flex items-start space-x-2">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <div>
                <p className="text-xs font-medium text-gray-900">
                  Overlapping Recipients
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  Recipients in multiple segments receive content from their
                  highest-priority version
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-white p-3 shadow-sm">
            <div className="flex items-start space-x-2">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <div>
                <p className="text-xs font-medium text-gray-900">
                  Deduplication
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  Nexus automatically deduplicates across versions to prevent
                  over-messaging
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-white p-3 shadow-sm">
            <div className="flex items-start space-x-2">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <div>
                <p className="text-xs font-medium text-gray-900">
                  Priority Matters
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  Version sort order determines which content overlapping
                  recipients receive
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
