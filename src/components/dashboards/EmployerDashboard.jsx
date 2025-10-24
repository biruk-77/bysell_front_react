import React from 'react'
import { Link } from 'react-router-dom'
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import useAuthStore from '../../store/useAuthStore'

const EmployerDashboard = () => {
  const { user } = useAuthStore()

  const stats = [
    { name: 'Active Job Posts', value: '8', icon: BriefcaseIcon, color: 'text-blue-600' },
    { name: 'Applications', value: '124', icon: UserGroupIcon, color: 'text-green-600' },
    { name: 'Profile Views', value: '342', icon: EyeIcon, color: 'text-purple-600' },
  ]

  const recentApplications = [
    {
      id: 1,
      name: 'John Smith',
      position: 'Senior React Developer',
      experience: '5 years',
      applied: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      position: 'Frontend Engineer', 
      experience: '3 years',
      applied: '5 hours ago',
      status: 'reviewed'
    },
    {
      id: 3,
      name: 'Mike Chen',
      position: 'Full Stack Developer',
      experience: '4 years',
      applied: '1 day ago',
      status: 'shortlisted'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'shortlisted': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="mt-1 text-gray-600">
          Manage your job postings and find the best candidates.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => (
          <div key={item.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className={`h-8 w-8 ${item.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {item.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/posts/create"
            className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="h-6 w-6 text-blue-600 mr-3" />
            <span className="text-sm font-medium">Post Job</span>
          </Link>
          
          <Link
            to="/posts?category=job&type=request"
            className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <BriefcaseIcon className="h-6 w-6 text-green-600 mr-3" />
            <span className="text-sm font-medium">Browse Requests</span>
          </Link>
          
          <Link
            to="/connections"
            className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <UserGroupIcon className="h-6 w-6 text-purple-600 mr-3" />
            <span className="text-sm font-medium">Find Talent</span>
          </Link>
          
          <Link
            to="/profile"
            className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon className="h-6 w-6 text-orange-600 mr-3" />
            <span className="text-sm font-medium">Analytics</span>
          </Link>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Recent Applications
          </h2>
          <Link
            to="/applications"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentApplications.map((application) => (
            <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {application.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Applied for: {application.position}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Experience: {application.experience}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 mb-2">{application.applied}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                  <button className="mt-2 btn-primary text-xs px-3 py-1">
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmployerDashboard
