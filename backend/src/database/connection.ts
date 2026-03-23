import { Pool, PoolClient } from 'pg';
import { DatabaseConfig } from '../types/index.js';

export class DatabaseConnection {
  private pool: Pool;
  private static instance: DatabaseConnection;

  private constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl,
      // Ultra-optimized for extreme stress testing
      max: 100,  // Much higher for extreme concurrency
      min: 5,   // Higher min for sustained load
      idleTimeoutMillis: 5000,   // Much faster cleanup
      connectionTimeoutMillis: 2000,  // Faster timeout
      allowExitOnIdle: true,
      // Additional extreme optimizations
      maxUses: 10000,  // More uses per connection
      keepAlive: true,
      keepAliveInitialDelayMillis: 0,  // Immediate keep-alive
      // Statement timeout for preventing long-running queries
      statement_timeout: 10000,
      // Query timeout
      query_timeout: 5000,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected pool error:', err);
      // Don't crash the server, just log the error
      // The pool will automatically try to reconnect
    });

    // Handle connection errors
    this.pool.on('connect', (client) => {
      client.on('error', (err) => {
        console.error('Client connection error:', err);
      });
    });
  }

  public static getInstance(config?: DatabaseConfig): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      if (!config) {
        throw new Error('Database config required for first initialization');
      }
      DatabaseConnection.instance = new DatabaseConnection(config);
    }
    return DatabaseConnection.instance;
  }

  public async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const start = Date.now();
    let retries = 0;
    const maxRetries = 1;  // Minimal retries for extreme performance
    
    while (retries <= maxRetries) {
      try {
        const result = await this.pool.query(text, params);
        const duration = Date.now() - start;
        
        // Only log very slow queries
        if (duration > 500) {
          console.log(`Very slow query (${duration}ms): ${text.substring(0, 50)}...`);
        }
        
        return result.rows as T[];
      } catch (error: any) {
        retries++;
        
        // Ultra-fast retry logic for specific errors
        if ((error.code === 'ECONNRESET' || error.code === 'CONNECTION_TERMINATED' || error.message?.includes('Connection terminated')) && retries <= maxRetries) {
          // Minimal delay for fastest retry
          await new Promise(resolve => setTimeout(resolve, 10));
          continue;
        }
        
        // Log only critical errors, ignore constraint violations
        if (error.code !== '23505' && error.code !== '23503' && error.code !== '23514') {
          console.error('Database query error:', error.code || error.message);
        }
        
        throw error;
      }
    }
    
    throw new Error(`Query failed after ${maxRetries + 1} attempts`);
  }

  public async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows.length > 0 ? rows[0]! : null;
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  public getPool(): Pool {
    return this.pool;
  }
}

// Initialize database connection from environment variables
export function createDatabaseConnection(): DatabaseConnection {
  // Use DATABASE_URL if available, otherwise use individual parameters
  if (process.env.DATABASE_URL) {
    // Parse the DATABASE_URL for Neon
    const url = process.env.DATABASE_URL;
    const urlObj = new URL(url);
    
    const config: DatabaseConfig = {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 5432,
      database: urlObj.pathname.substring(1), // Remove leading slash
      username: urlObj.username,
      password: urlObj.password,
      ssl: url.includes('neon.tech') ? {
        rejectUnauthorized: false,
        require: true
      } : false,
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '10'),
        min: 0, // Don't keep idle connections — Neon terminates them server-side
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '10000'),
        connectionTimeoutMillis: 10000,
        allowExitOnIdle: true,
      },
    };

    return DatabaseConnection.getInstance(config);
  }

  // Fallback to individual environment variables
  const config: DatabaseConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'torqvio',
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_HOST?.includes('neon.tech') ? {
      rejectUnauthorized: false,
      require: true
    } : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: 0, // Don't keep idle connections — Neon terminates them server-side
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '10000'),
      connectionTimeoutMillis: 10000,
      allowExitOnIdle: true,
    },
  };

  return DatabaseConnection.getInstance(config);
}
