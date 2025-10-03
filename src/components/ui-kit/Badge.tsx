import clsx from "clsx";
import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "pill" | "square";
  dot?: boolean;
  count?: number;
  showZero?: boolean;
  max?: number;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  shape = "rounded",
  dot = false,
  count,
  showZero = false,
  max = 99,
  className,
  icon,
}) => {
  const variantClasses = {
    default: "bg-slate-700 text-slate-200 border-slate-600",
    secondary: "bg-slate-600 text-slate-300 border-slate-500",
    success: "bg-green-600 text-green-100 border-green-500",
    warning: "bg-yellow-600 text-yellow-100 border-yellow-500",
    error: "bg-red-600 text-red-100 border-red-500",
    info: "bg-blue-600 text-blue-100 border-blue-500",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const shapeClasses = {
    rounded: "rounded-md",
    pill: "rounded-full",
    square: "rounded-none",
  };

  // Handle count display
  const displayCount = () => {
    if (count === undefined) return null;
    if (count === 0 && !showZero) return null;
    if (count > max) return `${max}+`;
    return count;
  };

  const shouldShowBadge = count !== undefined ? count > 0 || showZero : true;

  if (dot) {
    return (
      <div className="relative inline-flex">
        {children}
        {shouldShowBadge && (
          <span
            className={clsx(
              "absolute -top-1 -right-1 w-3 h-3 border-2 border-slate-900 rounded-full",
              variantClasses[variant].split(" ")[0], // Just the background color
              className,
            )}
          />
        )}
      </div>
    );
  }

  if (count !== undefined) {
    return (
      <div className="relative inline-flex">
        {children}
        {shouldShowBadge && (
          <span
            className={clsx(
              "absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium border rounded-full min-w-[1.25rem] h-5",
              variantClasses[variant],
              className,
            )}
          >
            {displayCount()}
          </span>
        )}
      </div>
    );
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 font-medium border",
        sizeClasses[size],
        shapeClasses[shape],
        variantClasses[variant],
        className,
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
