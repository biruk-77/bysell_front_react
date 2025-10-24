import axios from 'axios'
import toast from 'react-hot-toast'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('📡 Making API request:', config.method?.toUpperCase(), config.url)
    console.log('📤 Request data:', config.data)
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong'
    
    // Handle different error codes
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status === 403) {
      toast.error('Access denied. Insufficient permissions.')
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateAccount: (data) => api.put('/auth/account', data),
  updatePassword: (data) => api.put('/auth/password', data),
  deleteAccount: (data) => api.delete('/auth/account', { data }),
}

// Profile API calls
export const profileAPI = {
  getMyProfile: () => api.get('/profile/me'),
  createProfile: (formData) => api.post('/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProfile: (formData) => api.put('/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadProfileImage: (formData) => api.post('/profile/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Posts/Listings API calls
export const postsAPI = {
  getAllPosts: (params) => api.get('/posts', { params }),
  getPost: (postId) => api.get(`/posts/${postId}`),
  getMyPosts: (params) => api.get('/posts/my', { params }),
  createPost: (data) => api.post('/posts', data),
  updatePost: (postId, data) => api.put(`/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/posts/${postId}`)
}

// Connections API calls
export const connectionsAPI = {
  sendConnectionRequest: (data) => api.post('/connections/send', data),
  respondToConnectionRequest: (connectionId, data) => api.put(`/connections/${connectionId}/respond`, data),
  getMyConnections: (params) => api.get('/connections', { params }),
  getPendingRequests: (params) => api.get('/connections/pending', { params }),
  getSentRequests: (params) => api.get('/connections/sent', { params }),
  removeConnection: (connectionId) => api.delete(`/connections/${connectionId}`)
}

// Messages API calls
export const messagesAPI = {
  sendMessage: (data) => api.post('/messages/send', data),
  getConversations: (params) => api.get('/messages/conversations', { params }),
  getConversation: (userId, params) => api.get(`/messages/conversation/${userId}`, { params }),
  markMessagesAsRead: (userId) => api.put(`/messages/read/${userId}`),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`)
}

// Search API calls
export const searchAPI = {
  unifiedSearch: (params) => api.get('/search', { params }),
  searchUsers: (params) => api.get('/search/users', { params }),
  searchPosts: (params) => api.get('/search/posts', { params }),
  getDiscoveryFeed: (params) => api.get('/search/discover', { params }),
  getSuggestions: (params) => api.get('/search/suggestions', { params }),
}

// Notifications API calls
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
}

// Admin API calls
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserStats: () => api.get('/admin/stats'),
  updateUserRole: (userId, data) => api.put(`/admin/users/${userId}/role`, data),
  suspendUser: (userId, data) => api.put(`/admin/users/${userId}/suspend`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getPosts: (params) => api.get('/admin/posts', { params }),
  deletePost: (postId) => api.delete(`/admin/posts/${postId}`),
  sendAnnouncement: (data) => api.post('/admin/announcement', data),
}

export default api
