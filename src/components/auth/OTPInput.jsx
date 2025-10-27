import React, { useRef, useState, useEffect } from 'react';

const OTPInput = ({ length = 6, value = '', onChange, disabled = false }) => {
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(value.split(''));

  useEffect(() => {
    if (value !== otp.join('')) {
      setOtp(value.split(''));
    }
  }, [value]);

  const handleChange = (index, digit) => {
    if (!/^\d*$/.test(digit)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = digit.slice(-1); // Take only last character
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(length - newOtp.length).fill('')]);
    onChange(pastedData);

    // Focus last filled input
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default OTPInput;
