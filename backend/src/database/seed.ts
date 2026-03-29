import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from './connection.js';
import { logger } from '../utils/logger.js';

async function seedDatabase() {
  const db = DatabaseConnection.getInstance();
  
  try {
    logger.info('🌱 Seeding database with test data...');
    
    // Create test organization
    const orgId = uuidv4();
    await db.query(`
      INSERT INTO organizations (id, name, slug, plan, settings)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (slug) DO NOTHING
    `, [orgId, 'Test Organization', 'test-org', 'free', '{}']);
    
    // Create test project with API key
    const projectId = uuidv4();
    const apiKey = 'test-api-key-torqvio-demo';
    
    await db.query(`
      INSERT INTO projects (id, organization_id, name, api_key, framework, settings, quotas)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (api_key) DO NOTHING
    `, [projectId, orgId, 'Demo Project', apiKey, 'dashboard', '{}', '{}']);
    
    logger.info('✅ Database seeded successfully');
    logger.info(`🔑 Test API Key: ${apiKey}`);
    logger.info('📝 Add this to your frontend requests: X-API-Key: ' + apiKey);
    
  } catch (error) {
    logger.error('❌ Failed to seed database:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
