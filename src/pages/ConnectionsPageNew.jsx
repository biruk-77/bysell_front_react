import React, { useState, useEffect, useMemo } from 'react'
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  MessageCircle, 
  Search, 
  Star, 
  Zap,
  Globe,
  Grid,
  List,
  Sparkles,
  TrendingUp,
  Eye
} from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import useSocket from '../hooks/useSocket'
import { connectionsAPI, searchAPI } from '../lib/api'
import UserCard from '../components/connections/UserCard'
import ConnectionRequestModal from '../components/connections/ConnectionRequestModal'
import MutualConnectionsBadge from '../components/connections/MutualConnectionsBadge'
import RelatedConnectionsModal from '../components/connections/RelatedConnectionsModal'
import { getMutualCount, getPeopleYouMayKnow, getNetworkInsights } from '../utils/connectionHelpers'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const ConnectionsPage = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { 
    isConnected: socketConnected, 
    onlineUsers, 
    sendConnectionRequest: socketSendRequest,
    respondToConnectionRequest: socketRespondRequest 
  } = useSocket()
  
  // State
  const [activeTab, setActiveTab] = useState('discover')
  const [connections, setConnections] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('name')
  const [filterRole, setFilterRole] = useState('all')
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [requestLoading, setRequestLoading] = useState(false)
  
  // PART 2 & 4: People You May Know + Related Connections
  const [showRelatedModal, setShowRelatedModal] = useState(false)
  const [relatedModalUser, setRelatedModalUser] = useState(null)

  // Load connections data
  const loadConnectionsData = async () => {
    try {
      setLoading(true)
      
      const [connectionsRes, pendingRes, sentRes] = await Promise.all([
        connectionsAPI.getMyConnections({ page: 1, limit: 50 }).catch(() => ({ data: { connections: [] } })),
        connectionsAPI.getPendingRequests({ page: 1, limit: 50 }).catch(() => ({ data: { requests: [] } })),
        connectionsAPI.getSentRequests({ page: 1, limit: 50 }).catch(() => ({ data: { requests: [] } }))
      ])

      setConnections(connectionsRes.data?.connections || [])
      setPendingRequests(pendingRes.data?.requests || [])
      setSentRequests(sentRes.data?.requests || [])
      
      // Get suggested users
      try {
        const searchRes = await searchAPI.searchUsers({ query: 'test', limit: 10 })
        const users = searchRes.data?.data?.users || searchRes.data?.users || searchRes.data || []
        const filteredUsers = users.filter(u => u.id !== user?.id)
        setSuggestedUsers(filteredUsers)
      } catch (e) {
        setSuggestedUsers([])
      }
    } catch (error) {
      console.error('Failed to load connections:', error)
      toast.error('Failed to load connections')
      setConnections([])
      setPendingRequests([])
      setSentRequests([])
      setSuggestedUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConnectionsData()
  }, [])

  // PART 2: People You May Know - Calculate smart suggestions
  const peopleYouMayKnow = useMemo(() => {
    if (!user || suggestedUsers.length === 0) return [];
    return getPeopleYouMayKnow(connections, suggestedUsers, user).slice(0, 12);
  }, [connections, suggestedUsers, user]);

  // PART 3: Network Insights - Calculate statistics
  const networkInsights = useMemo(() => {
    return getNetworkInsights(connections);
  }, [connections]);

  // Search users
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const response = await searchAPI.searchUsers({ query: query.trim(), limit: 20 })
      const users = response.data?.data?.users || response.data?.users || response.data || []
      setSearchResults(users)
    } catch (error) {
      console.error('Failed to search users:', error)
      toast.error('Failed to search users')
    } finally {
      setSearching(false)
    }
  }

  // Send connection request via Socket
  const sendConnectionRequest = async (userId, message = '') => {
    try {
      setRequestLoading(true)
      await socketSendRequest(userId, message)
      await loadConnectionsData()
    } catch (error) {
      console.error('Socket connection request failed:', error)
      throw error
    } finally {
      setRequestLoading(false)
    }
  }

  // Handle connection request with modal
  const handleConnectClick = (user) => {
    const status = getUserConnectionStatus(user.id)
    
    if (status !== 'not_connected') {
      toast.info(`You are already ${status} with ${user.username}`)
      return
    }
    
    setSelectedUser(user)
    setShowConnectionModal(true)
  }

  // Start chat
  const startChat = (userId, username) => {
    navigate(`/messages/${userId}`)
    toast.success(`Opening chat with ${username}`)
  }

  // Disconnect user
  const disconnectUser = async (userId, username) => {
    try {
      const connection = connections.find(conn => 
        (conn.requester?.id === userId || conn.receiver?.id === userId)
      )
      
      if (!connection) {
        toast.error('Connection not found')
        return
      }

      await connectionsAPI.removeConnection(connection.id)
      toast.success(`Disconnected from ${username}`)
      loadConnectionsData()
    } catch (error) {
      console.error('Failed to disconnect:', error)
      toast.error('Failed to disconnect')
    }
  }

  // Check user connection status
  const getUserConnectionStatus = (userId) => {
    if (!userId) return 'not_connected'
    
    if (userId === user?.id) {
      return 'self'
    }
    
    // Check if already connected
    const connectedConnection = connections.find(conn => {
      const isMatch = (conn.requester?.id === userId || conn.receiver?.id === userId)
      const isAccepted = conn.status === 'accepted'
      return isMatch && isAccepted
    })
    
    if (connectedConnection) {
      return 'connected'
    }

    // Check if request sent
    const sentRequest = sentRequests.find(req => {
      const isMatch = req.receiver?.id === userId
      const isPending = req.status === 'pending'
      return isMatch && isPending
    })
    
    if (sentRequest) {
      return 'pending'
    }

    // Check if request received
    const receivedRequest = pendingRequests.find(req => {
      const isMatch = req.requester?.id === userId
      const isPending = req.status === 'pending'
      return isMatch && isPending
    })
    
    if (receivedRequest) {
      return 'received'
    }

    return 'not_connected'
  }

  // Respond to connection request via Socket
  const respondToConnectionRequest = async (connectionId, action, requester) => {
    try {
      await socketRespondRequest(connectionId, action)
      
      if (action === 'accept') {
        toast.success(`Connection request from ${requester} accepted!`)
      } else {
        toast.info(`Connection request from ${requester} declined`)
      }
      
      await loadConnectionsData()
    } catch (error) {
      console.error(`Failed to ${action} connection request:`, error)
      toast.error(`Failed to ${action} connection request`)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchTerm)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Filter and sort functions
  const getFilteredUsers = (users) => {
    let filtered = users

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.username.localeCompare(b.username)
        case 'role':
          return a.role.localeCompare(b.role)
        case 'recent':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        default:
          return 0
      }
    })

    return filtered
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view connections</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Connections</h2>
          <p className="text-gray-600">Fetching your network...</p>
        </div>
      </div>
    )
  }

  const currentUsers = searchTerm ? searchResults : suggestedUsers
  const filteredUsers = getFilteredUsers(currentUsers)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Your Network
              </h1>
              <p className="text-gray-600 text-lg">
                Connect, collaborate, and grow your professional network
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${
                socketConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  socketConnected ? 'bg-green-600' : 'bg-red-600'
                }`} />
                <span>{socketConnected ? 'Live' : 'Offline'}</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <Globe className="h-4 w-4" />
                <span>{onlineUsers.length} online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Connections', 
              value: connections.length, 
              icon: UserCheck, 
              color: 'green',
              description: 'Active connections'
            },
            { 
              label: 'Pending', 
              value: pendingRequests.length, 
              icon: Zap, 
              color: 'yellow',
              description: 'Awaiting response'
            },
            { 
              label: 'Sent', 
              value: sentRequests.length, 
              icon: Star, 
              color: 'blue',
              description: 'Requests sent'
            },
            { 
              label: 'May Know', 
              value: peopleYouMayKnow.length, 
              icon: TrendingUp, 
              color: 'purple',
              description: `+${networkInsights.recentGrowth} this week`
            }
          ].map(({ label, value, icon: Icon, color, description }) => (
            <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  color === 'green' ? 'bg-green-100 text-green-600' :
                  color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                  color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex space-x-1">
              {[
                { id: 'discover', label: 'Discover', icon: Users },
                { id: 'suggested', label: 'May Know', icon: TrendingUp, count: peopleYouMayKnow.length },
                { id: 'connections', label: 'Connected', icon: UserCheck },
                { id: 'pending', label: 'Pending', icon: Zap },
                { id: 'sent', label: 'Sent', icon: Star }
              ].map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="role">Sort by Role</option>
                <option value="recent">Sort by Recent</option>
              </select>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="employee">Employee</option>
                <option value="employer">Employer</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="connector">Connector</option>
                <option value="reviewer">Reviewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'discover' && (
              <DiscoverTab 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searching={searching}
                filteredUsers={filteredUsers}
                viewMode={viewMode}
                onConnect={handleConnectClick}
                onChat={startChat}
                getUserStatus={getUserConnectionStatus}
                pendingRequests={pendingRequests}
                myConnections={connections}
                onAccept={(userId, username) => {
                  const request = pendingRequests.find(req => req.requester?.id === userId)
                  if (request) {
                    respondToConnectionRequest(request.id, 'accept', request.requester?.username)
                  }
                }}
                onReject={(userId, username) => {
                  const request = pendingRequests.find(req => req.requester?.id === userId)
                  if (request) {
                    respondToConnectionRequest(request.id, 'reject', request.requester?.username)
                  }
                }}
              />
            )}

            {activeTab === 'suggested' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  People You May Know ({peopleYouMayKnow.length})
                </h3>
                
                {peopleYouMayKnow.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions yet</h3>
                    <p className="text-gray-600">Connect with more people to get smart suggestions</p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                    : 'space-y-4'
                  }>
                    {peopleYouMayKnow.map((suggestedUser) => (
                      <div key={suggestedUser.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                            {suggestedUser.username?.[0]?.toUpperCase()}
                          </div>
                          <h3 className="font-semibold text-lg text-gray-900">{suggestedUser.username}</h3>
                          <p className="text-sm text-gray-600 capitalize">{suggestedUser.role}</p>
                          
                          {/* PART 1: Show suggestion reasons */}
                          {suggestedUser.suggestionReasons && suggestedUser.suggestionReasons.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1 justify-center">
                              {suggestedUser.suggestionReasons.slice(0, 2).map((reason, i) => (
                                <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                  {reason}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-4 w-full">
                            <button
                              onClick={() => handleConnectClick(suggestedUser)}
                              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
                            >
                              <UserPlus className="w-4 h-4" />
                              Connect
                            </button>
                            <button
                              onClick={() => {
                                setRelatedModalUser(suggestedUser);
                                setShowRelatedModal(true);
                              }}
                              className="p-2 border border-purple-300 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title="View related connections"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'connections' && (
              <ConnectionsTab 
                connections={connections}
                onChat={startChat}
                onDisconnect={disconnectUser}
                viewMode={viewMode}
              />
            )}

            {activeTab === 'pending' && (
              <PendingTab 
                pendingRequests={pendingRequests}
                onAccept={(connectionId, requester) => respondToConnectionRequest(connectionId, 'accept', requester)}
                onReject={(connectionId, requester) => respondToConnectionRequest(connectionId, 'reject', requester)}
                viewMode={viewMode}
              />
            )}

            {activeTab === 'sent' && (
              <SentTab 
                sentRequests={sentRequests}
                viewMode={viewMode}
              />
            )}
          </div>
        </div>
      </div>

      {/* Connection Request Modal */}
      <ConnectionRequestModal
        isOpen={showConnectionModal}
        onClose={() => {
          setShowConnectionModal(false)
          setSelectedUser(null)
        }}
        targetUser={selectedUser}
        onSendRequest={sendConnectionRequest}
        isLoading={requestLoading}
      />

      {/* PART 4: Related Connections Modal */}
      <RelatedConnectionsModal
        isOpen={showRelatedModal}
        onClose={() => {
          setShowRelatedModal(false)
          setRelatedModalUser(null)
        }}
        targetUser={relatedModalUser}
        myConnections={connections}
        allUsers={[...suggestedUsers, ...searchResults]}
        currentUser={user}
        onConnect={handleConnectClick}
      />
    </div>
  )
}

// Tab Components
const DiscoverTab = ({ 
  searchTerm, 
  setSearchTerm, 
  searching, 
  filteredUsers, 
  viewMode, 
  onConnect, 
  onChat, 
  getUserStatus, 
  pendingRequests,
  onAccept,
  onReject,
  myConnections = []
}) => (
  <div>
    {/* Search Bar */}
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search for people to connect with..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {searching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
        </div>
      )}
    </div>

    {/* Users Grid/List */}
    {filteredUsers.length === 0 ? (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchTerm ? 'No users found' : 'No suggested users'}
        </h3>
        <p className="text-gray-600">
          {searchTerm ? 'Try a different search term' : 'Check back later for suggestions'}
        </p>
      </div>
    ) : (
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }>
        {filteredUsers.map((user) => {
          // PART 1: Calculate mutual connections
          const mutualCount = getMutualCount(myConnections, user);
          const mutualNames = myConnections
            .filter(conn => user.connections && user.connections.includes(
              conn.requester?.id === conn.requesterId ? conn.receiver?.id : conn.requester?.id
            ))
            .map(conn => {
              const mutual = conn.requester?.id === conn.requesterId ? conn.receiver : conn.requester;
              return mutual?.username;
            })
            .filter(Boolean)
            .slice(0, 2);

          return (
            <UserCard
              key={user.id}
              user={user}
              status={getUserStatus(user.id)}
              onConnect={() => onConnect(user)}
              onChat={onChat}
              onAccept={onAccept}
              onReject={onReject}
              compact={viewMode === 'list'}
              mutualCount={mutualCount}
              mutualNames={mutualNames}
            />
          );
        })}
      </div>
    )}
  </div>
)

const ConnectionsTab = ({ connections, onChat, onDisconnect, viewMode }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      My Connections ({connections.length})
    </h3>
    
    {connections.length === 0 ? (
      <div className="text-center py-12">
        <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
        <p className="text-gray-600">Start connecting with people to build your network</p>
      </div>
    ) : (
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }>
        {connections.map((conn) => {
          const connectedUser = conn.requester?.id === conn.requesterId ? conn.receiver : conn.requester
          return (
            <UserCard
              key={conn.id}
              user={connectedUser}
              status="connected"
              onChat={onChat}
              onDisconnect={onDisconnect}
              compact={viewMode === 'list'}
            />
          )
        })}
      </div>
    )}
  </div>
)

const PendingTab = ({ pendingRequests, onAccept, onReject, viewMode }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Pending Requests ({pendingRequests.length})
    </h3>
    
    {pendingRequests.length === 0 ? (
      <div className="text-center py-12">
        <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
        <p className="text-gray-600">Connection requests will appear here</p>
      </div>
    ) : (
      <div className="space-y-4">
        {pendingRequests.map((request) => (
          <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {request.requester?.username?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{request.requester?.username}</h4>
                  <p className="text-sm text-gray-600 capitalize">{request.requester?.role}</p>
                  {request.message && (
                    <p className="text-sm text-gray-500 mt-1 italic">"{request.message}"</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onAccept(request.id, request.requester?.username)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Accept
                </button>
                <button
                  onClick={() => onReject(request.id, request.requester?.username)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)

const SentTab = ({ sentRequests, viewMode }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Sent Requests ({sentRequests.length})
    </h3>
    
    {sentRequests.length === 0 ? (
      <div className="text-center py-12">
        <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No sent requests</h3>
        <p className="text-gray-600">Requests you send will appear here</p>
      </div>
    ) : (
      <div className="space-y-4">
        {sentRequests.map((request) => (
          <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {request.receiver?.username?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{request.receiver?.username}</h4>
                  <p className="text-sm text-gray-600 capitalize">{request.receiver?.role}</p>
                  {request.message && (
                    <p className="text-sm text-gray-500 mt-1 italic">"{request.message}"</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                <Zap className="h-4 w-4" />
                <span>Pending</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)

export default ConnectionsPage
