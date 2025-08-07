import React from 'react';
import classNames from 'classnames';

const NotificationsPanel = ({ notifications = [], onClose }) => {
  if (!notifications.length) return null;

  return (
    <div className="fixed top-4 right-4 w-80 z-50">
      <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-white">Notifications</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white">✕</button>
        </div>
        <ul className="max-h-96 overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-700">
          {notifications.map((note, idx) => (
            <li key={idx} className="p-4 text-sm text-neutral-700 dark:text-neutral-300">
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationsPanel;
