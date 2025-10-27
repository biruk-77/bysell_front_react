import React, { useState } from 'react';
import { Mail, Phone, User, Lock, Building, MapPin, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../lib/api';

const EnhancedRegister = () => {
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Category Selection, 3: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    category: '',
    subCategory: '',
    location: '',
    bio: '',
    businessLicense: null
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = {
    'employer': {
      label: 'Employer',
      description: 'Post jobs and hire employees',
      subCategories: ['Full-time Jobs', 'Part-time Jobs', 'Contract Work', 'Internships']
    },
    'employee': {
      label: 'Job Seeker',
      description: 'Find employment opportunities',
      subCategories: ['Full-time', 'Part-time', 'Contract', 'Freelance']
    },
    'landlord': {
      label: 'Property Owner/Landlord',
      description: 'List properties for rent',
      subCategories: ['Apartments', 'Houses', 'Commercial', 'Rooms']
    },
    'tenant': {
      label: 'Tenant',
      description: 'Find rental properties',
      subCategories: ['Apartment Seeker', 'House Seeker', 'Commercial Seeker', 'Room Seeker']
    },
    'seller': {
      label: 'Seller',
      description: 'Sell products and services',
      subCategories: ['Electronics', 'Vehicles', 'Furniture', 'Clothing', 'Services']
    },
    'buyer': {
      label: 'Buyer',
      description: 'Purchase products and services',
      subCategories: ['Electronics', 'Vehicles', 'Furniture', 'Clothing', 'Services']
    },
    'service_provider': {
      label: 'Service Provider',
      description: 'Offer professional services',
      subCategories: ['Plumbing', 'Electrical', 'Cleaning', 'Tutoring', 'Healthcare']
    },
    'service_seeker': {
      label: 'Service Seeker',
      description: 'Find professional services',
      subCategories: ['Home Services', 'Professional Services', 'Personal Services']
    },
    'matchmaking': {
      label: 'Matchmaking',
      description: 'Find life partner (Secure & Private)',
      subCategories: ['Marriage Seeker', 'Family Representative']
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setStep(2);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    try {
      setLoading(true);
      
      // Send registration data and get OTP
      const response = await authAPI.sendRegistrationOTP({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        category: formData.category,
        subCategory: formData.subCategory,
        location: formData.location,
        bio: formData.bio
      });

      if (response.success) {
        toast.success('OTP sent to your email and phone');
        setStep(3);
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      
      const response = await authAPI.verifyRegistrationOTP({
        email: formData.email,
        phone: formData.phone,
        otp: otp
      });

      if (response.success) {
        toast.success('Registration successful! Please login.');
        // Redirect to login or auto-login
        window.location.href = '/login';
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

  const renderStep1 = () => (
    <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-2">Step 1: Basic Information</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline h-4 w-4 mr-2" />
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline h-4 w-4 mr-2" />
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline h-4 w-4 mr-2" />
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="inline h-4 w-4 mr-2" />
            Password *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter password (min 6 characters)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="inline h-4 w-4 mr-2" />
            Confirm Password *
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm your password"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-2" />
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="City, State, Country"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
      >
        Continue to Category Selection
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleCategorySubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Select Your Category</h2>
        <p className="text-gray-600 mt-2">Step 2: Choose how you'll use the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(categories).map(([key, category]) => (
          <div
            key={key}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.category === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, category: key, subCategory: '' }))}
          >
            <h3 className="font-semibold text-gray-900">{category.label}</h3>
            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
          </div>
        ))}
      </div>

      {formData.category && categories[formData.category] && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialization
          </label>
          <select
            name="subCategory"
            value={formData.subCategory}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select specialization (optional)</option>
            {categories[formData.category].subCategories.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="inline h-4 w-4 mr-2" />
          Bio/Description
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tell others about yourself..."
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50"
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleOTPVerification} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Verify Account</h2>
        <p className="text-gray-600 mt-2">Step 3: Enter the OTP sent to your email and phone</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
          6-Digit Verification Code
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
        <p className="text-sm text-gray-500 text-center mt-2">
          OTP sent to {formData.email} and {formData.phone}
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 font-medium disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify & Create Account'}
        </button>
      </div>

      <div className="text-center">
        <button
          type="button"
          className="text-blue-600 hover:text-blue-800 text-sm"
          onClick={() => handleCategorySubmit({ preventDefault: () => {} })}
        >
          Resend OTP
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i <= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRegister;
