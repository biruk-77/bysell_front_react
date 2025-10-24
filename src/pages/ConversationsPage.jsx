import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Users, Search, Plus } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import socketService from '../lib/socket'
import { messagesAPI, connectionsAPI } from '../lib/api'
import toast from 'react-hot-toast'

const ConversationsPage = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
    setupSocketListeners()

    return () => {
      cleanupSocketListeners()
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load conversations and connections in parallel
      const [conversationsRes, connectionsRes] = await Promise.all([
        messagesAPI.getConversations({ limit: 50 }),
        connectionsAPI.getMyConnections({ limit: 50 })
      ])

      setConversations(conversationsRes.data.conversations || [])
      setConnections(connectionsRes.data.connections || [])
    } catch (error) {
      console.error('Failed to load conversations:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const setupSocketListeners = () => {
    // Listen for new messages to update conversation list
    socketService.addEventListener('new_message', handleNewMessage)
    socketService.addEventListener('message_notification', handleMessageNotification)
  }

  const cleanupSocketListeners = () => {
    socketService.removeEventListener('new_message', handleNewMessage)
    socketService.removeEventListener('message_notification', handleMessageNotification)
  }

  const handleNewMessage = (messageData) => {
    // Update the conversation list with the latest message
    setConversations(prev => {
      const updated = [...prev]
      const conversationIndex = updated.findIndex(conv => 
        conv.otherUser.id === messageData.senderId || conv.otherUser.id === messageData.receiverId
      )
      
      if (conversationIndex >= 0) {
        // Move conversation to top and update latest message
        const conversation = { ...updated[conversationIndex] }
        conversation.latestMessage = messageData
        conversation.updatedAt = messageData.createdAt
        
        updated.splice(conversationIndex, 1)
        updated.unshift(conversation)
      }
      
      return updated
    })
  }

  const handleMessageNotification = (data) => {
    // Handle additional message notifications if needed
    console.log('Message notification in conversations:', data)
  }

  const startConversation = (userId, username) => {
    navigate(`/messages/${userId}`)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredConnections = connections.filter(conn => {
    const otherUser = conn.requester?.id === user.id ? conn.receiver : conn.requester
    return otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">Connect and chat with your network</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Conversations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Recent Conversations ({filteredConversations.length})
            </h2>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-600">Start chatting with your connections!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => startConversation(conversation.otherUser.id, conversation.otherUser.username)}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {conversation.otherUser?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.otherUser?.username}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {conversation.latestMessage && 
                              new Date(conversation.latestMessage.createdAt).toLocaleDateString()
                            }
                          </span>
                        </div>
                        
                        {conversation.latestMessage && (
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.latestMessage.senderId === user.id ? 'You: ' : ''}
                            {conversation.latestMessage.content}
                          </p>
                        )}
                        
                        {conversation.unreadCount > 0 && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
                              {conversation.unreadCount} new
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Your Connections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Your Connections ({filteredConnections.length})
            </h2>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredConnections.length === 0 ? (
              <div className="p-6 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
                <p className="text-gray-600">
                  <button
                    onClick={() => navigate('/connections')}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Build your network
                  </button>
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConnections.map((connection) => {
                  const otherUser = connection.requester?.id === user.id 
                    ? connection.receiver 
                    : connection.requester

                  return (
                    <div key={connection.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {otherUser?.username?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {otherUser?.username}
                          </h3>
                          <p className="text-sm text-gray-600">{otherUser?.email}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => startConversation(otherUser.id, otherUser.username)}
                        className="inline-flex items-center px-3 py-2 border border-primary-300 rounded-md text-sm font-medium text-primary-700 bg-white hover:bg-primary-50"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time connection status */}
      {socketService.isConnected() && (
        <div className="mt-6 text-center">
          <span className="inline-flex items-center text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Real-time messaging active
          </span>
        </div>
      )}
    </div>
  )
}

export default ConversationsPage
