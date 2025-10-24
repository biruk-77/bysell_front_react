import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'
import useSocket from './lib/useSocket'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Dashboard Pages
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/profile/ProfilePage'

// Posts Pages
import PostsPage from './pages/PostsPage'

// Search Pages  
import SearchPage from './pages/SearchPage'

import ConnectionsPage from './pages/ConnectionsPage'

// Messages Pages
import ConversationsPage from './pages/ConversationsPage'
import MessagingPage from './pages/MessagingPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'

// Other Pages
import NotFoundPage from './pages/NotFoundPage'

function App() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore()
  
  // Initialize Socket.io connection for real-time features
  const { isConnected, onlineUsers } = useSocket()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Main Dashboard */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Profile */}
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* Posts */}
                  <Route path="/posts" element={<PostsPage />} />

                  {/* Search */}
                  <Route path="/search" element={<SearchPage />} />

                  {/* Connections */}
                  <Route path="/connections" element={<ConnectionsPage />} />

                  {/* Messages */}
                  <Route path="/messages" element={<ConversationsPage />} />
                  <Route path="/messages/:userId" element={<MessagingPage />} />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 */}
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
