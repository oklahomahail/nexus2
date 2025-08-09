// src/components/Topbar.tsx - Modernized with unified design system
import clsx from "clsx";
import {
  Bell,
  Search,
  Settings,
  User,
  ChevronDown,
  LogOut,
  HelpCircle,
} from "lucide-react";
import React, { useState } from "react";

interface TopbarProps {
  title: string;
  description?: string;
  showSearch?: boolean;
  actions?: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    organization?: string;
  };
}

const Topbar: React.FC<TopbarProps> = ({
  title,
  _description,
  _showSearch = true,
  _actions,
  user = {
    name: "Dave Hail",
    email: "dave@nexusconsulting.com",
    organization: "Nexus Consulting",
    _,
  },
}) => {
  const [_showUserMenu, setShowUserMenu] = useState(false);
  const [_showNotifications, setShowNotifications] = useState(false);
  const [_searchQuery, setSearchQuery] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Campaign milestone reached",
      message: "End of Year Campaign has reached 75% of its goal",
      time: "2 minutes ago",
      type: "success",
      unread: true,
    },
    {
      id: 2,
      title: "New donor registered",
      message: "Sarah Johnson just made their first donation",
      time: "1 hour ago",
      type: "info",
      unread: true,
    },
    {
      id: 3,
      title: "Monthly report ready",
      message: "Your October fundraising report is ready for review",
      time: "3 hours ago",
      type: "info",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="border-b border-surface/50 bg-surface/30 backdrop-blur-md sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Title & Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-white truncate">
                  {title}
                </h1>
                {description && (
                  <p className="text-slate-400 text-sm mt-0.5 truncate">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Center Section - Search */}
          {showSearch && (
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns, donors, reports..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Right Section - Actions & User */}
          <div className="flex items-center space-x-4">
            {/* Custom Actions */}
            {actions}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg animate-fade-in z-50">
                  <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">
                        Notifications
                      </h3>
                      <span className="text-xs text-slate-400">
                        {unreadCount} unread
                      </span>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={clsx(
                          "p-4 border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors cursor-pointer",
                          notification.unread && "bg-blue-500/5",
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={clsx(
                              "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                              notification.type === "success"
                                ? "bg-green-400"
                                : notification.type === "info"
                                  ? "bg-blue-400"
                                  : "bg-slate-400",
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium">
                              {notification.title}
                            </p>
                            <p className="text-slate-400 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-slate-500 text-xs mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 border-t border-slate-700/50">
                    <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200">
              <Settings className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                </div>

                <div className="hidden md:block text-left">
                  <p className="text-white text-sm font-medium">{user.name}</p>
                  <p className="text-slate-400 text-xs">{user.organization}</p>
                </div>

                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg animate-fade-in z-50">
                  <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-slate-400 text-sm">{user.email}</p>
                        <p className="text-slate-500 text-xs">
                          {user.organization}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-slate-700/50 rounded-lg transition-colors group">
                      <User className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      <span className="text-slate-300 group-hover:text-white">
                        Profile Settings
                      </span>
                    </button>

                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-slate-700/50 rounded-lg transition-colors group">
                      <Settings className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      <span className="text-slate-300 group-hover:text-white">
                        Account Settings
                      </span>
                    </button>

                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-slate-700/50 rounded-lg transition-colors group">
                      <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      <span className="text-slate-300 group-hover:text-white">
                        Help & Support
                      </span>
                    </button>
                  </div>

                  <div className="p-2 border-t border-slate-700/50">
                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-red-500/10 rounded-lg transition-colors group text-red-400 hover:text-red-300">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
