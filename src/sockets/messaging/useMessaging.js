import { useEffect } from 'react';
import { useSocketConnection } from '../core/socketConnection';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

// Messaging socket functionality
export const useMessaging = () => {
  const { socket, isConnected } = useSocketConnection();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!socket) return;

    // Message events
    const handleNewMessage = (data) => {
      console.log('💬 New message:', data);
      if (data.senderId !== user?.id) {
        toast(`New message from ${data.senderUsername}`);
      }
      // Dispatch event for RealTimeMessageInterface to catch
      window.dispatchEvent(new CustomEvent('new_message', { detail: data }));
    };

    const handleMessageRead = (data) => {
      console.log('📖 Message read:', data);
      window.dispatchEvent(new CustomEvent('messages_read', { detail: data }));
    };

    const handleMessageDeleted = (data) => {
      console.log('🗑️ Message deleted:', data);
      window.dispatchEvent(new CustomEvent('message_deleted', { detail: data }));
    };

    const handleUserTyping = (data) => {
      console.log('⌨️ User typing:', data);
      window.dispatchEvent(new CustomEvent('user_typing', { detail: data }));
    };

    // Add event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('user_typing', handleUserTyping);

    // Cleanup
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, user?.id]);

  // Messaging methods
  const sendMessage = (receiverId, content, messageType = 'text') => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('send_message', {
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
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('join_conversation', {
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
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('leave_conversation', {
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

  const startTyping = (receiverId) => {
    if (!socket) return;
    socket.emit('start_typing', { receiverId });
  };

  const stopTyping = (receiverId) => {
    if (!socket) return;
    socket.emit('stop_typing', { receiverId });
  };

  return {
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping
  };
};

export default useMessaging;
