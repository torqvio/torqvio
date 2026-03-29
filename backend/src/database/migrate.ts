import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseConnection } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const db = DatabaseConnection.getInstance();
  
  try {
    console.log('Running database migrations...');
    
    // Read and execute the schema file with error handling for existing objects
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    try {
      await db.query(schema);
    } catch (error: any) {
      // Log but continue if objects already exist
      if (error.code === '42710' || error.message?.includes('already exists')) {
        console.log('⚠️ Some schema objects already exist, continuing...');
      } else {
        throw error;
      }
    }
    
    // Run individual migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const migration = fs.readFileSync(migrationPath, 'utf8');
      try {
        await db.query(migration);
      } catch (error: any) {
        // Log but continue if objects already exist
        if (error.code === '42710' || error.message?.includes('already exists')) {
          console.log(`⚠️ Migration ${file} objects already exist, continuing...`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log('Migrations completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
