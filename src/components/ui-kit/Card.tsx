import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg";
  border?: boolean;
  variant?: "default" | "outlined" | "elevated";
}

type Variant = NonNullable<CardProps["variant"]>;
type Padding = NonNullable<CardProps["padding"]>;
type Shadow = NonNullable<CardProps["shadow"]>;
type Rounded = NonNullable<CardProps["rounded"]>;

const variantClasses = {
  default: "card-base",
  outlined: "card-base border-surface",
  elevated: "card-base shadow-soft",
} satisfies Record<Variant, string>;

const paddingClasses = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
} satisfies Record<Padding, string>;

const shadowClasses = {
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
} satisfies Record<Rounded, string>;

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "md",
  shadow = "md",
  rounded = "md",
  border = true,
  variant = "default",
}) => {
  return (
    <div
      className={`
        ${variantClasses[variant]},
        ${paddingClasses[padding]},
        ${shadowClasses[shadow]},
        ${roundedClasses[rounded]},
        ${border && variant === "default" && "border border-gray-200"},
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
