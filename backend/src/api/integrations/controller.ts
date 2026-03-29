import { Router } from 'express';
import { IntegrationService } from '../services/integration-service';
import { ConnectorService } from '../services/connector-service';
import { IntegrationBuilderService } from '../services/integration-builder-service';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { 
  CreateIntegrationSchema,
  UpdateIntegrationSchema,
  CreateConnectorSchema,
  TestIntegrationSchema,
  DiscoverySchema
} from '../schemas/integration-schemas';

const router = Router();
const integrationService = new IntegrationService();
const connectorService = new ConnectorService();
const builderService = new IntegrationBuilderService();

// Integration CRUD Operations
router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    const integrations = await integrationService.getIntegrationsByProject(projectId);
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const integration = await integrationService.getIntegrationById(id);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    res.json(integration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integration' });
  }
});

router.post('/', authenticate, validateRequest(CreateIntegrationSchema), async (req, res) => {
  try {
    const integration = await integrationService.createIntegration(req.body);
    res.status(201).json(integration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create integration' });
  }
});

router.put('/:id', authenticate, validateRequest(UpdateIntegrationSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const integration = await integrationService.updateIntegration(id, req.body);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    res.json(integration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await integrationService.deleteIntegration(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete integration' });
  }
});

// Integration Testing
router.post('/:id/test', authenticate, validateRequest(TestIntegrationSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { endpoint, method, parameters } = req.body;
    
    const result = await integrationService.testIntegration(id, {
      endpoint,
      method,
      parameters
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to test integration' });
  }
});

router.post('/:id/health', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const health = await integrationService.checkIntegrationHealth(id);
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check integration health' });
  }
});

// Integration Metrics
router.get('/:id/metrics', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '24h' } = req.query;
    
    const metrics = await integrationService.getIntegrationMetrics(id, period as string);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integration metrics' });
  }
});

router.get('/:id/logs', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100, offset = 0, level } = req.query;
    
    const logs = await integrationService.getIntegrationLogs(id, {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      level: level as string
    });
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integration logs' });
  }
});

// Connector Management
router.get('/connectors/registry', authenticate, async (req, res) => {
  try {
    const { category, search } = req.query;
    const connectors = await connectorService.getConnectors({
      category: category as string,
      search: search as string
    });
    res.json(connectors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch connectors' });
  }
});

router.get('/connectors/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const connector = await connectorService.getConnectorById(id);
    
    if (!connector) {
      return res.status(404).json({ error: 'Connector not found' });
    }
    
    res.json(connector);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch connector' });
  }
});

router.post('/connectors', authenticate, validateRequest(CreateConnectorSchema), async (req, res) => {
  try {
    const connector = await connectorService.createConnector(req.body);
    res.status(201).json(connector);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create connector' });
  }
});

// Integration Builder
router.post('/builder/discover', authenticate, validateRequest(DiscoverySchema), async (req, res) => {
  try {
    const { type, url, authentication, filter } = req.body;
    
    const discovery = await builderService.discoverEndpoints({
      type,
      url,
      authentication,
      filter
    });
    
    res.json(discovery);
  } catch (error) {
    res.status(500).json({ error: 'Failed to discover endpoints' });
  }
});

router.post('/builder/validate', authenticate, async (req, res) => {
  try {
    const config = req.body;
    const validation = await builderService.validateConfiguration(config);
    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate configuration' });
  }
});

router.post('/builder/test', authenticate, async (req, res) => {
  try {
    const { config, test } = req.body;
    const result = await builderService.runTest(config, test);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to run test' });
  }
});

router.post('/builder/package', authenticate, async (req, res) => {
  try {
    const config = req.body;
    const packageResult = await builderService.packageConnector(config);
    res.json(packageResult);
  } catch (error) {
    res.status(500).json({ error: 'Failed to package connector' });
  }
});

// Integration Bundles
router.get('/bundles', authenticate, async (req, res) => {
  try {
    const bundles = await integrationService.getIntegrationBundles();
    res.json(bundles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integration bundles' });
  }
});

router.post('/bundles/:bundleId/setup', authenticate, async (req, res) => {
  try {
    const { bundleId } = req.params;
    const { projectId, configuration } = req.body;
    
    const result = await integrationService.setupBundle(bundleId, projectId, configuration);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to setup integration bundle' });
  }
});

// Ecosystem Recommendations
router.get('/ecosystem/recommendations', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    const recommendations = await integrationService.getEcosystemRecommendations(projectId as string);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ecosystem recommendations' });
  }
});

router.post('/ecosystem/recommendations/:recommendationId/apply', authenticate, async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { projectId } = req.body;
    
    const result = await integrationService.applyRecommendation(recommendationId, projectId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply recommendation' });
  }
});

// Authentication Flows
router.post('/auth/oauth/:provider/authorize', authenticate, async (req, res) => {
  try {
    const { provider } = req.params;
    const { redirectUri, scopes } = req.body;
    
    const authUrl = await integrationService.getOAuthAuthorizationUrl(provider, {
      redirectUri,
      scopes
    });
    
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

router.post('/auth/oauth/:provider/exchange', authenticate, async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, redirectUri } = req.body;
    
    const tokens = await integrationService.exchangeOAuthCode(provider, {
      code,
      redirectUri
    });
    
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to exchange authorization code' });
  }
});

// Webhook Management
router.post('/:id/webhooks', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const webhook = await integrationService.createWebhook(id, req.body);
    res.status(201).json(webhook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

router.get('/:id/webhooks', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const webhooks = await integrationService.getWebhooks(id);
    res.json(webhooks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

router.delete('/:id/webhooks/:webhookId', authenticate, async (req, res) => {
  try {
    const { id, webhookId } = req.params;
    const success = await integrationService.deleteWebhook(id, webhookId);
    
    if (!success) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

// Integration Execution
router.post('/:id/execute', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { context, endpoint, method, parameters } = req.body;
    
    const result = await integrationService.executeIntegration(id, {
      context,
      endpoint,
      method,
      parameters
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute integration' });
  }
});

// Integration Scheduling
router.post('/:id/schedule', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule, timezone } = req.body;
    
    const result = await integrationService.scheduleIntegration(id, {
      schedule,
      timezone
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to schedule integration' });
  }
});

router.delete('/:id/schedule', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await integrationService.unscheduleIntegration(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to unschedule integration' });
  }
});

export default router;
