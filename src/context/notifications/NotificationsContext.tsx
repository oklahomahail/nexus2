// src/context/NotificationsContext.tsx

export {};

export {};

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

export const useNotifications = () => ({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  markAsRead: () => {}
});
