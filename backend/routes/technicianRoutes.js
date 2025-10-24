const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const db = require('../database');

const router = express.Router();

// Get tasks assigned to the current technician
router.get('/tasks', protect, (req, res) => {
  const technicianId = req.user.userId;

  db.all(
    `SELECT mr.*, u.username as student_name, u.phone as student_phone
     FROM maintenance_requests mr 
     LEFT JOIN users u ON mr.user_id = u.id 
     WHERE mr.assigned_to = ?
     ORDER BY 
       CASE mr.priority 
         WHEN 'high' THEN 1
         WHEN 'medium' THEN 2
         WHEN 'low' THEN 3
         ELSE 4
       END,
       mr.created_at DESC`,
    [technicianId],
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

// Update task status
router.put('/tasks/:id/status', protect, (req, res) => {
  const taskId = req.params.id;
  const technicianId = req.user.userId;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required'
    });
  }

  // Verify the task is assigned to this technician
  db.get(
    `SELECT * FROM maintenance_requests WHERE id = ? AND assigned_to = ?`,
    [taskId, technicianId],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Task not found or not assigned to you'
        });
      }

      // Update the task status
      db.run(
        `UPDATE maintenance_requests 
         SET status = ?, updated_at = CURRENT_TIMESTAMP,
         completed_date = CASE WHEN ? = 'resolved' THEN CURRENT_TIMESTAMP ELSE completed_date END
         WHERE id = ?`,
        [status, status, taskId],
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
            message: 'Task status updated successfully'
          });
        }
      );
    }
  );
});

module.exports = router;