import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Shield, CheckCircle, XCircle, Lock } from 'lucide-react';

const Profile = () => {
  const { 
    user, 
    updateProfile, 
    verifyEmailAndUpdate, 
    changePassword, 
    resendOTP,
    updateUser,
     apiStatus 
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile state
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    room_number: ''
  });

  // OTP state
  const [otp, setOtp] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Initialize profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        room_number: user.room_number || user.roomNumber || ''
      });
    }
  }, [user]);
   useEffect(() => {
    if (apiStatus === 'offline') {
      setMessage({ 
        type: 'error', 
        text: 'Server is offline. Some features may not work.' 
      });
    }
  }, [apiStatus]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const requiresVerification = profileData.email !== user.email;
      
      const result = await updateProfile(profileData, requiresVerification);
      
      if (result.requiresVerification) {
        setPendingEmail(profileData.email);
        setShowOtpVerification(true);
        setMessage({ type: 'info', text: result.message });
      } else if (result.success) {
        // Update local form state with the returned user data
        if (result.user) {
          setProfileData({
            username: result.user.username || result.user.name || '',
            email: result.user.email || '',
            phone: result.user.phone || '',
            room_number: result.user.room_number || result.user.roomNumber || ''
          });
        }
        setMessage({ type: 'success', text: result.message || 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await verifyEmailAndUpdate(pendingEmail, otp, profileData);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Email verified and profile updated successfully!' });
        setShowOtpVerification(false);
        setOtp('');
        setPendingEmail('');
        
        // Update local form state
        if (result.user) {
          setProfileData({
            username: result.user.username || result.user.name || '',
            email: result.user.email || '',
            phone: result.user.phone || '',
            room_number: result.user.room_number || result.user.roomNumber || ''
          });
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'OTP verification failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'OTP verification failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setLoading(false);
      return;
    }

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const result = await resendOTP(pendingEmail);
      if (result.success) {
        setMessage({ type: 'info', text: 'New verification code sent to your email!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to resend verification code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to resend verification code' });
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(clearMessage, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Please log in to view your profile.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Profile Settings
        </h1>
        <p style={{ color: '#6b7280' }}>
          Manage your account information and security settings
        </p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          backgroundColor: message.type === 'success' ? '#d1fae5' : 
                          message.type === 'error' ? '#fef2f2' : '#eff6ff',
          border: `1px solid ${
            message.type === 'success' ? '#a7f3d0' : 
            message.type === 'error' ? '#fecaca' : '#bfdbfe'
          }`,
          color: message.type === 'success' ? '#065f46' : 
                message.type === 'error' ? '#dc2626' : '#1e40af'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {message.type === 'success' ? <CheckCircle size={20} /> : 
             message.type === 'error' ? <XCircle size={20} /> : <Shield size={20} />}
            {message.text}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '1rem 1.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === 'profile' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'profile' ? '#3b82f6' : '#6b7280',
            fontWeight: activeTab === 'profile' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('password')}
          style={{
            padding: '1rem 1.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === 'password' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'password' ? '#3b82f6' : '#6b7280',
            fontWeight: activeTab === 'password' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Change Password
        </button>
      </div>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
            Personal Information
          </h2>

          {!showOtpVerification ? (
            <form onSubmit={handleProfileUpdate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Username Field */}
                <div>
                  <label htmlFor="username" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Username
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      bottom: 0, 
                      left: 0, 
                      paddingLeft: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none'
                    }}>
                      <User size={20} color="#9ca3af" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      required
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      bottom: 0, 
                      left: 0, 
                      paddingLeft: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none'
                    }}>
                      <Mail size={20} color="#9ca3af" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  {profileData.email !== user.email && (
                    <p style={{ fontSize: '0.875rem', color: '#f59e0b', marginTop: '0.5rem' }}>
                      Changing your email requires verification
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      bottom: 0, 
                      left: 0, 
                      paddingLeft: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none'
                    }}>
                      <Phone size={20} color="#9ca3af" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Room Number Field - Hidden for technicians */}
                {user.role !== 'technician' && (
                  <div>
                    <label htmlFor="room_number" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      {user.role === 'admin' ? 'Block' : 'Room Number'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        bottom: 0, 
                        left: 0, 
                        paddingLeft: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'none'
                      }}>
                        <MapPin size={20} color="#9ca3af" />
                      </div>
                      <input
                        id="room_number"
                        type="text"
                        required={user.role !== 'technician'}
                        value={profileData.room_number}
                        onChange={(e) => setProfileData(prev => ({ ...prev, room_number: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        placeholder={user.role === 'admin' ? 'e.g., Block A' : 'e.g., A-101'}
                      />
                    </div>
                  </div>
                )}

                {/* Role Display */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Account Role
                  </label>
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.375rem',
                    color: '#374151',
                    textTransform: 'capitalize',
                    border: '1px solid #d1d5db'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={16} />
                      {user.role}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
                  onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          ) : (
            /* OTP Verification Section */
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Verify Your Email
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                We've sent a 6-digit verification code to <strong>{pendingEmail}</strong>. 
                Please enter it below to verify your new email address.
              </p>

              <form onSubmit={handleOtpVerification}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="otp" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength="6"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1.25rem',
                      textAlign: 'center',
                      letterSpacing: '0.5rem',
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="000000"
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    style={{
                      padding: '0.75rem 2rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontWeight: '500',
                      cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer',
                      opacity: (loading || otp.length !== 6) ? 0.5 : 1,
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => !loading && otp.length === 6 && (e.target.style.backgroundColor = '#2563eb')}
                    onMouseOut={(e) => !loading && otp.length === 6 && (e.target.style.backgroundColor = '#3b82f6')}
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'transparent',
                      color: '#3b82f6',
                      border: '1px solid #3b82f6',
                      borderRadius: '0.375rem',
                      fontWeight: '500',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#eff6ff')}
                    onMouseOut={(e) => !loading && (e.target.style.backgroundColor = 'transparent')}
                  >
                    Resend Code
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpVerification(false);
                      setOtp('');
                      setPendingEmail('');
                    }}
                    disabled={loading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'transparent',
                      color: '#6b7280',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontWeight: '500',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#f9fafb')}
                    onMouseOut={(e) => !loading && (e.target.style.backgroundColor = 'transparent')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
            Change Password
          </h2>

          <form onSubmit={handlePasswordChange}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    bottom: 0, 
                    left: 0, 
                    paddingLeft: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <Lock size={20} color="#9ca3af" />
                  </div>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    bottom: 0, 
                    left: 0, 
                    paddingLeft: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <Lock size={20} color="#9ca3af" />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    bottom: 0, 
                    left: 0, 
                    paddingLeft: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <Lock size={20} color="#9ca3af" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
                onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;