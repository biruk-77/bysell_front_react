import React, { useState } from 'react'
import { X, User, Send, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const ConnectionRequestModal = ({ 
  isOpen, 
  onClose, 
  targetUser, 
  onSendRequest,
  isLoading 
}) => {
  const [note, setNote] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const templates = [
    "Hi! I'd love to connect and expand my professional network.",
    "Hello! I saw your profile and think we could have great synergy.",
    "Hi there! I'm interested in connecting with like-minded professionals.",
    "Hello! I'd like to connect and explore potential collaboration opportunities.",
    "Hi! Your background looks impressive. Let's connect!"
  ]

  const handleSendRequest = async () => {
    try {
      const message = note.trim() || selectedTemplate || `Hi ${targetUser.username}! I would like to connect with you.`
      await onSendRequest(targetUser.id, message)
      toast.success(`Connection request sent to ${targetUser.username}!`)
      onClose()
      setNote('')
      setSelectedTemplate('')
    } catch (error) {
      toast.error(error.message || 'Failed to send connection request')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Connect with</h2>
                <p className="text-blue-100">{targetUser.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* SEND BUTTON AT THE TOP! */}
          <div className="flex space-x-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSendRequest}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>SEND REQUEST</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {targetUser.username[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{targetUser.username}</h3>
              <p className="text-sm text-gray-600 capitalize">{targetUser.role}</p>
              {targetUser.profile?.bio && (
                <p className="text-xs text-gray-500 mt-1">{targetUser.profile.bio}</p>
              )}
            </div>
          </div>

          {/* Quick Templates */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <label className="text-sm font-medium text-gray-700">
                Quick Templates
              </label>
            </div>
            <div className="space-y-2">
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedTemplate(template)
                    setNote(template)
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                    selectedTemplate === template
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
                setSelectedTemplate('')
              }}
              placeholder={`Hi ${targetUser.username}! I would like to connect with you.`}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Make it personal to increase your chances!
              </p>
              <span className="text-xs text-gray-400">
                {note.length}/500
              </span>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionRequestModal
