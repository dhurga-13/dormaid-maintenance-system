import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, List, Wrench, Calendar, Search, User, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(null);

   // ...existing code...
  // Fetch technician tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const techQuery = user?.id ? `?technicianId=${encodeURIComponent(user.id)}` : '';
      // NOTE: use the router mount + route: /api/technician/tasks
      const response = await fetch(`http://localhost:5000/api/technician/tasks${techQuery}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('dormaid_token') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      // defensive: if server returned non-JSON (HTML 404), log body for debugging
      if (!response.ok) {
        const text = await response.text();
        console.error('Fetch tasks failed', response.status, text);
        setTasks([]);
        return;
      }

      const data = await response.json();
      // backend returns { success: true, data: [...] }
      const tasksList = data.data || data.tasks || [];
      // keep client-side safety filter if needed
      const filtered = user
        ? tasksList.filter(t =>
            t.assigned_to == user.id ||
            t.technician_id == user.id ||
            t.assignedTechnicianId == user.id ||
            String(t.assigned_to).toLowerCase() === String(user.id).toLowerCase() ||
            t.assigned_to_email === user.email ||
            t.technician_email === user.email
          )
        : tasksList;

      setTasks(filtered);
    } catch (err) {
      console.error('Fetch error:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };
// ...existing code...

  // run fetch after user is available (so we can scope to assigned technician)
  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);
  // ...existing code...
  // Update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    setUpdatingTask(taskId);
    try {
      const token = localStorage.getItem('dormaid_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/technician/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Update status failed', response.status, text);
        return;
      }

      const resJson = await response.json();
      // backend returns updated row in resJson.data
      const updated = resJson.data || null;

      if (updated) {
        setTasks(prevTasks => prevTasks.map(t => (t.id === updated.id ? { ...t, ...updated } : t)));
      } else {
        // fallback: optimistically update local state
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId
              ? { ...task, status: newStatus, completed_date: newStatus === 'completed' ? new Date().toISOString() : null }
              : task
          )
        );
      }
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setUpdatingTask(null);
    }
  };
// ...existing code...
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate statistics
  const stats = {
    totalTasks: tasks.length,
    assigned: tasks.filter(task => task.status === 'pending').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    completed: tasks.filter(task => task.status === 'completed').length,
    highPriority: tasks.filter(task => task.priority === 'high').length
  };

  const recentTasks = tasks.slice(0, 3);

  // Filtered tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus =
      activeTab === 'all' ||
      (activeTab === 'assigned' && task.status === 'pending') ||
      (activeTab === 'in-progress' && task.status === 'in-progress') ||
      (activeTab === 'completed' && task.status === 'completed');

    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.student_name && task.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      task.room_number.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Icon helpers
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock style={{ width: '1rem', height: '1rem', color: '#f59e0b' }} />;
      case 'in-progress': return <Wrench style={{ width: '1rem', height: '1rem', color: '#3b82f6' }} />;
      case 'completed': return <CheckCircle style={{ width: '1rem', height: '1rem', color: '#10b981' }} />;
      default: return <Clock style={{ width: '1rem', height: '1rem' }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Assigned';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#fef3c7', color: '#d97706' };
      case 'in-progress':
        return { backgroundColor: '#dbeafe', color: '#2563eb' };
      case 'completed':
        return { backgroundColor: '#d1fae5', color: '#059669' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Technician Dashboard</h2>
        <button
          onClick={fetchTasks}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <StatCard icon={<List />} label="Total Tasks" value={stats.totalTasks} color="#3b82f6" />
        <StatCard icon={<Clock />} label="Assigned" value={stats.assigned} color="#f59e0b" />
        <StatCard icon={<Wrench />} label="In Progress" value={stats.inProgress} color="#3b82f6" />
        <StatCard icon={<CheckCircle />} label="Completed" value={stats.completed} color="#10b981" />
        <StatCard icon={<AlertTriangle />} label="High Priority" value={stats.highPriority} color="#ef4444" />
      </div>

      {/* Search and Tabs */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['all', 'assigned', 'in-progress', 'completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: activeTab === tab ? '#3b82f6' : '#e5e7eb',
                color: activeTab === tab ? 'white' : '#374151',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: '0.375rem', padding: '0.25rem 0.5rem', border: '1px solid #e5e7eb' }}>
          <Search size={16} style={{ color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              marginLeft: '0.5rem',
              fontSize: '0.875rem',
              color: '#374151'
            }}
          />
        </div>
      </div>

      {/* Task List */}
      <div style={{ marginTop: '2rem' }}>
        {loading ? (
          <p>Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredTasks.map(task => (
              <div key={task.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{task.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Room {task.room_number}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', ...getStatusStyles(task.status), padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
                    {getStatusIcon(task.status)}
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{getStatusText(task.status)}</span>
                  </div>
                </div>

                <p style={{ marginTop: '0.75rem', color: '#374151', fontSize: '0.875rem' }}>{task.description}</p>

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
                      onClick={() => updateTaskStatus(task.id, 'completed')}
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
                  {task.status === 'completed' && task.completed_date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                      <CheckCircle size={16} />
                      <span>Completed on {formatDate(task.completed_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <div style={{
      backgroundColor: `${color}20`,
      color: color,
      borderRadius: '9999px',
      padding: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{label}</p>
      <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>{value}</p>
    </div>
  </div>
);

export default TechnicianDashboard;
