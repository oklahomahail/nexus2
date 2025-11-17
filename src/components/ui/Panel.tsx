/**
 * Panel Component
 * Premium editorial content panel with optional header
 */

import { ReactNode, HTMLAttributes } from "react";

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function Panel({
  title,
  subtitle,
  children,
  actions,
  className = "",
  ...props
}: PanelProps) {
  return (
    <section
      className={`bg-[var(--nx-offwhite)] border border-[var(--nx-border)] rounded-[var(--nx-radius-md)] shadow-[var(--nx-shadow-sm)] p-6 ${className}`}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-[var(--nx-text-primary)] mb-1">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-[var(--nx-text-muted)]">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export default Panel;
