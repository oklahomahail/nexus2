/**
 * Nexus Logo Component
 *
 * The 6-node glowing network forming a central nexus point
 * Represents the intersection of people, purpose, and data
 */

interface NexusLogoProps {
  /** Size in pixels (defaults to 48) */
  size?: number;
  /** Show wordmark alongside symbol */
  showWordmark?: boolean;
  /** Enable pulsing animation */
  animated?: boolean;
  /** Class name for custom styling */
  className?: string;
}

export function NexusLogo({
  size = 48,
  showWordmark = false,
  animated = false,
  className = "",
}: NexusLogoProps) {
  const nodeRadius = size * 0.08;
  const coreRadius = size * 0.12;
  const orbitRadius = size * 0.35;

  // Calculate positions for 6 nodes in a circle
  const nodes = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 6 - Math.PI / 2; // Start from top
    return {
      x: size / 2 + Math.cos(angle) * orbitRadius,
      y: size / 2 + Math.sin(angle) * orbitRadius,
    };
  });

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animated ? "animate-nexus-pulse" : ""}
      >
        <defs>
          {/* Gradient for nodes */}
          <linearGradient
            id="nexus-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3B36F4" />
            <stop offset="100%" stopColor="#72E4FC" />
          </linearGradient>

          {/* Glow filter for center core */}
          <filter id="nexus-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Outer glow for nodes */}
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines from center to nodes */}
        {nodes.map((node, i) => (
          <line
            key={`line-${i}`}
            x1={size / 2}
            y1={size / 2}
            x2={node.x}
            y2={node.y}
            stroke="url(#nexus-gradient)"
            strokeWidth={size * 0.02}
            strokeLinecap="round"
            opacity="0.6"
          />
        ))}

        {/* Outer nodes */}
        {nodes.map((node, i) => (
          <circle
            key={`node-${i}`}
            cx={node.x}
            cy={node.y}
            r={nodeRadius}
            fill="url(#nexus-gradient)"
            filter="url(#node-glow)"
          />
        ))}

        {/* Center core - bright white with glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={coreRadius}
          fill="#FFFFFF"
          filter="url(#nexus-glow)"
        />
      </svg>

      {showWordmark && (
        <span
          className="font-semibold tracking-tight"
          style={{
            fontSize: size * 0.4,
            fontFamily: "Inter Tight, Inter, sans-serif",
            color: "#FFFFFF",
          }}
        >
          Nexus
        </span>
      )}
    </div>
  );
}
