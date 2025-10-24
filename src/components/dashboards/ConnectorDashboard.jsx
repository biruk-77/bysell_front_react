import React from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

const ConnectorDashboard = () => {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.username}!
        </h1>
        <p className="mt-1 text-gray-600">
          Advanced networking and connection management.
        </p>
        <Link to="/connections" className="mt-4 btn-primary">
          Manage Network
        </Link>
      </div>
    </div>
  )
}

export default ConnectorDashboard
