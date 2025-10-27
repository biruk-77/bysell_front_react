import React, { useState } from 'react'
import { 
  MessageCircle, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle,
  Zap,
  Crown,
  Star,
  MoreVertical,
  User
} from 'lucide-react'
import MutualConnectionsBadge from './MutualConnectionsBadge'

const UserCard = ({ 
  user, 
  status, 
  onConnect, 
  onChat, 
  onDisconnect, 
  onAccept, 
  onReject,
  showActions = true,
  compact = false,
  mutualCount = 0,
  mutualNames = []
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            <span>Connected</span>
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </div>
        )
      case 'received':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <Zap className="h-3 w-3" />
            <span>Respond</span>
          </div>
        )
      default:
        return null
    }
  }

  const getRoleIcon = () => {
    switch (user.role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 'reviewer':
        return <Star className="h-4 w-4 text-purple-600" />
      default:
        return null
    }
  }

  const getDropdownItems = () => {
    const items = []

    switch (status) {
      case 'connected':
        items.push(
          {
            label: 'Chat',
            icon: MessageCircle,
            onClick: () => onChat(user.id, user.username),
            className: 'text-blue-600 hover:bg-blue-50'
          },
          {
            label: 'Disconnect',
            icon: UserX,
            onClick: () => onDisconnect(user.id, user.username),
            className: 'text-red-600 hover:bg-red-50'
          }
        )
        break
      
      case 'pending':
        items.push({
          label: 'Request Sent',
          icon: Clock,
          onClick: () => {},
          className: 'text-yellow-600 cursor-not-allowed opacity-50',
          disabled: true
        })
        break
      
      case 'received':
        items.push(
          {
            label: 'Accept',
            icon: UserCheck,
            onClick: () => onAccept(user.id, user.username),
            className: 'text-green-600 hover:bg-green-50'
          },
          {
            label: 'Decline',
            icon: UserX,
            onClick: () => onReject(user.id, user.username),
            className: 'text-red-600 hover:bg-red-50'
          }
        )
        break
      
      case 'self':
        items.push({
          label: 'That\'s You!',
          icon: User,
          onClick: () => {},
          className: 'text-gray-600 cursor-not-allowed opacity-50',
          disabled: true
        })
        break
      
      default:
        items.push({
          label: 'Connect',
          icon: UserPlus,
          onClick: () => onConnect(user),
          className: 'text-blue-600 hover:bg-blue-50'
        })
        
        if (user.role === 'reviewer') {
          items.unshift({
            label: 'Chat',
            icon: MessageCircle,
            onClick: () => onChat(user.id, user.username),
            className: 'text-purple-600 hover:bg-purple-50'
          })
        }
        break
    }

    return items
  }

  const getActionButtons = () => {
    if (!showActions) return null

    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onChat(user.id, user.username)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => onDisconnect(user.id, user.username)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Disconnect"
            >
              <UserX className="h-4 w-4" />
            </button>
          </div>
        )
      
      case 'pending':
        return (
          <button
            disabled
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg cursor-not-allowed font-medium"
          >
            Request Sent
          </button>
        )
      
      case 'received':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAccept(user.id, user.username)}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 font-medium"
            >
              <UserCheck className="h-4 w-4" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => onReject(user.id, user.username)}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 font-medium"
            >
              <UserX className="h-4 w-4" />
              <span>Decline</span>
            </button>
          </div>
        )
      
      case 'self':
        return (
          <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium">
            That's You! 👋
          </div>
        )
      
      default:
        // Special handling for reviewers
        if (user.role === 'reviewer') {
          return (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onChat(user.id, user.username)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => onConnect(user.id, user.username)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <UserPlus className="h-4 w-4" />
                <span>Connect</span>
              </button>
            </div>
          )
        }
        
        return (
          <button
            onClick={() => onConnect(user.id, user.username)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
          >
            <UserPlus className="h-4 w-4" />
            <span>Connect</span>
          </button>
        )
    }
  }

  const getAvatarColor = () => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600'
    ]
    const index = user.username?.charCodeAt(0) % colors.length || 0
    return colors[index]
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors relative">
        <div className={`h-10 w-10 bg-gradient-to-br ${getAvatarColor()} rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-semibold text-sm">
            {user.username?.[0]?.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900 truncate">{user.username}</p>
            {getRoleIcon()}
          </div>
          <p className="text-sm text-gray-600 capitalize">{user.role}</p>
        </div>
        {getStatusBadge()}
        
        {/* Single Connect Button */}
        {showActions && (
          <>
            {(status === 'not_connected' || !status || !['connected', 'pending', 'received', 'self'].includes(status)) && (
              <button
                onClick={() => onConnect(user)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium shadow-lg"
              >
                <UserPlus className="h-4 w-4" />
                <span>Connect</span>
              </button>
            )}
            
            {status === 'received' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onAccept(user.id, user.username)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 font-medium"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => onReject(user.id, user.username)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 font-medium"
                >
                  <UserX className="h-4 w-4" />
                  <span>Decline</span>
                </button>
              </div>
            )}
            
            {status === 'connected' && (
              <button
                onClick={() => onChat(user.id, user.username)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </button>
            )}
            
            {status === 'pending' && (
              <button
                onClick={() => onCancel && onCancel(user.connectionId, user.username)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <UserX className="h-4 w-4" />
                <span>Unrequest</span>
              </button>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 ${
        isHovered ? 'transform -translate-y-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className={`h-16 w-16 bg-gradient-to-br ${getAvatarColor()} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <span className="text-white font-bold text-xl">
              {user.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-lg">{user.username}</h3>
              {getRoleIcon()}
              {getStatusBadge()}
            </div>
            <p className="text-gray-600 capitalize mb-2">{user.role}</p>
            {user.profile?.bio && (
              <p className="text-sm text-gray-500 line-clamp-2">{user.profile.bio}</p>
            )}
            {user.profile?.location && (
              <p className="text-xs text-gray-400 mt-1">📍 {user.profile.location}</p>
            )}
            {/* PART 1: Display mutual connections */}
            {mutualCount > 0 && (
              <div className="mt-2">
                <MutualConnectionsBadge count={mutualCount} names={mutualNames} />
              </div>
            )}
          </div>
        </div>
        
        {/* Single Action Button for Grid View */}
        {showActions && (
          <>
            {(status === 'not_connected' || !status || !['connected', 'pending', 'received', 'self'].includes(status)) && (
              <button
                onClick={() => onConnect(user)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium shadow-lg"
              >
                <UserPlus className="h-4 w-4" />
                <span>Connect</span>
              </button>
            )}
            
            {status === 'received' && (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => onAccept(user.id, user.username)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 font-medium"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => onReject(user.id, user.username)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 font-medium"
                >
                  <UserX className="h-4 w-4" />
                  <span>Decline</span>
                </button>
              </div>
            )}
            
            {status === 'connected' && (
              <button
                onClick={() => onChat(user.id, user.username)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </button>
            )}
            
            {status === 'pending' && (
              <button
                onClick={() => onCancel && onCancel(user.connectionId, user.username)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <UserX className="h-4 w-4" />
                <span>Unrequest</span>
              </button>
            )}
          </>
        )}
      </div>
      
    </div>
  )
}

export default UserCard
