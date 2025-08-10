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

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "md",
  shadow = "md",
  rounded = "md",
  border = true,
  variant = "default",
}) => {
  const variantClasses = {
    default: "bg-white",
    outlined: "bg-white border-2",
    elevated: "bg-white shadow-lg",
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow",
    lg: "shadow-lg",
  };

  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-lg",
    lg: "rounded-xl",
  };

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
