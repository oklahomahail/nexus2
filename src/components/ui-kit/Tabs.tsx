/**
 * Tabs Component
 * Premium editorial tab navigation
 */

import { ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div
      className={`flex gap-1 border-b border-[var(--nx-border)] mb-6 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium
              transition-colors duration-150
              border-b-2 -mb-px
              ${
                isActive
                  ? "text-[var(--nx-text-primary)] border-[var(--nx-gold)]"
                  : "text-[var(--nx-text-muted)] border-transparent hover:text-[var(--nx-text-primary)] hover:border-gray-300"
              }
            `}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
