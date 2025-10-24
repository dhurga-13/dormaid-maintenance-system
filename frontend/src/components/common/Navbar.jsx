import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, LogOut, User, Building2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'student':
        return [
          { path: '/student', label: 'Dashboard', icon: Home },
          { path: '/student/complaint/new', label: 'New Complaint' },
          { path: '/student/complaints', label: 'My Complaints' },
        ];
      case 'technician':
        return [
          { path: '/technician', label: 'Dashboard', icon: Home },
        ];
      case 'admin':
        return [
          { path: '/admin', label: 'Dashboard', icon: Home },
        ];
      default:
        return [];
    }
  };

  if (!user) return null;

  return (
    <nav style={{ 
      backgroundColor: 'white', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          height: '4rem'
        }}>
          {/* Left side - Logo and Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {/* Logo - Same as login page */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <div style={{ 
                width: '2.5rem', 
                height: '2.5rem', 
                backgroundColor: '#3b82f6',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>DormAid</span>
            </Link>
            
            {/* Navigation Links */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {getNavLinks().map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textDecoration: 'none',
                      backgroundColor: isActive ? '#dbeafe' : 'transparent',
                      color: isActive ? '#1d4ed8' : '#4b5563',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {Icon && <Icon size={16} />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - User info and actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* User Profile with Name */}
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                color: '#4b5563',
                transition: 'all 0.2s ease',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.borderColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'transparent';
              }}
            >
              <User size={18} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>{user.name}</span>
                <span style={{ 
                  padding: '0.125rem 0.5rem', 
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  textTransform: 'capitalize'
                }}>
                  {user.role}
                </span>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;