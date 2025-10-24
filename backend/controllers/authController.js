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
      phone
    } = req.body;

    // Map frontend field names to backend expectations
    const username = name; // Map 'name' to 'username'
    const room_number = roomNumber; // Map 'roomNumber' to 'room_number'

    console.log('📝 Mapped data:', {
      username: username,
      email: email,
      passwordLength: password ? password.length : 0,
      role: role,
      room_number: room_number,
      phone: phone
    });

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
        phone: phone
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
              phone: user.phone
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
              phone: user.phone
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