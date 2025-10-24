import React from 'react'
import { Routes, Route } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

const AdminDashboard = () => {
  const { user } = useAuthStore()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/posts" element={<AdminPosts />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
      </Routes>
    </div>
  )
}

const AdminHome = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
    
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
        <p className="text-3xl font-bold text-primary-600">1,234</p>
      </div>
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900">Total Posts</h3>
        <p className="text-3xl font-bold text-green-600">567</p>
      </div>
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900">Connections</h3>
        <p className="text-3xl font-bold text-purple-600">890</p>
      </div>
    </div>
  </div>
)

const AdminUsers = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>
    <div className="card">
      <p className="text-gray-600">User management interface coming soon!</p>
    </div>
  </div>
)

const AdminPosts = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Post Management</h1>
    <div className="card">
      <p className="text-gray-600">Post moderation interface coming soon!</p>
    </div>
  </div>
)

const AdminAnalytics = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
    <div className="card">
      <p className="text-gray-600">Analytics dashboard coming soon!</p>
    </div>
  </div>
)

export default AdminDashboard
