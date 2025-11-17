/**
 * Button Component
 * Premium editorial button with multiple variants
 */

import { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-[var(--nx-charcoal)] text-white hover:bg-black focus:ring-[var(--nx-charcoal)]",
    secondary:
      "bg-white border border-[var(--nx-border)] text-[var(--nx-charcoal)] hover:bg-gray-50 focus:ring-[var(--nx-charcoal)]",
    ghost:
      "bg-transparent text-[var(--nx-charcoal)] hover:bg-gray-100 focus:ring-[var(--nx-charcoal)]",
    danger:
      "bg-[var(--nx-error)] text-white hover:bg-red-700 focus:ring-[var(--nx-error)]",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm rounded-[var(--nx-radius-sm)]",
    md: "px-4 py-2 text-sm rounded-[var(--nx-radius-sm)]",
    lg: "px-6 py-3 text-base rounded-[var(--nx-radius-md)]",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
