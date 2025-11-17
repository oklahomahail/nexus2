/**
 * AppPageLayout Component
 * Universal page wrapper that provides consistent structure across all Nexus pages
 *
 * This layout wraps all authenticated pages (except auth flows) and provides:
 * - Consistent sidebar navigation
 * - Unified topbar
 * - Editorial spacing rhythm
 * - Proper overflow handling
 */

import { ReactNode } from "react";
import AppTopbar from "./AppTopbar";

export interface AppPageLayoutProps {
  children: ReactNode;
  /** Optional custom sidebar - if not provided, will use default sidebar from context */
  sidebar?: ReactNode;
  /** Optional custom topbar - if not provided, uses AppTopbar */
  topbar?: ReactNode;
  /** Disable default padding for custom layouts */
  noPadding?: boolean;
}

export default function AppPageLayout({
  children,
  sidebar,
  topbar,
  noPadding = false
}: AppPageLayoutProps) {
  return (
    <div className="flex h-screen bg-[var(--nx-offwhite)] text-[var(--nx-charcoal)]">

      {/* Sidebar (if provided) */}
      {sidebar && sidebar}

      {/* Main Area */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Topbar */}
        {topbar || <AppTopbar />}

        {/* Page Content with Editorial Flow */}
        <main
          className={`flex-1 overflow-y-auto ${noPadding ? '' : 'px-8 py-10 space-y-10 editorial-flow'}`}
        >
          {children}
        </main>
      </div>

    </div>
  );
}
