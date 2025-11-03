import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Clock, CheckCircle, AlertCircle, RefreshCw, Trash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ComplaintStatus = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch complaints from backend
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('dormaid_token');
      const response = await fetch('http://localhost:5000/api/maintenance/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setComplaints(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this complaint?');
    if (!confirmed) return;
    try {
      setDeletingId(id);
      const token = localStorage.getItem('dormaid_token');
      const response = await fetch(`http://localhost:5000/api/maintenance/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setComplaints(prev => prev.filter(c => c.id !== id));
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.message || 'Failed to delete complaint');
      }
    } catch (e) {
      console.error('Delete error:', e);
      alert('Failed to delete complaint');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || complaint.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock style={{ width: '1rem', height: '1rem', color: '#d97706' }} />;
      case 'in-progress': return <AlertCircle style={{ width: '1rem', height: '1rem', color: '#2563eb' }} />;
      case 'resolved': return <CheckCircle style={{ width: '1rem', height: '1rem', color: '#059669' }} />;
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#6b7280',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>My Complaints</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            border: '2px solid transparent',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6b7280' }}>Loading your complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#6b7280',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>My Complaints</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>Room {user?.room_number}</p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            color: '#374151',
            fontSize: '0.875rem'
          }}
        >
          <RefreshCw 
            size={16} 
            style={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none' 
            }} 
          />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              width: '1rem',
              height: '1rem',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search complaints by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                minWidth: '140px'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
        
        {/* Summary */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          fontSize: '0.875rem', 
          color: '#6b7280',
          flexWrap: 'wrap'
        }}>
          <span>Total: {complaints.length}</span>
          <span>Pending: {complaints.filter(c => c.status === 'pending').length}</span>
          <span>In Progress: {complaints.filter(c => c.status === 'in-progress').length}</span>
          <span>Resolved: {complaints.filter(c => c.status === 'resolved').length}</span>
        </div>
      </div>

      {/* Complaints List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map(complaint => (
            <div key={complaint.id} style={{ 
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                    {complaint.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      backgroundColor: '#f3f4f6',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      Priority: <span style={{ color: getPriorityColor(complaint.priority) }}>{complaint.priority}</span>
                    </span>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Submitted: {formatDate(complaint.created_at)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5', margin: 0 }}>
                    {complaint.description}
                  </p>
                  {complaint.assigned_by_admin_name && complaint.assigned_at && (
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                      Assigned by {complaint.assigned_by_admin_name} on {formatDate(complaint.assigned_at)}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  {getStatusIcon(complaint.status)}
                  <span 
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
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
                    {getStatusText(complaint.status)}
                  </span>
                  <button
                    onClick={() => handleDelete(complaint.id)}
                    disabled={deletingId === complaint.id}
                    title="Delete complaint"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.375rem 0.5rem',
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fecaca',
                      borderRadius: '0.375rem',
                      cursor: deletingId === complaint.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Trash size={14} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {deletingId === complaint.id ? 'Deleting...' : 'Delete'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div style={{ 
                display: 'flex',
                gap: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #f3f4f6',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <span>
                  <strong>Room:</strong> {complaint.room_number}
                </span>
                {complaint.updated_at !== complaint.created_at && (
                  <span>
                    <strong>Last Updated:</strong> {formatDate(complaint.updated_at)}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ 
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            {complaints.length === 0 ? (
              <>
                <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  No complaints submitted yet
                </p>
                <p style={{ color: '#9ca3af' }}>
                  Submit your first maintenance request to get started
                </p>
              </>
            ) : (
              <>
                <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  No complaints match your search
                </p>
                <p style={{ color: '#9ca3af' }}>
                  Try adjusting your search terms or filter
                </p>
              </>
            )}
          </div>
        )}
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

export default ComplaintStatus;