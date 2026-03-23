import { Request, Response, NextFunction } from 'express';
import { createDatabaseConnection } from '../database/connection.js';

// Connection pool middleware to prevent connection exhaustion - Ultra optimized
class ConnectionPoolManager {
  private activeConnections = 0;
  private maxConnections = 500;  // Much higher for extreme stress testing
  private queue: Array<{ resolve: Function; reject: Function; timestamp: number; }> = [];
  private queueTimeout = 10000; // 10 second queue timeout

  async getConnection() {
    return new Promise((resolve, reject) => {
      if (this.activeConnections < this.maxConnections) {
        this.activeConnections++;
        resolve(createDatabaseConnection());
      } else {
        const timestamp = Date.now();
        this.queue.push({ resolve, reject, timestamp });
        
        // Set queue timeout
        setTimeout(() => {
          const index = this.queue.findIndex(item => item.timestamp === timestamp);
          if (index !== -1) {
            this.queue.splice(index, 1);
            reject(new Error('Connection queue timeout'));
          }
        }, this.queueTimeout);
      }
    });
  }

  releaseConnection() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        next.resolve(createDatabaseConnection());
      }
    } else {
      this.activeConnections--;
    }
  }

  middleware = (req: Request, res: Response, next: NextFunction) => {
    // Skip for health checks and static routes
    if (req.path === '/health' || req.path.startsWith('/static')) {
      return next();
    }

    this.getConnection()
      .then(db => {
        // Attach database connection to request
        (req as any).db = db;
        
        // Clean up connection after response
        res.on('finish', () => {
          this.releaseConnection();
        });
        
        // Also clean up on error
        res.on('error', () => {
          this.releaseConnection();
        });
        
        next();
      })
      .catch(error => {
        console.error('Connection pool error:', error.message);
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database connection pool exhausted'
        });
      });
  };

  getStats() {
    return {
      activeConnections: this.activeConnections,
      maxConnections: this.maxConnections,
      queueLength: this.queue.length
    };
  }
}

export const connectionPoolManager = new ConnectionPoolManager();
