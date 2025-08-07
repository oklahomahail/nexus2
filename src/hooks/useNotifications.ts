import { useReducer, useCallback, useEffect } from 'react';
import { notificationsReducer } from '../reducers/notificationsReducer';
import { generateId } from '../utils/generateId';

export const useNotifications = () => {
  const [notifications, dispatch] = useReducer(notificationsReducer, []);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: newNotification.id });
    }, 5000);

    return newNotification;
  }, []);

  const markAsRead = useCallback((id) => {
    dispatch({ type: 'MARK_READ', payload: id });
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  return { notifications, addNotification, markAsRead, removeNotification };
};
