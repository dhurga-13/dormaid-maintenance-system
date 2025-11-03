import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, AlertTriangle, List, Building, BarChart3, Wrench, UserPlus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningTech, setAssigningTech] = useState(null);
  const [showReport, setShowReport] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('dormaid_token');
      
      // Fetch all complaints
      const complaintsResponse = await fetch('http://localhost:5000/api/admin/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch technicians
      const techResponse = await fetch('http://localhost:5000/api/admin/technicians', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Fetch users
      const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (complaintsResponse.ok) {
        const result = await complaintsResponse.json();
        console.log('Complaints data:', result.data); // Debug log
        setComplaints(result.data || []);
      } else {
        console.error('Failed to fetch complaints:', complaintsResponse.status);
      }

      if (techResponse.ok) {
        const result = await techResponse.json();
        setTechnicians(result.data || []);
      }

      if (usersResponse.ok) {
        const result = await usersResponse.json();
        setUsers(result.data || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const stats = {
    totalComplaints: complaints.length,
    pendingComplaints: complaints.filter(c => c.status === 'pending').length,
    resolvedComplaints: complaints.filter(c => c.status === 'resolved').length,
    totalStudents: users.filter(u => u.role === 'student').length,
    totalTechnicians: technicians.length,
    activeTechnicians: technicians.filter(t => t.status === 'active').length
  };

  // Assign technician to complaint
  const assignTechnician = async (complaintId, technicianId) => {
    setAssigningTech(complaintId);
    try {
      const token = localStorage.getItem('dormaid_token');
      const response = await fetch(`http://localhost:5000/api/admin/complaints/${complaintId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ technicianId })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh the data
        fetchDashboardData();
        alert('Technician assigned successfully!');
      } else {
        alert('Error assigning technician: ' + result.message);
      }
    } catch (error) {
      console.error('Error assigning technician:', error);
      alert('Error assigning technician');
    } finally {
      setAssigningTech(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock style={{ width: '1rem', height: '1rem', color: '#f59e0b' }} />;
      case 'in-progress': return <AlertTriangle style={{ width: '1rem', height: '1rem', color: '#3b82f6' }} />;
      case 'resolved': return <CheckCircle style={{ width: '1rem', height: '1rem', color: '#10b981' }} />;
      default: return <Clock style={{ width: '1rem', height: '1rem' }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Compute complaint type stats
  const typeStats = React.useMemo(() => {
    const counts = complaints.reduce((acc, c) => {
      const key = (c.complaint_type || 'other').toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries;
  }, [complaints]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get technician name by ID
  const getTechnicianName = (techId) => {
    if (!techId) return 'Not Assigned';
    const tech = technicians.find(t => t.id === techId);
    return tech ? tech.username : 'Unknown Technician';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '3px solid transparent',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p style={{ color: '#6b7280' }}>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Admin Dashboard</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Welcome back, {user?.username}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={fetchDashboardData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '0.75rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => setShowReport(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <BarChart3 size={20} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem',
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
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Pending</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pendingComplaints}</p>
            </div>
            <Clock style={{ width: '2rem', height: '2rem', color: '#f59e0b' }} />
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Resolved</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.resolvedComplaints}</p>
            </div>
            <CheckCircle style={{ width: '2rem', height: '2rem', color: '#10b981' }} />
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Total Students</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.totalStudents}</p>
            </div>
            <Users style={{ width: '2rem', height: '2rem', color: '#3b82f6' }} />
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Technicians</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.totalTechnicians}</p>
            </div>
            <Wrench style={{ width: '2rem', height: '2rem', color: '#8b5cf6' }} />
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            width: 'min(560px, 90vw)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>Complaint Type Report</h3>
              <button onClick={() => setShowReport(false)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '0.375rem 0.625rem', cursor: 'pointer' }}>Close</button>
            </div>
            <div style={{ padding: '1rem 1.25rem' }}>
              {typeStats.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {typeStats.map(([type, count], idx) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: idx === 0 ? '#f0f9ff' : 'white' }}>
                      <span style={{ textTransform: 'capitalize', color: '#374151', fontWeight: 500 }}>{type}</span>
                      <span style={{ fontWeight: 700, color: idx === 0 ? '#0ea5e9' : '#111827' }}>{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>No complaints found to generate report.</p>
              )}
            </div>
            {/* Footer removed to avoid duplicate Close button */}
          </div>
        </div>
      )}

      {/* Recent Complaints Section */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>All Complaints</h2>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Showing {complaints.length} complaints
          </span>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {complaints.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {complaints.map((complaint) => (
                <div key={complaint.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: complaint.status === 'pending' ? '#fffbeb' : 'white'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                      {complaint.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                      <strong>Priority:</strong> <span style={{ color: getPriorityColor(complaint.priority), fontWeight: '500' }}>
                        {complaint.priority}
                      </span> • <strong>Type:</strong> {complaint.complaint_type || '—'} • <strong>Room:</strong> {complaint.room_number} • <strong>Student:</strong> {complaint.student_name || 'Unknown'}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                      {complaint.description}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      <strong>Submitted:</strong> {formatDate(complaint.created_at)} • 
                      <strong> Assigned to:</strong> {getTechnicianName(complaint.assigned_to)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(complaint.status)}
                      <span style={{ 
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        ...(complaint.status === 'pending' && {
                          backgroundColor: '#fef3c7',
                          color: '#d97706',
                          border: '1px solid #f59e0b'
                        }),
                        ...(complaint.status === 'in-progress' && {
                          backgroundColor: '#dbeafe',
                          color: '#2563eb',
                          border: '1px solid #3b82f6'
                        }),
                        ...(complaint.status === 'resolved' && {
                          backgroundColor: '#d1fae5',
                          color: '#059669',
                          border: '1px solid #10b981'
                        })
                      }}>
                        {getStatusText(complaint.status)}
                      </span>
                    </div>
                    
                    {/* Assign Technician Dropdown */}
                    {complaint.status === 'pending' && technicians.length > 0 && (
                      <select
                        value={complaint.assigned_to || ''}
                        onChange={(e) => assignTechnician(complaint.id, e.target.value)}
                        disabled={assigningTech === complaint.id}
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          minWidth: '180px',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="">Assign Technician</option>
                        {technicians.map(tech => (
                          <option key={tech.id} value={tech.id}>
                            {tech.username} {tech.work_area ? `• ${tech.work_area}` : ''} ({tech.phone || 'No phone'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                No complaints found
              </p>
              <p style={{ color: '#9ca3af' }}>
                When students submit maintenance requests, they will appear here.
              </p>
            </div>
          )}
        </div>
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

export default AdminDashboard;