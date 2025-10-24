import React from 'react'
import useAuthStore from '../store/useAuthStore'

const TestConnections = () => {
  const { user } = useAuthStore()

  console.log('🧪 Test Connections - User:', user)

  if (!user) {
    return <div className="p-8 text-center">Please log in</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Connections</h1>
      <div className="bg-white rounded-lg border p-6">
        <p className="mb-2">✅ User logged in: {user.username}</p>
        <p className="mb-2">✅ Role: {user.role}</p>
        <p className="mb-2">✅ Component rendering successfully</p>
        <div className="mt-4 p-4 bg-green-50 rounded">
          <p className="text-green-800">If you see this, React is working correctly!</p>
        </div>
      </div>
    </div>
  )
}

export default TestConnections
