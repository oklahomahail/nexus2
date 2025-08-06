import React from 'react';
import { useAppContext, useNotifications } from '../context/AppContext';

interface TopbarProps {
  title: string;
  description?: string;
}

const Topbar: React.FC<TopbarProps> = ({ title, description }) => {
  const { state } = useAppContext();
  const { unreadCount, actions } = useNotifications();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 relative" onClick={() => actions.toggle()}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.97 4.757l-1.414 1.414A7.5 7.5 0 003 12.5v5a1 1 0 001 1h6c0-1.5-2-3-2-3s2-1.5 2-3v-5a7.5 7.5 0 00-6.556-7.443z" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">{state.user.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{state.user.name || 'User'}</p>
              <p className="text-xs text-gray-600 capitalize">{state.user.role || 'Member'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
