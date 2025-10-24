import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import { toast } from 'react-hot-toast';

const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io('http://localhost:5000', {
      auth: { token }
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected!');
      setIsConnected(true);
      toast.success('Connected to real-time services');
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
      toast.error('Disconnected from real-time services');
    });

    socket.on('connect_error', (error) => {
      console.error('🚫 Socket connection error:', error);
      setIsConnected(false);
      toast.error('Connection failed: ' + error.message);
    });

    // User status events
    socket.on('user_online', (data) => {
      console.log('🟢 User online:', data);
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        return [...filtered, data];
      });
      
      if (data.userId !== user?.id) {
        toast.success(`${data.username} is now online`, { duration: 2000 });
      }
    });

    socket.on('user_offline', (data) => {
      console.log('🔴 User offline:', data);
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
      
      if (data.userId !== user?.id) {
        toast(`${data.username} went offline`, { 
          duration: 2000,
          icon: '⚪' 
        });
      }
    });

    // Connection request events
    socket.on('connection_request_received', (data) => {
      console.log('🔗 New connection request:', data);
      toast.success(
        `New connection request from ${data.connection.requester.username}`,
        { duration: 5000 }
      );
      
      // Trigger custom event for components to listen
      window.dispatchEvent(new CustomEvent('connection_request_received', { 
        detail: data 
      }));
    });

    socket.on('connection_request_responded', (data) => {
      console.log('✅ Connection request responded:', data);
      const action = data.action === 'accept' ? 'accepted' : 'rejected';
      toast.success(
        `${data.connection.receiver.username} ${action} your connection request`,
        { duration: 5000 }
      );
      
      // Trigger custom event
      window.dispatchEvent(new CustomEvent('connection_request_responded', { 
        detail: data 
      }));
    });

    // Message events
    socket.on('new_message', (data) => {
      console.log('💬 New message:', data);
      
      // Don't show toast for your own messages
      if (data.senderId !== user?.id) {
        toast(
          `New message from ${data.senderUsername}: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`,
          { 
            duration: 4000,
            icon: '💬'
          }
        );
      }
      
      // Trigger custom event for message components
      window.dispatchEvent(new CustomEvent('new_message', { 
        detail: data 
      }));
    });

    socket.on('message_notification', (data) => {
      console.log('🔔 Message notification:', data);
      toast.info(data.notification, { duration: 3000 });
    });

    socket.on('messages_read', (data) => {
      console.log('👁️ Messages read:', data);
      
      // Trigger custom event for message status updates
      window.dispatchEvent(new CustomEvent('messages_read', { 
        detail: data 
      }));
    });

    socket.on('message_deleted', (data) => {
      console.log('🗑️ Message deleted:', data);
      toast('A message was deleted', { 
        duration: 2000,
        icon: '🗑️' 
      });
      
      // Trigger custom event
      window.dispatchEvent(new CustomEvent('message_deleted', { 
        detail: data 
      }));
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
  const joinConversation = (otherUserId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', { otherUserId });
      console.log('👥 Joined conversation with:', otherUserId);
    }
  };

  const sendMessage = (receiverId, content, messageType = 'text') => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        receiverId,
        content,
        messageType
      });
      console.log('📤 Sent message to:', receiverId);
    }
  };

  const leaveConversation = (otherUserId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_conversation', { otherUserId });
      console.log('👋 Left conversation with:', otherUserId);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    joinConversation,
    sendMessage,
    leaveConversation
  };
};

export default useSocket;
