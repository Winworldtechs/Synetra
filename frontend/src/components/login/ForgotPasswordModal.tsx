import React, { useState } from 'react';
import './ForgotPasswordModal.css';
import axios from '../utils/axios';
import { Player } from '@lottiefiles/react-lottie-player';
import { success as successAnimation } from '../../assets/animations';

const API_URL = import.meta.env.VITE_API_URL;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'email' | 'otp' | 'newPassword' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (response.data.success || response.status === 200) {
        setStep('otp');
      } else {
        throw new Error(response.data.error || 'Failed to send verification code');
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.error || 'Failed to send verification code. Please try again.');
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!otp.trim()) {
      setError('Verification code is required');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (response.data.success || response.status === 200) {
        setStep('newPassword');
      } else {
        throw new Error(response.data.error || 'Invalid verification code');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.error || 'Invalid verification code. Please try again.');
    }
    setLoading(false);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6; // Minimum 6 characters
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Comprehensive validation before making the request
    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!trimmedOtp) {
      setError('Verification code is required');
      return;
    }

    if (trimmedOtp.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    if (!newPassword) {
      setError('New password is required');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Ensure all required fields are present in the request
      const requestData = {
        email: email.trim(),
        otp: otp.trim(),
        password: newPassword, // Changed from newPassword to password to match API expectation
        confirm_password: confirmPassword // Added confirm_password field
      };

      console.log('Reset password request data:', requestData); // For debugging

      const response = await axios.post(
        `${API_URL}/auth/reset-password`, 
        requestData,
        {
          headers: { 
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.success || response.status === 200) {
        setStep('success');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(response.data.error || 'Failed to reset password');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      
      // Additional error logging for debugging
      if (err.response) {
        console.log('Error response data:', err.response.data);
        console.log('Error response status:', err.response.status);
        console.log('Error response headers:', err.response.headers);
      }
    }
    setLoading(false);
  };

  const modalContent = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleEmailSubmit} className="forgot-password-form">
            <h2>Forgot Password</h2>
            <p>Enter your email to receive a verification code</p>
            <input
              type="email"
              placeholder="Email*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </form>
        );
      case 'otp':
        return (
          <form onSubmit={handleOtpSubmit} className="forgot-password-form">
            <h2>Enter Verification Code</h2>
            <p>Enter the 6-digit code sent to your email</p>
            <input
              type="text"
              placeholder="Verification Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        );
      case 'newPassword':
        return (
          <form onSubmit={handlePasswordSubmit} className="forgot-password-form">
            <h2>Reset Password</h2>
            <p>Enter your new password</p>
            <input
              type="password"
              placeholder="New Password* (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              aria-label="New Password"
            />
            <input
              type="password"
              placeholder="Confirm Password*"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              aria-label="Confirm Password"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        );
      case 'success':
        return (
          <div className="success-container">
            <Player
              autoplay
              keepLastFrame
              src={successAnimation}
              style={{ width: '200px', height: '200px' }}
            />
            <h2>Password Reset Successful!</h2>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {error && <div className="error-message">{error}</div>}
        {modalContent()}
        {step !== 'success' && (
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;