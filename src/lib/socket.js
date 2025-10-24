import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
    this.eventHandlers = new Map()
  }

  connect(token) {
    if (this.socket?.connected) return this.socket

    console.log('🔌 Connecting to Socket.io server...')

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    this.setupConnectionEvents()
    this.setupMessageEvents()
    this.setupConnectionRequestEvents()
    this.setupPresenceEvents()

    return this.socket
  }

  setupConnectionEvents() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.io server!')
      this.connected = true
      this.triggerEvent('socket_connected', { connected: true })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.io server:', reason)
      this.connected = false
      this.triggerEvent('socket_disconnected', { connected: false, reason })
    })

    this.socket.on('connect_error', (error) => {
      console.error('🚫 Socket connection error:', error.message)
      this.connected = false
      toast.error('Connection failed: ' + error.message)
      this.triggerEvent('socket_error', { error: error.message })
    })
  }

  setupMessageEvents() {
    this.socket.on('new_message', (data) => {
      console.log('💬 New message received:', data)
      toast.success(`New message from ${data.senderUsername || 'Someone'}`)
      this.triggerEvent('new_message', data)
    })

    this.socket.on('message_notification', (data) => {
      console.log('🔔 Message notification:', data)
      this.triggerEvent('message_notification', data)
    })

    this.socket.on('messages_read', (data) => {
      console.log('👁️ Messages read by:', data.readByUsername)
      this.triggerEvent('messages_read', data)
    })

    this.socket.on('message_deleted', (data) => {
      console.log('🗑️ Message deleted:', data)
      this.triggerEvent('message_deleted', data)
    })

    this.socket.on('user_typing', (data) => {
      console.log('⌨️ User typing:', data)
      this.triggerEvent('user_typing', data)
    })
  }

  setupConnectionRequestEvents() {
    this.socket.on('connection_request_received', (data) => {
      console.log('🔗 New connection request:', data)
      toast.success(`New connection request from ${data.connection.requester.username}!`)
      this.triggerEvent('connection_request_received', data)
    })

    this.socket.on('connection_request_responded', (data) => {
      console.log('✅ Connection request responded:', data)
      const action = data.action === 'accept' ? 'accepted' : 'rejected'
      toast.success(`${data.connection.receiver.username} ${action} your connection request!`)
      this.triggerEvent('connection_request_responded', data)
    })
  }

  setupPresenceEvents() {
    this.socket.on('user_online', (data) => {
      console.log('🟢 User online:', data)
      this.triggerEvent('user_online', data)
    })

    this.socket.on('user_offline', (data) => {
      console.log('🔴 User offline:', data)
      this.triggerEvent('user_offline', data)
    })

    this.socket.on('user_status_changed', (data) => {
      console.log('📊 User status changed:', data)
      this.triggerEvent('user_status_changed', data)
    })
  }

  // Event handler management
  addEventListener(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event).add(handler)
  }

  removeEventListener(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler)
    }
  }

  triggerEvent(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error('Error in event handler:', error)
        }
      })
    }
  }

  // Messaging methods
  joinConversation(otherUserId, callback) {
    if (!this.isConnected()) {
      console.error('❌ Socket not connected')
      return
    }

    console.log('👥 Joining conversation with:', otherUserId)
    this.socket.emit('join_conversation', { otherUserId }, (response) => {
      if (response?.success) {
        console.log('✅ Joined conversation:', response.message)
      } else {
        console.error('❌ Failed to join conversation:', response?.message)
      }
      callback?.(response)
    })
  }

  sendMessage(receiverId, content, messageType = 'text', callback) {
    if (!this.isConnected()) {
      console.error('❌ Socket not connected')
      return
    }

    console.log('📤 Sending message to:', receiverId)
    this.socket.emit('send_message', {
      receiverId,
      content,
      messageType
    }, (response) => {
      if (response?.success) {
        console.log('✅ Message sent successfully')
      } else {
        console.error('❌ Failed to send message:', response?.message)
        toast.error('Failed to send message')
      }
      callback?.(response)
    })
  }

  // Typing indicators
  startTyping(receiverId, callback) {
    if (!this.isConnected()) return
    this.socket.emit('typing_start', { receiverId }, callback)
  }

  stopTyping(receiverId, callback) {
    if (!this.isConnected()) return
    this.socket.emit('typing_stop', { receiverId }, callback)
  }

  // Status management
  updateStatus(status, callback) {
    if (!this.isConnected()) return
    this.socket.emit('update_status', { status }, callback)
  }

  getOnlineUsers(callback) {
    if (!this.isConnected()) return
    this.socket.emit('get_online_users', {}, callback)
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from Socket.io server...')
      this.socket.disconnect()
      this.socket = null
      this.connected = false
      this.eventHandlers.clear()
    }
  }

  // Utility methods
  emit(event, data, callback) {
    if (this.socket?.connected) {
      this.socket.emit(event, data, callback)
    } else {
      console.warn('⚠️ Cannot emit - socket not connected')
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected
  }

  getSocket() {
    return this.socket
  }
}

export default new SocketService()
