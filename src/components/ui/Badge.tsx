import { clsx } from "clsx";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full";

  const variantClasses = {
    default: "bg-elevated text-text border border-border",
    success: "bg-green-500/10 text-green-400 border border-green-500/20",
    warning: "bg-warn/10 text-warn border border-warn/20",
    error: "bg-error/10 text-error border border-error/20",
    info: "bg-accent/10 text-accent border border-accent/20",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-caption min-h-[18px]",
    md: "px-2.5 py-1 text-body-sm min-h-[24px]",
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
