const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const db = require('../database');

const router = express.Router();

// Get all complaints for admin
router.get('/complaints', protect, (req, res) => {
  db.all(
    `SELECT mr.*, u.username as student_name, u.room_number as student_room
     FROM maintenance_requests mr 
     LEFT JOIN users u ON mr.user_id = u.id 
     ORDER BY mr.created_at DESC`,
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }

      res.json({
        success: true,
        data: rows
      });
    }
  );
});

// Get all technicians
router.get('/technicians', protect, (req, res) => {
  db.all(
    `SELECT id, username, email, role, phone FROM users WHERE role = 'technician'`,
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }

      res.json({
        success: true,
        data: rows
      });
    }
  );
});

// Get all users
router.get('/users', protect, (req, res) => {
  db.all(
    `SELECT id, username, email, role, room_number, phone FROM users`,
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }

      res.json({
        success: true,
        data: rows
      });
    }
  );
});

// Assign technician to complaint
router.put('/complaints/:id/assign', protect, (req, res) => {
  const complaintId = req.params.id;
  const { technicianId } = req.body;

  if (!technicianId) {
    return res.status(400).json({
      success: false,
      message: 'Technician ID is required'
    });
  }

  db.run(
    `UPDATE maintenance_requests 
     SET assigned_to = ?, status = 'in-progress', updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [technicianId, complaintId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }

      res.json({
        success: true,
        message: 'Technician assigned successfully'
      });
    }
  );
});

module.exports = router;