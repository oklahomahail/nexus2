// ✅ src/components/NotificationsPanel.tsx
import React, { useState } from 'react';
import { useNotifications } from '../context/AppContext';

interface NotificationsPanelProps {
  show: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ show, onClose }) => {
  const { notifications, actions } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto h-full pb-20 p-4">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-gray-600">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification: { id: any; read: any; title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; message: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; timestamp: { toLocaleTimeString: () => string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }; }) => (
                <div
                  key={notification.id ?? Math.random().toString()}
                  className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => {
                    if (typeof notification.id === 'string') {
                      actions.markRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <button
              onClick={actions.clear}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear All Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;