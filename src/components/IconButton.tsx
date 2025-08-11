import clsx from "clsx";
import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: LucideIcon;
  variant?: "default" | "success";
}

const variantClasses: Record<
  NonNullable<IconButtonProps["variant"]>,
  string
> = {
  default:
    "bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50 border-slate-700/50",
  success: "bg-green-600/20 text-green-400 border-green-500/30",
};

const IconButton: React.FC<IconButtonProps> = ({
  label,
  icon: Icon,
  variant = "default",
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 border",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

export default IconButton;
