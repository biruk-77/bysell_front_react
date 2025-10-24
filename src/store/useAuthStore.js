import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../lib/api'
import socketService from '../lib/socket'
import toast from 'react-hot-toast'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Login function
      login: async (credentials) => {
        try {
          console.log('🔄 Starting login with credentials:', credentials)
          set({ isLoading: true, error: null })
          
          const response = await authAPI.login(credentials)
          console.log('📥 Login API response:', response)
          const { token, user } = response.data
          
          // Store in localStorage
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          
          // Update store
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          // Connect to socket
          socketService.connect(token)
          
          toast.success(`Welcome back, ${user.username}!`)
          return { success: true, user }
          
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed'
          set({ 
            error: message, 
            isLoading: false 
          })
          return { success: false, message }
        }
      },

      // Register function
      register: async (userData) => {
        try {
          console.log('🔄 Starting registration with data:', userData)
          set({ isLoading: true, error: null })
          
          const response = await authAPI.register(userData)
          const { token, user } = response.data
          
          // Store in localStorage
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          
          // Update store
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          // Connect to socket
          socketService.connect(token)
          
          toast.success(`Welcome to ByAndSell, ${user.username}!`)
          return { success: true, user }
          
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed'
          set({ 
            error: message, 
            isLoading: false 
          })
          return { success: false, message }
        }
      },

      // Logout function
      logout: async () => {
        try {
          // Disconnect socket
          socketService.disconnect()
          
          // Clear localStorage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          
          // Clear store
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            error: null 
          })
          
          toast.success('Logged out successfully')
          
        } catch (error) {
          console.error('Logout error:', error)
        }
      },

      // Check authentication status
      checkAuth: async () => {
        try {
          const token = localStorage.getItem('token')
          const userStr = localStorage.getItem('user')
          
          if (!token || !userStr) {
            set({ isAuthenticated: false })
            return false
          }
          
          const user = JSON.parse(userStr)
          
          // Verify token with server
          const response = await authAPI.me()
          const serverUser = response.data.user
          
          // Update store
          set({ 
            user: serverUser, 
            token, 
            isAuthenticated: true 
          })
          
          // Connect to socket
          socketService.connect(token)
          
          return true
          
        } catch (error) {
          // Token is invalid
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          })
          return false
        }
      },

      // Update user profile
      updateUser: (updatedUser) => {
        const currentUser = get().user
        const newUser = { ...currentUser, ...updatedUser }
        
        localStorage.setItem('user', JSON.stringify(newUser))
        set({ user: newUser })
      },

      // Update account information
      updateAccount: async (accountData) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await authAPI.updateAccount(accountData)
          const updatedUser = response.data.user
          
          // Update localStorage and store
          localStorage.setItem('user', JSON.stringify(updatedUser))
          set({ 
            user: updatedUser, 
            isLoading: false 
          })
          
          toast.success('Account updated successfully')
          return { success: true }
          
        } catch (error) {
          const message = error.response?.data?.message || 'Update failed'
          set({ 
            error: message, 
            isLoading: false 
          })
          return { success: false, message }
        }
      },

      // Change password
      changePassword: async (passwordData) => {
        try {
          set({ isLoading: true, error: null })
          
          await authAPI.updatePassword(passwordData)
          
          set({ isLoading: false })
          toast.success('Password updated successfully')
          return { success: true }
          
        } catch (error) {
          const message = error.response?.data?.message || 'Password change failed'
          set({ 
            error: message, 
            isLoading: false 
          })
          return { success: false, message }
        }
      },

      // Delete account
      deleteAccount: async (passwordData) => {
        try {
          set({ isLoading: true, error: null })
          
          await authAPI.deleteAccount(passwordData)
          
          // Logout after deletion
          get().logout()
          
          toast.success('Account deleted successfully')
          return { success: true }
          
        } catch (error) {
          const message = error.response?.data?.message || 'Account deletion failed'
          set({ 
            error: message, 
            isLoading: false 
          })
          return { success: false, message }
        }
      },

      // Helper getters
      getUser: () => get().user,
      getToken: () => get().token,
      isAdmin: () => get().user?.role === 'admin',
      hasRole: (role) => get().user?.role === role,
      hasAnyRole: (roles) => roles.includes(get().user?.role),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
