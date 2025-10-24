import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PlusIcon,
  BellIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { MessageCircle, Users } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { postsAPI, connectionsAPI, messagesAPI } from '../lib/api'
import socketService from '../lib/socket'
import toast from 'react-hot-toast'

const FunctionalDashboard = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  // State for all dashboard data
  const [dashboardData, setDashboardData] = useState({
    myPosts: [],
    connections: [],
    pendingRequests: [],
    recentMessages: [],
    stats: {
      activePosts: 0,
      totalConnections: 0,
      pendingRequests: 0,
      unreadMessages: 0
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboardData()
    setupSocketListeners()

    return () => {
      cleanupSocketListeners()
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load all dashboard data in parallel
      const [postsRes, connectionsRes, pendingRes, messagesRes] = await Promise.all([
        postsAPI.getMyPosts({ limit: 10 }),
        connectionsAPI.getMyConnections({ limit: 20 }),
        connectionsAPI.getPendingRequests({ limit: 10 }),
        messagesAPI.getConversations({ limit: 10 })
      ])

      const posts = postsRes.data.posts || []
      const connections = connectionsRes.data.connections || []
      const pending = pendingRes.data.connections || []
      const messages = messagesRes.data.conversations || []

      setDashboardData({
        myPosts: posts,
        connections: connections,
        pendingRequests: pending,
        recentMessages: messages,
        stats: {
          activePosts: posts.length,
          totalConnections: connections.length,
          pendingRequests: pending.length,
          unreadMessages: messages.filter(m => m.unreadCount > 0).length
        }
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const setupSocketListeners = () => {
    socketService.addEventListener('connection_request_received', handleNewConnectionRequest)
    socketService.addEventListener('new_message', handleNewMessage)
  }

  const cleanupSocketListeners = () => {
    socketService.removeEventListener('connection_request_received', handleNewConnectionRequest)
    socketService.removeEventListener('new_message', handleNewMessage)
  }

  const handleNewConnectionRequest = (data) => {
    // Refresh pending requests
    loadDashboardData()
    toast.success(`New connection request from ${data.connection.requester.username}!`)
  }

  const handleNewMessage = (data) => {
    // Refresh message data
    loadDashboardData()
  }

  const respondToConnectionRequest = async (connectionId, action) => {
    try {
      await connectionsAPI.respondToConnection(connectionId, { action })
      loadDashboardData()
      toast.success(`Connection request ${action}ed!`)
    } catch (error) {
      console.error('Failed to respond to connection:', error)
      toast.error('Failed to respond to connection request')
    }
  }

  const startChat = (userId, username) => {
    navigate(`/messages/${userId}`)
    toast.success(`Starting chat with ${username}`)
  }

  const sendConnectionRequest = async (userId, username) => {
    try {
      await connectionsAPI.sendConnectionRequest({
        receiverId: userId,
        message: `Hi ${username}! I'd like to connect with you.`
      })
      toast.success('Connection request sent!')
    } catch (error) {
      console.error('Failed to send connection request:', error)
      toast.error('Failed to send connection request')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const stats = [
    { 
      name: 'Active Posts', 
      value: dashboardData.stats.activePosts, 
      icon: BriefcaseIcon, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      action: () => navigate('/posts?tab=my-posts')
    },
    { 
      name: 'Connections', 
      value: dashboardData.stats.totalConnections, 
      icon: UserGroupIcon, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      action: () => navigate('/connections')
    },
    { 
      name: 'Pending Requests', 
      value: dashboardData.stats.pendingRequests, 
      icon: BellIcon, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-50',
      action: () => navigate('/connections?tab=pending')
    },
    { 
      name: 'Unread Messages', 
      value: dashboardData.stats.unreadMessages, 
      icon: ChatBubbleLeftRightIcon, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50',
      action: () => navigate('/messages')
    }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'requests', label: 'Connection Requests' },
    { id: 'messages', label: 'Recent Messages' },
    { id: 'posts', label: 'My Posts' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="mt-2 text-gray-600 capitalize">
              {user?.role} Dashboard - Manage your network and opportunities
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => navigate('/posts')}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Post
            </button>
            <button 
              onClick={() => navigate('/connections')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              Find People
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <div 
            key={stat.name} 
            onClick={stat.action}
            className={`${stat.bgColor} rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-white">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {dashboardData.myPosts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <BriefcaseIcon className="h-5 w-5 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{post.title}</p>
                        <p className="text-xs text-gray-500">
                          Posted {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {dashboardData.connections.slice(0, 2).map((conn) => {
                    const otherUser = conn.requester?.id === user.id ? conn.receiver : conn.requester
                    return (
                      <div key={conn.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <UserGroupIcon className="h-5 w-5 text-green-600 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Connected with {otherUser?.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(conn.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => navigate('/posts')}
                    className="flex items-center p-4 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <BriefcaseIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-blue-900">Browse All Posts</p>
                      <p className="text-sm text-blue-600">Find opportunities and offers</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/messages')}
                    className="flex items-center p-4 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-900">View Messages</p>
                      <p className="text-sm text-green-600">Check your conversations</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/connections')}
                    className="flex items-center p-4 text-left bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <UserGroupIcon className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-purple-900">Manage Network</p>
                      <p className="text-sm text-purple-600">Connect with professionals</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Connection Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Pending Connection Requests ({dashboardData.pendingRequests.length})
              </h3>
              
              {dashboardData.pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.pendingRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {request.requester?.username?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {request.requester?.username}
                            </h4>
                            <p className="text-sm text-gray-600">{request.requester?.email}</p>
                            {request.message && (
                              <p className="text-sm text-gray-600 italic mt-1">
                                "{request.message}"
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => respondToConnectionRequest(request.id, 'accept')}
                            className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => respondToConnectionRequest(request.id, 'reject')}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Conversations ({dashboardData.recentMessages.length})
              </h3>
              
              {dashboardData.recentMessages.length === 0 ? (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No messages yet</p>
                  <button
                    onClick={() => navigate('/connections')}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Start Networking
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentMessages.map((conversation) => (
                    <div 
                      key={conversation.id} 
                      onClick={() => startChat(conversation.otherUser.id, conversation.otherUser.username)}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {conversation.otherUser?.username?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {conversation.otherUser?.username}
                            </h4>
                            {conversation.latestMessage && (
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.latestMessage.senderId === user.id ? 'You: ' : ''}
                                {conversation.latestMessage.content}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {conversation.latestMessage && 
                                new Date(conversation.latestMessage.createdAt).toLocaleDateString()
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {conversation.unreadCount > 0 && (
                            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                          <MessageCircle className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Posts Tab */}
          {activeTab === 'posts' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  My Posts ({dashboardData.myPosts.length})
                </h3>
                <button
                  onClick={() => navigate('/posts')}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create New Post
                </button>
              </div>
              
              {dashboardData.myPosts.length === 0 ? (
                <div className="text-center py-12">
                  <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No posts yet</p>
                  <button
                    onClick={() => navigate('/posts')}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Create Your First Post
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.myPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            post.postType === 'offer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {post.postType === 'offer' ? 'Offering' : 'Looking for'}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{post.category}</span>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-2">{post.title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        {post.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {post.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Real-time Status */}
      {socketService.isConnected() && (
        <div className="text-center mt-6">
          <span className="inline-flex items-center text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Real-time updates active
          </span>
        </div>
      )}
    </div>
  )
}

export default FunctionalDashboard
