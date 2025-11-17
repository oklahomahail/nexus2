import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  border?: boolean;
  variant?: "default" | "outlined" | "elevated";
  theme?: "dark" | "light";
}

type Variant = NonNullable<CardProps["variant"]>;
type Padding = NonNullable<CardProps["padding"]>;
type Shadow = NonNullable<CardProps["shadow"]>;
type Rounded = NonNullable<CardProps["rounded"]>;

// Dark mode variant classes
const darkVariantClasses = {
  default: "card-base",
  outlined: "card-base border-surface",
  elevated: "card-base shadow-soft",
} satisfies Record<Variant, string>;

// Light mode variant classes
const lightVariantClasses = {
  default: "bg-white",
  outlined: "bg-white border border-[rgb(var(--nexus-slate-200))]",
  elevated: "bg-white shadow-sm",
} satisfies Record<Variant, string>;

const paddingClasses = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
} satisfies Record<Padding, string>;

// Shadow classes for light mode
const lightShadowClasses = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-sm hover:shadow-md",
  lg: "shadow-md hover:shadow-lg",
} satisfies Record<Shadow, string>;

// Shadow classes for dark mode
const darkShadowClasses = {
  none: "",
  sm: "shadow-soft",
  md: "shadow-medium",
  lg: "shadow-strong",
} satisfies Record<Shadow, string>;

const roundedClasses = {
  none: "rounded-none",
  sm: "rounded-md",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-2xl",
  "2xl": "rounded-2xl",
} satisfies Record<Rounded, string>;

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "md",
  shadow = "sm",
  rounded = "2xl",
  border = true,
  variant = "default",
  theme = "light",
}) => {
  const variantClasses =
    theme === "light" ? lightVariantClasses : darkVariantClasses;
  const shadowClasses =
    theme === "light" ? lightShadowClasses : darkShadowClasses;

  return (
    <div
      className={`
        ${variantClasses[variant]},
        ${paddingClasses[padding]},
        ${shadowClasses[shadow]},
        ${roundedClasses[rounded]},
        ${border && variant === "default" && theme === "light" && "border border-[rgb(var(--nexus-slate-200))]"},
        ${border && variant === "default" && theme === "dark" && "border border-gray-200"},
        transition-shadow duration-200
        ${className}
      `
        .trim()
        .replace(/,\s*/g, " ")}
    >
      {children}
    </div>
  );
};

export default Card;
