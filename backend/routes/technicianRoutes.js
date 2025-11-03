// ...existing code...
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const db = require('../database');

const router = express.Router();

// helper to check if a column exists on a table
function columnExists(table, column, cb) {
  db.all(`PRAGMA table_info('${table}')`, (err, cols) => {
    if (err) return cb(err);
    const exists = cols && cols.some(c => c.name === column);
    cb(null, exists);
  });
}

// Get tasks assigned to the current technician (or optional ?technicianId= for admin/testing)
router.get('/tasks', protect, (req, res) => {
  const technicianId = req.query.technicianId || req.user.userId;

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
        console.error('Database error (GET /tasks):', err);
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

  console.log('req.user:', req.user);
  console.log(`PUT /tasks/${taskId}/status by user ${technicianId} -> status=${status}`);

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required'
    });
  }

  const validStatuses = ['pending', 'in-progress', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
    });
  }

  // Verify the task is assigned to this technician
  db.get(
    `SELECT * FROM maintenance_requests WHERE id = ? AND assigned_to = ?`,
    [taskId, technicianId],
    (err, row) => {
      if (err) {
        console.error('Database error (SELECT task):', err);
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

      // Determine which "completed" column exists (if any)
      columnExists('maintenance_requests', 'completed_date', (err1, hasCompletedDate) => {
        if (err1) {
          console.error('Error checking columns:', err1);
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        columnExists('maintenance_requests', 'completed_at', (err2, hasCompletedAt) => {
          if (err2) {
            console.error('Error checking columns:', err2);
            return res.status(500).json({ success: false, message: 'Internal server error' });
          }

          let sql, params;
          if (hasCompletedDate) {
            sql = `UPDATE maintenance_requests 
                   SET status = ?, updated_at = CURRENT_TIMESTAMP,
                       completed_date = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_date END
                   WHERE id = ?`;
            params = [status, status, taskId];
          } else if (hasCompletedAt) {
            sql = `UPDATE maintenance_requests 
                   SET status = ?, updated_at = CURRENT_TIMESTAMP,
                       completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
                   WHERE id = ?`;
            params = [status, status, taskId];
          } else {
            // no completed column — just update status and updated_at
            sql = `UPDATE maintenance_requests 
                   SET status = ?, updated_at = CURRENT_TIMESTAMP
                   WHERE id = ?`;
            params = [status, taskId];
          }

          db.run(sql, params, function(err3) {
            if (err3) {
              console.error('Database error (UPDATE task):', err3);
              const msg = (process.env.NODE_ENV === 'production') ? 'Internal server error' : err3.message;
              return res.status(500).json({
                success: false,
                message: msg
              });
            }

            // Return the updated row so frontend can sync
            db.get(
              `SELECT mr.*, u.username as student_name, u.phone as student_phone
               FROM maintenance_requests mr
               LEFT JOIN users u ON mr.user_id = u.id
               WHERE mr.id = ?`,
              [taskId],
              (err4, updatedRow) => {
                if (err4) {
                  console.error('Database error (SELECT updated):', err4);
                  const msg = (process.env.NODE_ENV === 'production') ? 'Internal server error' : err4.message;
                  return res.status(500).json({
                    success: false,
                    message: msg
                  });
                }

                res.json({
                  success: true,
                  message: 'Task status updated successfully',
                  data: updatedRow
                });
              }
            );
          });
        });
      });
    }
  );
});

module.exports = router;
// ...existing code...