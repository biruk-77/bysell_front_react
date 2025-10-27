import { useEffect } from 'react';
import { useSocketConnection } from '../core/socketConnection';
import toast from 'react-hot-toast';

// Notifications socket functionality
export const useNotifications = () => {
  const { socket, isConnected } = useSocketConnection();

  useEffect(() => {
    if (!socket) return;

    // Notification events
    const handleNotification = (data) => {
      console.log('🔔 New notification:', data);
      
      // Show toast notification
      switch (data.type) {
        case 'info':
          toast(data.message, { icon: 'ℹ️' });
          break;
        case 'success':
          toast.success(data.message);
          break;
        case 'warning':
          toast(data.message, { icon: '⚠️' });
          break;
        case 'error':
          toast.error(data.message);
          break;
        default:
          toast(data.message);
      }

      // Dispatch event for components to catch
      window.dispatchEvent(new CustomEvent('notification_received', { detail: data }));
    };

    const handleNotificationRead = (data) => {
      console.log('📖 Notification read:', data);
      window.dispatchEvent(new CustomEvent('notification_read', { detail: data }));
    };

    const handleNotificationCleared = (data) => {
      console.log('🗑️ Notification cleared:', data);
      window.dispatchEvent(new CustomEvent('notification_cleared', { detail: data }));
    };

    // Add event listeners
    socket.on('notification', handleNotification);
    socket.on('notification_read', handleNotificationRead);  
    socket.on('notification_cleared', handleNotificationCleared);

    // Cleanup
    return () => {
      socket.off('notification', handleNotification);
      socket.off('notification_read', handleNotificationRead);
      socket.off('notification_cleared', handleNotificationCleared);
    };
  }, [socket]);

  // Notification methods
  const markNotificationAsRead = (notificationId) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('mark_notification_read', {
        notificationId
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const clearNotification = (notificationId) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('clear_notification', {
        notificationId
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const clearAllNotifications = () => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('clear_all_notifications', {}, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  return {
    isConnected,
    markNotificationAsRead,
    clearNotification,
    clearAllNotifications
  };
};

export default useNotifications;
