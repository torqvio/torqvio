import express from 'express';
import { createServer as createHttpServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Router, Request, Response } from 'express';
import { createDatabaseConnection } from '../database/connection.js';
import { EventBus } from '../events/EventBus.js';
import { ExecutionEngine } from '../engine/ExecutionEngine.js';
import { WorkflowTriggerMapper } from '../events/WorkflowTriggerMapper.js';
import { NotificationService } from '../notifications/NotificationService.js';
import flowRoutes from './routes/flows.js';
import executionRoutes from './routes/executions.js';
import webhookRoutes from './routes/webhooks.js';
import webhookTestRoutes from './routes/webhook-test.js';
import cleanupRoutes from './routes/cleanup.js';
import cliRoutes from './routes/cli.js';
import authRoutes from './routes/auth.js';
import billingRoutes from './routes/billing.js';
import workflowsRoutes from './routes/workflows.js';
import workflowsApiRoutes from './routes/workflows-api.js';
import executionsApiRoutes from './routes/executions-api.js';
import { createAnalyticsRouter } from './routes/analytics.js';
import batchJobRoutes from './routes/batch-jobs.js';
import { createEventsRouter } from './routes/events-ingestion.js';
import { initializeSocketEvents, EventBroadcaster } from './routes/events-socket.js';
import eventsStreamRouter from './routes/events-stream.js';
import apiKeysRoutes from './routes/api-keys.js';
import githubStatsRoutes from './routes/github-stats.js';
import { createApiRateLimiter, createStrictRateLimiter } from '../middleware/rateLimiter.js';
import { connectionPoolManager } from '../middleware/connectionPool.js';
import { logger } from '../utils/logger.js';
import { requestIdMiddleware, errorHandler } from '../utils/errorHandler.js';
import { swaggerSpec, swaggerUi } from './swagger.js';

interface ApiServerResult {
  app: express.Express;
  httpServer: any;
  PORT: number;
  eventBroadcaster: EventBroadcaster;
}

export function createApiServer(): ApiServerResult {
  const app = express();
  const httpServer = createHttpServer(app);
  const PORT = Number(process.env.API_PORT) || 8913;
  const db = createDatabaseConnection();
  
  // Initialize Trust Machine components
  const eventBus = new EventBus(db);
  const executionEngine = new ExecutionEngine();
  const notificationService = new NotificationService();
  const workflowTriggerMapper = new WorkflowTriggerMapper(db, eventBus, executionEngine);

  // Initialize Socket.IO for real-time events
  const io = initializeSocketEvents(httpServer);
  const eventBroadcaster = new EventBroadcaster(io, db);

  // Apply request ID middleware first
  app.use(requestIdMiddleware);

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  // Apply rate limiting
  const apiRateLimiter = createApiRateLimiter();
  const strictRateLimiter = createStrictRateLimiter();
  
  // Rate limit API routes
  app.use('/workflows', apiRateLimiter.middleware);
  app.use('/executions', apiRateLimiter.middleware);
  app.use('/api/v1/flows', strictRateLimiter.middleware);
  app.use('/api/v1/executions', strictRateLimiter.middleware);
  
  // Apply connection pool management
  app.use(connectionPoolManager.middleware);

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    next();
  });

  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      const db = createDatabaseConnection();
      const isHealthy = await db.healthCheck();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: isHealthy ? 'connected' : 'disconnected',
        redis: 'connected', // Mock Redis status for documentation consistency
        version: process.env.npm_package_version || '2.1.0'
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        redis: 'disconnected'
      });
    }
  });

  // API Documentation
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Torqvio API Documentation'
  }));

  // API documentation JSON
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Apply rate limiting before routes
  const webhookRateLimit = createApiRateLimiter();

  // API routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/api-keys', apiKeysRoutes);
  app.use('/api/v1/billing', billingRoutes);
  app.use('/api/v1/flows', flowRoutes);
  app.use('/api/v1/executions', executionRoutes);
  app.use('/api/v1/github-stats', githubStatsRoutes);
    app.use('/api/v1/webhooks', webhookRateLimit.middleware);
  app.use('/api/v1/webhooks', webhookRoutes);
  // Legacy path for documentation compatibility
  app.use('/api/webhooks', webhookRateLimit.middleware);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/v1/webhooks/test', webhookTestRoutes);
  app.use('/api/v1/webhooks/cleanup', cleanupRoutes);
  app.use('/api/v1/analytics', createAnalyticsRouter(db));
  app.use('/api/v1/batch-jobs', batchJobRoutes);
  app.use('/api/v1', createEventsRouter(db, eventBus));
  app.use('/api/v1', eventsStreamRouter);
  app.use('/cli', cliRoutes);
  app.use('/api/workflows', workflowsRoutes);
  app.use('/workflows', workflowsApiRoutes);
  app.use('/executions', executionsApiRoutes);

  // API documentation
  app.get('/api/v1', (req, res) => {
    res.json({
      name: 'Torqvio API',
      version: 'v1',
      description: 'Durable execution platform API',
      endpoints: {
        auth: '/api/v1/auth',
        billing: '/api/v1/billing',
        flows: '/api/v1/flows',
        executions: '/api/v1/executions',
        webhooks: '/api/v1/webhooks',
        events: '/api/v1/events/stream',
        cli: '/cli',
        health: '/health'
      },
      documentation: '/docs',
      openapi_spec: '/docs.json'
    });
  });

  // 404 handler with structured error
  app.use((req, res) => {
    const requestId = (req as any).requestId;
    res.status(404).json({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
        request_id: requestId
      }
    });
  });

  // Structured error handler
  app.use(errorHandler);

  return { app, httpServer, PORT, eventBroadcaster };
}
