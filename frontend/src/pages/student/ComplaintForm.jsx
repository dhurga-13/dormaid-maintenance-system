import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Home, Wrench, Clock } from 'lucide-react';

const ComplaintForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('dormaid_token');
      const response = await fetch('http://localhost:5000/api/maintenance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          room_number: user.room_number
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Complaint submitted successfully! You will be redirected to dashboard.'
        });
        setFormData({ title: '', description: '', priority: 'medium' });
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/student');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Error submitting complaint'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#10b981', icon: Clock },
    { value: 'medium', label: 'Medium', color: '#f59e0b', icon: Wrench },
    { value: 'high', label: 'High', color: '#ef4444', icon: AlertCircle }
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          margin: '0 auto', 
          width: '4rem', 
          height: '4rem', 
          backgroundColor: '#3b82f6',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <Home style={{ width: '2rem', height: '2rem', color: 'white' }} />
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Submit Maintenance Request
        </h1>
        <p style={{ color: '#6b7280' }}>
          Room {user?.room_number} • We'll address your concern as soon as possible
        </p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {message.text}
        </div>
      )}

      {/* Complaint Form */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Title Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="title" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              Issue Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              placeholder="e.g., Leaking faucet, Broken light, Wi-Fi issue"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Description Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="description" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              Detailed Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              placeholder="Please provide a detailed description of the issue..."
              rows="5"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                resize: 'vertical',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Priority Field */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontWeight: '500',
              color: '#374151',
              fontSize: '0.875rem'
            }}>
              Priority Level
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {priorityOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <label
                    key={option.value}
                    style={{
                      flex: '1',
                      minWidth: '120px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={option.value}
                      checked={formData.priority === option.value}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      padding: '1rem',
                      border: `2px solid ${formData.priority === option.value ? option.color : '#e5e7eb'}`,
                      borderRadius: '0.5rem',
                      backgroundColor: formData.priority === option.value ? `${option.color}10` : 'white',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}>
                      <IconComponent 
                        size={24} 
                        color={formData.priority === option.value ? option.color : '#9ca3af'} 
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <div style={{
                        fontWeight: '500',
                        color: formData.priority === option.value ? option.color : '#374151'
                      }}>
                        {option.label}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Submit Maintenance Request
              </>
            )}
          </button>
        </form>
      </div>

      {/* CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ComplaintForm;