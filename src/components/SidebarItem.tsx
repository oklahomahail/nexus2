// src/components/SidebarItem.tsx - Unified with design system
import clsx from "clsx";
import React from "react";

interface SidebarItemProps {
  icon: string;
  label: string;
  description?: string;
  isActive: boolean;
  onClick: () => void;
  collapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  _label,
  _description,
  _isActive,
  _onClick,
  _collapsed,
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group relative",
        isActive
          ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/25"
          : "text-slate-400 hover:text-white hover:bg-slate-800/50",
      )}
      title={collapsed ? label : undefined}
    >
      {/* Icon */}
      <span className="text-lg flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {icon}
      </span>

      {/* Label and Description */}
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm leading-tight">{label}</div>
          {description && (
            <div className="text-xs opacity-75 leading-tight truncate mt-0.5">
              {description}
            </div>
          )}
        </div>
      )}

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-full" />
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 whitespace-nowrap">
          <div className="font-medium">{label}</div>
          {description && (
            <div className="text-xs opacity-75 mt-0.5">{description}</div>
          )}
          {/* Arrow */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45" />
        </div>
      )}
    </button>
  );
};

export default SidebarItem;
