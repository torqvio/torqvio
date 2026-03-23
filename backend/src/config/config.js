export default {
  server: {
    port: process.env.PORT || 8459,
    host: '0.0.0.0',
    cors: {
      origin: ['http://localhost:7243', 'http://localhost:3000'],
      credentials: true
    }
  },
  
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 10000,
      allowExitOnIdle: true
    }
  },
  
  redis: {
    url: process.env.REDIS_URL,
    keyPrefix: 'torqvio:'
  },
  
  workflows: {
    timeout: 300000, // 5 minutes
    retries: 3,
    backoff: 'exponential'
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json'
  },
  
  scheduler: {
    intervalMs: parseInt(process.env.SCHEDULER_INTERVAL_MS) || 5000,
    maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS) || 3
  }
}
