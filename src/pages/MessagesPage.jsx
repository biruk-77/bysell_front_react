import React, { useState } from 'react';
import ConversationList from '../components/messages/ConversationList';
import RealTimeMessageInterface from '../components/messages/RealTimeMessageInterface';

const MessagesPage = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState('');

  const handleSelectConversation = (userId, username) => {
    console.log('📱 Selected conversation:', userId, username);
    setSelectedUserId(userId);
    setSelectedUsername(username);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Conversation List - Left Side */}
          <div className="lg:col-span-1 h-full">
            <ConversationList 
              onSelectConversation={handleSelectConversation}
              selectedUserId={selectedUserId}
            />
          </div>

          {/* Chat Interface - Right Side */}
          <div className="lg:col-span-2 h-full">
            {selectedUserId ? (
              <RealTimeMessageInterface
                conversationUserId={selectedUserId}
                conversationUsername={selectedUsername}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-24 w-24 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Select a conversation
                  </h3>
                  <p className="text-sm text-gray-500">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
