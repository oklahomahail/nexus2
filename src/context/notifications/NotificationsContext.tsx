// src/context/notifications/NotificationsContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Notification {
  id: string;
  message: string;
  read?: boolean;
}

export interface NotificationsContextValue {
  notifications: Notification[];
  addNotification: (_notification: Notification) => void;
  removeNotification: (_id: string) => void;
  markAsRead: (_id: string) => void;
}

const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);

export const NotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const value: NotificationsContextValue = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextValue => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider",
    );
  }
  return context;
};
