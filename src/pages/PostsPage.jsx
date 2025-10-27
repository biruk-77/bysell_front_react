import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MapPin, Calendar, DollarSign, Users, Edit, Trash2, Eye, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import { postsAPI, connectionsAPI } from '../lib/api'
import toast from 'react-hot-toast'

const PostsPage = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('suggested') // Default to suggested
  const [posts, setPosts] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    postType: '',
    category: '',
    location: ''
  })

  // Get matching role for current user
  const getMatchingRole = () => {
    const role = user?.role?.toLowerCase()
    const roleMap = {
      'employer': 'employee',
      'employee': 'employer',
      'renter': 'tenant',
      'tenant': 'renter',
      'husband': 'wife',
      'wife': 'husband',
      'buyer': 'seller',
      'seller': 'buyer',
      'service_provider': 'customer',
      'customer': 'service_provider'
    }
    return roleMap[role] || null
  }

  // Get category for role
  const getCategoryForRole = (role) => {
    if (['employer', 'employee'].includes(role)) return 'employment'
    if (['renter', 'tenant'].includes(role)) return 'rental'
    if (['husband', 'wife'].includes(role)) return 'matchmaking'
    if (['buyer', 'seller'].includes(role)) return 'marketplace'
    if (['service_provider', 'customer'].includes(role)) return 'services'
    return null
  }

  useEffect(() => {
    loadPosts()
  }, [activeTab, filters, showAllCategories])

  const loadPosts = async () => {
    try {
      setLoading(true)
      
      // Load connections first to know which users we can chat with
      const connectionsRes = await connectionsAPI.getMyConnections({ limit: 100 })
      setConnections(connectionsRes.data.connections || [])
      
      if (activeTab === 'suggested') {
        // Load posts from matching role
        const matchingRole = getMatchingRole()
        const response = await postsAPI.getAllPosts({
          page: 1,
          limit: 20,
          role: matchingRole, // Filter by matching role
          ...filters
        })
        setPosts(response.data.posts || [])
      } else if (activeTab === 'all') {
        const response = await postsAPI.getAllPosts({
          page: 1,
          limit: 20,
          ...filters
        })
        setPosts(response.data.posts || [])
      } else if (activeTab === 'my-posts') {
        const response = await postsAPI.getMyPosts({
          page: 1,
          limit: 20
        })
        setMyPosts(response.data.posts || [])
      }
    } catch (error) {
      console.error('Failed to load posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (postData) => {
    try {
      const response = await postsAPI.createPost(postData)
      toast.success('Post created successfully!')
      setShowCreateModal(false)
      loadPosts()
    } catch (error) {
      console.error('Failed to create post:', error)
      toast.error('Failed to create post')
    }
  }

  const handleUpdatePost = async (postId, postData) => {
    try {
      await postsAPI.updatePost(postId, postData)
      toast.success('Post updated successfully!')
      setEditingPost(null)
      loadPosts()
    } catch (error) {
      console.error('Failed to update post:', error)
      toast.error('Failed to update post')
    }
  }

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.deletePost(postId)
        toast.success('Post deleted successfully!')
        loadPosts()
      } catch (error) {
        console.error('Failed to delete post:', error)
        toast.error('Failed to delete post')
      }
    }
  }

  const sendConnectionRequest = async (userId, username) => {
    try {
      await connectionsAPI.sendConnectionRequest({
        receiverId: userId,
        message: `Hi ${username}! I'm interested in your post and would like to connect.`
      })
      toast.success('Connection request sent!')
    } catch (error) {
      console.error('Failed to send connection request:', error)
      toast.error('Failed to send connection request')
    }
  }

  const startChat = (userId, username) => {
    navigate(`/messages/${userId}`)
    toast.success(`Starting conversation with ${username}`)
  }

  const isConnectedTo = (userId) => {
    return connections.some(conn => 
      (conn.requester?.id === userId && conn.receiver?.id === user.id) ||
      (conn.receiver?.id === userId && conn.requester?.id === user.id)
    )
  }

  const matchingRole = getMatchingRole()
  const userCategory = getCategoryForRole(user?.role?.toLowerCase())

  const tabs = [
    { id: 'suggested', label: `For You ${matchingRole ? `(${matchingRole.charAt(0).toUpperCase() + matchingRole.slice(1)})` : ''}`, icon: Users },
    { id: 'all', label: 'Browse All', icon: Eye },
    { id: 'my-posts', label: 'My Posts', icon: Edit }
  ]

  const categories = [
    { value: 'employment', label: '👔 Employment' },
    { value: 'rental', label: '🏠 Rental' },
    { value: 'matchmaking', label: '💕 Matchmaking' },
    { value: 'marketplace', label: '🛒 Marketplace' },
    { value: 'services', label: '🔧 Services' }
  ]

  const postTypes = [
    { value: 'offer', label: 'Offering' },
    { value: 'request', label: 'Looking for' }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {activeTab === 'suggested' && matchingRole 
              ? `${matchingRole.charAt(0).toUpperCase() + matchingRole.slice(1)} Posts For You`
              : activeTab === 'all' 
                ? 'Browse All Posts' 
                : 'My Posts & Listings'}
          </h1>
          <p className="text-gray-600 mt-2">
            {activeTab === 'suggested' && matchingRole
              ? `Connect with ${matchingRole}s in your network`
              : 'Discover opportunities and share what you offer'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Suggested Banner */}
      {activeTab === 'suggested' && matchingRole && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                🎯 Showing {matchingRole.charAt(0).toUpperCase() + matchingRole.slice(1)} Posts
              </h3>
              <p className="text-gray-700">
                These posts are from <span className="font-bold">{matchingRole}s</span> that match your <span className="font-bold">{user?.role}</span> profile. 
                Want to explore other categories? Switch to <button onClick={() => setActiveTab('all')} className="text-purple-600 font-bold underline hover:text-purple-700">Browse All</button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {(activeTab === 'all' || activeTab === 'suggested') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filters.postType}
              onChange={(e) => setFilters(prev => ({ ...prev, postType: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {postTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Posts Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {(activeTab === 'my-posts' ? myPosts : posts).length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab === 'suggested' 
                  ? `No ${matchingRole} posts yet`
                  : activeTab === 'my-posts'
                    ? 'No posts yet'
                    : 'No posts found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'suggested' 
                  ? `Be patient! ${matchingRole.charAt(0).toUpperCase() + matchingRole.slice(1)}s will start posting soon.`
                  : activeTab === 'my-posts'
                    ? 'Create your first post to get started!'
                    : 'Try adjusting your filters or search terms.'}
              </p>
              {activeTab === 'suggested' && (
                <button
                  onClick={() => setActiveTab('all')}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  Browse All Posts
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === 'my-posts' ? myPosts : posts).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isMyPost={post.userId === user.id}
                  isConnected={isConnectedTo(post.userId)}
                  onEdit={() => setEditingPost(post)}
                  onDelete={() => handleDeletePost(post.id)}
                  onConnect={() => sendConnectionRequest(post.userId, post.author?.username)}
                  onChat={() => startChat(post.userId, post.author?.username)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Post Modal */}
      {(showCreateModal || editingPost) && (
        <PostModal
          post={editingPost}
          onClose={() => {
            setShowCreateModal(false)
            setEditingPost(null)
          }}
          onSubmit={(data) => {
            if (editingPost) {
              handleUpdatePost(editingPost.id, data)
            } else {
              handleCreatePost(data)
            }
          }}
          categories={categories}
          postTypes={postTypes}
        />
      )}
    </div>
  )
}

const PostCard = ({ post, isMyPost, isConnected, onEdit, onDelete, onConnect, onChat }) => {
  const getTypeColor = (type) => {
    return type === 'offer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'job': return Users
      case 'service': return DollarSign
      case 'product': return DollarSign
      default: return Users
    }
  }

  const CategoryIcon = getCategoryIcon(post.category)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(post.postType)}`}>
            {post.postType === 'offer' ? 'Offering' : 'Looking for'}
          </span>
          <span className="inline-flex items-center text-xs text-gray-500">
            <CategoryIcon className="h-3 w-3 mr-1" />
            {post.category}
          </span>
        </div>
        {isMyPost && (
          <div className="flex space-x-1">
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-primary-600"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {post.title}
      </h3>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {post.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        {post.location && (
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {post.location}
          </div>
        )}
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {post.author?.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {post.author?.username || 'Unknown'}
          </span>
        </div>
        
        {!isMyPost && (
          <div className="flex space-x-2">
            {isConnected ? (
              <button
                onClick={onChat}
                className="text-xs px-3 py-1 bg-green-600 text-white rounded-full hover:bg-green-700 flex items-center"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Chat
              </button>
            ) : (
              <button
                onClick={onConnect}
                className="text-xs px-3 py-1 bg-primary-600 text-white rounded-full hover:bg-primary-700"
              >
                Connect
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const PostModal = ({ post, onClose, onSubmit, categories, postTypes }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    description: post?.description || '',
    postType: post?.postType || 'offer',
    category: post?.category || 'job',
    location: post?.location || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {post ? 'Edit Post' : 'Create New Post'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter a compelling title for your post"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe what you're offering or looking for..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  required
                  value={formData.postType}
                  onChange={(e) => setFormData(prev => ({ ...prev, postType: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {postTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="City, Country (optional)"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {post ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostsPage
