import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token }
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected!');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('🚫 Socket connection error:', error);
      setIsConnected(false);
    });

    // User presence events
    socket.on('user_online', (data) => {
      console.log('🟢 User online:', data);
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        return [...filtered, data];
      });
    });

    socket.on('user_offline', (data) => {
      console.log('🔴 User offline:', data);
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    // Connection request events
    socket.on('connection_request_received', (data) => {
      console.log('🔗 New connection request:', data);
      toast.success(`New connection request from ${data.connection.requester.username}`);
    });

    socket.on('connection_request_responded', (data) => {
      console.log('✅ Connection request responded:', data);
      const action = data.action === 'accept' ? 'accepted' : 'rejected';
      toast.success(`${data.connection.receiver.username} ${action} your connection request`);
    });

    // Message events
    socket.on('new_message', (data) => {
      console.log('💬 New message:', data);
      if (data.senderId !== user?.id) {
        toast(`New message from ${data.senderUsername}`);
      }
      // Dispatch event for RealTimeMessageInterface to catch
      window.dispatchEvent(new CustomEvent('new_message', { detail: data }));
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        setIsConnected(false);
        setOnlineUsers([]);
      }
    };
  }, [token, user?.id]);

  // Socket methods
  const sendConnectionRequest = (receiverId, message = '') => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('send_connection_request', {
        receiverId,
        message: message || 'Hi! I would like to connect with you.'
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const respondToConnectionRequest = (connectionId, action) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('respond_connection_request', {
        connectionId,
        action
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const cancelConnectionRequest = (connectionId) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('cancel_connection_request', {
        connectionId
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const sendMessage = (receiverId, content, messageType = 'text') => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('send_message', {
        receiverId,
        content,
        messageType
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const joinConversation = (otherUserId) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('join_conversation', {
        otherUserId
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const leaveConversation = (otherUserId) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('leave_conversation', {
        otherUserId
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    sendConnectionRequest,
    respondToConnectionRequest,
    cancelConnectionRequest,
    sendMessage,
    joinConversation,
    leaveConversation
  };
};

export default useSocket;
