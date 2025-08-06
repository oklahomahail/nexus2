import React from 'react';
import { AppNotification } from '../context/types';
import { XCircleIcon } from 'lucide-react';

export interface NotificationsPanelProps {
  show: boolean;
  onClose: () => void;
  markAsRead: (id: string) => void;
  clear: () => void;
}

const sampleNotifications: AppNotification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Campaign Launched',
    message: 'The summer campaign has started successfully.',
    timestamp: new Date(),
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Reminder',
    message: 'Donor reports are due this Friday.',
    timestamp: new Date(),
    read: true,
  },
];

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  show,
  onClose,
  markAsRead,
  clear,
}) => {
  // You would use actual context notifications instead of sampleNotifications
  const notifications = sampleNotifications;

  if (!show) return null;

  return (
    <aside className="w-full max-w-sm bg-white shadow-xl border-l border-gray-200 fixed right-0 top-0 bottom-0 z-50">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XCircleIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[80vh] p-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No notifications.</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`mb-4 p-4 rounded-md border ${
                notification.read ? 'bg-gray-100' : 'bg-white'
              }`}
            >
              <h3 className="text-sm font-medium text-gray-800">{notification.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {notification.timestamp.toLocaleString()}
                </span>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 border-t">
          <button
            onClick={clear}
            className="w-full bg-red-100 text-red-600 text-sm font-medium px-4 py-2 rounded hover:bg-red-200"
          >
            Clear All
          </button>
        </div>
      )}
    </aside>
  );
};

export default NotificationsPanel;
