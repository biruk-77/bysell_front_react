import { useEffect } from 'react';
import { useSocketConnection } from '../core/socketConnection';
import toast from 'react-hot-toast';

// Connection requests socket functionality
export const useConnections = () => {
  const { socket, isConnected } = useSocketConnection();

  useEffect(() => {
    if (!socket) return;

    // Connection request events
    const handleConnectionRequestReceived = (data) => {
      console.log('🔗 New connection request:', data);
      toast.success(`New connection request from ${data.connection.requester.username}`);
      // Dispatch event for components to catch
      window.dispatchEvent(new CustomEvent('connection_request_received', { detail: data }));
    };

    const handleConnectionRequestResponded = (data) => {
      console.log('✅ Connection request responded:', data);
      const action = data.action === 'accept' ? 'accepted' : 'rejected';
      toast.success(`${data.connection.receiver.username} ${action} your connection request`);
      // Dispatch event for components to catch
      window.dispatchEvent(new CustomEvent('connection_request_responded', { detail: data }));
    };

    const handleConnectionRequestCancelled = (data) => {
      console.log('❌ Connection request cancelled:', data);
      toast.info(`Connection request cancelled`);
      // Dispatch event for components to catch
      window.dispatchEvent(new CustomEvent('connection_request_cancelled', { detail: data }));
    };

    // Add event listeners
    socket.on('connection_request_received', handleConnectionRequestReceived);
    socket.on('connection_request_responded', handleConnectionRequestResponded);
    socket.on('connection_request_cancelled', handleConnectionRequestCancelled);

    // Cleanup
    return () => {
      socket.off('connection_request_received', handleConnectionRequestReceived);
      socket.off('connection_request_responded', handleConnectionRequestResponded);
      socket.off('connection_request_cancelled', handleConnectionRequestCancelled);
    };
  }, [socket]);

  // Connection methods
  const sendConnectionRequest = (receiverId, message = '') => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('send_connection_request', {
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
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('respond_connection_request', {
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
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('cancel_connection_request', {
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

  return {
    isConnected,
    sendConnectionRequest,
    respondToConnectionRequest,
    cancelConnectionRequest
  };
};

export default useConnections;
