import {
  Integration,
  Webhook,
  OAuthTokens,
  ExecutionContext,
  IntegrationResult,
  LogEntry,
  IntegrationBundle,
  EcosystemRecommendation,
  HealthDetail,
  HealthStatus,
  connectivity,
  IntegrationMetrics
} from '../types/torqvio-client.js';
import { DatabaseService } from './database-service';
import { HttpClient } from '../utils/http-client';
import { logger } from '../utils/logger';
import { Scheduler } from '../utils/scheduler';
import { EventBus } from '../utils/event-bus';
import { CryptoService } from '../utils/crypto-service';
import { Validator } from '../utils/validator';

export class IntegrationService {
  private db: DatabaseService;
  private http: HttpClient;
  private logger: any = logger;
  private scheduler: Scheduler;
  private eventBus: EventBus;
  private crypto: CryptoService;
  private validator: Validator;

  constructor() {
    this.db = new DatabaseService();
    this.http = new HttpClient();
    this.logger = logger;
    this.scheduler = new Scheduler();
    this.eventBus = new EventBus();
    this.crypto = new CryptoService();
    this.validator = new Validator();
  }

  // CRUD Operations
  async getIntegrationsByProject(projectId: string): Promise<Integration[]> {
    try {
      const integrations = await this.db.query(
        'SELECT * FROM integrations WHERE project_id = ? ORDER BY created_at DESC',
        [projectId]
      );

      // Decrypt sensitive data
      return integrations.map(this.decryptIntegration);
    } catch (error) {
      this.logger.error('Failed to get integrations by project', { projectId, error });
      throw error;
    }
  }

  async getIntegrationById(id: string): Promise<Integration | null> {
    try {
      const integration = await this.db.queryOne(
        'SELECT * FROM integrations WHERE id = ?',
        [id]
      );

      return integration ? this.decryptIntegration(integration) : null;
    } catch (error) {
      this.logger.error('Failed to get integration by ID', { id, error });
      throw error;
    }
  }

  async createIntegration(data: Partial<Integration>): Promise<Integration> {
    try {
      // Validate integration data
      const validation = this.validator.validateIntegration(data);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const integration = {
        id: this.generateId(),
        ...data,
        status: 'inactive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Encrypt sensitive data
      const encryptedIntegration = this.encryptIntegration(integration);

      await this.db.insert('integrations', encryptedIntegration);

      // Emit event
      this.eventBus.emit('integration.created', { integration });

      this.logger.info('Integration created', { id: integration.id, type: integration.type });
      return integration;
    } catch (error) {
      this.logger.error('Failed to create integration', { data, error });
      throw error;
    }
  }

  async updateIntegration(id: string, data: Partial<Integration>): Promise<Integration | null> {
    try {
      const existing = await this.getIntegrationById(id);
      if (!existing) {
        return null;
      }

      // Validate update data
      const validation = this.validator.validateIntegration(data);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const updated = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString()
      };

      // Encrypt sensitive data
      const encryptedIntegration = this.encryptIntegration(updated);

      await this.db.update(
        'integrations',
        encryptedIntegration,
        { id }
      );

      // Emit event
      this.eventBus.emit('integration.updated', { integration: updated });

      this.logger.info('Integration updated', { id });
      return updated;
    } catch (error) {
      this.logger.error('Failed to update integration', { id, data, error });
      throw error;
    }
  }

