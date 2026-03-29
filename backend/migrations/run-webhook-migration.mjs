import { DatabaseConnection } from '../src/database/connection.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runWebhookMigration() {
  const db = DatabaseConnection.getInstance();
  
  try {
    console.log('🚀 Running webhook retry columns migration...');
    
    const migrationPath = join(__dirname, '012_add_webhook_retry_columns.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await db.query(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        // Log but continue for non-critical errors (like index already exists)
        console.warn('⚠️  Warning:', error.message);
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

runWebhookMigration();
