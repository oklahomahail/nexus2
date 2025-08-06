// ✅ src/components/SidebarItem.tsx
import React from 'react';

interface SidebarItemProps {
  icon: string;
  label: string;
  description?: string;
  isActive: boolean;
  onClick: () => void;
  collapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, description, isActive, onClick, collapsed }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
        isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
      title={collapsed ? label : undefined}
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm">{label}</div>
          {description && <div className="text-xs text-gray-500 truncate">{description}</div>}
        </div>
      )}
    </button>
  );
};

export default SidebarItem;