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
  ClockIcon,
  HomeIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  HeartIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { MessageCircle, Users, Briefcase, Home, ShoppingCart, Wrench, Heart, TrendingUp, Award, Target, Rocket, Building } from 'lucide-react'
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

  // ALL Connection Categories from SRS
  const allCategories = [
    {
      id: 'employment',
      name: 'Employer ↔️ Employee',
      employerDesc: 'Post jobs, find talent, manage hiring',
      employeeDesc: 'Browse jobs, apply, showcase your skills',
      icon: Briefcase,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      roles: ['employer', 'employee']
    },
    {
      id: 'rental',
      name: 'Renter ↔️ Tenant',
      renterDesc: 'List properties, find tenants, manage rentals',
      tenantDesc: 'Find housing, contact landlords, secure rentals',
      icon: Home,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      roles: ['renter', 'tenant']
    },
    {
      id: 'matchmaking',
      name: 'Husband ↔️ Wife',
      description: 'Social matchmaking & family connections',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700',
      roles: ['husband', 'wife']
    },
    {
      id: 'marketplace',
      name: 'Buyer ↔️ Seller',
      buyerDesc: 'Browse products, make purchases, negotiate deals',
      sellerDesc: 'List products, manage inventory, sell items',
      icon: ShoppingCart,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      roles: ['buyer', 'seller']
    },
    {
      id: 'services',
      name: 'Service Provider ↔️ Customer',
      providerDesc: 'Offer professional services, manage bookings',
      customerDesc: 'Find service providers, hire professionals',
      icon: Wrench,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      roles: ['service_provider', 'customer']
    }
  ]

  // Filter categories based on user role
  const getUserCategories = () => {
    const userRole = user?.role?.toLowerCase()
    
    // Admin sees all categories
    if (userRole === 'admin') {
      return allCategories.map(cat => ({
        ...cat,
        description: cat.description || `${cat.name} connections`
      }))
    }

    // Filter for user's role
    const relevantCategory = allCategories.find(cat => 
      cat.roles.includes(userRole)
    )

    if (!relevantCategory) {
      return [] // No category for this role
    }

    // Get the right description based on role
    let description = relevantCategory.description
    if (userRole === 'employer') description = relevantCategory.employerDesc
    if (userRole === 'employee') description = relevantCategory.employeeDesc
    if (userRole === 'renter') description = relevantCategory.renterDesc
    if (userRole === 'tenant') description = relevantCategory.tenantDesc
    if (userRole === 'buyer') description = relevantCategory.buyerDesc
    if (userRole === 'seller') description = relevantCategory.sellerDesc
    if (userRole === 'service_provider') description = relevantCategory.providerDesc
    if (userRole === 'customer') description = relevantCategory.customerDesc

    return [{
      ...relevantCategory,
      description
    }]
  }

  const connectionCategories = getUserCategories()

  // Dynamic tab label based on role
  const getCategoryTabLabel = () => {
    if (connectionCategories.length === 0) return 'Categories'
    if (connectionCategories.length > 1) return 'My Categories' // Admin
    return `My ${connectionCategories[0].id.charAt(0).toUpperCase() + connectionCategories[0].id.slice(1)}`
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'categories', label: getCategoryTabLabel() },
    { id: 'requests', label: 'Connection Requests' },
    { id: 'messages', label: 'Recent Messages' },
    { id: 'posts', label: 'My Posts' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Header with Gradient */}
      <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-2xl shadow-xl p-8 mb-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-white/90 text-lg font-semibold capitalize">
                {user?.role} Dashboard - Manage your network and opportunities
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate('/posts')}
                className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Post
              </button>
              <button 
                onClick={() => navigate('/connections')}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold hover:bg-white/30 transition-all"
              >
                <Users className="h-5 w-5 mr-2" />
                Find People
              </button>
            </div>
          </div>
          
          {/* Quick Category Access */}
          {connectionCategories.length > 0 && (
            <div className={`grid ${connectionCategories.length === 1 ? 'grid-cols-1' : `grid-cols-${Math.min(connectionCategories.length, 5)}`} gap-3 mt-6`}>
              {connectionCategories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => navigate(`/posts?category=${category.id}`)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all group"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                      <div>
                        <div className="text-sm font-bold text-white text-left">{category.name}</div>
                        <div className="text-xs text-white/80 text-left">{category.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - Enhanced Design */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={stat.name} 
            onClick={stat.action}
            className="group relative bg-white rounded-2xl p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200 transform hover:scale-105"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} strokeWidth={2.5} />
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">{stat.name}</p>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs - Modern Design */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
          <nav className="flex space-x-2 px-6 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-6 font-bold text-sm rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              {connectionCategories.length === 1 ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Your {connectionCategories[0].name} Dashboard
                  </h3>
                  <p className="text-gray-600 mb-8">
                    {connectionCategories[0].description}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Connection Categories</h3>
                  <p className="text-gray-600 mb-8">Choose how you want to connect and grow your network</p>
                </>
              )}
              
              <div className={`grid grid-cols-1 ${connectionCategories.length === 1 ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                {connectionCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <div
                      key={category.id}
                      onClick={() => navigate(`/posts?category=${category.id}`)}
                      className={`${category.bgColor} rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-gray-200`}
                    >
                      {/* Icon with gradient background */}
                      <div className="relative mb-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform`}>
                          <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                      
                      {/* Category name */}
                      <h4 className={`text-xl font-black ${category.textColor} mb-2`}>
                        {category.name}
                      </h4>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {category.description}
                      </p>
                      
                      {/* Action button */}
                      <button className={`w-full py-3 bg-white ${category.textColor} font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2`}>
                        <span>Explore</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
              
              {/* Info Section */}
              {connectionCategories.length > 0 && (
                <div className={`mt-12 bg-gradient-to-br ${connectionCategories[0].bgColor} rounded-2xl p-8 border-2 ${connectionCategories[0].textColor.replace('text-', 'border-')}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${connectionCategories[0].color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {React.createElement(connectionCategories[0].icon, { className: "w-6 h-6 text-white", strokeWidth: 2.5 })}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {connectionCategories.length === 1 
                          ? `🚀 Your ${connectionCategories[0].id.charAt(0).toUpperCase() + connectionCategories[0].id.slice(1)} Network` 
                          : '🚀 Multi-Category Networking Platform'}
                      </h4>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {connectionCategories.length === 1 
                          ? `Connect with others in the ${connectionCategories[0].name.toLowerCase()} category. Build your network, explore opportunities, and grow your connections!`
                          : 'Ethio Connect brings together 5 powerful connection categories in one unified platform. Whether you\'re hiring, renting, selling, or seeking services, we\'ve got you covered!'}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="text-center">
                          <div className={`text-3xl font-black ${connectionCategories[0].textColor}`}>280K+</div>
                          <div className="text-sm text-gray-600 font-semibold">Active Users</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black text-blue-600">50K+</div>
                          <div className="text-sm text-gray-600 font-semibold">Active Posts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black text-pink-600">4.9★</div>
                          <div className="text-sm text-gray-600 font-semibold">User Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black text-green-600">99.8%</div>
                          <div className="text-sm text-gray-600 font-semibold">Success Rate</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
