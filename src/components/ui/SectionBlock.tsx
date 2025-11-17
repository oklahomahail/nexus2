/**
 * SectionBlock Component
 * Standardized content panel with optional title and actions
 *
 * Usage:
 * <SectionBlock title="Recent Activity">
 *   Content goes here
 * </SectionBlock>
 *
 * <SectionBlock
 *   title="Campaign Performance"
 *   actions={<Button>View All</Button>}
 * >
 *   Chart or table goes here
 * </SectionBlock>
 */

import { ReactNode } from "react";

export interface SectionBlockProps {
  title?: string;
  /** Optional description or subtitle */
  description?: string;
  /** Optional actions (buttons, links) in the header */
  actions?: ReactNode;
  children: ReactNode;
  /** Remove padding for full-bleed content like tables */
  noPadding?: boolean;
  /** Add custom className */
  className?: string;
}

export function SectionBlock({
  title,
  description,
  actions,
  children,
  noPadding = false,
  className = ""
}: SectionBlockProps) {
  return (
    <section
      className={`section-block bg-white border border-[var(--nx-border)] shadow-[var(--nx-shadow-sm)] rounded-[var(--nx-radius-md)] ${className}`}
    >
      {/* Header */}
      {(title || actions) && (
        <div className={`flex items-start justify-between ${noPadding ? 'p-6 pb-0' : 'px-6 pt-6 pb-4'} border-b border-[var(--nx-border)]`}>
          <div>
            {title && (
              <h2 className="text-[24px] font-semibold text-[var(--nx-charcoal)] mb-1">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[13px] text-[var(--nx-text-muted)]">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </section>
  );
}

export default SectionBlock;
