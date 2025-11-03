const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const db = require('../database');

const router = express.Router();

// Get user's maintenance requests
router.get('/my-requests', protect, (req, res) => {
  const userId = req.user.userId;

  db.all(
    `SELECT mr.*, ab.username AS assigned_by_admin_name
     FROM maintenance_requests mr
     LEFT JOIN users ab ON mr.assigned_by_admin_id = ab.id
     WHERE mr.user_id = ?
     ORDER BY mr.created_at DESC`,
    [userId],
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

// Create new maintenance request
router.post('/create', protect, (req, res) => {
  const userId = req.user.userId;
  const { title, description, priority = 'medium', room_number, complaint_type = 'other' } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title and description are required'
    });
  }

  const query = `
    INSERT INTO maintenance_requests (user_id, title, description, priority, room_number, complaint_type, status) 
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;

  db.run(query, [userId, title, description, priority, room_number, complaint_type], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }

    res.json({
      success: true,
      message: 'Maintenance request created successfully',
      data: {
        id: this.lastID,
        title,
        description,
        priority,
        complaint_type,
        room_number,
        status: 'pending',
        created_at: new Date().toISOString()
      }
    });
  });
});

module.exports = router;
 
// Delete a maintenance request (only by owner)
router.delete('/:id', protect, (req, res) => {
  const userId = req.user.userId;
  const requestId = req.params.id;

  // Verify the request belongs to the authenticated user
  db.get(
    `SELECT id, user_id FROM maintenance_requests WHERE id = ?`,
    [requestId],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      if (!row) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      if (String(row.user_id) !== String(userId)) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this request' });
      }

      db.run(
        `DELETE FROM maintenance_requests WHERE id = ?`,
        [requestId],
        function(deleteErr) {
          if (deleteErr) {
            console.error('Database error:', deleteErr);
            return res.status(500).json({ success: false, message: 'Internal server error' });
          }

          return res.json({ success: true, message: 'Request deleted successfully' });
        }
      );
    }
  );
});