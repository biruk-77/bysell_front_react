import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import useAuthStore from '../../store/useAuthStore'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuthStore()
  
  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    console.log('🔐 Login attempt with:', data)
    
    const result = await login(data)
    console.log('🔐 Login result:', result)
    
    if (result.success) {
      console.log('✅ Login successful, redirecting to:', from)
      navigate(from, { replace: true })
    } else {
      console.error('❌ Login failed:', result.message)
      toast.error(result.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    autoComplete="email"
                    className="input-primary"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 3,
                        message: 'Password must be at least 3 characters'
                      }
                    })}
                    type="password"
                    autoComplete="current-password"
                    className="input-primary"
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Sign in
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">ByAndSell</h1>
            <p className="text-xl opacity-90 max-w-md">
              Connect. Trade. Grow. Your comprehensive platform for buying, selling, employment, and networking.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
