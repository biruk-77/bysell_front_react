import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import toast from 'react-hot-toast'

const ProtectedRoute = ({ children, requiredRole, requiredRoles }) => {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Don't show toast during render - it causes React warnings
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role requirements
  if (requiredRole) {
    if (user?.role !== requiredRole) {
      // Don't show toast during render - it causes React warnings
      return <Navigate to="/dashboard" replace />
    }
  }

  if (requiredRoles) {
    if (!requiredRoles.includes(user?.role)) {
      // Don't show toast during render - it causes React warnings
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}

export default ProtectedRoute
