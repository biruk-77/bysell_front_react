import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PublicRoute
