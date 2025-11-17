import clsx from "clsx";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  theme?: "dark" | "light";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  theme = "light",
  children,
  className,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Light mode variant classes (Nexus Light theme)
  const lightVariantClasses = {
    primary:
      "bg-[rgb(var(--nexus-blue-600))] hover:bg-[rgb(var(--nexus-blue-700))] text-white focus:ring-[rgb(var(--nexus-blue-600))]",
    secondary:
      "bg-white hover:bg-[rgb(var(--nexus-slate-100))] text-[rgb(var(--nexus-slate-700))] border border-[rgb(var(--nexus-slate-300))] focus:ring-[rgb(var(--nexus-blue-600))]",
    outline:
      "border border-[rgb(var(--nexus-slate-300))] text-[rgb(var(--nexus-slate-700))] hover:bg-[rgb(var(--nexus-slate-100))] focus:ring-[rgb(var(--nexus-blue-600))]",
    danger:
      "bg-[rgb(var(--nexus-red-500))] hover:bg-red-700 text-white focus:ring-[rgb(var(--nexus-red-500))]",
    ghost:
      "text-[rgb(var(--nexus-blue-600))] hover:text-[rgb(var(--nexus-blue-700))] hover:bg-blue-50 focus:ring-[rgb(var(--nexus-blue-600))]",
  };

  // Dark mode variant classes (legacy)
  const darkVariantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary:
      "bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500",
    outline:
      "border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white focus:ring-slate-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost:
      "text-blue-400 hover:text-blue-300 hover:bg-slate-800 focus:ring-blue-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses =
    theme === "light" ? lightVariantClasses : darkVariantClasses;

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
