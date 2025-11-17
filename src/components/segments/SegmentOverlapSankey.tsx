import React, { useMemo } from "react";
import { Sankey, Tooltip, ResponsiveContainer, Rectangle } from "recharts";

export interface SegmentOverlapFlow {
  source: string;
  target: string;
  value: number;
}

interface SegmentOverlapSankeyProps {
  segments: Array<{ segmentId: string; segmentName: string; color: string }>;
  flows: SegmentOverlapFlow[];
}

/**
 * SegmentOverlapSankey
 *
 * Sankey diagram showing how recipients flow between segments.
 * Visualizes the overlap and exclusivity patterns across segments.
 *
 * Uses Recharts Sankey component for interactive flow visualization.
 */
export function SegmentOverlapSankey({
  segments,
  flows,
}: SegmentOverlapSankeyProps): React.JSX.Element {
  // Transform data for Sankey format
  const sankeyData = useMemo(() => {
    // Create nodes
    const nodes = segments.map((seg) => ({
      name: seg.segmentName,
    }));

    // Create links with numeric indices
    const links = flows.map((flow) => {
      const sourceIndex = segments.findIndex(
        (s) => s.segmentId === flow.source,
      );
      const targetIndex = segments.findIndex(
        (s) => s.segmentId === flow.target,
      );

      return {
        source: sourceIndex,
        target: targetIndex,
        value: flow.value,
      };
    });

    return { nodes, links };
  }, [segments, flows]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Custom node renderer
  const CustomNode = (props: any) => {
    const { x, y, width, height, index, payload } = props;
    const isOut = x + width + 6 > props.containerWidth;

    return (
      <g>
        <Rectangle
          x={x}
          y={y}
          width={width}
          height={height}
          fill={segments[index % segments.length]?.color || "#3b82f6"}
          fillOpacity="0.8"
        />
        <text
          textAnchor={isOut ? "end" : "start"}
          x={isOut ? x - 6 : x + width + 6}
          y={y + height / 2}
          fontSize="12"
          className="font-medium"
          fill="#1f2937"
        >
          {payload.name}
        </text>
      </g>
    );
  };

  // Custom link renderer with gradient
  const CustomLink = (props: any) => {
    const {
      sourceX,
      targetX,
      sourceY,
      targetY,
      sourceControlX,
      targetControlX,
      linkWidth,
      index,
    } = props;

    return (
      <g>
        <defs>
          <linearGradient
            id={`linkGradient-${index}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <path
          d={`
            M${sourceX},${sourceY}
            C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
          `}
          fill="none"
          stroke={`url(#linkGradient-${index})`}
          strokeWidth={linkWidth}
          strokeOpacity={0.5}
        />
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
          <p className="text-xs font-semibold text-gray-900">
            {data.source} → {data.target}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {formatNumber(data.value)} recipients
          </p>
        </div>
      );
    }
    return null;
  };

  if (flows.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            No overlap data available
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Add more segments to see overlap flows
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sankey Diagram */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ResponsiveContainer width="100%" height={400}>
          <Sankey
            data={sankeyData}
            node={<CustomNode />}
            link={<CustomLink />}
            nodePadding={50}
            margin={{ top: 20, right: 120, bottom: 20, left: 120 }}
          >
            <Tooltip content={<CustomTooltip />} />
          </Sankey>
        </ResponsiveContainer>
      </div>

      {/* Flow Summary */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          Overlap Flows
        </h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {flows.map((flow, index) => {
            const sourceSeg = segments.find((s) => s.segmentId === flow.source);
            const targetSeg = segments.find((s) => s.segmentId === flow.target);

            return (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center space-x-2 text-xs">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: sourceSeg?.color || "#3b82f6" }}
                  />
                  <span className="font-medium text-gray-700">
                    {sourceSeg?.segmentName || flow.source}
                  </span>
                  <svg
                    className="h-3 w-3 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: targetSeg?.color || "#8b5cf6" }}
                  />
                  <span className="font-medium text-gray-700">
                    {targetSeg?.segmentName || flow.target}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-900">
                  {formatNumber(flow.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-md bg-purple-50 p-3">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs text-purple-700">
            <strong>Flow Visualization:</strong> This diagram shows how
            recipients overlap between segments. Thicker flows indicate larger
            overlaps. Use this to understand your audience composition and avoid
            over-messaging.
          </p>
        </div>
      </div>
    </div>
  );
}
