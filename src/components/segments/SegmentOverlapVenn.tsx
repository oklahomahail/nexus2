import React from "react";

export interface SegmentOverlap {
  segmentId: string;
  segmentName: string;
  totalRecipients: number;
  color: string;
}

export interface OverlapIntersection {
  segments: string[]; // Array of segmentIds
  count: number;
}

interface SegmentOverlapVennProps {
  segments: SegmentOverlap[];
  intersections: OverlapIntersection[];
}

/**
 * SegmentOverlapVenn
 *
 * Venn diagram showing overlap between top 3 segments.
 * Uses SVG circles with transparency to show intersections.
 *
 * Note: For true Venn accuracy with proper proportional areas,
 * you'd need a library like venn.js. This is a simplified visual
 * representation that shows the concept clearly.
 */
export function SegmentOverlapVenn({
  segments,
  intersections,
}: SegmentOverlapVennProps): React.JSX.Element {
  // Limit to top 3 segments for Venn clarity
  const topSegments = segments.slice(0, 3);

  if (topSegments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        No segment data available
      </div>
    );
  }

  // SVG configuration
  const svgWidth = 400;
  const svgHeight = 300;
  const circleRadius = 80;

  // Circle positions for 2 or 3 circles
  const getCirclePositions = (): { x: number; y: number }[] => {
    if (topSegments.length === 1) {
      return [{ x: svgWidth / 2, y: svgHeight / 2 }];
    } else if (topSegments.length === 2) {
      return [
        { x: svgWidth / 2 - 50, y: svgHeight / 2 },
        { x: svgWidth / 2 + 50, y: svgHeight / 2 },
      ];
    } else {
      // Three circles in triangular formation
      return [
        { x: svgWidth / 2, y: svgHeight / 2 - 40 }, // Top
        { x: svgWidth / 2 - 60, y: svgHeight / 2 + 40 }, // Bottom left
        { x: svgWidth / 2 + 60, y: svgHeight / 2 + 40 }, // Bottom right
      ];
    }
  };

  const positions = getCirclePositions();

  // Calculate intersection counts
  const getIntersectionCount = (segmentIds: string[]): number => {
    const intersection = intersections.find((i) => {
      if (i.segments.length !== segmentIds.length) return false;
      return segmentIds.every((id) => i.segments.includes(id));
    });
    return intersection?.count || 0;
  };

  // Get all two-way and three-way intersections
  const twoWayIntersections =
    topSegments.length >= 2
      ? [
          {
            segments: [topSegments[0].segmentId, topSegments[1].segmentId],
            count: getIntersectionCount([
              topSegments[0].segmentId,
              topSegments[1].segmentId,
            ]),
          },
          ...(topSegments.length >= 3
            ? [
                {
                  segments: [
                    topSegments[0].segmentId,
                    topSegments[2].segmentId,
                  ],
                  count: getIntersectionCount([
                    topSegments[0].segmentId,
                    topSegments[2].segmentId,
                  ]),
                },
                {
                  segments: [
                    topSegments[1].segmentId,
                    topSegments[2].segmentId,
                  ],
                  count: getIntersectionCount([
                    topSegments[1].segmentId,
                    topSegments[2].segmentId,
                  ]),
                },
              ]
            : []),
        ]
      : [];

  const threeWayIntersection =
    topSegments.length === 3
      ? getIntersectionCount(topSegments.map((s) => s.segmentId))
      : 0;

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="space-y-4">
      {/* SVG Venn Diagram */}
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
        <svg width={svgWidth} height={svgHeight} className="overflow-visible">
          {/* Define filters for better visual */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Draw circles */}
          {topSegments.map((segment, index) => (
            <circle
              key={segment.segmentId}
              cx={positions[index].x}
              cy={positions[index].y}
              r={circleRadius}
              fill={segment.color}
              opacity={0.3}
              stroke={segment.color}
              strokeWidth={2}
              filter="url(#glow)"
            />
          ))}

          {/* Labels for each circle */}
          {topSegments.map((segment, index) => {
            // Position labels outside the circles
            let labelX = positions[index].x;
            let labelY = positions[index].y;

            if (topSegments.length === 3) {
              if (index === 0)
                labelY -= circleRadius + 20; // Top
              else if (index === 1)
                labelX -= circleRadius + 40; // Bottom left
              else labelX += circleRadius + 40; // Bottom right
            } else if (topSegments.length === 2) {
              if (index === 0) labelX -= circleRadius + 40;
              else labelX += circleRadius + 40;
            }

            return (
              <g key={`label-${segment.segmentId}`}>
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  className="text-xs font-semibold"
                  fill={segment.color}
                >
                  {segment.segmentName}
                </text>
                <text
                  x={labelX}
                  y={labelY + 12}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#6b7280"
                >
                  {formatNumber(segment.totalRecipients)}
                </text>
              </g>
            );
          })}

          {/* Intersection count labels */}
          {topSegments.length === 3 && threeWayIntersection > 0 && (
            <text
              x={svgWidth / 2}
              y={svgHeight / 2}
              textAnchor="middle"
              className="text-sm font-bold"
              fill="#1f2937"
            >
              {formatNumber(threeWayIntersection)}
            </text>
          )}

          {/* Two-way intersection labels */}
          {topSegments.length >= 2 &&
            twoWayIntersections.map((intersection, index) => {
              if (intersection.count === 0) return null;

              let x = svgWidth / 2;
              let y = svgHeight / 2;

              if (topSegments.length === 2) {
                x = svgWidth / 2;
                y = svgHeight / 2;
              } else if (topSegments.length === 3) {
                // Position labels between circles
                if (index === 0) {
                  // Between 0 and 1
                  x = svgWidth / 2 - 30;
                  y = svgHeight / 2;
                } else if (index === 1) {
                  // Between 0 and 2
                  x = svgWidth / 2 + 30;
                  y = svgHeight / 2;
                } else if (index === 2) {
                  // Between 1 and 2
                  x = svgWidth / 2;
                  y = svgHeight / 2 + 50;
                }
              }

              return (
                <text
                  key={`intersection-${index}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  className="text-xs font-semibold"
                  fill="#6b7280"
                >
                  {formatNumber(intersection.count)}
                </text>
              );
            })}
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          Overlap Summary
        </h4>
        <div className="space-y-1.5">
          {topSegments.map((segment) => (
            <div
              key={segment.segmentId}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-gray-900">{segment.segmentName}</span>
              </div>
              <span className="font-medium text-gray-700">
                {formatNumber(segment.totalRecipients)}
              </span>
            </div>
          ))}

          {twoWayIntersections.length > 0 && (
            <>
              <div className="my-2 border-t border-gray-200" />
              {twoWayIntersections.map((intersection, index) => {
                if (intersection.count === 0) return null;
                const segNames = intersection.segments.map((id) => {
                  const seg = topSegments.find((s) => s.segmentId === id);
                  return seg?.segmentName || id;
                });
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-600">
                      {segNames.join(" ∩ ")}
                    </span>
                    <span className="font-medium text-gray-600">
                      {formatNumber(intersection.count)}
                    </span>
                  </div>
                );
              })}
            </>
          )}

          {topSegments.length === 3 && threeWayIntersection > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">All three segments</span>
              <span className="font-medium text-gray-600">
                {formatNumber(threeWayIntersection)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-md bg-blue-50 p-3">
        <p className="text-xs text-blue-700">
          <strong>Overlap Insight:</strong> Recipients appearing in multiple
          segments will receive content from their highest-priority version. Use
          overlaps to understand your audience composition.
        </p>
      </div>
    </div>
  );
}
