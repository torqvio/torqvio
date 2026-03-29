import { createDatabaseConnection } from '../dist/database/connection.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runPasswordResetMigration() {
  let db;
  try {
    console.log('🚀 Starting password reset tokens migration...');
    
    // Load environment variables
    if (process.env.DATABASE_URL) {
      console.log('✅ DATABASE_URL found');
    } else {
      console.log('❌ DATABASE_URL not found in environment');
      console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE')));
      throw new Error('DATABASE_URL not found');
    }
    
    db = createDatabaseConnection();
    console.log('📊 Database connection instance created');
    
    // Test database connection
    try {
      await db.query('SELECT 1 as test');
      console.log('✅ Database connection test successful');
    } catch (testError) {
      console.error('❌ Database connection test failed:', testError.message);
      throw testError;
    }
    
    const migrationPath = join(__dirname, '013_create_password_reset_tokens.sql');
    console.log('📁 Migration file path:', migrationPath);
    
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    console.log('📝 Migration SQL loaded, length:', migrationSQL.length);
    
    // Split by semicolons and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log('🔢 Found', statements.length, 'SQL statements to execute');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n📋 Statement ${i + 1}/${statements.length}:`, statement.substring(0, 100) + '...');
      
      try {
        const result = await db.query(statement);
        console.log('✅ Executed successfully, result:', result ? 'has result' : 'no result');
      } catch (error) {
        // Log but continue for non-critical errors (like index already exists)
        console.warn('⚠️  Warning:', error.message);
        console.warn('📄 Full statement:', statement);
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log('ℹ️  This is expected, continuing...');
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n🎉 Password reset tokens migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (db) {
      try {
        await db.close();
        console.log('🔐 Database connection closed');
      } catch (closeError) {
        console.warn('⚠️  Error closing database:', closeError.message);
      }
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPasswordResetMigration();
}

export { runPasswordResetMigration };
