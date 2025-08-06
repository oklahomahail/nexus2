// src/hooks/useNotifications.ts
import { useAppContext } from './useAppContext';
import { selectors } from './selectors';

export const useNotifications = () => {
  const { state, actions } = useAppContext();
  
  return {
    notifications: state.ui.notifications,
    unreadCount: selectors.getUnreadNotificationCount(state),
    actions: {
      show: actions.showNotification,
      markRead: actions.markNotificationRead,
      clear: actions.clearNotifications
    }
  };
};
