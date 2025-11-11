/**
 * Nexus Icon Component
 *
 * Simplified icon version of the logo for use in app badges, favicons, and minimalist contexts
 */

interface NexusIconProps {
  /** Size in pixels (defaults to 24) */
  size?: number;
  /** Enable glow animation */
  animated?: boolean;
  /** Class name for custom styling */
  className?: string;
}

export function NexusIcon({
  size = 24,
  animated = false,
  className = "",
}: NexusIconProps) {
  const nodeRadius = size * 0.12;
  const coreRadius = size * 0.18;
  const orbitRadius = size * 0.35;

  // Calculate positions for 6 nodes
  const nodes = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
    return {
      x: size / 2 + Math.cos(angle) * orbitRadius,
      y: size / 2 + Math.sin(angle) * orbitRadius,
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? "animate-nexus-glow" : ""} ${className}`}
    >
      <defs>
        <linearGradient
          id={`nexus-icon-gradient-${size}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#3B36F4" />
          <stop offset="100%" stopColor="#72E4FC" />
        </linearGradient>

        <filter id={`nexus-icon-glow-${size}`}>
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connection lines */}
      {nodes.map((node, i) => (
        <line
          key={`line-${i}`}
          x1={size / 2}
          y1={size / 2}
          x2={node.x}
          y2={node.y}
          stroke={`url(#nexus-icon-gradient-${size})`}
          strokeWidth={size * 0.08}
          strokeLinecap="round"
          opacity="0.5"
        />
      ))}

      {/* Outer nodes */}
      {nodes.map((node, i) => (
        <circle
          key={`node-${i}`}
          cx={node.x}
          cy={node.y}
          r={nodeRadius}
          fill={`url(#nexus-icon-gradient-${size})`}
        />
      ))}

      {/* Center core */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={coreRadius}
        fill="#FFFFFF"
        filter={`url(#nexus-icon-glow-${size})`}
      />
    </svg>
  );
}
