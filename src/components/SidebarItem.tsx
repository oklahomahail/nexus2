import React from "react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  isActive: boolean;
  onClick: () => void;
  collapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  description,
  isActive,
  onClick,
  collapsed,
}) => {
  const base =
    "w-full text-left transition-all duration-200 border border-transparent rounded-lg p-3 group relative";
  const active = "bg-blue-600/20 text-blue-300 border-blue-500/50";
  const inactive = "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30";

  return (
    <button
      onClick={onClick}
      className={[base, isActive ? active : inactive].join(" ")}
      title={collapsed ? label : undefined}
    >
      <div className="flex items-center space-x-3">
        <div className="text-lg">{icon}</div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm leading-tight">{label}</div>
            {description && (
              <div className="text-xs opacity-75 mt-0.5 leading-tight">
                {description}
              </div>
            )}
          </div>
        )}
      </div>

      {isActive && (
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full" />
      )}

      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="font-medium">{label}</div>
          {description && (
            <div className="text-xs opacity-75 mt-0.5">{description}</div>
          )}
        </div>
      )}
    </button>
  );
};

export default SidebarItem;
