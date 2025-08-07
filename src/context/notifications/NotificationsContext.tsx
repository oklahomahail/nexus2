// src/context/NotificationsContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationsContextType {
  show: boolean;
  toggle: () => void;
  markAsRead: () => void;
  clear: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [show, setShow] = useState(false);

  const toggle = () => setShow((prev) => !prev);
  const markAsRead = () => console.log('Marking notifications as read');
  const clear = () => console.log('Clearing all notifications');

  return (
    <NotificationsContext.Provider value={{ show, toggle, markAsRead, clear }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationsProvider');
  return context;
};
