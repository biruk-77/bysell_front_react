// Main socket exports - centralized access to all socket functionality
export { default as useSocketConnection } from './core/socketConnection';
export { default as useMessaging } from './messaging/useMessaging';
export { default as useConnections } from './connections/useConnections';
export { default as useNotifications } from './notifications/useNotifications';
export { default as usePresence } from './presence/usePresence';
export { default as useTrading } from './trading/useTrading';
export { default as useEmployment } from './employment/useEmployment';

// Combined socket hook - imports all functionality
import { useSocketConnection } from './core/socketConnection';
import { useMessaging } from './messaging/useMessaging';
import { useConnections } from './connections/useConnections';
import { useNotifications } from './notifications/useNotifications';
import { usePresence } from './presence/usePresence';
import { useTrading } from './trading/useTrading';
import { useEmployment } from './employment/useEmployment';

// Main combined hook for backward compatibility
export const useSocket = () => {
  const { socket, isConnected } = useSocketConnection();
  const { onlineUsers } = usePresence();
  
  const messaging = useMessaging();
  const connections = useConnections();
  const notifications = useNotifications();
  const trading = useTrading();
  const employment = useEmployment();

  return {
    // Core
    socket,
    isConnected,
    onlineUsers,
    
    // Messaging
    sendMessage: messaging.sendMessage,
    joinConversation: messaging.joinConversation,
    leaveConversation: messaging.leaveConversation,
    startTyping: messaging.startTyping,
    stopTyping: messaging.stopTyping,
    
    // Connections
    sendConnectionRequest: connections.sendConnectionRequest,
    respondToConnectionRequest: connections.respondToConnectionRequest,
    cancelConnectionRequest: connections.cancelConnectionRequest,
    
    // Notifications
    markNotificationAsRead: notifications.markNotificationAsRead,
    clearNotification: notifications.clearNotification,
    clearAllNotifications: notifications.clearAllNotifications,
    
    // Trading
    sendTradeRequest: trading.sendTradeRequest,
    respondToTradeRequest: trading.respondToTradeRequest,
    completeTrade: trading.completeTrade,
    cancelTrade: trading.cancelTrade,
    
    // Employment
    applyForJob: employment.applyForJob,
    respondToJobApplication: employment.respondToJobApplication,
    scheduleInterview: employment.scheduleInterview,
    sendJobOffer: employment.sendJobOffer,
    respondToJobOffer: employment.respondToJobOffer
  };
};

export default useSocket;
