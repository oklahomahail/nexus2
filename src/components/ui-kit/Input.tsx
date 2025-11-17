import clsx from "clsx";
import React, { forwardRef } from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
  variant?: "default" | "filled" | "outlined";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  theme?: "dark" | "light";
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    leftIcon,
    rightIcon,
    className,
    wrapperClassName,
    variant = "default",
    size = "md",
    fullWidth = true,
    theme = "light",
    id,
    ...rest
  },
  ref,
) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

  const baseClasses =
    "transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0";

  // Light mode variant classes
  const lightVariantClasses = {
    default:
      "bg-white border border-[rgb(var(--nexus-slate-300))] text-[rgb(var(--nexus-slate-900))] placeholder-[rgb(var(--nexus-slate-700))] focus:ring-[rgb(var(--nexus-blue-600))] focus:border-[rgb(var(--nexus-blue-600))]",
    filled:
      "bg-[rgb(var(--nexus-slate-100))] border-transparent text-[rgb(var(--nexus-slate-900))] placeholder-[rgb(var(--nexus-slate-700))] focus:ring-[rgb(var(--nexus-blue-600))] focus:bg-white",
    outlined:
      "bg-transparent border-2 border-[rgb(var(--nexus-slate-300))] text-[rgb(var(--nexus-slate-900))] placeholder-[rgb(var(--nexus-slate-700))] focus:ring-[rgb(var(--nexus-blue-600))] focus:border-[rgb(var(--nexus-blue-600))]",
  } as const;

  // Dark mode variant classes
  const darkVariantClasses = {
    default:
      "bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500",
    filled:
      "bg-slate-700 border-transparent text-white placeholder-slate-400 focus:ring-blue-500 focus:bg-slate-800",
    outlined:
      "bg-transparent border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500",
  } as const;

  const variantClasses =
    theme === "light" ? lightVariantClasses : darkVariantClasses;

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-3 py-2 text-sm rounded-xl",
    lg: "px-4 py-3 text-base rounded-xl",
  } as const;

  const iconPadding = {
    sm: { left: "pl-8", right: "pr-8" },
    md: { left: "pl-10", right: "pr-10" },
    lg: { left: "pl-12", right: "pr-12" },
  } as const;

  const withLeft = leftIcon
    ? iconPadding[size as keyof typeof iconPadding].left
    : "";
  const withRight = rightIcon
    ? iconPadding[size as keyof typeof iconPadding].right
    : "";
  const errorStyles = error
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : "";
  const widthClass = fullWidth ? "w-full" : "";

  const inputClass = clsx(
    baseClasses,
    variantClasses[variant as keyof typeof variantClasses],
    sizeClasses[size as keyof typeof sizeClasses],
    withLeft,
    withRight,
    errorStyles,
    widthClass,
    className,
  );

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  } as const;

  const iconPositions = {
    sm: { left: "left-2", right: "right-2" },
    md: { left: "left-3", right: "right-3" },
    lg: { left: "left-3", right: "right-3" },
  } as const;

  const labelColor =
    theme === "light" ? "text-[rgb(var(--nexus-slate-900))]" : "text-slate-200";
  const iconColor =
    theme === "light" ? "text-[rgb(var(--nexus-slate-700))]" : "text-slate-400";
  const hintColor =
    theme === "light" ? "text-[rgb(var(--nexus-slate-700))]" : "text-slate-400";
  const errorColor =
    theme === "light" ? "text-[rgb(var(--nexus-red-500))]" : "text-red-400";

  return (
    <div className={clsx(fullWidth && "w-full", wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium mb-2 ${labelColor}`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div
            className={clsx(
              "absolute inset-y-0 flex items-center pointer-events-none",
              iconColor,
              iconPositions[size as keyof typeof iconPositions].left,
            )}
          >
            <span className={iconSizes[size as keyof typeof iconSizes]}>
              {leftIcon}
            </span>
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={inputClass}
          {...rest}
        />

        {rightIcon && (
          <div
            className={clsx(
              "absolute inset-y-0 flex items-center",
              iconColor,
              iconPositions[size as keyof typeof iconPositions].right,
            )}
          >
            <span className={iconSizes[size as keyof typeof iconSizes]}>
              {rightIcon}
            </span>
          </div>
        )}
      </div>

      {(hint || error) && (
        <div className="mt-1.5">
          {error ? (
            <p
              id={`${inputId}-error`}
              className={`text-xs ${errorColor} flex items-center gap-1`}
            >
              <span aria-hidden="true">⚠</span>
              {error}
            </p>
          ) : (
            <p id={`${inputId}-hint`} className={`text-xs ${hintColor}`}>
              {hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

export default Input;
// Support both `import Input from ...` and `import { Input } from ...`
export { Input };
