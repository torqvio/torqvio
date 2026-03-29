import { IntegrationConnector } from './types';
import { DatabaseConnection } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';

export interface IntegrationConfig {
  type: IntegrationType;
  name: string;
  config: Record<string, any>;
  webhookUrl?: string;
  projectId: string;
}

export interface ExternalEvent {
  id: string;
  type: string;
  integrationId: string;
  rawData: any;
  headers: Record<string, string>;
  timestamp: Date;
}

export interface ProcessedEvent {
  id: string;
  status: 'processed' | 'ignored' | 'invalid_signature' | 'error';
  workflowTriggered?: string;
  recoveryPotential?: number;
  data?: any;
  reason?: string;
}

export interface WebhookConfig {
  endpointId?: string;
  secret: string;
  url: string;
}

export enum IntegrationType {
  STRIPE = 'stripe',
  SHOPIFY = 'shopify',
  WOOCOMMERCE = 'woocommerce',
  CUSTOM_API = 'custom_api',
  GENERIC = 'generic'
}

export class IntegrationService {
  private connectors: Map<IntegrationType, IntegrationConnector> = new Map();
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async registerConnector(type: IntegrationType, connector: IntegrationConnector): Promise<void> {
    this.connectors.set(type, connector);
  }

  async createIntegration(integrationConfig: IntegrationConfig): Promise<any> {
    const connector = this.connectors.get(integrationConfig.type);
    if (!connector) {
      throw new Error(`No connector found for type: ${integrationConfig.type}`);
    }

    // Validate credentials
    const isValid = await connector.validateCredentials(integrationConfig.config as any);
    if (!isValid) {
      throw new Error('Invalid integration credentials');
    }

    // Setup webhooks if provided
    let webhookConfig: WebhookConfig | null = null;
    if (integrationConfig.webhookUrl) {
      webhookConfig = await connector.setupWebhooks({
        type: integrationConfig.type,
        ...integrationConfig.config,
        webhookUrl: integrationConfig.webhookUrl
      } as any);
    }

    // Create integration record
    const integration = await this.db.query(`
      INSERT INTO integrations (
        id, project_id, type, name, config, webhook_url, webhook_secret, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `, [
      uuidv4(),
      integrationConfig.projectId,
      integrationConfig.type,
      integrationConfig.name,
      JSON.stringify(integrationConfig.config),
      integrationConfig.webhookUrl,
      webhookConfig?.secret,
      'active'
    ]);

    return integration[0];
  }

  async processEvent(event: ExternalEvent): Promise<ProcessedEvent> {
    try {
      // Get integration
      const integration = await this.db.query(`
        SELECT id, name, type, config, status, project_id, created_at, updated_at
        FROM integrations WHERE id = $1 AND status = 'active'
      `, [event.integrationId]);

      if (integration.length === 0) {
        return {
          id: uuidv4(),
          status: 'ignored',
          reason: 'Integration not found or inactive'
        };
      }

      const integrationData = integration[0];
      const connector = this.connectors.get(integrationData.type as IntegrationType);

      if (!connector) {
        return {
          id: uuidv4(),
          status: 'ignored',
          reason: `No connector for type: ${integrationData.type}`
        };
      }

      // Store raw event
      await this.db.query(`
        INSERT INTO integration_events (
          id, integration_id, external_event_id, event_type, raw_data, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        uuidv4(),
        event.integrationId,
        event.id,
        event.type,
        JSON.stringify(event.rawData),
        'processing'
      ]);

      // Process event with connector
      const processedEvent = await connector.processEvent({
        ...event,
        config: integrationData.config
      });

      // Update event record
      await this.db.query(`
        UPDATE integration_events 
        SET processed_data = $1, status = $2 
        WHERE external_event_id = $3
      `, [
        JSON.stringify(processedEvent),
        processedEvent.status,
        event.id
      ]);

      return processedEvent;
    } catch (error) {
      console.error('Error processing integration event:', error);
      return {
        id: uuidv4(),
        status: 'error',
        reason: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getEvents(integrationId: string, limit: number = 50): Promise<any[]> {
    const limitedCount = Math.min(limit, 100); // Max 100 for safety
    const events = await this.db.query(`
      SELECT id, integration_id, event_type, status, payload, error, created_at, updated_at
      FROM integration_events 
      WHERE integration_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `, [integrationId, limitedCount]);

    return events;
  }

  async getIntegrations(projectId: string): Promise<any[]> {
    const integrations = await this.db.query(`
      SELECT id, name, type, config, status, project_id, created_at, updated_at
      FROM integrations 
      WHERE project_id = $1 
      ORDER BY created_at DESC
      LIMIT 100
    `, [projectId]);

    return integrations;
  }

  async updateIntegration(integrationId: string, updates: Partial<IntegrationConfig>): Promise<any> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }

    if (updates.config) {
      fields.push(`config = $${paramIndex++}`);
      values.push(JSON.stringify(updates.config));
    }

    if (updates.webhookUrl) {
      fields.push(`webhook_url = $${paramIndex++}`);
      values.push(updates.webhookUrl);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(integrationId);

    const result = await this.db.query(`
      UPDATE integrations 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    return result[0];
  }

  async deleteIntegration(integrationId: string): Promise<void> {
    await this.db.query('DELETE FROM integration_events WHERE integration_id = $1', [integrationId]);
    await this.db.query('DELETE FROM integrations WHERE id = $1', [integrationId]);
  }
}
