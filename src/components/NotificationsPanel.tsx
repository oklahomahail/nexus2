/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
import React, { useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
}

interface NotificationsPanelProps {
  notifications?: Notification[];
  onClose?: () => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications = [],
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}) => {
  const [_filter, _setFilter] = useState<"all" | "unread">("all");
  const [_loading, _setLoading] = useState(false);

  // Sample notifications for demo
  const sampleNotifications: Notification[] = [
    {
      id: "1",
      title: "New Donation Received",
      message: "John Smith donated $500 to the Annual Fund campaign",
      type: "success",
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      read: false,
    },
    {
      id: "2",
      title: "Campaign Goal Achieved",
      message: "Spring Fundraiser has reached 100% of its goal!",
      type: "success",
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      read: false,
    },
    {
      id: "3",
      title: "Monthly Report Available",
      message: "Your monthly analytics report is ready for download",
      type: "info",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      read: true,
    },
  ];

  const allNotifications = notifications.length > 0 ? notifications : sampleNotifications;
  const unreadCount = allNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      case "warning":
        return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>;
      case "error":
        return <div className="w-2 h-2 bg-red-400 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-blue-400 rounded-full"></div>;
    }
  };

  const getNotificationBgColor = (type: Notification["type"], read: boolean) => {
    if (read) return "bg-gray-50 border-gray-200";
    
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    return "Earlier";
  };

  return (
    <div className="notifications-panel bg-white shadow-lg rounded-lg p-6 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => onClose && onClose()}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {allNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 border rounded-lg ${getNotificationBgColor(notification.type, notification.read)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-2">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">{formatTimestamp(notification.timestamp)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationsPanel;
