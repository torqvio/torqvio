import express, { Router } from 'express';
import { IntegrationService, IntegrationType } from '../../integrations/IntegrationService';
import { StripeConnector } from '../../integrations/connectors/StripeConnector';
import { ShopifyConnector } from '../../integrations/connectors/ShopifyConnector';
import { GenericAPIConnector } from '../../integrations/connectors/GenericAPIConnector';
import { createDatabaseConnection } from '../../database/connection';
import { v4 as uuidv4 } from 'uuid';

const router: Router = express.Router();

// Initialize integration service
const db = createDatabaseConnection();
const integrationService = new IntegrationService(db);

// Register connectors
async function initializeConnectors() {
  await integrationService.registerConnector(IntegrationType.STRIPE, new StripeConnector({} as any));
  await integrationService.registerConnector(IntegrationType.SHOPIFY, new ShopifyConnector({} as any));
  await integrationService.registerConnector(IntegrationType.CUSTOM_API, new GenericAPIConnector({} as any));
  await integrationService.registerConnector(IntegrationType.GENERIC, new GenericAPIConnector({} as any));
}

initializeConnectors().catch(console.error);

// Create a new integration
router.post('/', async (req, res) => {
  try {
    const { type, name, config, webhookUrl, projectId } = req.body;

    if (!type || !name || !config || !projectId) {
      return res.status(400).json({
        error: 'Missing required fields: type, name, config, projectId'
      });
    }

    const integrationConfig = {
      type,
      name,
      config,
      webhookUrl,
      projectId
    };

    const integration = await integrationService.createIntegration(integrationConfig);
    res.status(201).json(integration);
  } catch (error) {
    console.error('Error creating integration:', error);
    res.status(500).json({
      error: 'Failed to create integration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all integrations for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const integrations = await integrationService.getIntegrations(projectId);
    res.json(integrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({
      error: 'Failed to fetch integrations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get a specific integration
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const integrations = await integrationService.getIntegrations('');
    const integration = integrations.find(i => i.id === id);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json(integration);
  } catch (error) {
    console.error('Error fetching integration:', error);
    res.status(500).json({
      error: 'Failed to fetch integration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update an integration
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const integration = await integrationService.updateIntegration(id, updates);
    res.json(integration);
  } catch (error) {
    console.error('Error updating integration:', error);
    res.status(500).json({
      error: 'Failed to update integration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete an integration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await integrationService.deleteIntegration(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting integration:', error);
    res.status(500).json({
      error: 'Failed to delete integration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get events for an integration
router.get('/:id/events', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const events = await integrationService.getEvents(id, limit);
    res.json(events);
  } catch (error) {
    console.error('Error fetching integration events:', error);
    res.status(500).json({
      error: 'Failed to fetch integration events',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Webhook endpoint for receiving events
router.post('/webhook/:integrationId', async (req, res) => {
  try {
    const { integrationId } = req.params;
    
    const event = {
      id: uuidv4(),
      type: req.headers['x-event-type'] as string || 'unknown',
      integrationId,
      rawData: req.body,
      data: req.body, // Include parsed data
      headers: req.headers as Record<string, string>,
      timestamp: new Date()
    };

    const processedEvent = await integrationService.processEvent(event);
    
    res.status(200).json({
      status: 'processed',
      eventId: processedEvent.id,
      workflowTriggered: processedEvent.workflowTriggered
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test integration connectivity
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get integration details
    const integrations = await integrationService.getIntegrations('');
    const integration = integrations.find(i => i.id === id);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Test based on integration type
    let testResult = { success: false, message: 'Unknown integration type' };

    switch (integration.type) {
      case IntegrationType.STRIPE:
        // Test Stripe connectivity
        const stripeConnector = new StripeConnector(integration.config);
        const isValid = await stripeConnector.validateCredentials(integration.config);
        testResult = {
          success: isValid,
          message: isValid ? 'Stripe connection successful' : 'Stripe credentials invalid'
        };
        break;
      
      case IntegrationType.SHOPIFY:
        // Test Shopify connectivity
        const shopifyConnector = new ShopifyConnector(integration.config);
        const shopifyValid = await shopifyConnector.validateCredentials(integration.config);
        testResult = {
          success: shopifyValid,
          message: shopifyValid ? 'Shopify connection successful' : 'Shopify credentials invalid'
        };
        break;
      
      case IntegrationType.CUSTOM_API:
      case IntegrationType.GENERIC:
        // Test Generic API connectivity
        const genericConnector = new GenericAPIConnector(integration.config);
        const genericValid = await genericConnector.validateCredentials(integration.config);
        testResult = {
          success: genericValid,
          message: genericValid ? 'API connection successful' : 'API credentials invalid'
        };
        break;
    }

    res.json(testResult);
  } catch (error) {
    console.error('Error testing integration:', error);
    res.status(500).json({
      error: 'Failed to test integration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get supported integration types
router.get('/types/supported', async (req, res) => {
  try {
    const supportedTypes = [
      {
        type: IntegrationType.STRIPE,
        name: 'Stripe',
        description: 'Payment processing and subscription management',
        features: ['Payment failure recovery', 'Subscription churn recovery', 'Dunning management'],
        configFields: [
          { name: 'secretKey', type: 'password', label: 'Secret Key', required: true },
          { name: 'webhookUrl', type: 'url', label: 'Webhook URL', required: true }
        ]
      },
      {
        type: IntegrationType.SHOPIFY,
        name: 'Shopify',
        description: 'E-commerce platform integration',
        features: ['Order recovery', 'Payment failure handling', 'Checkout recovery'],
        configFields: [
          { name: 'shopDomain', type: 'text', label: 'Shop Domain', required: true },
          { name: 'accessToken', type: 'password', label: 'Access Token', required: true },
          { name: 'webhookUrl', type: 'url', label: 'Webhook URL', required: true }
        ]
      },
      {
        type: IntegrationType.CUSTOM_API,
        name: 'Custom API',
        description: 'Generic REST API integration',
        features: ['Custom event mapping', 'Flexible authentication', 'Webhook support'],
        configFields: [
          { name: 'healthCheckUrl', type: 'url', label: 'Health Check URL', required: true },
          { name: 'webhookRegistrationUrl', type: 'url', label: 'Webhook Registration URL', required: true },
          { name: 'webhookUrl', type: 'url', label: 'Webhook URL', required: true },
          { name: 'webhookSecret', type: 'password', label: 'Webhook Secret', required: true },
          { name: 'authType', type: 'select', label: 'Auth Type', required: true, options: ['bearer', 'basic', 'api_key'] }
        ]
      }
    ];

    res.json(supportedTypes);
  } catch (error) {
    console.error('Error fetching supported types:', error);
    res.status(500).json({
      error: 'Failed to fetch supported integration types',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
