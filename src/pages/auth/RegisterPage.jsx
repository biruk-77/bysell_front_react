import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import useAuthStore from '../../store/useAuthStore'
import Button from '../../components/ui/Button'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register: registerUser, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const watchPassword = watch('password', '')

  const onSubmit = async (data) => {
    console.log('📝 Form data:', data) // Debug log
    console.log('🔍 Form validation errors:', errors) // Debug log
    
    const { confirmPassword, ...registerData } = data
    console.log('📤 Sending to API:', registerData) // Debug log
    console.log('🎯 Specific fields being sent:')
    console.log('  - username:', registerData.username)
    console.log('  - email:', registerData.email) 
    console.log('  - password:', registerData.password ? '[HIDDEN]' : 'MISSING')
    console.log('  - role:', registerData.role)
    
    try {
      const result = await registerUser(registerData)
      console.log('📋 Registration result:', result) // Debug log
      
      if (result.success) {
        console.log('✅ Registration successful!')
        navigate('/dashboard')
      } else {
        console.error('❌ Registration failed:', result.message)
        alert(`Registration failed: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('💥 Registration error:', error)
      alert(`Registration error: ${error.message || 'Network error'}`)
    }
  }

  const roles = [
    { value: 'employee', label: 'Employee', description: 'Looking for jobs and opportunities' },
    { value: 'employer', label: 'Employer', description: 'Hiring talent and posting jobs' },
    { value: 'buyer', label: 'Buyer', description: 'Purchasing products and services' },
    { value: 'seller', label: 'Seller', description: 'Selling products and services' },
    { value: 'connector', label: 'Connector', description: 'Advanced networking and connections' },
    { value: 'reviewer', label: 'Reviewer', description: 'Content moderation and review' },
    { value: 'admin', label: 'Administrator', description: 'Full system administration access' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    {...register('username', {
                      required: 'Username is required',
                      minLength: {
                        value: 3,
                        message: 'Username must be at least 3 characters'
                      }
                    })}
                    type="text"
                    autoComplete="username"
                    className="input-primary"
                    placeholder="Enter your username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>
              </div>

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
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type="password"
                    autoComplete="new-password"
                    className="input-primary"
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => 
                        value === watchPassword || 'Passwords do not match'
                    })}
                    type="password"
                    autoComplete="new-password"
                    className="input-primary"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  I am a...
                </label>
                <div className="mt-1">
                  <select
                    {...register('role', {
                      required: 'Please select your role'
                    })}
                    className="input-primary"
                  >
                    <option value="">Select your role</option>
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Create Account
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
            <h1 className="text-4xl font-bold mb-4">Join ByAndSell</h1>
            <p className="text-xl opacity-90 max-w-md">
              Start your journey in our comprehensive platform for business, employment, and networking.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
