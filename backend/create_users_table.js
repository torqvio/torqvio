import { config } from 'dotenv';
config(); // Load environment variables

import { createDatabaseConnection } from './src/database/connection.js';

const db = createDatabaseConnection();

async function createUsersTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'viewer',
        password_hash VARCHAR(255),
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    console.log('✅ Users table created successfully');
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);
    
    console.log('✅ Users table indexes created');
    
  } catch (error) {
    console.error('❌ Error creating users table:', error);
  } finally {
    // Don't call end() since it's a singleton pool
    console.log('✅ Migration completed');
  }
}

createUsersTable();
