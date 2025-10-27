import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import OTPInput from './OTPInput';
import axios from 'axios';
import toast from 'react-hot-toast';

const OTPVerification = ({ 
  isOpen, 
  onClose, 
  userId,
  phoneNumber,
  onSuccess,
  onError 
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // Send OTP when modal opens
    handleSendOTP();

    return () => {
      setOtp('');
      setTimeLeft(300);
      setError('');
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const handleSendOTP = async () => {
    try {
      setResending(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/otp/send`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('OTP sent successfully!');
      setTimeLeft(300);
      setCanResend(false);

      // In development, show OTP in console
      if (response.data.devToken) {
        console.log('🔐 Development OTP:', response.data.devToken);
        toast.success(`Dev OTP: ${response.data.devToken}`, { duration: 10000 });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      const message = error.response?.data?.message || 'Failed to send OTP';
      setError(message);
      toast.error(message);
      onError?.(error);
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/otp/verify`,
        { userId, token: otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Phone verified successfully!');
      onSuccess?.(response.data);
      handleClose();
    } catch (error) {
      console.error('Verify OTP error:', error);
      const message = error.response?.data?.message || 'Invalid OTP';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    await handleSendOTP();
    setOtp('');
  };

  const handleClose = () => {
    setOtp('');
    setError('');
    setTimeLeft(300);
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Phone
          </h2>
          <p className="text-gray-600">
            We've sent a 6-digit code to <br />
            <span className="font-semibold">{phoneNumber || 'your phone number'}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            disabled={loading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Timer */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            {timeLeft > 0 ? (
              <>
                Code expires in{' '}
                <span className="font-semibold text-blue-600">
                  {formatTime(timeLeft)}
                </span>
              </>
            ) : (
              <span className="text-red-600 font-semibold">Code expired</span>
            )}
          </p>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 mb-4"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={18} />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              Verify Code
            </>
          )}
        </button>

        {/* Resend Link */}
        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={!canResend || resending}
            className={`text-sm font-medium ${
              canResend
                ? 'text-blue-600 hover:text-blue-700 cursor-pointer'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            {resending ? 'Sending...' : "Didn't receive code? Resend"}
          </button>
        </div>

        {/* Development Note */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Dev Mode:</strong> Check console or toast notification for OTP code
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;
