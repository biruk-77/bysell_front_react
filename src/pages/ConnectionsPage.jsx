import React, { useState, useEffect } from 'react'
import { Users, UserPlus, UserCheck, UserX, MessageCircle, Search, Star } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { connectionsAPI, searchAPI } from '../lib/api'
import RealTimeConnections from '../components/connections/RealTimeConnections'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const ConnectionsPage = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
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
  
  console.log('🚀 CONNECTIONS PAGE - User:', user?.username, 'Role:', user?.role)

  if (!user) {
    return <div className="p-8">Please log in to view connections</div>
  }

  // Load connections data
  const loadConnectionsData = async () => {
    try {
      setLoading(true)
      
      // Load all connection data
      const [connectionsRes, pendingRes, sentRes] = await Promise.all([
        connectionsAPI.getMyConnections({ page: 1, limit: 50 }).catch(() => ({ data: { connections: [] } })),
        connectionsAPI.getPendingRequests({ page: 1, limit: 50 }).catch(() => ({ data: { requests: [] } })),
        connectionsAPI.getSentRequests({ page: 1, limit: 50 }).catch(() => ({ data: { requests: [] } }))
      ])

      const myConnections = connectionsRes.data?.connections || []
      const myPendingRequests = pendingRes.data?.requests || []
      const mySentRequests = sentRes.data?.requests || []

      console.log('📊 RAW API RESPONSES:')
      console.log('🔗 Connections response:', connectionsRes.data)
      console.log('📥 Pending response:', pendingRes.data)  
      console.log('📤 Sent response:', sentRes.data)

      console.log('📊 PARSED DATA:')
      console.log('🔗 My connections:', myConnections)
      console.log('📥 Pending requests:', myPendingRequests)
      console.log('📤 Sent requests:', mySentRequests)

      setConnections(myConnections)
      setPendingRequests(myPendingRequests)
      setSentRequests(mySentRequests)
      
      console.log('📊 STATE SET - Data lengths:', {
        connections: myConnections.length,
        pending: myPendingRequests.length,
        sent: mySentRequests.length
      })
      
      // Get suggested users
      try {
        const searchRes = await searchAPI.searchUsers({ query: 'test', limit: 10 })
        console.log('🔍 Search Response:', searchRes.data)
        
        // Handle different response structures
        const users = searchRes.data?.data?.users || searchRes.data?.users || searchRes.data || []
        console.log('👥 Found users:', users)
        
        const filteredUsers = users.filter(u => u.id !== user?.id)
        setSuggestedUsers(filteredUsers)
        
        console.log('✅ Suggested users set:', filteredUsers.length)
      } catch (e) {
        console.error('❌ Failed to load suggested users:', e)
        setSuggestedUsers([])
      }
    } catch (error) {
      console.error('Failed to load connections:', error)
      toast.error('Failed to load connections')
      
      // Set empty arrays on error so UI still renders
      setConnections([])
      setPendingRequests([])
      setSentRequests([])
      setSuggestedUsers([])
    } finally {
      console.log('✅ Loading complete, setting loading to false')
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConnectionsData()
  }, [])

  // Search users
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const response = await searchAPI.searchUsers({ query: query.trim(), limit: 20 })
      console.log('🔍 Search users response:', response.data)
      
      // Handle different response structures
      const users = response.data?.data?.users || response.data?.users || response.data || []
      console.log('👥 Search found users:', users.length)
      
      setSearchResults(users)
    } catch (error) {
      console.error('Failed to search users:', error)
      toast.error('Failed to search users')
    } finally {
      setSearching(false)
    }
  }

  // Send connection request
  const sendConnectionRequest = async (userId, username) => {
    try {
      console.log('🔄 Attempting to send connection request to:', username)
      
      // Double-check status before sending
      await loadConnectionsData()
      
      const currentStatus = getUserConnectionStatus(userId)
      console.log('📊 Current status for', username, ':', currentStatus)
      
      if (currentStatus !== 'not_connected') {
        console.log('⚠️ Cannot connect - status is:', currentStatus)
        toast.info(`You are already ${currentStatus} with ${username}`)
        return
      }

      console.log('✅ Proceeding with connection request...')
      await connectionsAPI.sendConnectionRequest({
        receiverId: userId,
        message: `Hi ${username}! I'd like to connect with you on ByAndSell.`
      })
      
      toast.success(`Connection request sent to ${username}!`)
      
      // Reload data to get updated status
      await loadConnectionsData()
    } catch (error) {
      console.error('❌ Connection request failed:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      
      if (errorMessage.includes('already exists') || errorMessage.includes('already connected')) {
        toast.info(`Already connected with ${username}!`)
        await loadConnectionsData() // Refresh to get correct status
      } else if (errorMessage.includes('Cannot send connection request to yourself')) {
        toast.error('Cannot connect to yourself!')
      } else {
        toast.error(`Failed to connect: ${errorMessage}`)
      }
    }
  }

  // Start chat with connected user
  const startChat = (userId, username) => {
    navigate(`/messages/${userId}`)
    toast.success(`Opening chat with ${username}`)
  }

  // Disconnect from connected user
  const disconnectUser = async (userId, username) => {
    try {
      // Find the connection to delete
      const connection = connections.find(conn => 
        (conn.requester?.id === userId || conn.receiver?.id === userId)
      )
      
      if (!connection) {
        toast.error('Connection not found')
        return
      }

      // Delete the connection
      await connectionsAPI.removeConnection(connection.id)
      
      toast.success(`Disconnected from ${username}`)
      
      // Reload data to update UI
      loadConnectionsData()
    } catch (error) {
      console.error('Failed to disconnect:', error)
      toast.error('Failed to disconnect')
    }
  }

  // Check user connection status - THE MOST IMPORTANT FUNCTION
  const getUserConnectionStatus = (userId) => {
    if (!userId) return 'not_connected'
    
    console.log('🔍 Checking status for user:', userId)
    console.log('📊 Current data:', {
      connections: connections.length,
      pending: pendingRequests.length,
      sent: sentRequests.length
    })
    
    // Don't allow connecting to yourself
    if (userId === user?.id) {
      console.log('🚫 Cannot connect to yourself')
      return 'self'
    }
    
    // Check if already connected (accepted status)
    const connectedConnection = connections.find(conn => {
      const isMatch = (conn.requester?.id === userId || conn.receiver?.id === userId)
      const isAccepted = conn.status === 'accepted'
      console.log('Connection check:', { 
        connId: conn.id, 
        requester: conn.requester?.id, 
        receiver: conn.receiver?.id, 
        status: conn.status, 
        userId, 
        isMatch, 
        isAccepted 
      })
      return isMatch && isAccepted
    })
    
    if (connectedConnection) {
      console.log('✅ User is connected via connection:', connectedConnection.id)
      return 'connected'
    }

    // Check if request already sent by me (pending status)
    const sentRequest = sentRequests.find(req => {
      const isMatch = req.receiver?.id === userId
      const isPending = req.status === 'pending'
      console.log('Sent request check:', { 
        reqId: req.id, 
        receiver: req.receiver?.id, 
        status: req.status, 
        userId, 
        isMatch, 
        isPending 
      })
      return isMatch && isPending
    })
    
    if (sentRequest) {
      console.log('📤 Request sent to user via request:', sentRequest.id)
      return 'pending'
    }

    // Check if request received from them (pending status)
    const receivedRequest = pendingRequests.find(req => {
      const isMatch = req.requester?.id === userId
      const isPending = req.status === 'pending'
      console.log('Received request check:', { 
        reqId: req.id, 
        requester: req.requester?.id, 
        status: req.status, 
        userId, 
        isMatch, 
        isPending 
      })
      return isMatch && isPending
    })
    
    if (receivedRequest) {
      console.log('📥 Request received from user via request:', receivedRequest.id)
      return 'received'
    }

    console.log('🆕 No connection with user')
    return 'not_connected'
  }

  // Respond to connection request
  const respondToConnectionRequest = async (connectionId, action, requester) => {
    try {
      await connectionsAPI.respondToConnectionRequest(connectionId, { action })
      
      if (action === 'accept') {
        toast.success(`Connection request from ${requester} accepted!`)
      } else {
        toast.info(`Connection request from ${requester} declined`)
      }
      
      loadConnectionsData()
    } catch (error) {
      console.error('Failed to respond to connection request:', error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading connections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
        <p className="text-gray-600 mt-2">Manage your professional network</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'discover', label: 'Discover People', icon: Users, count: suggestedUsers.length },
          { id: 'connections', label: 'My Connections', icon: UserCheck, count: connections.length },
          { id: 'pending', label: 'Pending Requests', icon: UserPlus, count: pendingRequests.length },
          { id: 'sent', label: 'Sent Requests', icon: Star, count: sentRequests.length },
          { id: 'realtime', label: 'Live Updates', icon: MessageCircle, count: 0 }
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
            {count > 0 && (
              <span className="ml-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border">
        {activeTab === 'discover' && (
          <DiscoverPeopleTab 
            suggestedUsers={suggestedUsers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            searching={searching}
            onConnect={sendConnectionRequest}
            onChat={startChat}
            onDisconnect={disconnectUser}
            getUserStatus={getUserConnectionStatus}
            onRespond={respondToConnectionRequest}
            pendingRequests={pendingRequests}
            onRefresh={loadConnectionsData}
          />
        )}

        {activeTab === 'connections' && (
          <ConnectionsTab 
            connections={connections}
            onChat={startChat}
            onDisconnect={disconnectUser}
          />
        )}

        {activeTab === 'pending' && (
          <PendingRequestsTab 
            pendingRequests={pendingRequests}
            onRespond={respondToConnectionRequest}
            onRefresh={loadConnectionsData}
          />
        )}

        {activeTab === 'sent' && (
          <SentRequestsTab 
            sentRequests={sentRequests}
          />
        )}

        {activeTab === 'realtime' && (
          <div className="p-4">
            <RealTimeConnections />
          </div>
        )}
      </div>
    </div>
  )
}

// Smart UserCard Component with Connection Status
const UserCard = ({ user, onConnect, onChat, onDisconnect, getUserStatus, onRespond, pendingRequests }) => {
  const status = getUserStatus ? getUserStatus(user.id) : 'not_connected'
  
  console.log(`🔍 UserCard for ${user.username}:`)
  console.log('  - User ID:', user.id)
  console.log('  - Status:', status)
  console.log('  - getUserStatus function exists:', !!getUserStatus)
  
  const getButtonForStatus = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChat(user.id, user.username)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </button>
            <button
              onClick={() => onDisconnect(user.id, user.username)}
              className="px-3 py-2 bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 flex items-center gap-2"
            >
              <UserX className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        )
      
      case 'pending':
        return (
          <button
            disabled
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md cursor-not-allowed"
          >
            Request Sent
          </button>
        )
      
      case 'received':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Find the pending request for this user
                const request = pendingRequests?.find(req => req.requester?.id === user.id)
                if (request && onRespond) {
                  onRespond(request.id, 'accept', request.requester?.username)
                }
              }}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
            >
              <UserCheck className="h-4 w-4" />
              Accept
            </button>
            <button
              onClick={() => {
                // Find the pending request for this user
                const request = pendingRequests?.find(req => req.requester?.id === user.id)
                if (request && onRespond) {
                  onRespond(request.id, 'reject', request.requester?.username)
                }
              }}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1"
            >
              <UserX className="h-4 w-4" />
              Decline
            </button>
          </div>
        )
      
      case 'self':
        return (
          <button
            disabled
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md cursor-not-allowed"
          >
            That's You!
          </button>
        )
      
      default:
        // Special case: Reviewers can chat with anyone without connection
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (currentUser.role === 'reviewer') {
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChat(user.id, user.username)}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </button>
              <button
                onClick={() => onConnect(user.id, user.username)}
                className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Connect
              </button>
            </div>
          )
        }
        
        // Normal users need to connect first
        return (
          <button
            onClick={() => onConnect(user.id, user.username)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Connect
          </button>
        )
    }
  }

  return (
    <div className="p-4 border-b border-gray-200 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            status === 'connected' ? 'bg-green-600' : 'bg-primary-600'
          }`}>
            <span className="text-white font-medium">
              {user.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">{user.username}</h3>
              {status === 'connected' && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Connected
                </span>
              )}
              {status === 'pending' && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Pending
                </span>
              )}
              {status === 'received' && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Respond
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 capitalize">{user.role}</p>
            {user.profile?.bio && (
              <p className="text-xs text-gray-500 mt-1">{user.profile.bio}</p>
            )}
          </div>
        </div>
        
        {getButtonForStatus()}
      </div>
    </div>
  )
}

// Tab Components
const DiscoverPeopleTab = ({ suggestedUsers, searchTerm, setSearchTerm, searchResults, searching, onConnect, onChat, onDisconnect, getUserStatus, onRespond, pendingRequests }) => (
  <div>
    <div className="p-4 border-b border-gray-200">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search for people..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        {searching && <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>}
      </div>
    </div>
    
    <div className="max-h-96 overflow-y-auto">
      {(searchTerm ? searchResults : suggestedUsers).map((user) => (
        <UserCard 
          key={user.id} 
          user={user} 
          onConnect={onConnect}
          onChat={onChat}
          onDisconnect={onDisconnect}
          getUserStatus={getUserStatus}
          onRespond={onRespond}
          pendingRequests={pendingRequests}
        />
      ))}
      
      {(searchTerm ? searchResults : suggestedUsers).length === 0 && (
        <div className="p-8 text-center text-gray-600">
          {searchTerm ? 'No users found' : 'No suggested users available'}
        </div>
      )}
    </div>
  </div>
)

const ConnectionsTab = ({ connections, onChat, onDisconnect }) => (
  <div className="p-4">
    <h3 className="font-medium mb-4">My Connections ({connections.length})</h3>
    {connections.length === 0 ? (
      <p className="text-gray-600 text-center py-8">No connections yet</p>
    ) : (
      <div className="space-y-4">
        {connections.map((conn) => {
          const connectedUser = conn.requester?.id === conn.requesterId ? conn.receiver : conn.requester
          return (
            <div key={conn.id} className="flex items-center justify-between p-4 border rounded hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{connectedUser?.username?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{connectedUser?.username}</p>
                  <p className="text-sm text-gray-600 capitalize">{connectedUser?.role || 'User'}</p>
                  <p className="text-xs text-gray-500">
                    Connected on {new Date(conn.updatedAt || conn.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onChat(connectedUser?.id, connectedUser?.username)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </button>
                <button 
                  onClick={() => onDisconnect(connectedUser?.id, connectedUser?.username)}
                  className="px-3 py-2 bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 flex items-center gap-2"
                >
                  <UserX className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>
    )}
  </div>
)

const PendingRequestsTab = ({ pendingRequests, onRespond }) => (
  <div className="p-4">
    <h3 className="font-medium mb-4">Pending Requests ({pendingRequests.length})</h3>
    {pendingRequests.length === 0 ? (
      <p className="text-gray-600 text-center py-8">No pending requests</p>
    ) : (
      <div className="space-y-4">
        {pendingRequests.map((request) => (
          <div key={request.id} className="flex items-center justify-between p-4 border rounded">
            <div>
              <p className="font-medium">{request.requester?.username}</p>
              {request.message && <p className="text-sm text-gray-600">"{request.message}"</p>}
            </div>
            <div className="space-x-2">
              <button 
                onClick={() => onRespond(request.id, 'accept', request.requester?.username)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
              >
                Accept
              </button>
              <button 
                onClick={() => onRespond(request.id, 'reject', request.requester?.username)}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)

const SentRequestsTab = ({ sentRequests }) => (
  <div className="p-4">
    <h3 className="font-medium mb-4">Sent Requests ({sentRequests.length})</h3>
    {sentRequests.length === 0 ? (
      <p className="text-gray-600 text-center py-8">No sent requests</p>
    ) : (
      <div className="space-y-4">
        {sentRequests.map((request) => (
          <div key={request.id} className="flex items-center justify-between p-4 border rounded">
            <p className="font-medium">{request.receiver?.username}</p>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
              {request.status}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
)

export default ConnectionsPage
