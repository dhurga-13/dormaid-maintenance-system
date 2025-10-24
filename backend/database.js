const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'dormaid.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      room_number TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('✅ Users table ready');
    }
  });

  // Maintenance requests table - UPDATED
  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      room_number TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      assigned_to INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (assigned_to) REFERENCES users (id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating maintenance_requests table:', err);
    } else {
      console.log('✅ Maintenance requests table ready');
      addAssignedToColumnIfMissing();
    }
  });
}

// Function to add missing column to existing tables
function addAssignedToColumnIfMissing() {
  db.all(`
    PRAGMA table_info(maintenance_requests)
  `, (err, columns) => {
    if (err) {
      console.error('Error checking columns:', err);
      return;
    }
    
    const hasAssignedTo = columns.some(col => col.name === 'assigned_to');
    
    if (!hasAssignedTo) {
      db.run(`
        ALTER TABLE maintenance_requests 
        ADD COLUMN assigned_to INTEGER
        REFERENCES users(id)
      `, (alterErr) => {
        if (alterErr) {
          console.error('Error adding assigned_to column:', alterErr);
        } else {
          console.log('✅ Successfully added assigned_to column to maintenance_requests table');
        }
      });
    } else {
      console.log('✅ assigned_to column already exists');
    }
  });
}

module.exports = db;