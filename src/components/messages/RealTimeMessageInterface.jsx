import React, { useState, useEffect, useRef } from 'react';
import { Send, Clock, Trash2, Check, CheckCheck } from 'lucide-react';
import socketService from '../../lib/socket';
import useAuthStore from '../../store/useAuthStore';
import { messagesAPI } from '../../lib/api';
import { toast } from 'react-hot-toast';

const RealTimeMessageInterface = ({ conversationUserId, conversationUsername }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [userStatus, setUserStatus] = useState('online');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [oldestMessageId, setOldestMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { user: currentUser, token } = useAuthStore();
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  console.log('💬 Message Interface - Current User:', currentUser?.id, currentUser?.username);
  console.log('💬 Message Interface - Conversation User:', conversationUserId, conversationUsername);

  // Connect socket when component mounts
  useEffect(() => {
    if (token && !socketService.isConnected()) {
      console.log('🔌 Connecting socket service...');
      socketService.connect(token);
    }

    // Listen for connection status changes
    const handleConnected = () => {
      console.log('✅ Socket service connected');
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      console.log('❌ Socket service disconnected');
      setIsConnected(false);
    };

    socketService.addEventListener('socket_connected', handleConnected);
    socketService.addEventListener('socket_disconnected', handleDisconnected);

    return () => {
      socketService.removeEventListener('socket_connected', handleConnected);
      socketService.removeEventListener('socket_disconnected', handleDisconnected);
    };
  }, [token]);

  // Load existing conversation history - FIXED: Prevent multiple calls
  const loadConversationHistory = async () => {
    if (!conversationUserId || isLoadingHistory) return;
    
    try {
      setIsLoadingHistory(true);
      console.log('📚 Loading conversation history with:', conversationUserId);
      const response = await messagesAPI.getConversation(conversationUserId, { limit: 50 });
      
      if (response.data?.messages) {
        const formattedMessages = response.data.messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          senderUsername: msg.senderUsername,
          timestamp: new Date(msg.createdAt),
          isRead: msg.isRead
        }));
        
        console.log('📚 Loaded', formattedMessages.length, 'historical messages');
        setMessages(formattedMessages);
        
        // Track oldest message for pagination
        if (formattedMessages.length > 0) {
          setOldestMessageId(formattedMessages[0].id);
        }
        
        // Check if there are more messages to load
        setHasMoreMessages(formattedMessages.length >= 50);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      // Don't show error toast as it might be a new conversation
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load more older messages
  const loadMoreMessages = async () => {
    if (!conversationUserId || isLoadingMore || !hasMoreMessages) return;
    
    try {
      setIsLoadingMore(true);
      console.log('📚 Loading more messages before:', oldestMessageId);
      
      const response = await messagesAPI.getConversation(conversationUserId, { 
        limit: 20,
        before: oldestMessageId 
      });
      
      if (response.data?.messages && response.data.messages.length > 0) {
        const formattedMessages = response.data.messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          senderUsername: msg.senderUsername,
          timestamp: new Date(msg.createdAt),
          isRead: msg.isRead
        }));
        
        console.log('📚 Loaded', formattedMessages.length, 'more messages');
        
        // Prepend older messages to the beginning
        setMessages(prev => [...formattedMessages, ...prev]);
        
        // Update oldest message ID
        setOldestMessageId(formattedMessages[0].id);
        
        // Check if there are more messages
        setHasMoreMessages(formattedMessages.length >= 20);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Join conversation when component mounts - FIXED: Remove excessive dependencies
  useEffect(() => {
    if (conversationUserId && socketService.isConnected()) {
      socketService.joinConversation(conversationUserId);
      loadConversationHistory();
    }

    return () => {
      if (conversationUserId) {
        // Leave conversation on unmount
        socketService.emit('leave_conversation', { otherUserId: conversationUserId });
      }
    };
  }, [conversationUserId]); // Only re-run when conversationUserId changes

  // Listen for real-time events via socketService
  useEffect(() => {
    const handleNewMessage = (data) => {
      console.log('📨 New message received:', data);
      console.log('📨 Current user ID:', currentUser?.id);
      console.log('📨 Conversation user ID:', conversationUserId);
      console.log('📨 Event listener is working! Data:', JSON.stringify(data, null, 2));
      
      // Only add message if it's for this conversation
      const isRelevantMessage = (
        (data.senderId === currentUser?.id && data.receiverId === conversationUserId) ||
        (data.senderId === conversationUserId && data.receiverId === currentUser?.id)
      );
      
      if (isRelevantMessage) {
        const messageData = {
          id: data.messageId || `msg-${Date.now()}`,
          content: data.content,
          senderId: data.senderId,
          receiverId: data.receiverId,
          senderUsername: data.senderUsername,
          timestamp: new Date(data.timestamp || Date.now()),
          isRead: false
        };
        
        // If this is our own message coming back, replace the optimistic message
        if (data.senderId === currentUser?.id) {
          console.log('📤 Replacing optimistic message with server message:', messageData);
          setMessages(prev => {
            // Remove optimistic message and add server message
            const withoutOptimistic = prev.filter(msg => !msg.sending || msg.content !== data.content);
            return [...withoutOptimistic, messageData];
          });
        } else {
          // This is a message from the other user
          console.log('📨 Adding received message:', messageData);
          setMessages(prev => [...prev, messageData]);
          
          // Auto-mark message as read
          console.log('📖 Auto-marking messages as read from:', conversationUserId);
          socketService.emit('mark_messages_read', { otherUserId: conversationUserId }, (response) => {
            if (response?.success) {
              console.log('✅ Messages marked as read');
            }
          });
        }
      } else {
        console.log('❌ Message not relevant to this conversation');
      }
    };

    const handleMessagesRead = (data) => {
      // Mark messages as read
      setMessages(prev => prev.map(msg => ({
        ...msg,
        isRead: true
      })));
      
      toast.success(`${data.readByUsername} read your messages`, { duration: 2000 });
    };

    const handleMessageDeleted = (data) => {
      // Remove deleted message
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    };

    const handleUserTyping = (data) => {
      // Only handle typing for current conversation user
      if (data.userId === conversationUserId) {
        setOtherUserTyping(data.isTyping);
        
        // Auto-hide typing indicator after 3 seconds
        if (data.isTyping) {
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      }
    };

    const handleUserStatusChanged = (data) => {
      // Update status if it's the conversation user
      if (data.userId === conversationUserId) {
        setUserStatus(data.status);
      }
    };

    // Add event listeners via socketService
    socketService.addEventListener('new_message', handleNewMessage);
    socketService.addEventListener('messages_read', handleMessagesRead);
    socketService.addEventListener('message_deleted', handleMessageDeleted);
    socketService.addEventListener('user_typing', handleUserTyping);
    socketService.addEventListener('user_status_changed', handleUserStatusChanged);

    // Cleanup
    return () => {
      socketService.removeEventListener('new_message', handleNewMessage);
      socketService.removeEventListener('messages_read', handleMessagesRead);
      socketService.removeEventListener('message_deleted', handleMessageDeleted);
      socketService.removeEventListener('user_typing', handleUserTyping);
      socketService.removeEventListener('user_status_changed', handleUserStatusChanged);
    };
  }, [conversationUserId, currentUser?.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socketService.isConnected()) {
      console.log('❌ Cannot send: message empty or socket not connected');
      return;
    }
    
    const messageContent = newMessage.trim();
    
    // Add to local state immediately (optimistic update)
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      senderId: currentUser?.id,
      receiverId: conversationUserId,
      senderUsername: currentUser?.username,
      timestamp: new Date(),
      isRead: false,
      sending: true
    };
    
    console.log('📤 Adding optimistic message:', optimisticMessage);
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    
    // Stop typing indicator when sending message
    if (isTyping) {
      setIsTyping(false);
      console.log('⌨️ Stopping typing indicator after send');
      socketService.emit('stop_typing', { receiverId: conversationUserId });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
    
    try {
      // Send via Socket.io using socketService
      console.log('📤 Sending message via socketService...');
      socketService.sendMessage(conversationUserId, messageContent, 'text', (response) => {
        if (response?.success) {
          console.log('✅ Message sent successfully:', response);
        } else {
          console.error('❌ Failed to send message:', response?.message);
          toast.error('Failed to send message');
        }
      });
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator via socket
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      
      // Emit start typing event
      console.log('⌨️ Emitting start_typing to:', conversationUserId);
      socketService.emit('start_typing', { receiverId: conversationUserId }, (response) => {
        if (response?.success) {
          console.log('✅ Typing indicator sent');
        }
      });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        // Emit stop typing event
        console.log('⌨️ Emitting stop_typing to:', conversationUserId);
        socketService.emit('stop_typing', { receiverId: conversationUserId });
      }, 3000);
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
      console.log('⌨️ Emitting stop_typing to:', conversationUserId);
      socketService.emit('stop_typing', { receiverId: conversationUserId });
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
              <div className={`w-2 h-2 rounded-full ${
                userStatus === 'online' ? 'bg-green-500' : 
                userStatus === 'away' ? 'bg-yellow-500' : 
                userStatus === 'busy' ? 'bg-red-500' : 'bg-gray-400'
              }`} />
              <span className="text-xs text-gray-500 capitalize">
                {otherUserTyping ? 'Typing...' : userStatus}
              </span>
              {isConnected && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs text-green-600">Live</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Load More Button */}
        {hasMoreMessages && messages.length > 0 && (
          <div className="flex justify-center mb-4">
            <button
              onClick={loadMoreMessages}
              disabled={isLoadingMore}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingMore ? 'Loading...' : 'Load More Messages'}
            </button>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMyMessage = message.senderId === currentUser?.id;
            console.log('🎨 Rendering message - RAW MESSAGE DATA:');
            console.log(JSON.stringify(message, null, 2));
            console.log('Is My Message:', isMyMessage, '| Current User ID:', currentUser?.id);
            
            return (
              <div
                key={message.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isMyMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {!isMyMessage && (
                    <p className="text-xs opacity-75 mb-1">{message.senderUsername}</p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMyMessage && (
                      <div className="flex items-center space-x-1">
                        {message.sending ? (
                          <Clock className="h-3 w-3 opacity-75" />
                        ) : message.isRead ? (
                          <CheckCheck className="h-4 w-4 opacity-90" />
                        ) : (
                          <Check className="h-4 w-4 opacity-75" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="flex justify-start px-4">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
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
          <p className="text-xs text-blue-600 mt-1">You are typing...</p>
        )}
        
        {otherUserTyping && (
          <p className="text-xs text-green-600 mt-1">{conversationUsername} is typing...</p>
        )}
      </div>
    </div>
  );
};

export default RealTimeMessageInterface;