  async deleteIntegration(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete('integrations', { id });
      
      if (result) {
        // Clean up related data
        await this.cleanupIntegrationData(id);
        
        // Emit event
        this.eventBus.emit('integration.deleted', { id });
        
        this.logger.info('Integration deleted', { id });
      }
      
      return result;
    } catch (error) {
      this.logger.error('Failed to delete integration', { id, error });
      throw error;
    }
  }

  // Testing and Health Checks
  async testIntegration(id: string, options: {
    endpoint: string;
    method: string;
    parameters?: Record<string, any>;
  }): Promise<IntegrationResult> {
    try {
      const integration = await this.getIntegrationById(id);
      if (!integration) {
        throw new Error('Integration not found');
      }

      const startTime = Date.now();
      
      // Execute test request
      const result = await this.executeIntegrationRequest(integration, {
        endpoint: options.endpoint,
        method: options.method,
        parameters: options.parameters
      });

      const duration = Date.now() - startTime;

      // Log test result
      await this.logIntegrationActivity(id, {
        level: 'info',
        message: `Test executed: ${options.method} ${options.endpoint}`,
        metadata: {
          duration,
          success: result.success,
          endpoint: options.endpoint,
          method: options.method
        }
      });

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        duration,
        logs: []
      };
    } catch (error) {
      this.logger.error('Failed to test integration', { id, options, error });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: 0,
        logs: []
      };
    }
  }

  async checkIntegrationHealth(id: string): Promise<HealthStatus> {
    try {
      const integration = await this.getIntegrationById(id);
      if (!integration) {
        throw new Error('Integration not found');
      }

      const checks: HealthDetail[] = [];
      
      // Check authentication
      const authCheck = await this.checkAuthentication(integration);
      checks.push(authCheck);

      // Check connectivity
      const connectivityCheck = await this.checkConnectivity(integration);
      checks.push(connectivityCheck);

      // Check recent performance
      const performanceCheck = await this.checkRecentPerformance(id);
      checks.push(performanceCheck);

      // Determine overall status
      const overallStatus = this.determineHealthStatus(checks);

      return {
        overall: overallStatus,
        checks: checks
      };
    } catch (error) {
      this.logger.error('Failed to check integration health', { id, error });
      
      return {
        overall: 'unhealthy',
        checks: [{
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        }]
      };
    }
  }

  // Metrics and Monitoring
  async getIntegrationMetrics(id: string, period: string): Promise<IntegrationMetrics> {
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(*) as executions,
          AVG(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100 as success_rate,
          AVG(duration) as average_duration,
          COUNT(CASE WHEN success = 0 THEN 1 END) / COUNT(*) * 100 as error_rate,
          MAX(created_at) as last_execution
        FROM integration_executions 
        WHERE integration_id = ? 
          AND created_at >= datetime('now', '-${period}')
      `, [id]);

      const metrics = result.rows[0] || {};

      return {
        executions: metrics.executions || 0,
        successRate: metrics.success_rate || 0,
        averageDuration: metrics.average_duration || 0,
        lastExecution: metrics.last_execution || new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Failed to get integration metrics', { id, period, error });
      throw error;
    }
  }

  async getIntegrationLogs(id: string, options: {
    limit: number;
    offset: number;
    level?: string;
  }): Promise<LogEntry[]> {
    try {
      let query = `
        SELECT * FROM integration_logs 
        WHERE integration_id = ?
      `;
      const params: any[] = [id];

      if (options.level) {
        query += ` AND level = ?`;
        params.push(options.level);
      }

      query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      params.push(options.limit, options.offset);

      const logs = await this.db.query(query, params);
      
      return logs.map((log: any) => ({
        timestamp: log.created_at,
        level: log.level,
        message: log.message,
        metadata: log.metadata ? JSON.parse(log.metadata) : undefined
      }));
    } catch (error) {
      this.logger.error('Failed to get integration logs', { id, options, error });
      throw error;
    }
  }

  // Execution
  async executeIntegration(id: string, context: ExecutionContext): Promise<IntegrationResult> {
    try {
      const integration = await this.getIntegrationById(id);
      if (!integration) {
        throw new Error('Integration not found');
      }

      if (integration.status !== 'active') {
        throw new Error('Integration is not active');
      }

      const startTime = Date.now();
      
      // Execute the integration
      const result = await this.executeIntegrationRequest(integration, {
        endpoint: context.endpoint,
        method: context.method,
        parameters: context.parameters
      });

      const duration = Date.now() - startTime;

      // Log execution
      await this.logExecution(id, {
        success: result.success,
        duration,
        endpoint: context.endpoint,
        method: context.method,
        error: result.error
      });

      // Emit event
      this.eventBus.emit('integration.executed', {
        integrationId: id,
        result,
        duration
      });

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        duration,
        logs: []
      };
    } catch (error) {
      this.logger.error('Failed to execute integration', { id, context, error });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: 0,
        logs: []
      };
    }
  }

  // Scheduling
  async scheduleIntegration(id: string, options: {
    schedule: string;
    timezone?: string;
  }): Promise<{ success: boolean; scheduleId: string }> {
    try {
      const integration = await this.getIntegrationById(id);
      if (!integration) {
        throw new Error('Integration not found');
      }

      const scheduleId = this.scheduler.schedule({
        id: `integration-${id}`,
        schedule: options.schedule,
        timezone: options.timezone || 'UTC',
        handler: async () => {
          await this.executeIntegration(id, {
            endpoint: 'default',
            method: 'GET',
            parameters: {}
          });
        }
      });

      // Update integration with schedule info
      await this.updateIntegration(id, {
        scheduleId,
        schedule: options.schedule,
        timezone: options.timezone
      });

      this.logger.info('Integration scheduled', { id, scheduleId });
      
      return { success: true, scheduleId };
    } catch (error) {
      this.logger.error('Failed to schedule integration', { id, options, error });
      throw error;
    }
  }

  async unscheduleIntegration(id: string): Promise<boolean> {
    try {
      const integration = await this.getIntegrationById(id);
      if (!integration || !integration.scheduleId) {
        return false;
      }

      this.scheduler.unschedule(integration.scheduleId);

      // Update integration
      await this.updateIntegration(id, {
        scheduleId: undefined,
        schedule: undefined,
        timezone: undefined
      });

      this.logger.info('Integration unscheduled', { id });
      return true;
    } catch (error) {
      this.logger.error('Failed to unschedule integration', { id, error });
      throw error;
    }
  }

  // Bundles and Recommendations
  async getIntegrationBundles(): Promise<IntegrationBundle[]> {
    try {
      return [
        {
          id: 'ecommerce_stack',
          name: 'E-commerce Power Stack',
          description: 'Complete e-commerce automation with payments, inventory, and notifications',
          integrations: ['stripe', 'shopify', 'slack'],
          popular: true,
          setupTime: '5 min',
          discount: 25
        },
        {
          id: 'crm_suite',
          name: 'CRM Automation Suite',
          description: 'Customer relationship management with email and analytics',
          integrations: ['hubspot', 'sendgrid', 'google_analytics'],
          popular: false,
          setupTime: '8 min',
          discount: 20
        },
        {
          id: 'saas_metrics',
          name: 'SaaS Metrics Bundle',
          description: 'Complete SaaS analytics and reporting stack',
          integrations: ['stripe', 'mixpanel', 'google_analytics', 'slack'],
          popular: true,
          setupTime: '12 min',
          discount: 30
        }
      ];
    } catch (error) {
      this.logger.error('Failed to get integration bundles', { error });
      return [];
    }
  }

  async setupBundle(bundleId: string, projectId: string, configuration?: any): Promise<{ success: boolean; integrations: string[] }> {
    try {
      const bundles = await this.getIntegrationBundles();
      const bundle = bundles.find(b => b.id === bundleId);
      
      if (!bundle) {
        throw new Error('Bundle not found');
      }

      const createdIntegrations: string[] = [];

      for (const integrationType of bundle.integrations) {
        const integration = await this.createIntegration({
          projectId,
          type: integrationType,
          name: `${integrationType} (from ${bundle.name})`,
          configuration: configuration?.[integrationType] || {}
        });
        
        createdIntegrations.push(integration.id);
      }

      this.logger.info('Bundle setup completed', { bundleId, projectId, integrations: createdIntegrations });
      
      return { success: true, integrations: createdIntegrations };
    } catch (error) {
      this.logger.error('Failed to setup bundle', { bundleId, projectId, error });
      throw error;
    }
  }

  async getEcosystemRecommendations(projectId: string): Promise<EcosystemRecommendation[]> {
    try {
      const integrations = await this.getIntegrationsByProject(projectId);
      const integrationTypes = integrations.map(i => i.type);

      // Generate recommendations based on existing integrations
      const recommendations: EcosystemRecommendation[] = [];

      if (integrationTypes.includes('shopify')) {
        recommendations.push({
          id: 'rec_001',
          type: 'bundle',
          title: 'Complete Your E-commerce Stack',
          description: 'Most Shopify users also connect Stripe and Slack for full automation.',
          impact: 'Increase efficiency by 45%',
          confidence: 92,
          integrations: ['stripe', 'slack'],
          autoSetupAvailable: true,
          estimatedTime: '3 min'
        });
      }

      if (integrationTypes.includes('stripe')) {
        recommendations.push({
          id: 'rec_002',
          type: 'connection',
          title: 'Connect Analytics Pipeline',
          description: 'Your payment data can automatically feed into analytics for better insights.',
          impact: 'Improve decision making by 34%',
          confidence: 87,
          integrations: ['google_analytics', 'mixpanel'],
          autoSetupAvailable: true,
          estimatedTime: '2 min'
        });
      }

      if (integrations.length > 0 && !integrationTypes.includes('slack')) {
        recommendations.push({
          id: 'rec_003',
          type: 'expansion',
          title: 'Add Notification Layer',
          description: 'Real-time notifications for all your integrations improve team response time.',
          impact: 'Reduce response time by 67%',
          confidence: 78,
          integrations: ['slack'],
          autoSetupAvailable: true,
          estimatedTime: '1 min'
        });
      }

      return recommendations;
    } catch (error) {
      this.logger.error('Failed to get ecosystem recommendations', { projectId, error });
      throw error;
    }
  }

  async applyRecommendation(recommendationId: string, projectId: string): Promise<{ success: boolean; integrations: string[] }> {
    try {
      const recommendations = await this.getEcosystemRecommendations(projectId);
      const recommendation = recommendations.find(r => r.id === recommendationId);
      
      if (!recommendation) {
        throw new Error('Recommendation not found');
      }

      const createdIntegrations: string[] = [];

      for (const integrationType of recommendation.integrations) {
        const integration = await this.createIntegration({
          projectId,
          type: integrationType,
          name: `${integrationType} (from recommendation)`,
          configuration: {}
        });
        
        createdIntegrations.push(integration.id);
      }

      this.logger.info('Recommendation applied', { recommendationId, projectId, integrations: createdIntegrations });
      
      return { success: true, integrations: createdIntegrations };
    } catch (error) {
      this.logger.error('Failed to apply recommendation', { recommendationId, projectId, error });
      throw error;
    }
  }

  // OAuth Authentication
  async getOAuthAuthorizationUrl(provider: string, options: {
    redirectUri: string;
    scopes: string[];
  }): Promise<string> {
    try {
      // This would integrate with OAuth providers
      // For now, return a mock URL
      const state = this.generateId();
      
      return `https://auth.${provider}.com/oauth/authorize?` +
        `client_id=${process.env[`${provider.toUpperCase()}_CLIENT_ID`]}&` +
        `redirect_uri=${encodeURIComponent(options.redirectUri)}&` +
        `scope=${options.scopes.join(' ')}&` +
        `state=${state}&` +
        `response_type=code`;
    } catch (error) {
      this.logger.error('Failed to get OAuth authorization URL', { provider, options, error });
      throw error;
    }
  }

  async exchangeOAuthCode(provider: string, options: {
    code: string;
    redirectUri: string;
  }): Promise<OAuthTokens> {
    try {
      // This would exchange the code with the OAuth provider
      // For now, return mock tokens
      return {
        accessToken: this.generateId(),
        refreshToken: this.generateId(),
        expiresIn: 3600,
        tokenType: 'Bearer',
        scope: 'read write'
      };
    } catch (error) {
      this.logger.error('Failed to exchange OAuth code', { provider, options, error });
      throw error;
    }
  }

  // Webhook Management
  async createWebhook(integrationId: string, data: Partial<Webhook>): Promise<Webhook> {
    try {
      const webhook = {
        id: this.generateId(),
        integrationId,
        ...data,
        secret: this.generateId(),
        active: true,
        createdAt: new Date().toISOString()
      };

      await this.db.insert('webhooks', webhook);
      
      this.logger.info('Webhook created', { integrationId, webhookId: webhook.id });
      return webhook;
    } catch (error) {
      this.logger.error('Failed to create webhook', { integrationId, data, error });
      throw error;
    }
  }

  async getWebhooks(integrationId: string): Promise<Webhook[]> {
    try {
      return await this.db.query(
        'SELECT * FROM webhooks WHERE integration_id = ?',
        [integrationId]
      );
    } catch (error) {
      this.logger.error('Failed to get webhooks', { integrationId, error });
      throw error;
    }
  }

  async deleteWebhook(integrationId: string, webhookId: string): Promise<boolean> {
    try {
      const result = await this.db.delete('webhooks', {
        integration_id: integrationId,
        id: webhookId
      });
      
      if (result) {
        this.logger.info('Webhook deleted', { integrationId, webhookId });
      }
      
      return result;
    } catch (error) {
      this.logger.error('Failed to delete webhook', { integrationId, webhookId, error });
      throw error;
    }
  }

  // Private Helper Methods
  private async executeIntegrationRequest(integration: Integration, options: {
    endpoint: string;
    method: string;
    parameters?: Record<string, any>;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Build request configuration
      const config = this.buildRequestConfig(integration, options);
      
      // Execute request
      const response = await this.http.request(config);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed'
      };
    }
  }

  private buildRequestConfig(integration: Integration, options: {
    endpoint: string;
    method: string;
    parameters?: Record<string, any>;
  }) {
    // This would build the actual HTTP request configuration
    // based on the integration type and configuration
    return {
      url: `${integration.configuration?.baseUrl || ''}${options.endpoint}`,
      method: options.method,
      headers: this.buildHeaders(integration),
      params: options.parameters
    };
  }

  private buildHeaders(integration: Integration): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Torqvio/1.0'
    };

    // Add authentication headers
    if (integration.configuration?.apiKey) {
      headers['Authorization'] = `Bearer ${integration.configuration.apiKey}`;
    }

    return headers;
  }

  private encryptIntegration(integration: any): any {
    // Encrypt sensitive fields
    const encrypted = { ...integration };
    
    if (encrypted.configuration?.apiKey) {
      encrypted.configuration.apiKey = this.crypto.encrypt(encrypted.configuration.apiKey);
    }
    
    if (encrypted.configuration?.clientSecret) {
      encrypted.configuration.clientSecret = this.crypto.encrypt(encrypted.configuration.clientSecret);
    }
    
    return encrypted;
  }

  private decryptIntegration(integration: any): any {
    // Decrypt sensitive fields
    const decrypted = { ...integration };
    
    if (decrypted.configuration?.apiKey) {
      decrypted.configuration.apiKey = this.crypto.decrypt(decrypted.configuration.apiKey);
    }
    
    if (decrypted.configuration?.clientSecret) {
      decrypted.configuration.clientSecret = this.crypto.decrypt(decrypted.configuration.clientSecret);
    }
    
    return decrypted;
  }

  private async cleanupIntegrationData(integrationId: string): Promise<void> {
    try {
      // Clean up webhooks
      await this.db.delete('webhooks', { integration_id: integrationId });
      
      // Clean up execution logs
      await this.db.delete('integration_executions', { integration_id: integrationId });
      
      // Clean up activity logs
      await this.db.delete('integration_logs', { integration_id: integrationId });
      
      // Unschedule if needed
      const integration = await this.getIntegrationById(integrationId);
      if (integration?.scheduleId) {
        this.scheduler.unschedule(integration.scheduleId);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup integration data', { integrationId, error });
    }
  }

  private async logIntegrationActivity(integrationId: string, log: {
    level: string;
    message: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await this.db.insert('integration_logs', {
        integration_id: integrationId,
        level: log.level,
        message: log.message,
        metadata: log.metadata ? JSON.stringify(log.metadata) : null,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to log integration activity', { integrationId, log, error });
    }
  }

  private async logExecution(integrationId: string, data: {
    success: boolean;
    duration: number;
    endpoint: string;
    method: string;
    error?: string;
  }): Promise<void> {
    try {
      await this.db.insert('integration_executions', {
        integration_id: integrationId,
        success: data.success ? 1 : 0,
        duration: data.duration,
        endpoint: data.endpoint,
        method: data.method,
        error: data.error,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to log execution', { integrationId, data, error });
    }
  }

  private async checkAuthentication(integration: Integration): Promise<HealthDetail> {
    try {
      // This would perform authentication validation
      // For now, assume it's healthy
      return {
        component: 'authentication',
        status: 'healthy',
        message: 'Authentication is valid'
      };
    } catch (error) {
      return {
        component: 'authentication',
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  private async checkConnectivity(integration: Integration): Promise<HealthDetail> {
    try {
      // This would perform connectivity test
      // For now, assume it's healthy
      return {
        component: 'connectivity',
        status: 'healthy',
        message: 'Connection is stable'
      };
    } catch (error) {
      return {
        component: 'connectivity',
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  private async checkRecentPerformance(id: string): Promise<HealthDetail> {
    try {
      const metrics = await this.getIntegrationMetrics(id, '1h');
      
      if (metrics.errorRate > 50) {
        return {
          component: 'performance',
          status: 'unhealthy',
          message: `High error rate: ${metrics.errorRate.toFixed(1)}%`,
          metrics
        };
      } else if (metrics.errorRate > 10) {
        return {
          component: 'performance',
          status: 'degraded',
          message: `Elevated error rate: ${metrics.errorRate.toFixed(1)}%`,
          metrics
        };
      } else {
        return {
          component: 'performance',
          status: 'healthy',
          message: 'Performance is within normal ranges',
          metrics
        };
      }
    } catch (error) {
      return {
        component: 'performance',
        status: 'unhealthy',
        message: 'Unable to fetch performance metrics'
      };
    }
  }

  private determineHealthStatus(checks: HealthDetail[]): 'healthy' | 'degraded' | 'unhealthy' {
    const hasUnhealthy = checks.some(c => c.status === 'unhealthy');
    const hasDegraded = checks.some(c => c.status === 'degraded');
    
    if (hasUnhealthy) {
      return 'unhealthy';
    } else if (hasDegraded) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}
