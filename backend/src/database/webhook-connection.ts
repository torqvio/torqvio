import { DatabaseConnection } from './connection.js';

// Optimized singleton database connection for webhook operations
let webhookDbConnection: DatabaseConnection | null = null;

export function getWebhookDbConnection(): DatabaseConnection {
  if (!webhookDbConnection) {
    webhookDbConnection = DatabaseConnection.getInstance();
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
