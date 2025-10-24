import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, List, Wrench, Calendar, Search, User, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assigned');
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingTask, setUpdatingTask] = useState(null);

  // Fetch technician's assigned tasks from backend
  useEffect(() => {
    fetchTechnicianTasks();
  }, []);

  const fetchTechnicianTasks = async () => {
    try {
      const token = localStorage.getItem('dormaid_token');
      const response = await fetch('http://localhost:5000/api/technician/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Technician tasks:', result.data); // Debug log
        setTasks(result.data || []);
      } else {
        console.error('Failed to fetch technician tasks:', response.status);
      }
    } catch (error) {
      console.error('Error fetching technician tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    setUpdatingTask(taskId);
    try {
      const token = localStorage.getItem('dormaid_token');
      const response = await fetch(`http://localhost:5000/api/technician/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: newStatus,
                ...(newStatus === 'completed' && { completed_date: new Date().toISOString() })
              }
            : task
        ));
        alert(`Task status updated to ${getStatusText(newStatus)}`);
      } else {
        alert('Error updating task: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task');
    } finally {
      setUpdatingTask(null);
    }
  };

  // Calculate stats from real data
  const stats = {
    totalTasks: tasks.length,
    assigned: tasks.filter(task => task.status === 'pending').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    completed: tasks.filter(task => task.status === 'resolved').length,
    highPriority: tasks.filter(task => task.priority === 'high').length
  };

  const recentTasks = tasks.slice(0, 3);

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = activeTab === 'all' || 
      (activeTab === 'assigned' && task.status === 'pending') ||
      (activeTab === 'in-progress' && task.status === 'in-progress') ||
      (activeTab === 'completed' && task.status === 'resolved');
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.student_name && task.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         task.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock style={{ width: '1rem', height: '1rem', color: '#f59e0b' }} />;
      case 'in-progress': return <Wrench style={{ width: '1rem', height: '1rem', color: '#3b82f6' }} />;
      case 'resolved': return <CheckCircle style={{ width: '1rem', height: '1rem', color: '#10b981' }} />;
      default: return <Clock style={{ width: '1rem', height: '1rem' }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Assigned';
      case 'in-progress': return 'In Progress';
      case 'resolved': return 'Completed';
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <p style={{ color: '#6b7280' }}>Loading technician dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Technician Dashboard</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Welcome back, {user?.username}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={fetchTechnicianTasks}
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
            <Wrench size={20} />
            <span>Quick Report</span>
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
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Total Tasks</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{stats.totalTasks}</p>
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
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Assigned</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.assigned}</p>
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
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>In Progress</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.inProgress}</p>
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
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Completed</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.completed}</p>
            </div>
            <CheckCircle style={{ width: '2rem', height: '2rem', color: '#10b981' }} />
          </div>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>Recent Tasks</h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {recentTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentTasks.map((task) => (
                <div key={task.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}>
                  <div>
                    <h3 style={{ fontWeight: '500', color: '#111827' }}>{task.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Room {task.room_number} • {formatDate(task.created_at)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getStatusIcon(task.status)}
                    <span style={{ 
                      padding: '0.375rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      ...(task.status === 'pending' && {
                        backgroundColor: '#fef3c7',
                        color: '#d97706'
                      }),
                      ...(task.status === 'in-progress' && {
                        backgroundColor: '#dbeafe',
                        color: '#2563eb'
                      }),
                      ...(task.status === 'resolved' && {
                        backgroundColor: '#d1fae5',
                        color: '#059669'
                      })
                    }}>
                      {getStatusText(task.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No tasks assigned yet</p>
          )}
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                color: '#3b82f6',
                fontWeight: '500',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              View All Tasks →
            </button>
          </div>
        </div>
      </div>

      {/* All Tasks Section */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>All Tasks</h2>
            
            {/* Search */}
            <div style={{ position: 'relative' }}>
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
                placeholder="Search tasks by title, room, or student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  width: '300px'
                }}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All Tasks' },
              { key: 'assigned', label: 'Assigned' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  backgroundColor: activeTab === tab.key ? '#3b82f6' : 'transparent',
                  color: activeTab === tab.key ? 'white' : '#6b7280',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div style={{ padding: '1.5rem' }}>
          {filteredTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredTasks.map(task => (
                <div key={task.id} style={{ 
                  padding: '1.5rem', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                          {task.title}
                        </h3>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          backgroundColor: '#f3f4f6',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#374151'
                        }}>
                          Priority: <span style={{ color: getPriorityColor(task.priority) }}>{task.priority}</span>
                        </span>
                      </div>
                      
                      <p style={{ color: '#6b7280', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                        {task.description}
                      </p>

                      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={16} />
                          <span><strong>Student:</strong> {task.student_name || 'Unknown'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={16} />
                          <span><strong>Room:</strong> {task.room_number}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={16} />
                          <span><strong>Assigned:</strong> {formatDate(task.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getStatusIcon(task.status)}
                        <span style={{ 
                          padding: '0.5rem 1rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                          ...(task.status === 'pending' && {
                            backgroundColor: '#fef3c7',
                            color: '#d97706'
                          }),
                          ...(task.status === 'in-progress' && {
                            backgroundColor: '#dbeafe',
                            color: '#2563eb'
                          }),
                          ...(task.status === 'resolved' && {
                            backgroundColor: '#d1fae5',
                            color: '#059669'
                          })
                        }}>
                          {getStatusText(task.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'in-progress')}
                        disabled={updatingTask === task.id}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: updatingTask === task.id ? '#9ca3af' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: updatingTask === task.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {updatingTask === task.id ? 'Starting...' : 'Start Task'}
                      </button>
                    )}
                    {task.status === 'in-progress' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'resolved')}
                        disabled={updatingTask === task.id}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: updatingTask === task.id ? '#9ca3af' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: updatingTask === task.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {updatingTask === task.id ? 'Completing...' : 'Mark Complete'}
                      </button>
                    )}
                    {task.status === 'resolved' && task.completed_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                        <CheckCircle size={16} />
                        <span>Completed on {formatDate(task.completed_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Wrench style={{ width: '3rem', height: '3rem', color: '#9ca3af', margin: '0 auto 1rem' }} />
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>No tasks found</p>
              <p style={{ color: '#9ca3af' }}>
                {searchTerm ? 'Try adjusting your search criteria' : 'No tasks assigned to you yet'}
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

export default TechnicianDashboard;