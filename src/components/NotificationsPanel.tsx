import clsx from "clsx";
import React from "react";

import { useNotifications } from "@/hooks/useNotifications";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notificationService";
import type { NotificationDTO } from "@/services/notificationService";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
}

interface NotificationsPanelProps {
  onClose?: () => void;
  onNotificationClick?: (_notification: NotificationDTO) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  onClose,
  onNotificationClick,
}) => {
  const { items, loading, error, markAsRead, markAllAsRead } =
    useNotifications();
  const unread = items.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      markAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const dot = (color: string) => (
    <span
      className={clsx("inline-block w-2 h-2 rounded-full", color)}
      aria-hidden
    />
  );

  type NotifType = "info" | "success" | "warning" | "error";
  const dotColor = {
    success: "bg-green-400",
    warning: "bg-yellow-400",
    error: "bg-red-400",
    info: "bg-blue-400",
  } satisfies Record<NotifType, string>;

  const rowBg = (t: NotifType, read: boolean) => {
    if (read) return "bg-slate-900/30 border-slate-800";
    switch (t) {
      case "success":
        return "bg-green-900/15 border-green-800/50";
      case "warning":
        return "bg-yellow-900/15 border-yellow-800/50";
      case "error":
        return "bg-red-900/15 border-red-800/50";
      default:
        return "bg-blue-900/15 border-blue-800/50";
    }
  };

  const formatAgo = (timestamp: string) => {
    const d = new Date(timestamp);
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-xl p-6 max-w-md text-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">Notifications</h3>
          {unread > 0 && (
            <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          )}
          <button
            onClick={handleMarkAllAsRead}
            disabled={loading || unread === 0}
            className="text-slate-300 hover:text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark all read
          </button>
          <button
            onClick={() => onClose?.()}
            className="text-slate-400 hover:text-white"
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-4">
          <p className="text-red-200 text-sm">Failed to load notifications</p>
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 && !loading ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No notifications</p>
          </div>
        ) : (
          items.map((n) => (
            <button
              key={n.id}
              onClick={() => onNotificationClick?.(n)}
              className={clsx(
                "w-full text-left p-3 border rounded-lg transition-opacity",
                rowBg(n.type, n.read),
                loading && "opacity-50",
              )}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-2">{dot(dotColor[n.type as NotifType])}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-slate-300 mt-1">{n.message}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span>{formatAgo(n.timestamp)}</span>
                    {!n.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleMarkAsRead(n.id);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                        disabled={loading}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <button className="w-full text-sm text-blue-400 hover:text-blue-300 font-medium">
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationsPanel;
