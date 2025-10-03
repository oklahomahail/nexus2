import clsx from "clsx";
import React from "react";

export interface ProgressProps {
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "success" | "warning" | "error" | "info";
  shape?: "rounded" | "pill" | "square";
  indeterminate?: boolean;
  striped?: boolean;
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  size = "md",
  variant = "default",
  shape = "rounded",
  indeterminate = false,
  striped = false,
  animated = false,
  showLabel = false,
  label,
  showPercentage = false,
  className,
  trackClassName,
  barClassName,
}) => {
  const percentage = indeterminate ? 0 : Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
    xl: "h-4",
  };

  const shapeClasses = {
    rounded: "rounded-md",
    pill: "rounded-full",
    square: "rounded-none",
  };

  const variantClasses = {
    default: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    error: "bg-red-600",
    info: "bg-cyan-600",
  };

  const trackColor = "bg-slate-700";

  return (
    <div className={clsx("w-full", className)}>
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {showLabel && (
            <span className="text-sm font-medium text-slate-300">
              {label || "Progress"}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-slate-400">
              {indeterminate ? "Loading..." : `${Math.round(percentage)}%`}
            </span>
          )}
        </div>
      )}

      <div
        className={clsx(
          "w-full overflow-hidden relative",
          sizeClasses[size],
          shapeClasses[shape],
          trackColor,
          trackClassName,
        )}
      >
        {indeterminate ? (
          <div
            className={clsx(
              "absolute inset-y-0 w-1/3 animate-pulse",
              variantClasses[variant],
              barClassName,
              "animate-indeterminate-progress",
            )}
          />
        ) : (
          <div
            className={clsx(
              "h-full transition-all duration-300 ease-out relative overflow-hidden",
              variantClasses[variant],
              shapeClasses[shape],
              striped && "progress-striped",
              animated && striped && "animate-progress-stripes",
              barClassName,
            )}
            style={{ width: `${percentage}%` }}
          >
            {striped && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-stripe-pattern" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Circular Progress variant
export interface CircularProgressProps {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "default" | "success" | "warning" | "error" | "info";
  indeterminate?: boolean;
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  max = 100,
  size = 40,
  strokeWidth = 3,
  variant = "default",
  indeterminate = false,
  showLabel = false,
  label,
  showPercentage = false,
  className,
}) => {
  const percentage = indeterminate ? 0 : Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = indeterminate
    ? 0
    : circumference - (percentage / 100) * circumference;

  const variantClasses = {
    default: "stroke-blue-600",
    success: "stroke-green-600",
    warning: "stroke-yellow-600",
    error: "stroke-red-600",
    info: "stroke-cyan-600",
  };

  return (
    <div className={clsx("inline-flex flex-col items-center", className)}>
      <div className="relative">
        <svg
          width={size}
          height={size}
          className={clsx(
            "transform -rotate-90",
            indeterminate && "animate-spin",
          )}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-slate-700"
          />

          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={clsx(
              "transition-all duration-300 ease-out",
              variantClasses[variant],
            )}
          />
        </svg>

        {/* Center content */}
        {(showPercentage || showLabel) && !indeterminate && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-slate-300">
              {showPercentage ? `${Math.round(percentage)}%` : label}
            </span>
          </div>
        )}
      </div>

      {showLabel && label && (
        <span className="text-sm text-slate-400 mt-2">{label}</span>
      )}
    </div>
  );
};

export default Progress;

// Add custom CSS for striped animation (you'll need to add this to your global CSS)
/*
@keyframes indeterminate-progress {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes progress-stripes {
  from {
    background-position: 40px 0;
  }
  to {
    background-position: 0 0;
  }
}

.animate-indeterminate-progress {
  animation: indeterminate-progress 1.5s infinite linear;
}

.animate-progress-stripes {
  animation: progress-stripes 1s linear infinite;
}

.progress-striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 40px 40px;
}
*/
