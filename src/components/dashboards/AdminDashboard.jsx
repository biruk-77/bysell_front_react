import React from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

const AdminDashboard = () => {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard - Welcome, {user?.username}!
        </h1>
        <p className="mt-1 text-gray-600">
          System administration and user management.
        </p>
        <div className="mt-4 space-x-4">
          <Link to="/admin/users" className="btn-primary">
            Manage Users
          </Link>
          <Link to="/admin/posts" className="btn-secondary">
            Manage Posts
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
