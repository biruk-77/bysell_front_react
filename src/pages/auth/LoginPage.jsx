// ==================================================================================
// ETHIO CONNECT - PREMIUM $500,000 LOGIN PAGE
// World-Class UI/UX Design | Multi-Component Architecture | Advanced Animations
// ==================================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import { 
  User, Mail, Lock, Phone, Eye, EyeOff, Loader2, Sparkles, AlertCircle,
  CheckCircle, Shield, Star, TrendingUp, Users, Heart, Zap, ArrowRight,
  Globe, Award, Target, Clock, CheckCircle2, Rocket, Crown, Gem
} from 'lucide-react';

// ==================================================================================
// PREMIUM HELPER COMPONENTS
// ==================================================================================

// Floating Particle Animation
const FloatingParticle = ({ delay = 0, duration = 20 }) => (
  <div 
    className="absolute w-2 h-2 bg-white/20 rounded-full blur-sm animate-float"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`
    }}
  />
);

// Premium Stats Card Component
const PremiumStatCard = ({ icon: Icon, value, label, gradient, delay = 0 }) => (
  <div 
    className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-500 overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
    <div className="relative z-10">
      <div className="flex items-center gap-4 mb-2">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-3xl font-bold text-white drop-shadow-lg">{value}</div>
          <div className="text-white/80 text-sm font-medium">{label}</div>
        </div>
      </div>
    </div>
    {/* Shine effect */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12 group-hover:left-full transition-all duration-1000"></div>
    </div>
  </div>
);

// Premium Testimonial Card
const TestimonialCard = ({ quote, author, role, rating = 5 }) => (
  <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:border-white/50 transition-all duration-300 group">
    <div className="flex gap-1 mb-3">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
    <p className="text-white/95 italic mb-4 leading-relaxed">{quote}</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
        {author[0]}
      </div>
      <div>
        <div className="text-white font-semibold">{author}</div>
        <div className="text-white/70 text-xs">{role}</div>
      </div>
    </div>
  </div>
);

// Premium Input Field with Advanced Animations
const PremiumInput = ({ icon: Icon, type = 'text', placeholder, value, onChange, onFocus, onBlur, error, success }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative group">
      <div className={`relative transition-all duration-300 ${isFocused ? 'transform scale-105' : ''}`}>
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 ${isFocused ? 'opacity-50' : ''} transition-all duration-500`}></div>
        
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300"
          style={{
            borderColor: error ? '#ef4444' : success ? '#10b981' : isFocused ? '#8b5cf6' : '#e5e7eb',
            boxShadow: isFocused ? '0 20px 60px -15px rgba(139, 92, 246, 0.5)' : 'none'
          }}
        >
          <div className="flex items-center gap-3 px-5 py-4">
            <Icon className={`w-5 h-5 transition-all duration-300 ${isFocused ? 'text-purple-600 scale-110' : 'text-gray-400'}`} strokeWidth={2.5} />
            <input
              type={type}
              value={value}
              onChange={onChange}
              onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
              onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-base font-medium"
            />
            {success && <CheckCircle2 className="w-5 h-5 text-green-500 animate-bounce" />}
            {error && <AlertCircle className="w-5 h-5 text-red-500 animate-shake" />}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm font-medium animate-slide-down">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

