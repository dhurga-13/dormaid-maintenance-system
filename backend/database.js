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
      block_number TEXT,
      phone TEXT,
      work_area TEXT,
      register_number TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('✅ Users table ready');
      addMissingUserColumnsIfNeeded();
    }
  });

  // Maintenance requests table - UPDATED
  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      complaint_type TEXT,
      room_number TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      assigned_to INTEGER,
      assigned_by_admin_id INTEGER,
      assigned_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (assigned_to) REFERENCES users (id),
      FOREIGN KEY (assigned_by_admin_id) REFERENCES users (id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating maintenance_requests table:', err);
    } else {
      console.log('✅ Maintenance requests table ready');
      addMissingColumnsIfNeeded();
    }
  });
}

// Function to add missing columns to existing tables
function addMissingColumnsIfNeeded() {
  db.all(`
    PRAGMA table_info(maintenance_requests)
  `, (err, columns) => {
    if (err) {
      console.error('Error checking columns:', err);
      return;
    }
    
    const hasAssignedTo = columns.some(col => col.name === 'assigned_to');
    const hasAssignedBy = columns.some(col => col.name === 'assigned_by_admin_id');
    const hasAssignedAt = columns.some(col => col.name === 'assigned_at');
    const hasComplaintType = columns.some(col => col.name === 'complaint_type');
    
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

    if (!hasAssignedBy) {
      db.run(`
        ALTER TABLE maintenance_requests 
        ADD COLUMN assigned_by_admin_id INTEGER
        REFERENCES users(id)
      `, (alterErr) => {
        if (alterErr) {
          console.error('Error adding assigned_by_admin_id column:', alterErr);
        } else {
          console.log('✅ Successfully added assigned_by_admin_id column');
        }
      });
    } else {
      console.log('✅ assigned_by_admin_id column already exists');
    }

    if (!hasAssignedAt) {
      db.run(`
        ALTER TABLE maintenance_requests 
        ADD COLUMN assigned_at DATETIME
      `, (alterErr) => {
        if (alterErr) {
          console.error('Error adding assigned_at column:', alterErr);
        } else {
          console.log('✅ Successfully added assigned_at column');
        }
      });
    } else {
      console.log('✅ assigned_at column already exists');
    }

    if (!hasComplaintType) {
      db.run(`
        ALTER TABLE maintenance_requests 
        ADD COLUMN complaint_type TEXT
      `, (alterErr) => {
        if (alterErr) {
          console.error('Error adding complaint_type column:', alterErr);
        } else {
          console.log('✅ Successfully added complaint_type column');
        }
      });
    } else {
      console.log('✅ complaint_type column already exists');
    }
  });
}

// Add missing columns to users table (e.g., work_area)
function addMissingUserColumnsIfNeeded() {
  db.all(`
    PRAGMA table_info(users)
  `, (err, columns) => {
    if (err) {
      console.error('Error checking users columns:', err);
      return;
    }

    const hasWorkArea = columns.some(col => col.name === 'work_area');
    const hasRegisterNumber = columns.some(col => col.name === 'register_number');
    const hasBlockNumber = columns.some(col => col.name === 'block_number');

    if (!hasWorkArea) {
      db.run(`
        ALTER TABLE users 
        ADD COLUMN work_area TEXT
      `, (alterErr) => {
        if (alterErr) {
          console.error('Error adding work_area column:', alterErr);
        } else {
          console.log('✅ Successfully added work_area column to users table');
        }
      });
    } else {
      console.log('✅ work_area column already exists');
    }

    if (!hasRegisterNumber) {
      db.run(`
        ALTER TABLE users 
        ADD COLUMN register_number TEXT
      `, (alterErr) => {
        if (alterErr) {
          console.error('Error adding register_number column:', alterErr);
        } else {
          // Add unique index if not exists (SQLite workaround via CREATE UNIQUE INDEX IF NOT EXISTS)
          db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_register_number ON users(register_number)`);
          console.log('✅ Successfully added register_number column to users table');
        }
      });
    } else {
      console.log('✅ register_number column already exists');
    }

    if (!hasBlockNumber) {
      db.run(`
        ALTER TABLE users 
        ADD COLUMN block_number TEXT
      `, (alterErr) => {
        if (alterErr) {
          console.error('Error adding block_number column:', alterErr);
        } else {
          console.log('✅ Successfully added block_number column to users table');
        }
      });
    } else {
      console.log('✅ block_number column already exists');
    }
  });
}

module.exports = db;