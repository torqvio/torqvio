// Simple script to create password_reset_tokens table
// Using the same database connection as the running backend

import('dotenv').then(async () => {
  console.log('Creating password reset tokens table...');
  
  try {
    // Import the database connection
    const { createDatabaseConnection } = await import('./dist/database/connection.js');
    const db = createDatabaseConnection();
    
    // Create the table
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash VARCHAR(64) NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used_at TIMESTAMP WITH TIME ZONE NULL
      )
    `);
    console.log('✅ Table created successfully');
    
    // Create indexes
    await db.query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)');
    console.log('✅ Indexes created successfully');
    
    await db.close();
    console.log('🎉 Password reset tokens table is ready!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}).catch(console.error);
