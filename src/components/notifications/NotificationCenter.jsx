import React, { useState, useEffect } from 'react'
import { Bell, X, Check, Users, MessageCircle, User } from 'lucide-react'
import socketService from '../../lib/socket'
import useAuthStore from '../../store/useAuthStore'
import toast from 'react-hot-toast'

const NotificationCenter = () => {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      setupSocketListeners()
    }

    return () => {
      cleanupSocketListeners()
    }
  }, [user])

  const setupSocketListeners = () => {
    // Connection requests
    socketService.addEventListener('connection_request_received', handleConnectionRequest)
    socketService.addEventListener('connection_request_responded', handleConnectionResponse)
    
    // Messages
    socketService.addEventListener('new_message', handleNewMessage)
    socketService.addEventListener('message_notification', handleMessageNotification)
    
    // User presence
    socketService.addEventListener('user_online', handleUserOnline)
    socketService.addEventListener('user_offline', handleUserOffline)
  }

  const cleanupSocketListeners = () => {
    socketService.removeEventListener('connection_request_received', handleConnectionRequest)
    socketService.removeEventListener('connection_request_responded', handleConnectionResponse)
    socketService.removeEventListener('new_message', handleNewMessage)
    socketService.removeEventListener('message_notification', handleMessageNotification)
    socketService.removeEventListener('user_online', handleUserOnline)
    socketService.removeEventListener('user_offline', handleUserOffline)
  }

  const handleConnectionRequest = (data) => {
    const notification = {
      id: `conn-req-${data.connection.id}`,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${data.connection.requester.username} wants to connect with you`,
      timestamp: new Date(),
      read: false,
      data: data.connection
    }
    
    addNotification(notification)
  }

  const handleConnectionResponse = (data) => {
    const action = data.action === 'accept' ? 'accepted' : 'rejected'
    const notification = {
      id: `conn-resp-${data.connection.id}`,
      type: 'connection_response',
      title: 'Connection Update',
      message: `${data.connection.receiver.username} ${action} your connection request`,
      timestamp: new Date(),
      read: false,
      data: data.connection
    }
    
    addNotification(notification)
  }

  const handleNewMessage = (data) => {
    // Only show notification if not from current user
    if (data.senderId !== user.id) {
      const notification = {
        id: `msg-${data.id || Date.now()}`,
        type: 'new_message',
        title: 'New Message',
        message: `${data.senderUsername}: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`,
        timestamp: new Date(),
        read: false,
        data: data
      }
      
      addNotification(notification)
    }
  }

  const handleMessageNotification = (data) => {
    // Additional message notification handling if needed
    console.log('Message notification:', data)
  }

  const handleUserOnline = (data) => {
    const notification = {
      id: `online-${data.userId}`,
      type: 'user_online',
      title: 'User Online',
      message: `${data.username} is now online`,
      timestamp: new Date(),
      read: false,
      data: data,
      autoRemove: true // Auto-remove after 3 seconds
    }
    
    addNotification(notification)
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeNotification(notification.id)
    }, 3000)
  }

  const handleUserOffline = (data) => {
    const notification = {
      id: `offline-${data.userId}`,
      type: 'user_offline',
      title: 'User Offline',
      message: `${data.username} went offline`,
      timestamp: new Date(),
      read: false,
      data: data,
      autoRemove: true
    }
    
    addNotification(notification)
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeNotification(notification.id)
    }, 3000)
  }

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep max 50
    setUnreadCount(prev => prev + 1)
  }

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request':
      case 'connection_response':
        return Users
      case 'new_message':
        return MessageCircle
      case 'user_online':
      case 'user_offline':
        return User
      default:
        return Bell
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'connection_request':
        return 'text-blue-600'
      case 'connection_response':
        return 'text-green-600'
      case 'new_message':
        return 'text-purple-600'
      case 'user_online':
        return 'text-green-500'
      case 'user_offline':
        return 'text-gray-500'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 top-12 z-20 w-96 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({unreadCount} new)
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    const iconColor = getNotificationColor(notification.type)
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full bg-gray-100 ${iconColor}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeNotification(notification.id)
                                }}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <div className="flex items-center justify-center text-xs text-gray-500">
                {socketService.isConnected() ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Real-time notifications active
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Notifications offline
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationCenter
