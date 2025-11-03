const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const JWT_SECRET = 'dormaid_secret_key_2024';
const JWT_EXPIRES_IN = '7d';

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Register new user
exports.register = (req, res) => {
  try {
    console.log('=== REGISTRATION REQUEST RECEIVED ===');
    console.log('Request body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('🚨 VALIDATION ERRORS:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    console.log('✅ Validation passed');

    // Map frontend field names to backend field names
    const { 
      name,        // Frontend sends 'name' (maps to username)
      email, 
      password, 
      role = 'student', 
      roomNumber,  // Frontend sends 'roomNumber' (maps to room_number)
      blockNumber, // Frontend sends 'blockNumber' for students
      phone,
      workArea,     // Frontend sends 'workArea' for technicians
      registerNumber // Frontend sends 'registerNumber' for students
    } = req.body;

    // Map frontend field names to backend expectations
    const username = name; // Map 'name' to 'username'
    const room_number = roomNumber; // Map 'roomNumber' to 'room_number'
    const work_area = role === 'technician' ? workArea || null : null;
    const register_number = role === 'student' ? (registerNumber || null) : null;
    const block_number = role === 'student' ? (blockNumber || null) : null;

    console.log('📝 Mapped data:', {
      username: username,
      email: email,
      passwordLength: password ? password.length : 0,
      role: role,
      room_number: room_number,
      phone: phone,
      work_area,
      register_number,
      block_number
    });

    // Validate register number for students
    if (role === 'student') {
      const pattern = /^[0-9]{2}[A-Za-z]{3}[0-9]{4}$/; // e.g., 23MIS0145
      if (!register_number || !pattern.test(register_number)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid register number format (e.g., 23MIS0145)'
        });
      }
    }

    // Check if user already exists
    User.findByEmail(email, (err, existingUser) => {
      if (err) {
        console.error('❌ Database error in findByEmail:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }

      if (existingUser) {
        console.log('🚨 User already exists with email:', email);
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      console.log('✅ Email is available');

      // Create new user with mapped data
      const userData = {
        username: username,
        email: email,
        password: password,
        role: role,
        room_number: room_number,
        block_number: block_number,
        phone: phone,
        work_area: work_area,
        register_number: register_number
      };

      User.create(userData, (err, user) => {
        if (err) {
          console.error('❌ Error creating user:', err);
          
          if (err.message.includes('UNIQUE constraint failed: users.username')) {
            return res.status(409).json({
              success: false,
              message: 'Username already taken'
            });
          }
          
          return res.status(500).json({
            success: false,
            message: 'Internal server error'
          });
        }

        console.log('✅ User created successfully:', {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        });

        const token = generateToken(user.id);

        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              room_number: user.room_number,
              block_number: user.block_number,
              phone: user.phone,
              work_area: user.work_area || null,
              register_number: user.register_number || null
            },
            token
          }
        });
      });
    });

  } catch (error) {
    console.error('💥 Unexpected error in register:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login user
exports.login = (req, res) => {
  try {
    console.log('=== LOGIN REQUEST RECEIVED ===');
    console.log('Request body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('🚨 VALIDATION ERRORS:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    console.log('✅ Login validation passed');

    const { email, password } = req.body;

    console.log('🔐 Login attempt for email:', email);

    // Find user by email
    User.findByEmail(email, (err, user) => {
      if (err) {
        console.error('❌ Database error in findByEmail:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }

      if (!user) {
        console.log('🚨 No user found with email:', email);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      console.log('✅ User found:', { id: user.id, email: user.email });

      // Verify password
      User.verifyPassword(password, user.password_hash, (err, isMatch) => {
        if (err) {
          console.error('❌ Password verification error:', err);
          return res.status(500).json({
            success: false,
            message: 'Internal server error'
          });
        }

        if (!isMatch) {
          console.log('🚨 Password mismatch for user:', email);
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }

        console.log('✅ Password verified successfully');

        const token = generateToken(user.id);

        console.log('🎉 Login successful for user:', {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        });

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              room_number: user.room_number,
              block_number: user.block_number,
              phone: user.phone,
              work_area: user.work_area || null,
              register_number: user.register_number || null
            },
            token
          }
        });
      });
    });

  } catch (error) {
    console.error('💥 Unexpected error in login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user profile
exports.getProfile = (req, res) => {
  try {
    console.log('=== PROFILE REQUEST RECEIVED ===');
    console.log('User ID from token:', req.user.userId);

    User.findById(req.user.userId, (err, user) => {
      if (err) {
        console.error('❌ Database error in findById:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }

      if (!user) {
        console.log('🚨 User not found with ID:', req.user.userId);
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('✅ Profile retrieved for user:', {
        id: user.id,
        username: user.username,
        email: user.email
      });

      res.json({
        success: true,
        data: { user }
      });
    });

  } catch (error) {
    console.error('💥 Unexpected error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update current user profile
exports.updateProfile = (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone, roomNumber, blockNumber, workArea, registerNumber } = req.body;

    // Build dynamic update based on provided fields
    const fields = [];
    const params = [];

    if (name !== undefined) { fields.push('username = ?'); params.push(name); }
    if (email !== undefined) { fields.push('email = ?'); params.push(email); }
    if (phone !== undefined) { fields.push('phone = ?'); params.push(phone); }
    if (roomNumber !== undefined) { fields.push('room_number = ?'); params.push(roomNumber); }
    if (blockNumber !== undefined) { fields.push('block_number = ?'); params.push(blockNumber); }
    if (workArea !== undefined) { fields.push('work_area = ?'); params.push(workArea); }
    if (registerNumber !== undefined) { fields.push('register_number = ?'); params.push(registerNumber); }

    if (fields.length === 0) {
      return res.json({ success: true, message: 'No changes provided', data: { } });
    }

    const sql = `UPDATE users SET ${fields.join(', ')}, created_at = created_at WHERE id = ?`;
    params.push(userId);

    const db = require('../database');
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Database error in updateProfile:', err);
        if (err.message && err.message.includes('UNIQUE constraint failed: users.email')) {
          return res.status(409).json({ success: false, message: 'Email already in use' });
        }
        if (err.message && err.message.includes('UNIQUE constraint failed: users.username')) {
          return res.status(409).json({ success: false, message: 'Username already in use' });
        }
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      // Return updated user
      User.findById(userId, (findErr, user) => {
        if (findErr || !user) {
          return res.status(200).json({ success: true, message: 'Profile updated', data: {} });
        }
        return res.json({ success: true, message: 'Profile updated', data: { user } });
      });
    });
  } catch (error) {
    console.error('💥 Unexpected error in updateProfile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Change password
exports.changePassword = (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    // Fetch user with password hash
    const db = require('../database');
    db.get('SELECT id, password_hash FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error('❌ Database error in changePassword (select):', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      if (!row) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Verify current password
      User.verifyPassword(currentPassword, row.password_hash, (vErr, isMatch) => {
        if (vErr) {
          console.error('❌ Password verify error:', vErr);
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash and update new password
        const bcrypt = require('bcryptjs');
        bcrypt.hash(newPassword, 10, (hErr, hashed) => {
          if (hErr) {
            console.error('❌ Password hash error:', hErr);
            return res.status(500).json({ success: false, message: 'Internal server error' });
          }
          db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, userId], function(uErr) {
            if (uErr) {
              console.error('❌ Database error in changePassword (update):', uErr);
              return res.status(500).json({ success: false, message: 'Internal server error' });
            }
            return res.json({ success: true, message: 'Password updated successfully' });
          });
        });
      });
    });
  } catch (error) {
    console.error('💥 Unexpected error in changePassword:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};