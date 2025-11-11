/**
 * Nexus Animated Splash Screen
 *
 * Beautiful intro animation:
 * 1. Central white node appears
 * 2. Six lines orbit out to form nodes
 * 3. Wordmark fades in
 *
 * Use for login screen, app initialization, or major transitions
 */

import { useEffect, useState } from "react";

interface NexusSplashProps {
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Duration in milliseconds (default: 3000) */
  duration?: number;
  /** Show wordmark after animation (default: true) */
  showWordmark?: boolean;
  /** Custom message below wordmark */
  message?: string;
}

export function NexusSplash({
  onComplete,
  duration = 3000,
  showWordmark = true,
  message,
}: NexusSplashProps) {
  const [phase, setPhase] = useState<
    "core" | "orbit" | "wordmark" | "complete"
  >("core");

  useEffect(() => {
    const timeline = [
      { phase: "core", delay: 0 },
      { phase: "orbit", delay: duration * 0.3 },
      { phase: "wordmark", delay: duration * 0.6 },
      { phase: "complete", delay: duration },
    ] as const;

    const timeouts = timeline.map(({ phase: nextPhase, delay }) =>
      setTimeout(() => setPhase(nextPhase), delay),
    );

    return () => timeouts.forEach(clearTimeout);
  }, [duration]);

  useEffect(() => {
    if (phase === "complete" && onComplete) {
      onComplete();
    }
  }, [phase, onComplete]);

  const size = 80;
  const nodeRadius = size * 0.08;
  const coreRadius = size * 0.12;
  const orbitRadius = size * 0.35;

  // Calculate node positions
  const nodes = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
    return {
      x: size / 2 + Math.cos(angle) * orbitRadius,
      y: size / 2 + Math.sin(angle) * orbitRadius,
    };
  });

  return (
    <div className="fixed inset-0 bg-[#0D0D12] flex flex-col items-center justify-center z-50">
      {/* Animated Logo */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="splash-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#3B36F4" />
              <stop offset="100%" stopColor="#72E4FC" />
            </linearGradient>

            <filter id="splash-glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Center core - appears first */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={coreRadius}
            fill="#FFFFFF"
            filter="url(#splash-glow)"
            className={phase === "core" ? "animate-nexus-pulse" : ""}
            style={{
              opacity: phase === "core" ? 1 : 1,
              transform: "scale(1)",
              transition: "all 0.3s ease-out",
            }}
          />

          {/* Connection lines - animate out during orbit phase */}
          {phase !== "core" &&
            nodes.map((node, i) => (
              <line
                key={`line-${i}`}
                x1={size / 2}
                y1={size / 2}
                x2={node.x}
                y2={node.y}
                stroke="url(#splash-gradient)"
                strokeWidth={size * 0.02}
                strokeLinecap="round"
                opacity="0.6"
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: phase === "orbit" ? 0 : 100,
                  transition: `stroke-dashoffset ${duration * 0.001 * 0.3}s ease-out ${i * 0.05}s`,
                }}
              />
            ))}

          {/* Outer nodes - appear during orbit phase */}
          {phase !== "core" &&
            nodes.map((node, i) => (
              <circle
                key={`node-${i}`}
                cx={node.x}
                cy={node.y}
                r={nodeRadius}
                fill="url(#splash-gradient)"
                style={{
                  opacity:
                    phase === "orbit" ||
                    phase === "wordmark" ||
                    phase === "complete"
                      ? 1
                      : 0,
                  transform: "scale(1)",
                  transition: `all 0.3s ease-out ${i * 0.05}s`,
                }}
              />
            ))}
        </svg>
      </div>

      {/* Wordmark - fades in during wordmark phase */}
      {showWordmark && (
        <div
          className="mt-6 flex flex-col items-center gap-2"
          style={{
            opacity: phase === "wordmark" || phase === "complete" ? 1 : 0,
            transform: `translateY(${phase === "wordmark" || phase === "complete" ? "0" : "10px"})`,
            transition: "all 0.5s ease-out",
          }}
        >
          <h1
            className="font-semibold tracking-tight"
            style={{
              fontSize: size * 0.4,
              fontFamily: "Inter Tight, Inter, sans-serif",
              color: "#FFFFFF",
            }}
          >
            Nexus
          </h1>

          {message && (
            <p
              className="text-muted text-center font-medium"
              style={{
                fontSize: size * 0.15,
                letterSpacing: "0.015em",
              }}
            >
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Simplified loading splash (no animation sequence)
 * Use for quick loading states
 */
export function NexusLoadingSplash({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="fixed inset-0 bg-[#0D0D12] flex flex-col items-center justify-center z-50">
      <div className="animate-nexus-pulse">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="loading-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#3B36F4" />
              <stop offset="100%" stopColor="#72E4FC" />
            </linearGradient>
            <filter id="loading-glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines */}
          <line
            x1="40"
            y1="40"
            x2="40"
            y2="12"
            stroke="url(#loading-gradient)"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.6"
          />
          <line
            x1="40"
            y1="40"
            x2="64.25"
            y2="26"
            stroke="url(#loading-gradient)"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.6"
          />
          <line
            x1="40"
            y1="40"
            x2="64.25"
            y2="54"
            stroke="url(#loading-gradient)"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.6"
          />
          <line
            x1="40"
            y1="40"
            x2="40"
            y2="68"
            stroke="url(#loading-gradient)"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.6"
          />
          <line
            x1="40"
            y1="40"
            x2="15.75"
            y2="54"
            stroke="url(#loading-gradient)"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.6"
          />
          <line
            x1="40"
            y1="40"
            x2="15.75"
            y2="26"
            stroke="url(#loading-gradient)"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Outer nodes */}
          <circle cx="40" cy="12" r="6.4" fill="url(#loading-gradient)" />
          <circle cx="64.25" cy="26" r="6.4" fill="url(#loading-gradient)" />
          <circle cx="64.25" cy="54" r="6.4" fill="url(#loading-gradient)" />
          <circle cx="40" cy="68" r="6.4" fill="url(#loading-gradient)" />
          <circle cx="15.75" cy="54" r="6.4" fill="url(#loading-gradient)" />
          <circle cx="15.75" cy="26" r="6.4" fill="url(#loading-gradient)" />

          {/* Center core */}
          <circle
            cx="40"
            cy="40"
            r="9.6"
            fill="#FFFFFF"
            filter="url(#loading-glow)"
          />
        </svg>
      </div>

      <p className="mt-6 text-muted text-center font-medium text-lg">
        {message}
      </p>
    </div>
  );
}
