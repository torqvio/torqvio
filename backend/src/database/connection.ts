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
      // Optimized connection pool settings
      max: 20,           // Reduced from 100 - more reasonable for most workloads
      min: 2,            // Reduced from 5 - lower baseline
      idleTimeoutMillis: 30000,     // Increased from 5000 - less churn
      connectionTimeoutMillis: 10000, // Increased from 2000 - more forgiving
      allowExitOnIdle: true,
      // Connection reuse settings
      maxUses: 5000,     // Reduced from 10000 - prevent connection staleness
      keepAlive: true,
      keepAliveInitialDelayMillis: 1000, // Increased from 0 - allow connection setup
      // Query timeouts for reliability (skip for Neon compatibility)
      ...(process.env.DATABASE_HOST?.includes('neon.tech') ? {} : {
        statement_timeout: 30000,  // Increased from 10000 - more time for complex queries
        query_timeout: 25000       // Increased from 5000 - balanced timeout
      }),
      // Connection validation
      application_name: 'torqvio-backend',
      // Performance optimizations (remove unsupported parameters for Neon)
      options: process.env.DATABASE_HOST?.includes('neon.tech') 
        ? undefined 
        : '-c statement_timeout=30s -c idle_in_transaction_session_timeout=10s'
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
        // Try to create config from environment variables
        config = DatabaseConnection.createConfigFromEnv();
      }
      if (!config) {
        throw new Error('Database config required for first initialization');
      }
      DatabaseConnection.instance = new DatabaseConnection(config);
    }
    return DatabaseConnection.instance;
  }

  private static createConfigFromEnv(): DatabaseConfig | undefined {
    try {
      if (process.env.DATABASE_URL) {
        const url = process.env.DATABASE_URL;
        const urlObj = new URL(url);
        
        return {
          host: urlObj.hostname,
          port: parseInt(urlObj.port) || 5432,
          database: urlObj.pathname.substring(1),
          username: urlObj.username,
          password: urlObj.password,
          ssl: url.includes('neon.tech') ? {
            rejectUnauthorized: false,
            require: true
          } : false,
          pool: {
            max: parseInt(process.env.DB_POOL_MAX || '10'),
            min: 0,
            idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '10000'),
            connectionTimeoutMillis: 10000,
            allowExitOnIdle: true,
          },
        };
      }

      return {
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
          min: 0,
          idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '10000'),
          connectionTimeoutMillis: 10000,
          allowExitOnIdle: true,
        },
      };
    } catch (error) {
      return undefined;
    }
  }

  public async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const start = Date.now();
    let retries = 0;
    const maxRetries = 2;  // Increased from 1 for better reliability
    
    while (retries <= maxRetries) {
      try {
        const result = await this.pool.query(text, params);
        const duration = Date.now() - start;
        
        // Log slow queries (threshold increased from 500ms)
        if (duration > 1000) {
          console.warn(`Slow query (${duration}ms): ${text.substring(0, 100)}...`);
        }
        
        return result.rows as T[];
      } catch (error: any) {
        retries++;
        
        // Improved retry logic with exponential backoff
        const isRetryableError = [
          'ECONNRESET',
          'CONNECTION_TERMINATED', 
          'ENOTFOUND',
          'ECONNREFUSED',
          'ETIMEDOUT'
        ].some(code => error.code === code || error.message?.includes(code));
        
        if (isRetryableError && retries <= maxRetries) {
          const backoffDelay = Math.min(100 * Math.pow(2, retries - 1), 1000); // Max 1s
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue;
        }
        
        // Log only non-constraint errors to reduce noise
        const nonCriticalErrors = ['23505', '23503', '23514', '42P01', '42703'];
        if (!nonCriticalErrors.includes(error.code)) {
          console.error('Database query error:', {
            code: error.code,
            message: error.message,
            query: text.substring(0, 100),
            duration: Date.now() - start
          });
        }
        
        throw error;
      }
    }
    
    throw new Error(`Query failed after ${maxRetries + 1} attempts: ${text.substring(0, 50)}...`);
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
