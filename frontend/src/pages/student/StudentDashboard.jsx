import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, List, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch complaints data from backend
  useEffect(() => {
    if (user) {
      fetchComplaintsData();
    }
  }, [user]);

  const fetchComplaintsData = async () => {
    try {
      const token = localStorage.getItem('dormaid_token');
      const response = await fetch('http://localhost:5000/api/maintenance/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const complaints = result.data || [];
        
        // Calculate stats
        const totalComplaints = complaints.length;
        const pending = complaints.filter(c => c.status === 'pending').length;
        const inProgress = complaints.filter(c => c.status === 'in-progress').length;
        const resolved = complaints.filter(c => c.status === 'resolved').length;

        setStats({
          totalComplaints,
          pending,
          inProgress,
          resolved
        });

        // Get recent complaints (last 3)
        const recent = complaints
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);
        
        setRecentComplaints(recent);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
            Welcome back, {user?.username}!
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Room {user?.room_number} • {user?.phone}
          </p>
        </div>
        <Link
          to="/student/complaint/new"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '500'
          }}
        >
          <PlusCircle size={20} />
          <span>New Complaint</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Total Complaints</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{stats.totalComplaints}</p>
            </div>
            <List style={{ width: '2rem', height: '2rem', color: '#9ca3af' }} />
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Pending</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>{stats.pending}</p>
            </div>
            <AlertTriangle style={{ width: '2rem', height: '2rem', color: '#f59e0b' }} />
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>In Progress</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.inProgress}</p>
            </div>
            <div style={{ 
              width: '2rem', 
              height: '2rem', 
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ 
                width: '1rem', 
                height: '1rem', 
                backgroundColor: '#3b82f6',
                borderRadius: '50%'
              }}></div>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Resolved</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>{stats.resolved}</p>
            </div>
            <CheckCircle style={{ width: '2rem', height: '2rem', color: '#10b981' }} />
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>Recent Complaints</h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {recentComplaints.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentComplaints.map((complaint) => (
                <div key={complaint.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}>
                  <div>
                    <h3 style={{ fontWeight: '500', color: '#111827' }}>{complaint.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {complaint.description} • {formatDate(complaint.created_at)}
                    </p>
                  </div>
                  <span 
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                      ...(complaint.status === 'pending' && {
                        backgroundColor: '#fef3c7',
                        color: '#d97706'
                      }),
                      ...(complaint.status === 'in-progress' && {
                        backgroundColor: '#dbeafe',
                        color: '#2563eb'
                      }),
                      ...(complaint.status === 'resolved' && {
                        backgroundColor: '#d1fae5',
                        color: '#059669'
                      })
                    }}
                  >
                    {complaint.status.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No complaints submitted yet</p>
              <Link
                to="/student/complaint/new"
                style={{ 
                  color: '#3b82f6', 
                  fontWeight: '500', 
                  textDecoration: 'none' 
                }}
              >
                Submit your first complaint →
              </Link>
            </div>
          )}
          
          {recentComplaints.length > 0 && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link
                to="/student/complaints"
                style={{ color: '#3b82f6', fontWeight: '500', textDecoration: 'none' }}
              >
                View All Complaints →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;