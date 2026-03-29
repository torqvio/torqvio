console.log('=== Password Reset Table Creation ===');

import('dotenv').then(() => {
  console.log('✅ Environment loaded');
  createTable();
}).catch(() => {
  console.log('⚠️ dotenv not available, using existing env');
  createTable();
});

async function createTable() {
  try {
    console.log('📊 Loading database connection...');
    const { createDatabaseConnection } = await import('./dist/database/connection.js');
    
    console.log('🔗 Creating database connection...');
    const db = createDatabaseConnection();
    
    console.log('🧪 Testing connection...');
    await db.query('SELECT NOW()');
    console.log('✅ Connection successful');
    
    console.log('📝 Creating password_reset_tokens table...');
    
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
    console.log('📋 Creating indexes...');
    
    try {
      await db.query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash)');
      console.log('✅ Token hash index created');
    } catch (e) {
      console.log('⚠️ Token hash index may already exist');
    }
    
    try {
      await db.query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)');
      console.log('✅ Expires at index created');
    } catch (e) {
      console.log('⚠️ Expires at index may already exist');
    }
    
    try {
      await db.query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)');
      console.log('✅ User ID index created');
    } catch (e) {
      console.log('⚠️ User ID index may already exist');
    }
    
    console.log('🎉 Password reset tokens table setup completed!');
    
    await db.close();
    console.log('🔐 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}
