import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication
    const token = localStorage.getItem('dormaid_token');
    const storedUser = localStorage.getItem('dormaid_user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      
      // Verify token is still valid by fetching profile
      fetchProfile(token).then(userData => {
        if (userData) {
          setUser(userData);
          localStorage.setItem('dormaid_user', JSON.stringify(userData));
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('dormaid_token');
          localStorage.removeItem('dormaid_user');
          setUser(null);
        }
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user profile with token
  const fetchProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data.user;
      }
      return null;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  // Update user function - use this to update user state globally
  const updateUser = (newUserData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...newUserData };
      // Also update localStorage
      localStorage.setItem('dormaid_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // Refresh user data from server
  const refreshUser = async () => {
    const token = localStorage.getItem('dormaid_token');
    if (!token) return null;

    try {
      const userData = await fetchProfile(token);
      if (userData) {
        updateUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
    return null;
  };

  // Register function - CONNECTED TO BACKEND
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        // Store token and user data
        localStorage.setItem('dormaid_token', result.data.token);
        localStorage.setItem('dormaid_user', JSON.stringify(result.data.user));
        setUser(result.data.user);
        
        return { 
          success: true, 
          user: result.data.user,
          message: 'Account created successfully!' 
        };
      } else {
        return { 
          success: false, 
          error: result.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  // Login function - CONNECTED TO BACKEND
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        // Store token and user data
        localStorage.setItem('dormaid_token', result.data.token);
        localStorage.setItem('dormaid_user', JSON.stringify(result.data.user));
        setUser(result.data.user);
        
        return { 
          success: true, 
          user: result.data.user 
        };
      } else {
        return { 
          success: false, 
          error: result.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('dormaid_token');
    localStorage.removeItem('dormaid_user');
  };

  // Update profile function - ENHANCED
  const updateProfile = async (profileData, requiresVerification = false) => {
    try {
      const token = localStorage.getItem('dormaid_token');
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      // If email change requires verification
      if (requiresVerification && profileData.email !== user.email) {
        // Generate OTP and store temporarily
        const otp = generateOTP();
        const otpData = {
          otp,
          email: profileData.email,
          profileData,
          expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        };
        localStorage.setItem(`otp_${profileData.email}`, JSON.stringify(otpData));
        
        // Send OTP email
        await sendOTPEmail(profileData.email, otp);
        
        return {
          requiresVerification: true,
          message: 'Verification code sent to your new email address'
        };
      }

      // Regular profile update (no email change or OTP verified)
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (result.success) {
        // Update user state immediately
        updateUser(result.data.user || { ...user, ...profileData });
        
        return { 
          success: true, 
          user: user,
          message: 'Profile updated successfully!' 
        };
      } else {
        return { 
          success: false, 
          error: result.message || 'Profile update failed' 
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  // Enhanced email verification with OTP
  const verifyEmailAndUpdate = async (email, otp, profileData) => {
    try {
      // Verify OTP from localStorage
      const storedOtpData = localStorage.getItem(`otp_${email}`);
      if (!storedOtpData) {
        return { success: false, error: 'OTP expired or invalid' };
      }

      const otpData = JSON.parse(storedOtpData);
      
      if (otpData.expires < Date.now()) {
        localStorage.removeItem(`otp_${email}`);
        return { success: false, error: 'OTP has expired' };
      }

      if (otpData.otp !== otp) {
        return { success: false, error: 'Invalid verification code' };
      }

      // OTP verified, now update profile with new email
      const token = localStorage.getItem('dormaid_token');
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...profileData, email }),
      });

      const result = await response.json();

      if (result.success) {
        // Update user state
        updateUser(result.data.user || { ...user, ...profileData, email });
        
        // Clean up OTP data
        localStorage.removeItem(`otp_${email}`);
        
        return { 
          success: true, 
          user: user,
          message: 'Email verified and profile updated successfully!' 
        };
      } else {
        return { 
          success: false, 
          error: result.message || 'Profile update failed after verification' 
        };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return { 
        success: false, 
        error: 'Network error during verification' 
      };
    }
  };

  // Enhanced password change
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('dormaid_token');
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await response.json();

      if (result.success) {
        return { 
          success: true, 
          message: result.message || 'Password updated successfully!' 
        };
      } else {
        return { 
          success: false, 
          error: result.message || 'Password change failed' 
        };
      }
    } catch (error) {
      console.error('Password change error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  // OTP functions
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTPEmail = async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();
      return { success: result.success };
    } catch (error) {
      console.error('Send OTP error:', error);
      // Fallback - log to console for development
      console.log(`OTP ${otp} sent to ${email}`);
      return { success: true };
    }
  };

  const resendOTP = async (email) => {
    const otp = generateOTP();
    const otpData = {
      otp,
      email,
      expires: Date.now() + 10 * 60 * 1000
    };
    localStorage.setItem(`otp_${email}`, JSON.stringify(otpData));
    
    await sendOTPEmail(email, otp);
    return { success: true };
  };

  const value = {
    user,
    register,
    login,
    logout,
    loading,
    updateProfile,
    verifyEmailAndUpdate,
    changePassword,
    sendOTPEmail,
    generateOTP,
    resendOTP,
    updateUser, // Export updateUser for direct state updates
    refreshUser // Export refreshUser to force data refresh
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};