import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Send, Phone, Video, MoreVertical, ArrowLeft, Smile } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import socketService from '../lib/socket'
import RealTimeMessageInterface from '../components/messages/RealTimeMessageInterface'
import { messagesAPI } from '../lib/api'
import toast from 'react-hot-toast'

const MessagingPage = () => {
  const { userId: otherUserId } = useParams()
  const { user } = useAuthStore()
  
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [useRealTimeInterface, setUseRealTimeInterface] = useState(true)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (otherUserId && user) {
      loadConversation()
      joinSocketConversation()
      setupSocketListeners()
    }

    return () => {
      cleanupSocketListeners()
    }
  }, [otherUserId, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversation = async () => {
    try {
      setLoading(true)
      const response = await messagesAPI.getConversation(otherUserId, { limit: 50 })
      setMessages(response.data.messages || [])
      setConversation(response.data.conversation)
      
      // Mark messages as read
      await messagesAPI.markMessagesAsRead(otherUserId)
    } catch (error) {
      console.error('Failed to load conversation:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const joinSocketConversation = () => {
    if (socketService.isConnected()) {
      socketService.joinConversation(otherUserId, (response) => {
        if (response?.success) {
          console.log('✅ Joined conversation room')
        }
      })
    }
  }

  const setupSocketListeners = () => {
    console.log('🔌 Setting up socket listeners for messaging')
    // Listen for new messages
    socketService.addEventListener('new_message', handleNewMessage)
    
    // Listen for typing indicators
    socketService.addEventListener('user_typing', handleUserTyping)
    
    // Listen for read receipts
    socketService.addEventListener('messages_read', handleMessagesRead)
    
    // Debug socket connection status
    socketService.addEventListener('socket_connected', () => {
      console.log('✅ Socket connected in messaging page')
    })
    
    socketService.addEventListener('socket_disconnected', () => {
      console.log('❌ Socket disconnected in messaging page')
    })
  }

  const cleanupSocketListeners = () => {
    console.log('🧹 Cleaning up socket listeners')
    socketService.removeEventListener('new_message', handleNewMessage)
    socketService.removeEventListener('user_typing', handleUserTyping)
    socketService.removeEventListener('messages_read', handleMessagesRead)
    socketService.removeEventListener('socket_connected')
    socketService.removeEventListener('socket_disconnected')
  }

  const handleNewMessage = (messageData) => {
    // Only add messages for this conversation
    if (messageData.senderId === otherUserId || messageData.receiverId === otherUserId) {
      setMessages(prev => [...prev, messageData])
      
      // Mark as read if it's from the other user
      if (messageData.senderId === otherUserId) {
        messagesAPI.markMessagesAsRead(otherUserId)
      }
    }
  }

  const handleUserTyping = (typingData) => {
    if (typingData.userId === otherUserId) {
      setOtherUserTyping(typingData.isTyping)
    }
  }

  const handleMessagesRead = (readData) => {
    if (readData.readBy === otherUserId) {
      setMessages(prev => prev.map(msg => 
        msg.senderId === user.id ? { ...msg, isRead: true } : msg
      ))
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    console.log('📤 Attempting to send message to:', otherUserId)
    console.log('🔌 Socket connected:', socketService.isConnected())
    
    if (!socketService.isConnected()) {
      console.warn('⚠️ Socket not connected, using API only')
    }

    const messageData = {
      receiverId: otherUserId,
      content: newMessage.trim(),
      messageType: 'text'
    }

    // Add optimistic message
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: otherUserId,
      content: messageData.content,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      isRead: false,
      senderUsername: user.username
    }

    setMessages(prev => [...prev, optimisticMessage])
    setNewMessage('')

    // Send via Socket.io for real-time delivery if connected
    if (socketService.isConnected()) {
      console.log('📡 Sending via Socket.io...')
      socketService.sendMessage(
        messageData.receiverId,
        messageData.content,
        messageData.messageType,
        (response) => {
          console.log('🔄 Socket response:', response)
          if (response?.success) {
            console.log('✅ Message sent via Socket.io successfully')
          } else {
            console.error('❌ Failed to send via Socket.io:', response?.message)
          }
        }
      )
    } else {
      console.warn('⚠️ Socket not connected, message will be sent via API only')
    }

    // Also send via API for persistence
    try {
      console.log('💾 Saving message to database via API...')
      const apiResponse = await messagesAPI.sendMessage(messageData)
      console.log('✅ Message saved to database:', apiResponse.data)
    } catch (error) {
      console.error('❌ Failed to save message to database:', error)
      toast.error('Failed to send message. Please try again.')
      
      // Remove the optimistic message on failure
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
    }
  }

  const sendMessageViaAPI = async (messageData) => {
    try {
      await messagesAPI.sendMessage(messageData)
      console.log('✅ Message saved via API')
    } catch (error) {
      console.error('Failed to send message via API:', error)
      toast.error('Failed to send message')
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)

    // Send typing indicator
    if (!isTyping && socketService.isConnected()) {
      setIsTyping(true)
      socketService.startTyping(otherUserId)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && socketService.isConnected()) {
        setIsTyping(false)
        socketService.stopTyping(otherUserId)
      }
    }, 3000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
      
      // Stop typing indicator
      if (isTyping && socketService.isConnected()) {
        setIsTyping(false)
        socketService.stopTyping(otherUserId)
      }
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // If using the new real-time interface
  if (useRealTimeInterface) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to conversations</span>
          </button>
          <button
            onClick={() => setUseRealTimeInterface(false)}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Switch to Classic View
          </button>
        </div>

        {/* Debug Info */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">🐛 Debug Info:</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>Your User ID:</strong> {user?.id}</p>
            <p><strong>Your Username:</strong> {user?.username}</p>
            <p><strong>Conversation Partner ID:</strong> {otherUserId}</p>
            <p><strong>Conversation Partner Name:</strong> {conversation?.otherUser?.username || 'Loading...'}</p>
            <p><strong>Are you chatting with yourself?</strong> {user?.id === otherUserId ? '⚠️ YES - This is the problem!' : '✅ No'}</p>
          </div>
        </div>

        {/* Warning if chatting with self */}
        {user?.id === otherUserId && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">⚠️ You're chatting with yourself!</h3>
            <p className="text-sm text-red-700 mb-3">
              To test messaging properly, you need to:
            </p>
            <div className="text-sm text-red-700 space-y-1">
              <p>1. Open an incognito window</p>
              <p>2. Register/login as a different user</p>
              <p>3. Go to connections and find your first user</p>
              <p>4. Start a conversation from there</p>
            </div>
          </div>
        )}
        
        <RealTimeMessageInterface 
          conversationUserId={otherUserId}
          conversationUsername={conversation?.otherUser?.username || `User ${otherUserId?.slice(-4)}`}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-12 w-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {conversation?.otherUser?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {conversation?.otherUser?.username || `Chat with User ${otherUserId?.slice(-4)}`}
              </h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600 capitalize">
                  {conversation?.otherUser?.role || 'User'}
                </p>
                <span className="text-gray-400">•</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${socketService.isConnected() ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  <p className="text-xs text-gray-500">
                    {socketService.isConnected() ? 'Connected' : 'Offline'}
                  </p>
                </div>
                {otherUserTyping && (
                  <>
                    <span className="text-gray-400">•</span>
                    <p className="text-sm text-green-600 font-medium">Typing...</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setUseRealTimeInterface(true)}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            Switch to Real-time View
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isMyMessage = message.senderId === user.id
          const showTimestamp = index === 0 || 
            new Date(messages[index - 1]?.createdAt).getTime() < 
            new Date(message.createdAt).getTime() - 300000 // 5 minutes

          return (
            <div key={message.id} className="space-y-1">
              {showTimestamp && (
                <div className="text-center text-xs text-gray-500 py-2">
                  {formatTime(message.createdAt)}
                </div>
              )}
              
              <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isMyMessage 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  
                  {isMyMessage && (
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <span className="text-xs opacity-75">
                        {formatTime(message.createdAt)}
                      </span>
                      {message.isRead && (
                        <div className="flex">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full ml-0.5"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Smile className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full max-h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="1"
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !socketService.isConnected()}
            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        {!socketService.isConnected() && (
          <div className="mt-2 text-sm text-red-600 text-center">
            Connection lost. Messages may not be delivered in real-time.
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagingPage
