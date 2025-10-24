const express = require('express');
const cors = require('cors');

// Initialize database
const db = require('./database');

const authRoutes = require('./routes/authRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Add this line
const technicianRoutes = require('./routes/technicianRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/admin', adminRoutes); // Add this line
app.use('/api/technician', technicianRoutes);
// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DormAid API is running with SQLite', 
    timestamp: new Date().toISOString() 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DormAid Server running on port ${PORT}`);
  console.log(`📁 SQLite database: dormaid.sqlite`);
});