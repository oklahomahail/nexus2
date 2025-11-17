/**
 * Card Component
 * Premium editorial card container
 */

import { ReactNode, HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  hover = false,
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  const baseStyles =
    "bg-white border border-[var(--nx-border)] rounded-[var(--nx-radius-md)] shadow-[var(--nx-shadow-sm)]";

  const hoverStyles = hover
    ? "transition-shadow duration-150 hover:shadow-[var(--nx-shadow-md)]"
    : "";

  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
