import React from 'react'
import { Link } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/outline'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h2>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        
        <Link
          to="/dashboard"
          className="inline-flex items-center btn-primary"
        >
          <HomeIcon className="h-5 w-5 mr-2" />
          Go back home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
