import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/useAuthStore'
import useSocket from './lib/useSocket'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Auth Pages
import CreativeLoginPage from './pages/auth/CreativeLoginPage'
import ModernRegisterPage from './pages/auth/ModernRegisterPage'

// Dashboard Pages
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/profile/ProfilePage'

// Main Pages
import PostsPage from './pages/PostsPage'
import SearchPage from './pages/SearchPage'
import ConnectionsPage from './pages/ConnectionsPage'
import ConnectionsPageNew from './pages/ConnectionsPageNew'
import ComprehensiveConnectionsPage from './pages/connections/ComprehensiveConnectionsPage'

// Messages Pages
import ConversationsPage from './pages/ConversationsPage'
import MessagingPage from './pages/MessagingPage'
import MessagesPage from './pages/MessagesPage'
import TestMessaging from './pages/TestMessaging'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLoginPage from './pages/admin/AdminLoginPage'

// Phone OTP Login
import PhoneLogin from './pages/PhoneLogin'

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
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <CreativeLoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <ModernRegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/phone-login"
          element={
            <PublicRoute>
              <PhoneLogin />
            </PublicRoute>
          }
        />

        {/* Admin Login Route (Separate from regular login) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Dashboard Route (No Layout) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
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
                  <Route path="/connections" element={<ConnectionsPageNew />} />
                  <Route path="/connections-old" element={<ConnectionsPage />} />
                  <Route path="/connections-test" element={<ComprehensiveConnectionsPage />} />

                  {/* Messages */}
                  <Route path="/messages" element={<ConversationsPage />} />
                  <Route path="/messages/:userId" element={<MessagingPage />} />
                  <Route path="/chat" element={<MessagesPage />} />
                  <Route path="/test-messaging" element={<TestMessaging />} />

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
