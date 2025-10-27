import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Shield, Lock, User, AlertCircle } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'
import toast from 'react-hot-toast'

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already authenticated as admin
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  // Redirect if authenticated as regular user
  if (isAuthenticated && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login({ username, password })

      if (result.success) {
        // Check if user is admin
        if (result.user.role !== 'admin') {
          setError('Access denied. Admin credentials required.')
          toast.error('Access denied. Admin credentials required.', { duration: 4000 })
          // Logout non-admin user
          useAuthStore.getState().logout()
          setLoading(false)
          return
        }

        toast.success(`Welcome, Admin ${result.user.username}!`, { duration: 3000 })
        navigate('/admin/dashboard', { replace: true })
      } else {
        setError(result.message || 'Invalid admin credentials')
        toast.error(result.message || 'Login failed', { duration: 4000 })
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      setError(msg)
      toast.error(msg, { duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Shield Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/50 transform hover:scale-105 transition-transform">
            <Shield className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-400 font-medium">
            Ethio Connect Control Center
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Admin Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3.5 rounded-xl font-bold text-lg hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Access Admin Panel'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-700/50 text-center">
            <p className="text-gray-400 text-sm">
              Not an admin?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                User Login
              </button>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            🔒 Secure connection · All activity is logged
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
