/**
 * PageHeading Component
 * Consistent page title pattern across all Nexus pages
 *
 * Usage:
 * <PageHeading
 *   title="Client Dashboard"
 *   subtitle="Track15-powered campaign and donor management"
 * />
 */

import { ReactNode } from "react";

export interface PageHeadingProps {
  title: string;
  subtitle?: string;
  /** Optional actions (buttons, etc.) to display on the right */
  actions?: ReactNode;
}

export function PageHeading({ title, subtitle, actions }: PageHeadingProps) {
  return (
    <div className="page-heading flex items-start justify-between">
      <div>
        <h1 className="text-[32px] font-semibold text-[var(--nx-charcoal)] tracking-tight leading-tight mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[15px] text-[var(--nx-text-muted)] leading-normal">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export default PageHeading;
