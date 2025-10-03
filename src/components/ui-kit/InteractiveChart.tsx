import clsx from "clsx";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// Types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
  drillDownData?: ChartDataPoint[];
}

export interface ChartProps {
  data: ChartDataPoint[];
  type?: "bar" | "line" | "pie" | "donut" | "area";
  width?: number | string;
  height?: number | string;
  interactive?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  enableDrillDown?: boolean;
  enableZoom?: boolean;
  colors?: string[];
  onPointClick?: (point: ChartDataPoint, index: number) => void;
  onPointHover?: (point: ChartDataPoint | null, index: number | null) => void;
  className?: string;
  title?: string;
  subtitle?: string;
}

export interface TooltipData {
  point: ChartDataPoint;
  index: number;
  x: number;
  y: number;
}

// Default color palette
const DEFAULT_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
  "#EC4899", // pink
  "#6B7280", // gray
];

export const InteractiveChart: React.FC<ChartProps> = ({
  data,
  type = "bar",
  width = "100%",
  height = 300,
  interactive = true,
  showTooltip = true,
  showLegend = false,
  showGrid = true,
  enableDrillDown = false,
  enableZoom: _enableZoom = false,
  colors = DEFAULT_COLORS,
  onPointClick,
  onPointHover,
  className,
  title,
  subtitle,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [_zoomLevel, _setZoomLevel] = useState(1);
  const [_panOffset, _setPanOffset] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

  // Update dimensions when container resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: typeof width === "number" ? width : rect.width || 400,
          height: typeof height === "number" ? height : 300,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [width, height]);

  // Calculate chart dimensions
  const margin = useMemo(
    () => ({ top: 20, right: 20, bottom: 40, left: 60 }),
    [],
  );
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  // Get max value for scaling
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const valueRange = maxValue - minValue || 1;

  // Handle mouse events
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGElement>) => {
      if (!interactive || !showTooltip) return;

      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Find the closest data point based on chart type
      let closestIndex = -1;
      // let _closestDistance = Infinity;

      if (type === "bar") {
        const barWidth = chartWidth / data.length;
        closestIndex = Math.floor((x - margin.left) / barWidth);
        closestIndex = Math.max(0, Math.min(closestIndex, data.length - 1));
      } else if (type === "line" || type === "area") {
        const xStep = chartWidth / (data.length - 1);
        closestIndex = Math.round((x - margin.left) / xStep);
        closestIndex = Math.max(0, Math.min(closestIndex, data.length - 1));
      } else if (type === "pie" || type === "donut") {
        // Calculate angle for pie charts
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        const angle = Math.atan2(y - centerY, x - centerX);
        const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);

        let currentAngle = 0;
        const total = data.reduce((sum, d) => sum + d.value, 0);

        for (let i = 0; i < data.length; i++) {
          const sliceAngle = (data[i].value / total) * Math.PI * 2;
          if (
            normalizedAngle >= currentAngle &&
            normalizedAngle <= currentAngle + sliceAngle
          ) {
            closestIndex = i;
            break;
          }
          currentAngle += sliceAngle;
        }
      }

      if (closestIndex >= 0 && closestIndex < data.length) {
        if (hoveredIndex !== closestIndex) {
          setHoveredIndex(closestIndex);
          setTooltip({
            point: data[closestIndex],
            index: closestIndex,
            x: event.clientX,
            y: event.clientY,
          });
          onPointHover?.(data[closestIndex], closestIndex);
        }
      }
    },
    [
      interactive,
      showTooltip,
      type,
      data,
      chartWidth,
      margin,
      dimensions,
      hoveredIndex,
      onPointHover,
    ],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    setHoveredIndex(null);
    onPointHover?.(null, null);
  }, [onPointHover]);

  const handleClick = useCallback(
    (index: number) => {
      if (interactive && index >= 0 && index < data.length) {
        onPointClick?.(data[index], index);

        // Handle drill down if enabled
        if (enableDrillDown && data[index].drillDownData) {
          // This would typically update the parent component's state
          console.log("Drill down to:", data[index].drillDownData);
        }
      }
    },
    [interactive, data, onPointClick, enableDrillDown],
  );

  // Render different chart types
  const renderBarChart = () => {
    const barWidth = (chartWidth / data.length) * 0.8;
    const barSpacing = (chartWidth / data.length) * 0.2;

    return (
      <g>
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-30">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1={margin.left}
                y1={margin.top + chartHeight * (1 - ratio)}
                x2={margin.left + chartWidth}
                y2={margin.top + chartHeight * (1 - ratio)}
                stroke="currentColor"
                strokeWidth={0.5}
                className="text-slate-600"
              />
            ))}
          </g>
        )}

        {/* Bars */}
        {data.map((point, index) => {
          const barHeight =
            ((point.value - minValue) / valueRange) * chartHeight;
          const x =
            margin.left + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = margin.top + chartHeight - barHeight;
          const color = point.color || colors[index % colors.length];
          const isHovered = hoveredIndex === index;

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                className={clsx(
                  "transition-all duration-200",
                  interactive && "cursor-pointer",
                  isHovered && "opacity-80 brightness-110",
                )}
                onClick={() => handleClick(index)}
              />

              {/* Value label on hover */}
              {isHovered && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-slate-300"
                >
                  {point.value.toLocaleString()}
                </text>
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((point, index) => {
          const x =
            margin.left +
            index * (barWidth + barSpacing) +
            barSpacing / 2 +
            barWidth / 2;
          return (
            <text
              key={index}
              x={x}
              y={dimensions.height - 10}
              textAnchor="middle"
              className="text-xs fill-slate-400"
            >
              {point.label.length > 8
                ? `${point.label.slice(0, 8)}...`
                : point.label}
            </text>
          );
        })}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const value = minValue + ratio * valueRange;
          const y = margin.top + chartHeight * (1 - ratio);
          return (
            <text
              key={ratio}
              x={margin.left - 10}
              y={y + 4}
              textAnchor="end"
              className="text-xs fill-slate-400"
            >
              {value.toLocaleString()}
            </text>
          );
        })}
      </g>
    );
  };

  const renderLineChart = () => {
    const points = data.map((point, index) => {
      const x = margin.left + (index / (data.length - 1)) * chartWidth;
      const y =
        margin.top +
        chartHeight -
        ((point.value - minValue) / valueRange) * chartHeight;
      return { x, y, point, index };
    });

    const pathData = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    return (
      <g>
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-30">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1={margin.left}
                y1={margin.top + chartHeight * (1 - ratio)}
                x2={margin.left + chartWidth}
                y2={margin.top + chartHeight * (1 - ratio)}
                stroke="currentColor"
                strokeWidth={0.5}
                className="text-slate-600"
              />
            ))}
          </g>
        )}

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={colors[0]}
          strokeWidth={2}
          className="transition-all duration-200"
        />

        {/* Area fill for area chart */}
        {type === "area" && (
          <path
            d={`${pathData} L ${points[points.length - 1].x} ${margin.top + chartHeight} L ${points[0].x} ${margin.top + chartHeight} Z`}
            fill={colors[0]}
            fillOpacity={0.2}
          />
        )}

        {/* Data points */}
        {points.map(({ x, y, index }) => {
          const isHovered = hoveredIndex === index;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={isHovered ? 6 : 4}
              fill={colors[0]}
              className={clsx(
                "transition-all duration-200",
                interactive && "cursor-pointer hover:r-6",
              )}
              onClick={() => handleClick(index)}
            />
          );
        })}

        {/* Axis labels */}
        {points.map(({ x, point, index }) => (
          <text
            key={index}
            x={x}
            y={dimensions.height - 10}
            textAnchor="middle"
            className="text-xs fill-slate-400"
          >
            {point.label}
          </text>
        ))}
      </g>
    );
  };

  const renderPieChart = () => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
    const innerRadius = type === "donut" ? radius * 0.4 : 0;

    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = -Math.PI / 2; // Start at top

    return (
      <g>
        {data.map((point, index) => {
          const sliceAngle = (point.value / total) * Math.PI * 2;
          const endAngle = currentAngle + sliceAngle;

          const x1 = centerX + Math.cos(currentAngle) * radius;
          const y1 = centerY + Math.sin(currentAngle) * radius;
          const x2 = centerX + Math.cos(endAngle) * radius;
          const y2 = centerY + Math.sin(endAngle) * radius;

          const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`,
          ].join(" ");

          const color = point.color || colors[index % colors.length];
          const isHovered = hoveredIndex === index;

          const result = (
            <path
              key={index}
              d={pathData}
              fill={color}
              className={clsx(
                "transition-all duration-200",
                interactive && "cursor-pointer",
                isHovered && "opacity-80 brightness-110",
              )}
              onClick={() => handleClick(index)}
              transform={
                isHovered
                  ? `translate(${Math.cos((currentAngle + endAngle) / 2) * 5}, ${Math.sin((currentAngle + endAngle) / 2) * 5})`
                  : undefined
              }
            />
          );

          currentAngle = endAngle;
          return result;
        })}

        {/* Inner circle for donut chart */}
        {type === "donut" && (
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius}
            fill="rgb(15 23 42)" // slate-900
          />
        )}
      </g>
    );
  };

  const renderChart = () => {
    switch (type) {
      case "bar":
        return renderBarChart();
      case "line":
      case "area":
        return renderLineChart();
      case "pie":
      case "donut":
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div ref={containerRef} className={clsx("relative", className)}>
      {/* Title and subtitle */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}

      {/* Chart SVG */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {renderChart()}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {data.map((point, index) => {
            const color = point.color || colors[index % colors.length];
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-slate-300">{point.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div
          className="fixed z-50 px-3 py-2 text-sm text-white bg-slate-800 border border-slate-700 rounded-lg shadow-xl pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 40,
          }}
        >
          <div className="font-medium">{tooltip.point.label}</div>
          <div className="text-slate-300">
            Value: {tooltip.point.value.toLocaleString()}
          </div>
          {enableDrillDown && tooltip.point.drillDownData && (
            <div className="text-xs text-blue-300 mt-1">
              Click to drill down
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveChart;
