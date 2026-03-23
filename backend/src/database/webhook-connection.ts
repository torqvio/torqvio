import { createDatabaseConnection } from './connection.js';

// Optimized singleton database connection for webhook operations
let webhookDbConnection: any = null;

export function getWebhookDbConnection() {
  if (!webhookDbConnection) {
    webhookDbConnection = createDatabaseConnection();
    
    // Optimize pool for high concurrency
    if (webhookDbConnection.pool) {
      webhookDbConnection.pool.max = 50;  // Increase max connections
      webhookDbConnection.pool.min = 10;  // Higher min for sustained load
      webhookDbConnection.pool.idleTimeoutMillis = 1000;  // Faster cleanup
      webhookDbConnection.pool.connectionTimeoutMillis = 1000;  // Faster timeout
    }
  }
  return webhookDbConnection;
}

// Close connection when shutting down
process.on('SIGTERM', async () => {
  if (webhookDbConnection) {
    try {
      await webhookDbConnection.close?.();
    } catch (error) {
      console.error('Error closing webhook DB connection:', error);
    }
  }
});

process.on('SIGINT', async () => {
  if (webhookDbConnection) {
    try {
      await webhookDbConnection.close?.();
    } catch (error) {
      console.error('Error closing webhook DB connection:', error);
    }
  }
});
