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
    id,
    ...rest
  },
  ref,
) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

  const baseClasses =
    "transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";

  const variantClasses = {
    default:
      "bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500",
    filled:
      "bg-slate-700 border-transparent text-white placeholder-slate-400 focus:ring-blue-500 focus:bg-slate-800",
    outlined:
      "bg-transparent border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500",
  } as const;

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-4 py-3 text-base rounded-lg",
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

  return (
    <div className={clsx(fullWidth && "w-full", wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium mb-2 text-slate-200"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div
            className={clsx(
              "absolute inset-y-0 flex items-center pointer-events-none text-slate-400",
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
              "absolute inset-y-0 flex items-center text-slate-400",
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
              className="text-xs text-red-400 flex items-center gap-1"
            >
              <span aria-hidden="true">⚠</span>
              {error}
            </p>
          ) : (
            <p id={`${inputId}-hint`} className="text-xs text-slate-400">
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
