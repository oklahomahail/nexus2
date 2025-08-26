// src/components/Topbar.tsx
import {
  Bell,
  Search,
  Settings,
  User,
  ChevronDown,
  LogOut,
  HelpCircle,
} from "lucide-react";
import React, { useMemo, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ClientHeader from "@/components/ClientHeader";
import StorageQuotaChip from "@/components/dashboard/StorageQuotaChip";
import NotificationsPanel, {
  type Notification,
} from "@/components/NotificationsPanel";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePolling } from "@/hooks/usePolling";

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
  organization?: string;
}

interface TopbarProps {
  title?: string;
  description?: string;
  showSearch?: boolean;
  actions?: React.ReactNode;
  user?: UserInfo;
  showNewCampaignButton?: boolean;
  onNewCampaign?: () => void | Promise<void>;
}

const defaultUser: UserInfo = {
  name: "Dave Hail",
  email: "dave@nexusconsulting.com",
  organization: "Nexus Consulting",
};

const Topbar: React.FC<TopbarProps> = ({
  title,
  description,
  showSearch = true,
  actions,
  user = defaultUser,
  showNewCampaignButton = true,
  onNewCampaign,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  // Route context
  const isClientScoped = location.pathname.startsWith("/client/");
  const isClientsPage = location.pathname === "/clients";
  const searchEnabled = showSearch && !(isClientsPage || isClientScoped);

  // Search input focus ref
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "/",
      preventDefault: true,
      allowInInputs: false,
      when: () => searchEnabled,
      handler: () => {
        searchRef.current?.focus();
      },
    },
    {
      key: "Escape",
      handler: () => {
        setShowNotifications(false);
        setShowUserMenu(false);
      },
    },
  ]);

  // Mock notifications fetcher (replace with real service)
  const fetchNotifications = useCallback(async () => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        title: "New Donation Received",
        message: "John Smith donated $500 to the Annual Fund campaign",
        type: "success",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        read: false,
      },
      {
        id: "2",
        title: "Campaign Goal Achieved",
        message: "Spring Fundraiser has reached 100% of its goal",
        type: "success",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: false,
      },
      {
        id: "3",
        title: "Monthly Report Available",
        message: "Your monthly analytics report is ready for download",
        type: "info",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        read: true,
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  // Poll notifications (30s visible / 3m hidden)
  // If the hook returns a Promise, explicitly ignore it to satisfy no-floating-promises.
  void usePolling(fetchNotifications, {
    visibleInterval: 30000,
    hiddenInterval: 180000,
    enabled: true,
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      handleMarkAsRead(notification.id);
      // navigate(`/notifications/${notification.id}`);
    },
    [handleMarkAsRead],
  );

  // Lint-safe handler for New Campaign button (no-floating-promises)
  const handleNewCampaignClick = useCallback(() => {
    if (onNewCampaign) {
      void Promise.resolve(onNewCampaign()).catch(() => {
        /* optionally toast/log an error */
      });
    } else {
      navigate("/campaigns/new");
    }
  }, [onNewCampaign, navigate]);

  return (
    <header className="border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-md sticky top-0 z-40">
      {/* Main topbar */}
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left: Brand + Title */}
          <div className="flex items-center space-x-4 sm:space-x-6 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">
                  N
                </span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                Nexus
              </div>
            </div>

            {title && !isClientsPage && !isClientScoped && (
              <div className="hidden md:block border-l border-slate-700 pl-4 sm:pl-6 min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-white truncate">
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

          {/* Center: Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            {searchEnabled && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns, donors..."
                  aria-label="Search"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-sm"
                />
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {actions}

            {showNewCampaignButton && (
              <button
                type="button"
                onClick={handleNewCampaignClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm"
              >
                <span className="hidden sm:inline">+ New Campaign</span>
                <span className="sm:hidden">+</span>
              </button>
            )}

            <div className="hidden lg:block">
              <StorageQuotaChip />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((s) => !s)}
                className="p-2 sm:p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 relative"
                aria-haspopup="menu"
                aria-expanded={showNotifications}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 z-50 max-w-[calc(100vw-1rem)] sm:max-w-none">
                  <NotificationsPanel
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onNotificationClick={handleNotificationClick}
                  />
                </div>
              )}
            </div>

            <button
              className="hidden sm:block p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((s) => !s)}
                className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                aria-haspopup="menu"
                aria-expanded={showUserMenu}
                aria-label="User menu"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-xs sm:text-sm">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                </div>

                <div className="hidden lg:block text-left">
                  <p className="text-white text-sm font-medium">{user.name}</p>
                  <p className="text-slate-400 text-xs">{user.organization}</p>
                </div>

                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-white transition-colors" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg z-50"
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
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-slate-400 text-sm truncate">
                          {user.email}
                        </p>
                        <p className="text-slate-500 text-xs truncate">
                          {user.organization}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-slate-700/50 rounded-lg transition-colors group">
                      <User className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      <span className="text-slate-300 group-hover:text-white text-sm">
                        Profile Settings
                      </span>
                    </button>

                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-slate-700/50 rounded-lg transition-colors group">
                      <Settings className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      <span className="text-slate-300 group-hover:text-white text-sm">
                        Account Settings
                      </span>
                    </button>

                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-slate-700/50 rounded-lg transition-colors group">
                      <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      <span className="text-slate-300 group-hover:text-white text-sm">
                        Help & Support
                      </span>
                    </button>
                  </div>

                  <div className="p-2 border-t border-slate-700/50">
                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-red-500/10 rounded-lg transition-colors group text-red-400 hover:text-red-300">
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Client-scoped header */}
      {isClientScoped && (
        <div className="px-6 pb-4 border-t border-slate-800/50">
          <ClientHeader />
        </div>
      )}
    </header>
  );
};

export default Topbar;
