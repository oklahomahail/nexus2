/**
 * SectionHeader Component
 * Premium editorial section header with optional actions
 */

import { ReactNode, HTMLAttributes } from "react";

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  actions,
  className = "",
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={`flex items-start justify-between mb-6 ${className}`}
      {...props}
    >
      <div>
        <h2 className="text-2xl font-semibold text-[var(--nx-text-primary)] mb-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-[var(--nx-text-muted)]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export default SectionHeader;
