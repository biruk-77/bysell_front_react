import React from 'react'
import { Link } from 'react-router-dom'
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import useAuthStore from '../../store/useAuthStore'

const EmployeeDashboard = () => {
  const { user } = useAuthStore()

  const stats = [
    { name: 'Applications Sent', value: '12', icon: BriefcaseIcon, color: 'text-blue-600' },
    { name: 'Connections', value: '34', icon: UserGroupIcon, color: 'text-green-600' },
    { name: 'Profile Views', value: '89', icon: ChartBarIcon, color: 'text-purple-600' },
  ]

  const recentJobs = [
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'Tech Corp',
      location: 'Remote',
      salary: '$80,000 - $120,000',
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Frontend Engineer',
      company: 'StartupXYZ',
      location: 'San Francisco, CA',
      salary: '$70,000 - $100,000',
      posted: '1 week ago'
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'InnovateLab',
      location: 'New York, NY',
      salary: '$75,000 - $110,000',
      posted: '3 days ago'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="mt-1 text-gray-600">
          Here's what's happening with your job search today.
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
            to="/posts?category=job&type=offer"
            className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <BriefcaseIcon className="h-6 w-6 text-blue-600 mr-3" />
            <span className="text-sm font-medium">Browse Jobs</span>
          </Link>
          
          <Link
            to="/posts/create"
            className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="h-6 w-6 text-green-600 mr-3" />
            <span className="text-sm font-medium">Post Request</span>
          </Link>
          
          <Link
            to="/connections"
            className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <UserGroupIcon className="h-6 w-6 text-purple-600 mr-3" />
            <span className="text-sm font-medium">My Network</span>
          </Link>
          
          <Link
            to="/profile"
            className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon className="h-6 w-6 text-orange-600 mr-3" />
            <span className="text-sm font-medium">Update Profile</span>
          </Link>
        </div>
      </div>

      {/* Recent Job Opportunities */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Recent Job Opportunities
          </h2>
          <Link
            to="/posts?category=job&type=offer"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentJobs.map((job) => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {job.company} • {job.location}
                  </p>
                  <p className="text-sm text-green-600 font-medium mt-1">
                    {job.salary}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">{job.posted}</span>
                  <button className="mt-2 btn-primary text-xs px-3 py-1">
                    Apply
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

export default EmployeeDashboard
