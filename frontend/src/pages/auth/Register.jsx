import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    roomNumber: '',
    role: 'student',
    workArea: 'other'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        roomNumber: formData.roomNumber,
        role: formData.role,
        workArea: formData.role === 'technician' ? formData.workArea : undefined
      });

      if (result.success) {
        navigate('/student'); // Redirect to dashboard after registration
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            margin: '0 auto', 
            width: '4rem', 
            height: '4rem', 
            backgroundColor: '#3b82f6',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>
          <h2 style={{ marginTop: '1.5rem', fontSize: '1.875rem', fontWeight: '800', color: '#111827' }}>
            Join DormAid
          </h2>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Create your account to get started
          </p>
        </div>

        <form 
          onSubmit={handleSubmit}
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}
        >
          {error && (
            <div style={{ 
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="name" className="form-label">
                Full Name *
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
                  <User style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email Address *
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
                  <Mail style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="phone" className="form-label">
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
                    <Phone style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Phone"
                  />
                </div>
              </div>
{formData.role !== 'technician' && (
  <div>
    <label htmlFor="roomNumber" className="form-label">
      {formData.role === 'admin' ? 'Block' : 'Room Number'} *
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
        <MapPin style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
      </div>
      <input
        id="roomNumber"
        name="roomNumber"
        type="text"
        required={formData.role !== 'technician'}
        value={formData.roomNumber}
        onChange={(e) => handleInputChange('roomNumber', e.target.value)}
        className="form-input"
        style={{ paddingLeft: '2.5rem' }}
        placeholder={formData.role === 'admin' ? 'e.g., Block A' : 'e.g., A-101'}
      />
    </div>
  </div>
)}
              
            </div>

            {formData.role === 'technician' && (
              <div>
                <label htmlFor="workArea" className="form-label">
                  Work Area / Specialty
                </label>
                <select
                  id="workArea"
                  value={formData.workArea}
                  onChange={(e) => handleInputChange('workArea', e.target.value)}
                  className="form-select"
                >
                  <option value="cleaning">Cleaning</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrician">Electrician</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="role" className="form-label">
                I am a *
              </label>
              <select
                id="role"
                required
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="form-select"
              >
                <option value="student">Student</option>
                <option value="technician">Technician</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password *
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
                  <Lock style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Create a password"
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password *
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
                  <Lock style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'white',
              backgroundColor: '#3b82f6',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              marginTop: '1.5rem'
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#3b82f6', 
                  fontWeight: '500', 
                  textDecoration: 'none' 
                }}
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;