// Premium Button Component
const PremiumButton = ({ children, loading, disabled, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="relative group w-full py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  >
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    {/* Shine effect */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100">
      <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12 group-hover:left-full transition-all duration-1000"></div>
    </div>
    
    {/* Button content */}
    <div className="relative z-10 flex items-center justify-center gap-3">
      {loading ? (
        <>
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-6 h-6" strokeWidth={2.5} />}
          <span>{children}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </>
      )}
    </div>
  </button>
);

// Mode Toggle with Premium Design
const PremiumModeToggle = ({ modes, activeMode, onChange }) => (
  <div className="relative bg-white/10 backdrop-blur-xl p-1.5 rounded-2xl border border-white/20 shadow-lg">
    <div className="flex gap-2">
      {modes.map((mode, index) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.value;
        return (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`relative flex-1 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              isActive 
                ? 'text-white shadow-lg transform scale-105' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl animate-gradient"></div>
            )}
            <div className="relative z-10 flex items-center justify-center gap-2">
              <Icon className="w-4 h-4" strokeWidth={2.5} />
              <span>{mode.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const from = location.state?.from?.pathname || '/dashboard';
  
  // State
  const [mode, setMode] = useState('email');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Mode configuration
  const modes = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'username', label: 'Username', icon: User },
    { value: 'phone', label: 'Phone', icon: Phone }
  ];
  
  // Handlers
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setEmail('');
    setUsername('');
    setPhone('');
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const loginData = mode === 'email' ? { email, password } 
        : mode === 'username' ? { username, password }
        : { phone, password };
      
      const result = await login(loginData);
      
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1500);
      } else {
        setError(result.message || 'Invalid credentials');
        toast.error(result.message || 'Login failed', { duration: 4000 });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      toast.error(msg, { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };
  
  // Success Overlay
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="text-center animate-scale-in">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full animate-ping"></div>
            <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-20 h-20 text-white" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Welcome Back!</h2>
          <p className="text-white/90 text-lg">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-white/5 rounded-full blur-2xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* LEFT SIDE - PREMIUM BRANDING */}
          <div className="hidden lg:block text-white space-y-8 animate-fade-in">
            {/* Logo & Tagline */}
            <div className="flex items-center gap-5 mb-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30 transform hover:rotate-12 transition-transform duration-300">
                  <Crown className="w-11 h-11 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-6xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
                  Ethio Connect
                </h1>
                <p className="text-white/90 text-xl font-semibold mt-1">Your Gateway to Success</p>
              </div>
            </div>
            
            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 gap-4 animate-stagger">
              <PremiumStatCard icon={Users} value="250K+" label="Active Users" gradient="from-blue-500 to-cyan-500" delay={0} />
              <PremiumStatCard icon={Rocket} value="2M+" label="Connections" gradient="from-purple-500 to-pink-500" delay={100} />
              <PremiumStatCard icon={Award} value="4.9★" label="User Rating" gradient="from-yellow-500 to-orange-500" delay={200} />
              <PremiumStatCard icon={Target} value="99.9%" label="Success Rate" gradient="from-green-500 to-emerald-500" delay={300} />
            </div>
            
            {/* Premium Testimonial */}
            <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <TestimonialCard
                quote="Ethio Connect completely transformed my career! I found my dream job in just 10 days. The platform is incredibly intuitive and professional."
                author="Alemayehu Bekele"
                role="Senior Software Engineer at Microsoft"
                rating={5}
              />
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center gap-4 justify-center pt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Shield className="w-4 h-4 text-green-300" />
                <span className="text-sm font-medium">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Gem className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-medium">Premium Quality</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - PREMIUM LOGIN FORM */}
          <div className="bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/20 animate-fade-in">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Crown className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Ethio Connect</h1>
            </div>
            
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-gray-900 mb-3 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Welcome Back! 👋
              </h2>
              <p className="text-gray-600 text-lg font-medium">Sign in to continue your journey</p>
            </div>
            
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl flex items-start gap-3 animate-shake">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 mb-1">Login Failed</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            {/* Premium Mode Toggle */}
            <div className="mb-8">
              <PremiumModeToggle
                modes={modes}
                activeMode={mode}
                onChange={handleModeChange}
              />
            </div>
            
            {/* PREMIUM LOGIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Login Identifier Input */}
              {mode === 'email' && (
                <PremiumInput
                  icon={Mail}
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}
              
              {mode === 'username' && (
                <PremiumInput
                  icon={User}
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              )}
              
              {mode === 'phone' && (
                <PremiumInput
                  icon={Phone}
                  type="tel"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              )}
              
              {/* Password Input with Toggle */}
              <div className="relative">
                <PremiumInput
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors p-2 hover:bg-purple-50 rounded-lg"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 cursor-pointer" 
                  />
                  <span className="text-sm text-gray-700 font-medium group-hover:text-purple-600 transition-colors">Remember me</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-semibold text-purple-600 hover:text-pink-600 transition-colors flex items-center gap-1 group"
                >
                  <span>Forgot password?</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              {/* Premium Submit Button */}
              <PremiumButton
                loading={loading}
                disabled={loading}
                icon={Rocket}
              >
                Sign In to Dashboard
              </PremiumButton>
            </form>
            
            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm font-semibold text-gray-500">New to Ethio Connect?</span>
              </div>
            </div>
            
            {/* Register Link */}
            <Link 
              to="/register" 
              className="block w-full py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-900 font-bold text-center rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all transform hover:scale-105 shadow-sm hover:shadow-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Create Your Free Account
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Premium Footer Badge */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-fade-in" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 shadow-2xl">
          <div className="flex items-center gap-2 text-white/90 text-sm font-semibold">
            <Shield className="w-4 h-4 text-green-300" />
            <span>256-bit SSL Encrypted</span>
          </div>
          <div className="w-px h-4 bg-white/30"></div>
          <div className="flex items-center gap-2 text-white/90 text-sm font-semibold">
            <Globe className="w-4 h-4 text-blue-300" />
            <span>Trusted by 250K+ Users</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
