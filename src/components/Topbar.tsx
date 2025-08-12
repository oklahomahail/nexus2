// src/components/Topbar.tsx
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
import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import ClientHeader from "@/components/ClientHeader";
import ClientSwitcher from "@/components/ClientSwitcher";
import StorageQuotaChip from "@/components/dashboard/StorageQuotaChip";

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
  organization?: string;
}

interface NotificationItem {
  id: number | string;
  title: string;
  message: string;
  time: string;
  type: "success" | "info" | "neutral";
  unread?: boolean;
}

interface TopbarProps {
  title?: string;
  description?: string;
  showSearch?: boolean;
  actions?: React.ReactNode;
  user?: UserInfo;
  notifications?: NotificationItem[];
}

const defaultUser: UserInfo = {
  name: "Dave Hail",
  email: "dave@nexusconsulting.com",
  organization: "Nexus Consulting",
};

const defaultNotifications: NotificationItem[] = [
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
  },
];

const Topbar: React.FC<TopbarProps> = ({
  title,
  description,
  showSearch = true,
  actions,
  user = defaultUser,
  notifications = defaultNotifications,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  // Check if we're in a client-scoped route
  const isClientScoped = location.pathname.startsWith("/client/");
  const isClientsPage = location.pathname === "/clients";

  return (
    <header className="border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-md sticky top-0 z-40">
      {/* Main topbar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center space-x-6">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div className="text-xl font-bold text-white">Nexus</div>
            </div>

            {/* Page title (if not showing client switcher) */}
            {title && !isClientsPage && !isClientScoped && (
              <div className="border-l border-slate-700 pl-6">
                <h1 className="text-xl font-semibold text-white truncate">
                  {title}
                </h1>
                {description && (
                  <p className="text-slate-400 text-sm mt-0.5 truncate">
                    {description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Center: Client Switcher or Search */}
          <div className="flex-1 max-w-xl mx-8">
            {isClientsPage || isClientScoped ? (
              <ClientSwitcher className="w-full" />
            ) : showSearch ? (
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
            ) : null}
          </div>

          {/* Right: Actions, Quota, Notifications, Settings, User */}
          <div className="flex items-center space-x-4">
            {/* Custom actions slot */}
            {actions}

            {/* Storage quota is always visible */}
            <div className="hidden sm:block">
              <StorageQuotaChip />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((s) => !s)}
                className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 relative"
                aria-haspopup="menu"
                aria-expanded={showNotifications}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg animate-fade-in z-50"
                  role="menu"
                >
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
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={clsx(
                          "p-4 border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors cursor-pointer",
                          n.unread && "bg-blue-500/5",
                        )}
                        role="menuitem"
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={clsx(
                              "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                              n.type === "success"
                                ? "bg-green-400"
                                : n.type === "info"
                                  ? "bg-blue-400"
                                  : "bg-slate-400",
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium">
                              {n.title}
                            </p>
                            <p className="text-slate-400 text-sm mt-1">
                              {n.message}
                            </p>
                            <p className="text-slate-500 text-xs mt-2">
                              {n.time}
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
            <button
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((s) => !s)}
                className="flex items-center space-x-3 p-2 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                aria-haspopup="menu"
                aria-expanded={showUserMenu}
                aria-label="User menu"
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

              {showUserMenu && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg animate-fade-in z-50"
                  role="menu"
                >
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

      {/* Client-scoped header (only show on client routes) */}
      {isClientScoped && (
        <div className="px-6 pb-4 border-t border-slate-800/50">
          <ClientHeader />
        </div>
      )}
    </header>
  );
};

export default Topbar;
