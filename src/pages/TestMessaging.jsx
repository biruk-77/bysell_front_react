import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { searchAPI } from '../lib/api';

const TestMessaging = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Search for all users
      const response = await searchAPI.searchUsers({ query: '', limit: 50 });
      const allUsers = response.data?.data?.users || response.data?.users || [];
      
      // Filter out current user
      const otherUsers = allUsers.filter(u => u.id !== currentUser?.id);
      setUsers(otherUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChat = (userId, username) => {
    navigate(`/messages/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <MessageCircle className="h-6 w-6 mr-2" />
          Test Messaging
        </h1>
        <p className="text-gray-600">Select a user to start a conversation</p>
      </div>

      {/* Current User Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">👤 You are:</h3>
        <div className="text-sm text-blue-700">
          <p><strong>Username:</strong> {currentUser?.username}</p>
          <p><strong>User ID:</strong> {currentUser?.id}</p>
          <p><strong>Role:</strong> {currentUser?.role}</p>
        </div>
      </div>

      {/* Available Users */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Available Users ({users.length})
          </h3>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No other users found.</p>
            <p className="text-sm mt-2">Create another user account to test messaging.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                      <p className="text-xs text-gray-400">{user.id}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => startChat(user.id, user.username)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Start Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">📝 Testing Instructions:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>1. <strong>Create a second user:</strong> Open incognito window and register</p>
          <p>2. <strong>Select different user:</strong> Click "Start Chat" with someone else</p>
          <p>3. <strong>Test messaging:</strong> Send messages between different users</p>
          <p>4. <strong>Check real-time:</strong> Open both users in different browser tabs</p>
        </div>
      </div>
    </div>
  );
};

export default TestMessaging;
