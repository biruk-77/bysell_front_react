import React, { useState, useEffect } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { messagesAPI } from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import socketService from '../../lib/socket';

const ConversationList = ({ onSelectConversation, selectedUserId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser } = useAuthStore();

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('📚 Loading conversations...');
      const response = await messagesAPI.getConversations();
      
      console.log('📚 Full API response:', response);
      console.log('📚 Response data:', response.data);
      
      if (response.data?.conversations) {
        console.log('📚 Loaded', response.data.conversations.length, 'conversations');
        console.log('📚 Conversations:', response.data.conversations);
        setConversations(response.data.conversations);
      } else {
        console.log('❌ No conversations in response');
      }
    } catch (error) {
      console.error('❌ Failed to load conversations:', error);
      console.error('❌ Error response:', error.response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Listen for conversations snapshot from socket on connect
  useEffect(() => {
    const handleConversationsSnapshot = (data) => {
      console.log('📸 Received conversations snapshot via socket:', data);
      if (data.conversations) {
        console.log('📸 Setting', data.conversations.length, 'conversations from socket');
        setConversations(data.conversations);
      }
    };

    socketService.addEventListener('conversations_snapshot', handleConversationsSnapshot);

    return () => {
      socketService.removeEventListener('conversations_snapshot', handleConversationsSnapshot);
    };
  }, []);

  // Listen for new messages to update conversation list
  useEffect(() => {
    const handleNewMessage = (data) => {
      console.log('📨 New message for conversation list:', data);
      // Reload conversations to update latest message
      loadConversations();
    };

    const handleMessagesRead = (data) => {
      console.log('👁️ Messages read, updating conversation list');
      // Update unread count
      setConversations(prev => 
        prev.map(conv => {
          if (conv.otherUser.id === data.readBy) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        })
      );
    };

    socketService.addEventListener('new_message', handleNewMessage);
    socketService.addEventListener('messages_read', handleMessagesRead);

    return () => {
      socketService.removeEventListener('new_message', handleNewMessage);
      socketService.removeEventListener('messages_read', handleMessagesRead);
    };
  }, []);

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Truncate message
  const truncateMessage = (message, maxLength = 40) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Messages
        </h2>
        
        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">Start chatting with your connections!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedUserId === conversation.otherUser.id;
              const isMyMessage = conversation.latestMessage.senderId === currentUser?.id;
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.otherUser.id, conversation.otherUser.username)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {conversation.otherUser.username.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.otherUser.username}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTimestamp(conversation.latestMessage.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          conversation.unreadCount > 0 && !isMyMessage 
                            ? 'text-gray-900 font-medium' 
                            : 'text-gray-600'
                        }`}>
                          {isMyMessage && <span className="text-gray-500">You: </span>}
                          {truncateMessage(conversation.latestMessage.content)}
                        </p>
                        
                        {conversation.unreadCount > 0 && !isMyMessage && (
                          <span className="flex-shrink-0 ml-2 bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
