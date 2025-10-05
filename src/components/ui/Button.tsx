import { clsx } from "clsx";
import { forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      primary:
        "bg-accent text-white hover:scale-105 focus:ring-accent/60 disabled:hover:scale-100",
      secondary:
        "bg-elevated text-text border border-border hover:bg-panel focus:ring-accent/60",
      ghost:
        "bg-transparent text-accent hover:bg-accent/10 focus:ring-accent/60",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-body-sm rounded-lg",
      md: "px-4 py-2.5 text-body rounded-lg",
      lg: "px-6 py-3 text-body-lg rounded-xl",
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
