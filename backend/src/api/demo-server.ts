import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

export function createDemoApiServer() {
  const app = express();
  const PORT = process.env.API_PORT || 3000;

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      message: 'Torqvio API Demo - Database not required'
    });
  });

  // API information
  app.get('/api/v1', (req, res) => {
    res.json({
      name: 'Torqvio API Demo',
      version: 'v1',
      description: 'Durable execution platform API - Demo Mode',
      status: 'demo_mode',
      endpoints: {
        health: '/health',
        info: '/api/v1',
        demo_flows: '/api/v1/demo/flows',
        demo_executions: '/api/v1/demo/executions'
      },
      note: 'This is a demo mode without database connectivity'
    });
  });

  // Demo flows endpoint
  app.get('/api/v1/demo/flows', (req, res) => {
    const demoFlows = [
      {
        id: 'demo-1',
        name: 'user-welcome',
        description: 'Welcome flow for new users',
        status: 'active',
        definition: {
          steps: [
            { type: 'function', name: 'sendWelcome' },
            { type: 'sleep', duration: '1h' },
            { type: 'function', name: 'sendFollowUp' }
          ],
          retry: { attempts: 3, strategy: 'exponential' }
        }
      },
      {
        id: 'demo-2',
        name: 'payment-processing',
        description: 'Process payment with retries',
        status: 'active',
        definition: {
          steps: [
            { type: 'function', name: 'validatePayment' },
            { type: 'function', name: 'chargeCard' },
            { type: 'function', name: 'sendReceipt' }
          ],
          retry: { attempts: 5, strategy: 'exponential' }
        }
      }
    ];

    res.json({
      flows: demoFlows,
      count: demoFlows.length
    });
  });

  // Demo executions endpoint
  app.get('/api/v1/demo/executions', (req, res) => {
    const demoExecutions = [
      {
        id: 'exec-1',
        flow_id: 'demo-1',
        flow_name: 'user-welcome',
        status: 'completed',
        payload: { userId: 'user-123', email: 'user@example.com' },
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString(),
        steps: [
          { name: 'sendWelcome', status: 'completed', duration: 150 },
          { name: 'sleep', status: 'completed', duration: 3600000 },
          { name: 'sendFollowUp', status: 'completed', duration: 200 }
        ]
      },
      {
        id: 'exec-2',
        flow_id: 'demo-2',
        flow_name: 'payment-processing',
        status: 'running',
        payload: { amount: 99.99, currency: 'USD' },
        created_at: new Date(Date.now() - 300000).toISOString(),
        updated_at: new Date(Date.now() - 60000).toISOString(),
        current_step: 'chargeCard',
        steps: [
          { name: 'validatePayment', status: 'completed', duration: 100 },
          { name: 'chargeCard', status: 'running', duration: null }
        ]
      }
    ];

    res.json({
      executions: demoExecutions,
      count: demoExecutions.length
    });
  });

  // Demo flow execution
  app.post('/api/v1/demo/flows/:id/execute', (req, res) => {
    const { id } = req.params;
    const payload = req.body;

    const executionId = `exec-${Date.now()}`;
    
    console.log(`Demo flow execution started: ${id}`, { 
      flowId: id, 
      executionId,
      payload 
    });

    res.status(202).json({
      execution: {
        id: executionId,
        flow_id: id,
        status: 'pending',
        payload: payload || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      message: 'Demo flow execution started'
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString()
    });
  });

  // Error handler
  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', error);
    
    res.status(error.status || 500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    });
  });

  return { app, PORT };
}
