import clsx from "clsx";

import type { ComponentType } from "react";

export interface IconBadgeProps {
  icon: ComponentType<{ className?: string }>;
  className?: string;
  iconClassName?: string;
}

const IconBadge: React.FC<IconBadgeProps> = ({
  icon: Icon,
  className,
  iconClassName,
}) => {
  return (
    <div className={clsx("p-2 bg-slate-800/50 rounded-lg", className)}>
      <Icon className={clsx("w-5 h-5 text-slate-400", iconClassName)} />
    </div>
  );
};

export default IconBadge;
