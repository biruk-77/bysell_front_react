import { useEffect, useState } from 'react';
import { useSocketConnection } from '../core/socketConnection';

// User presence socket functionality
export const usePresence = () => {
  const { socket, isConnected } = useSocketConnection();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // User presence events
    const handleUserOnline = (data) => {
      console.log('🟢 User online:', data);
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        return [...filtered, data];
      });
      // Dispatch event for components to catch
      window.dispatchEvent(new CustomEvent('user_online', { detail: data }));
    };

    const handleUserOffline = (data) => {
      console.log('🔴 User offline:', data);
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
      // Dispatch event for components to catch
      window.dispatchEvent(new CustomEvent('user_offline', { detail: data }));
    };

    const handleUserStatusChanged = (data) => {
      console.log('🔄 User status changed:', data);
      setOnlineUsers(prev => prev.map(u => 
        u.userId === data.userId 
          ? { ...u, status: data.status }
          : u
      ));
      // Dispatch event for components to catch
      window.dispatchEvent(new CustomEvent('user_status_changed', { detail: data }));
    };

    const handleOnlineUsersList = (data) => {
      console.log('👥 Online users list:', data);
      setOnlineUsers(data.users || []);
    };

    // Add event listeners
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('user_status_changed', handleUserStatusChanged);
    socket.on('online_users_list', handleOnlineUsersList);

    // Request current online users when connected
    if (isConnected) {
      socket.emit('get_online_users');
    }

    // Cleanup
    return () => {
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('user_status_changed', handleUserStatusChanged);
      socket.off('online_users_list', handleOnlineUsersList);
      setOnlineUsers([]);
    };
  }, [socket, isConnected]);

  // Presence methods
  const updateStatus = (status) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('update_status', {
        status
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const getOnlineUsers = () => {
    if (!socket) return;
    socket.emit('get_online_users');
  };

  return {
    isConnected,
    onlineUsers,
    updateStatus,
    getOnlineUsers
  };
};

export default usePresence;
