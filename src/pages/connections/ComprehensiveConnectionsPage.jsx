import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  UserCheck,
  UserMinus,
  MessageCircle,
  Search,
  Filter,
  MapPin,
  TrendingUp,
  ShoppingBag,
  Tag,
  Clock,
  X,
  Check,
  Send
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function ComprehensiveConnectionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('suggestions'); // suggestions, my-connections, requests
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Data states
  const [suggestions, setSuggestions] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  // Suggestion Categories
  const categories = [
    { id: 'all', name: 'All Users', icon: Users, color: 'blue' },
    { id: 'buyers', name: 'Buyers', icon: ShoppingBag, color: 'green' },
    { id: 'sellers', name: 'Sellers', icon: Tag, color: 'purple' },
    { id: 'nearby', name: 'Nearby', icon: MapPin, color: 'orange' },
    { id: 'trending', name: 'Trending', icon: TrendingUp, color: 'red' },
    { id: 'recent', name: 'Recently Active', icon: Clock, color: 'indigo' }
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (activeTab === 'suggestions') {
        const res = await axios.get(`${API_URL}/connections/suggestions?category=${selectedCategory}`, config);
        setSuggestions(res.data.suggestions || []);
      } else if (activeTab === 'my-connections') {
        const res = await axios.get(`${API_URL}/connections`, config);
        setMyConnections(res.data.connections || []);
      } else if (activeTab === 'requests') {
        const res = await axios.get(`${API_URL}/connections/requests`, config);
        setPendingRequests(res.data.received || []);
        setSentRequests(res.data.sent || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Send connection request
  const sendConnectionRequest = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/connections/request`,
        { receiverId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Connection request sent!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  // Accept connection request
  const acceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/connections/accept/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Connection accepted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  // Reject connection request
  const rejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/connections/reject/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Request rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  // Remove connection
  const removeConnection = async (userId) => {
    if (!confirm('Remove this connection?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/connections/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Connection removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove connection');
    }
  };

  // Navigate to chat
  const openChat = (userId) => {
    navigate(`/messages?userId=${userId}`);
  };

  // Filter by search
  const filterUsers = (users) => {
    if (!searchQuery) return users;
    return users.filter(user => 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              Connections
            </h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b overflow-x-auto">
            <TabButton
              active={activeTab === 'suggestions'}
              onClick={() => setActiveTab('suggestions')}
              icon={UserPlus}
              label="Suggestions"
              count={suggestions.length}
            />
            <TabButton
              active={activeTab === 'my-connections'}
              onClick={() => setActiveTab('my-connections')}
              icon={UserCheck}
              label="My Connections"
              count={myConnections.length}
            />
            <TabButton
              active={activeTab === 'requests'}
              onClick={() => setActiveTab('requests')}
              icon={Send}
              label="Requests"
              count={pendingRequests.length}
              badge={pendingRequests.length > 0}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Categories (only for suggestions) */}
        {activeTab === 'suggestions' && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((category) => (
                <CategoryChip
                  key={category.id}
                  category={category}
                  active={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterUsers(suggestions).map((user) => (
                  <UserSuggestionCard
                    key={user.id}
                    user={user}
                    onConnect={() => sendConnectionRequest(user.id)}
                  />
                ))}
                {filterUsers(suggestions).length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No suggestions found
                  </div>
                )}
              </div>
            )}

            {/* My Connections Tab */}
            {activeTab === 'my-connections' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterUsers(myConnections).map((user) => (
                  <ConnectionCard
                    key={user.id}
                    user={user}
                    onMessage={() => openChat(user.id)}
                    onRemove={() => removeConnection(user.id)}
                  />
                ))}
                {filterUsers(myConnections).length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No connections yet. Send some requests!
                  </div>
                )}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                {/* Received Requests */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                    Received Requests ({pendingRequests.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        type="received"
                        onAccept={() => acceptRequest(request.id)}
                        onReject={() => rejectRequest(request.id)}
                      />
                    ))}
                    {pendingRequests.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No pending requests
                      </div>
                    )}
                  </div>
                </div>

                {/* Sent Requests */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Send className="w-6 h-6 text-gray-600" />
                    Sent Requests ({sentRequests.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sentRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        type="sent"
                      />
                    ))}
                    {sentRequests.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No sent requests
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, icon: Icon, label, count, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition relative ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
      {count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {count}
        </span>
      )}
      {badge && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
      )}
    </button>
  );
}

// Category Chip Component
function CategoryChip({ category, active, onClick }) {
  const Icon = category.icon;
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    green: 'bg-green-100 text-green-700 border-green-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    orange: 'bg-orange-100 text-orange-700 border-orange-300',
    red: 'bg-red-100 text-red-700 border-red-300',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition whitespace-nowrap ${
        active
          ? colorClasses[category.color]
          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
      }`}
    >
      <Icon className="w-4 h-4" />
      {category.name}
    </button>
  );
}

// User Suggestion Card
function UserSuggestionCard({ user, onConnect }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
          {user.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <h3 className="font-semibold text-lg text-gray-900">{user.username}</h3>
        <p className="text-sm text-gray-600">{user.fullName || 'User'}</p>
        <p className="text-xs text-gray-500 mt-1">{user.role || 'Member'}</p>
        
        {user.location && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
            <MapPin className="w-3 h-3" />
            {user.location}
          </div>
        )}

        <div className="flex gap-2 mt-4 w-full">
          <button
            onClick={onConnect}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4" />
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}

// Connection Card
function ConnectionCard({ user, onMessage, onRemove }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
          {user.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <h3 className="font-semibold text-lg text-gray-900">{user.username}</h3>
        <p className="text-sm text-gray-600">{user.fullName || 'User'}</p>
        
        {user.isOnline && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Online
          </span>
        )}

        <div className="flex gap-2 mt-4 w-full">
          <button
            onClick={onMessage}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
          <button
            onClick={onRemove}
            className="p-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <UserMinus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Request Card
function RequestCard({ request, type, onAccept, onReject }) {
  const user = type === 'received' ? request.sender : request.receiver;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user?.username}</h3>
          <p className="text-sm text-gray-600 truncate">{user?.fullName || 'User'}</p>
          <p className="text-xs text-gray-500 mt-1">
            {type === 'received' ? 'Wants to connect' : 'Request pending'}
          </p>
        </div>
      </div>

      {type === 'received' && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={onAccept}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={onReject}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <X className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}

      {type === 'sent' && (
        <div className="mt-4 text-center text-sm text-gray-500">
          <Clock className="w-4 h-4 inline mr-1" />
          Waiting for response...
        </div>
      )}
    </div>
  );
}
