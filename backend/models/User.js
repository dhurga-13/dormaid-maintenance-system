const db = require('../database');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static create(userData, callback) {
    const { username, email, password, role = 'student', room_number, phone, work_area } = userData;
    
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return callback(err);
      
      const query = `
        INSERT INTO users (username, email, password_hash, role, room_number, phone, work_area) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [username, email, hashedPassword, role, room_number, phone, work_area || null], function(err) {
        if (err) return callback(err);
        
        // Get the inserted user
        db.get(
          'SELECT id, username, email, role, room_number, phone, work_area, created_at FROM users WHERE id = ?',
          [this.lastID],
          (err, row) => {
            callback(err, row);
          }
        );
      });
    });
  }

  // Find user by email
  static findByEmail(email, callback) {
    db.get('SELECT * FROM users WHERE email = ?', [email], callback);
  }

  // Find user by ID
  static findById(id, callback) {
    db.get(
      'SELECT id, username, email, role, room_number, phone, created_at FROM users WHERE id = ?',
      [id],
      callback
    );
  }

  // Verify password
  static verifyPassword(plainPassword, hashedPassword, callback) {
    bcrypt.compare(plainPassword, hashedPassword, callback);
  }
}

module.exports = User;