import React, { useState, useEffect, useRef } from 'react';
import { Send, UserCheck, Clock, Trash2 } from 'lucide-react';
import useSocket from '../../lib/useSocket';
import { toast } from 'react-hot-toast';

const RealTimeMessageInterface = ({ conversationUserId, conversationUsername }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { isConnected, joinConversation, sendMessage, leaveConversation } = useSocket();

  // Join conversation when component mounts
  useEffect(() => {
    if (conversationUserId && isConnected) {
      joinConversation(conversationUserId);
    }

    return () => {
      if (conversationUserId && isConnected) {
        leaveConversation(conversationUserId);
      }
    };
  }, [conversationUserId, isConnected, joinConversation, leaveConversation]);

  // Listen for real-time events
  useEffect(() => {
    const handleNewMessage = (event) => {
      const data = event.detail;
      
      // Only add message if it's for this conversation
      if (data.senderId === conversationUserId || data.receiverId === conversationUserId) {
        setMessages(prev => [...prev, {
          id: data.messageId || Date.now(),
          content: data.content,
          senderId: data.senderId,
          senderUsername: data.senderUsername,
          timestamp: new Date(data.timestamp || Date.now()),
          isRead: false
        }]);
      }
    };

    const handleMessagesRead = (event) => {
      const data = event.detail;
      
      // Mark messages as read
      setMessages(prev => prev.map(msg => ({
        ...msg,
        isRead: true
      })));
      
      toast.success(`${data.readByUsername} read your messages`, { duration: 2000 });
    };

    const handleMessageDeleted = (event) => {
      const data = event.detail;
      
      // Remove deleted message
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    };

    // Add event listeners
    window.addEventListener('new_message', handleNewMessage);
    window.addEventListener('messages_read', handleMessagesRead);
    window.addEventListener('message_deleted', handleMessageDeleted);

    // Cleanup
    return () => {
      window.removeEventListener('new_message', handleNewMessage);
      window.removeEventListener('messages_read', handleMessagesRead);
      window.removeEventListener('message_deleted', handleMessageDeleted);
    };
  }, [conversationUserId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected) return;
    
    // Send via Socket.io
    sendMessage(conversationUserId, newMessage.trim());
    
    // Add to local state immediately
    setMessages(prev => [...prev, {
      id: Date.now(),
      content: newMessage.trim(),
      senderId: 'me', // Will be replaced by actual user ID
      senderUsername: 'You',
      timestamp: new Date(),
      isRead: false,
      sending: true
    }]);
    
    setNewMessage('');
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      // Could emit typing event here
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

  if (!conversationUserId) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {conversationUsername?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{conversationUsername}</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-xs text-gray-500">
                {isConnected ? 'Real-time messaging' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === 'me'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.senderId === 'me' && (
                    <div className="flex items-center space-x-1">
                      {message.sending ? (
                        <Clock className="h-3 w-3 opacity-75" />
                      ) : message.isRead ? (
                        <UserCheck className="h-3 w-3 opacity-75" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-white opacity-50" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        
        {isTyping && (
          <p className="text-xs text-gray-500 mt-1">Typing...</p>
        )}
      </div>
    </div>
  );
};

export default RealTimeMessageInterface;
