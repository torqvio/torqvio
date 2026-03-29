import 'dotenv/config';
import { appConfig } from './config/index.js';
import { DatabaseConnection } from './database/connection.js';
import { runMigrations } from './database/migrate.js';
import { createApiServer } from './api/server.js';
import { logger } from './utils/logger.js';

// Prevent duplicate server initialization
declare global {
  var __TORQVIO_SERVER_RUNNING__: boolean | undefined;
}

const isServerRunning = globalThis.__TORQVIO_SERVER_RUNNING__;
if (isServerRunning) {
  logger.warn('⚠️ Server initialization attempted multiple times. Skipping duplicate startup.');
  process.exit(0);
}
globalThis.__TORQVIO_SERVER_RUNNING__ = true;

async function main() {
  logger.info('🚀 Starting Torqvio API Server...');
  logger.info(`⚙️  Using config: ${JSON.stringify(appConfig.server, null, 2)}`);
  
  try {
    // Initialize database
    logger.info('📊 Initializing database...');
    
    // Initialize database connection first
    DatabaseConnection.getInstance();
    // await runMigrations(); // Temporarily commented out - schema already exists
    
    // Test database connection
    const db = DatabaseConnection.getInstance();
    const isHealthy = await db.healthCheck();
    
    if (!isHealthy) {
      throw new Error('Database health check failed');
    }
    
    logger.info('✅ Database initialized successfully');
    
    // Create and start API server
    const { app, httpServer, PORT, eventBroadcaster } = createApiServer();
    
    httpServer.listen(PORT, () => {
      logger.info(`🌐 Torqvio API Server running on port ${PORT}`);
      logger.info('');
      logger.info('📚 Available endpoints:');
      logger.info('  GET  /health                    - Health check');
      logger.info('  GET  /api/v1                    - API information');
      logger.info('  GET  /api/v1/flows              - List flows');
      logger.info('  POST /api/v1/flows              - Create flow');
      logger.info('  GET  /api/v1/flows/:id          - Get flow');
      logger.info('  PUT  /api/v1/flows/:id          - Update flow');
      logger.info('  DELETE /api/v1/flows/:id        - Delete flow');
      logger.info('  POST /api/v1/flows/:id/execute  - Execute flow');
      logger.info('  GET  /api/v1/executions         - List executions');
      logger.info('  GET  /api/v1/executions/:id     - Get execution');
      logger.info('  GET  /api/v1/executions/:id/status - Get execution status');
      logger.info('  GET  /api/v1/executions/:id/logs   - Get execution logs');
      logger.info('  POST /api/v1/executions/:id/cancel - Cancel execution');
      logger.info('  POST /api/v1/executions/:id/retry  - Retry execution');
      logger.info('  GET  /api/v1/webhooks           - List webhooks');
      logger.info('  POST /api/v1/webhooks           - Create webhook');
      logger.info('  POST /api/v1/webhooks/:id       - Trigger webhook');
      logger.info('');
      logger.info('🎯 Torqvio API is ready!');
    });
    
  } catch (error) {
    logger.error('❌ Failed to start Torqvio:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the application
main();
