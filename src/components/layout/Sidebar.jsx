import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import useAuthStore from '../../store/useAuthStore'
import { clsx } from 'clsx'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuthStore()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['all'] },
    { name: 'Posts', href: '/posts', icon: BriefcaseIcon, roles: ['all'] },
    { name: 'Connections', href: '/connections', icon: UserGroupIcon, roles: ['all'] },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, roles: ['all'] },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon, roles: ['all'] },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon, roles: ['all'] },
    { name: 'Admin', href: '/admin', icon: ShieldCheckIcon, roles: ['admin'] },
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes('all') || item.roles.includes(user?.role)
  )

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-xl font-bold text-primary-600">ByAndSell</h1>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-x-3 p-3 bg-gray-50 rounded-lg">
        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
          <span className="text-sm font-medium text-white">
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.username}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {user?.role}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={clsx(
                      location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
                    )}
                  >
                    <item.icon
                      className={clsx(
                        location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                          ? 'text-primary-600'
                          : 'text-gray-400 group-hover:text-primary-600',
                        'h-6 w-6 shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
