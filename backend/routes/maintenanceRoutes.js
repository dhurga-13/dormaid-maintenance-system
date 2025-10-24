const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const db = require('../database');

const router = express.Router();

// Get user's maintenance requests
router.get('/my-requests', protect, (req, res) => {
  const userId = req.user.userId;

  db.all(
    `SELECT * FROM maintenance_requests WHERE user_id = ? ORDER BY created_at DESC`,
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
  const { title, description, priority = 'medium', room_number } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title and description are required'
    });
  }

  const query = `
    INSERT INTO maintenance_requests (user_id, title, description, priority, room_number, status) 
    VALUES (?, ?, ?, ?, ?, 'pending')
  `;

  db.run(query, [userId, title, description, priority, room_number], function(err) {
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
        room_number,
        status: 'pending',
        created_at: new Date().toISOString()
      }
    });
  });
});

module.exports = router;