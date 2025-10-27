import React, { useState } from 'react';
import { Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';

const EnhancedLogin = () => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password

  const login = useAuthStore(state => state.login);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const credential = loginMethod === 'email' ? formData.email : formData.phone;
    
    if (!credential || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      
      const response = await authAPI.login({
        [loginMethod]: credential,
        password: formData.password
      });

      if (response.success) {
        login(response.user, response.token);
        toast.success('Login successful!');
        window.location.href = '/dashboard';
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      
      // Redirect to backend social auth endpoint
      window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/social/${provider}`;
    } catch (error) {
      toast.error(`${provider} login failed`);
      console.error('Social login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    const credential = loginMethod === 'email' ? formData.email : formData.phone;
    
    if (!credential) {
      toast.error(`Please enter your ${loginMethod}`);
      return;
    }

    try {
      setLoading(true);
      
      const response = await authAPI.sendPasswordResetOTP({
        [loginMethod]: credential
      });

      if (response.success) {
        toast.success('OTP sent successfully');
        setResetStep(2);
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      
      const credential = loginMethod === 'email' ? formData.email : formData.phone;
      
      const response = await authAPI.verifyPasswordResetOTP({
        [loginMethod]: credential,
        otp: otp
      });

      if (response.success) {
        toast.success('OTP verified successfully');
        setResetStep(3);
      } else {
        toast.error(response.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('OTP verification failed. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      
      const credential = loginMethod === 'email' ? formData.email : formData.phone;
      
      const response = await authAPI.resetPassword({
        [loginMethod]: credential,
        otp: otp,
        newPassword: newPassword
      });

      if (response.success) {
        toast.success('Password reset successful! Please login.');
        setForgotPasswordMode(false);
        setResetStep(1);
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(response.message || 'Password reset failed');
      }
    } catch (error) {
      toast.error('Password reset failed. Please try again.');
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSocialLogins = () => (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => handleSocialLogin('google')}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition duration-200 disabled:opacity-50"
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <button
        type="button"
        onClick={() => handleSocialLogin('facebook')}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition duration-200 disabled:opacity-50"
      >
        <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Continue with Facebook
      </button>
    </div>
  );

  const renderForgotPasswordForm = () => {
    if (resetStep === 1) {
      return (
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-600 mt-2">Enter your {loginMethod} to receive OTP</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {loginMethod === 'email' ? (
                <>
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email Address
                </>
              ) : (
                <>
                  <Phone className="inline h-4 w-4 mr-2" />
                  Phone Number
                </>
              )}
            </label>
            <input
              type={loginMethod === 'email' ? 'email' : 'tel'}
              name={loginMethod}
              value={formData[loginMethod]}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter your ${loginMethod}`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setForgotPasswordMode(false)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Back to Login
            </button>
          </div>
        </form>
      );
    }

    if (resetStep === 2) {
      return (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Verify OTP</h2>
            <p className="text-gray-600 mt-2">Enter the 6-digit code sent to your {loginMethod}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength="6"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setResetStep(1)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Back
            </button>
          </div>
        </form>
      );
    }

    if (resetStep === 3) {
      return (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">New Password</h2>
            <p className="text-gray-600 mt-2">Create a new secure password</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline h-4 w-4 mr-2" />
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password (min 6 characters)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline h-4 w-4 mr-2" />
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 font-medium disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      );
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      {/* Social Login Options */}
      {renderSocialLogins()}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Login Method Toggle */}
      <div className="flex rounded-lg border border-gray-300 p-1">
        <button
          type="button"
          onClick={() => setLoginMethod('email')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            loginMethod === 'email'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <Mail className="inline h-4 w-4 mr-2" />
          Email
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('phone')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            loginMethod === 'phone'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <Phone className="inline h-4 w-4 mr-2" />
          Phone
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
        </label>
        <input
          type={loginMethod === 'email' ? 'email' : 'tel'}
          name={loginMethod}
          value={formData[loginMethod]}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={`Enter your ${loginMethod}`}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 block text-sm text-gray-700">Remember me</span>
        </label>

        <button
          type="button"
          onClick={() => setForgotPasswordMode(true)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {forgotPasswordMode ? renderForgotPasswordForm() : renderLoginForm()}
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLogin;
