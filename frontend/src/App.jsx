import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import StudentDashboard from './pages/student/StudentDashboard';
import ComplaintForm from './pages/student/ComplaintForm';
import ComplaintStatus from './pages/student/ComplaintStatus';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import './styles/globals.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center" style={{ height: '100vh' }}>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
          <Navbar />
          <main className="container" style={{ padding: '2rem 1rem' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Student Routes */}
              <Route path="/student" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/student/complaint/new" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ComplaintForm />
                </ProtectedRoute>
              } />
              <Route path="/student/complaints" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ComplaintStatus />
                </ProtectedRoute>
              } />
              
              {/* Technician Routes */}
              <Route path="/technician" element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <TechnicianDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin', 'warden']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* Profile Route */}
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['student', 'technician', 'admin', 'warden']}>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;