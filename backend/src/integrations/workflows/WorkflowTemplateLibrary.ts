import { DatabaseConnection } from '../../database/connection';
import { v4 as uuidv4 } from 'uuid';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  useCase: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  requiredIntegrations: string[];
  optionalIntegrations: string[];
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  configuration: TemplateConfiguration;
  documentation: TemplateDocumentation;
  examples: TemplateExample[];
  version: string;
  author: TemplateAuthor;
  popularity: number;
  rating: number;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'trigger' | 'condition' | 'action' | 'transformation' | 'delay' | 'notification';
  description: string;
  configuration: StepConfiguration;
  position: StepPosition;
  connections: StepConnection[];
  required: boolean;
  timeout?: number;
  retryPolicy?: RetryPolicy;
}

export interface StepConfiguration {
  integrationType?: string;
  action?: string;
  parameters: Record<string, any>;
  mapping?: FieldMapping[];
  validation?: ValidationRule[];
  errorHandling?: ErrorHandlingConfig;
}

export interface StepPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface StepConnection {
  fromStepId: string;
  toStepId: string;
  condition?: string;
  label?: string;
}

export interface WorkflowTrigger {
  id: string;
  name: string;
  type: 'webhook' | 'schedule' | 'event' | 'manual';
  configuration: TriggerConfiguration;
}

export interface TriggerConfiguration {
  webhook?: WebhookTriggerConfig;
  schedule?: ScheduleTriggerConfig;
  event?: EventTriggerConfig;
  manual?: ManualTriggerConfig;
}

export interface WebhookTriggerConfig {
  url: string;
  method: 'POST' | 'GET' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  authentication?: AuthenticationConfig;
  expectedPayload?: any;
}

export interface ScheduleTriggerConfig {
  cron: string;
  timezone?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface EventTriggerConfig {
  integrationType: string;
  eventType: string;
  filters?: Record<string, any>;
}

export interface ManualTriggerConfig {
  requireConfirmation: boolean;
  allowedRoles?: string[];
  description?: string;
}

export interface WorkflowCondition {
  id: string;
  name: string;
  type: 'simple' | 'complex' | 'custom';
  configuration: ConditionConfiguration;
}

export interface ConditionConfiguration {
  rules: ConditionRule[];
  operator: 'AND' | 'OR';
  customExpression?: string;
}

export interface ConditionRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in';
  value: any;
  caseSensitive?: boolean;
}

export interface WorkflowAction {
  id: string;
  name: string;
  type: 'integration' | 'notification' | 'data' | 'custom' | 'approval';
  configuration: ActionConfiguration;
}

export interface ActionConfiguration {
  integration?: IntegrationActionConfig;
  notification?: NotificationActionConfig;
  data?: DataActionConfig;
  custom?: CustomActionConfig;
  approval?: ApprovalActionConfig;
}

export interface IntegrationActionConfig {
  type: string;
  action: string;
  parameters: Record<string, any>;
  mapping?: FieldMapping[];
}

export interface NotificationActionConfig {
  channels: string[];
  template: string;
  recipients: string[];
  variables?: Record<string, any>;
}

export interface DataActionConfig {
  operation: 'create' | 'update' | 'delete' | 'query';
  source: string;
  data: any;
  condition?: string;
}

export interface CustomActionConfig {
  code: string;
  language: 'javascript' | 'python' | 'typescript';
  parameters: Record<string, any>;
}

export interface ApprovalActionConfig {
  approvers: string[];
  timeout: number;
  reminderInterval?: number;
  escalationRules?: EscalationRule[];
}

export interface EscalationRule {
  condition: string;
  action: string;
  delay: number;
}

export interface TemplateConfiguration {
  variables: TemplateVariable[];
  environment: TemplateEnvironment;
  security: TemplateSecurity;
  monitoring: TemplateMonitoring;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
  sensitive: boolean;
}

export interface TemplateEnvironment {
  required: string[];
  optional: string[];
  secrets: string[];
}

export interface TemplateSecurity {
  authentication: AuthenticationConfig[];
  permissions: string[];
  dataHandling: DataHandlingConfig;
}

export interface DataHandlingConfig {
  encryption: boolean;
  anonymization: boolean;
  retention: number;
  compliance: string[];
}

export interface TemplateMonitoring {
  metrics: string[];
  alerts: AlertConfig[];
  logging: LoggingConfig;
}

export interface AlertConfig {
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  retention: number;
  format: 'json' | 'text';
}

export interface TemplateDocumentation {
  overview: string;
  setup: string;
  configuration: string;
  troubleshooting: string;
  apiReference: string;
  changelog: string;
}

export interface TemplateExample {
  title: string;
  description: string;
  scenario: string;
  configuration: any;
  expectedResult: any;
}

export interface TemplateAuthor {
  id: string;
  name: string;
  email: string;
  company?: string;
  website?: string;
  verified: boolean;
}

export class WorkflowTemplateLibrary {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
    this.initializeTables();
    this.seedDefaultTemplates();
  }

  private async initializeTables(): Promise<void> {
    // Templates table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS workflow_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category_id UUID REFERENCES workflow_categories(id),
        use_case VARCHAR(200) NOT NULL,
        complexity VARCHAR(20) NOT NULL,
        estimated_time VARCHAR(50) NOT NULL,
        required_integrations TEXT[] NOT NULL DEFAULT '{}',
        optional_integrations TEXT[] DEFAULT '{}',
        steps JSONB NOT NULL,
        triggers JSONB NOT NULL,
        conditions JSONB DEFAULT '[]',
        actions JSONB DEFAULT '[]',
        configuration JSONB NOT NULL,
        documentation JSONB NOT NULL,
        examples JSONB DEFAULT '[]',
        version VARCHAR(50) NOT NULL,
        author_id UUID REFERENCES template_authors(id),
        popularity INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        tags TEXT[] DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Categories table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS workflow_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(20) DEFAULT '#6B7280',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Authors table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS template_authors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        company VARCHAR(200),
        website VARCHAR(500),
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Template usage tracking
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS template_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
        project_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        used_at TIMESTAMP DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'active'
      );
    `);

    // Template ratings
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS template_ratings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(template_id, user_id)
      );
    `);

    // Create indexes
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category_id)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_workflow_templates_popularity ON workflow_templates(popularity DESC)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_workflow_templates_rating ON workflow_templates(rating DESC)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_workflow_templates_tags ON workflow_templates USING GIN(tags)');
  }

  private async seedDefaultTemplates(): Promise<void> {
    // Create default categories
    const categories = [
      { name: 'E-commerce', description: 'Templates for e-commerce workflows', icon: 'shopping-cart', color: '#8B5CF6' },
      { name: 'Customer Support', description: 'Customer service and support workflows', icon: 'headset', color: '#10B981' },
      { name: 'Marketing', description: 'Marketing automation workflows', icon: 'megaphone', color: '#F59E0B' },
      { name: 'Finance', description: 'Financial and billing workflows', icon: 'dollar-sign', color: '#3B82F6' },
      { name: 'HR', description: 'Human resources workflows', icon: 'users', color: '#EF4444' },
      { name: 'Operations', description: 'Business operations workflows', icon: 'cog', color: '#6B7280' }
    ];

    for (const category of categories) {
      await this.db.query(`
        INSERT INTO workflow_categories (name, description, icon, color)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO NOTHING
      `, [category.name, category.description, category.icon, category.color]);
    }

    // Seed some default templates
    await this.seedEcommerceTemplates();
  }

  private async seedEcommerceTemplates(): Promise<void> {
    const templates = [
      {
        name: 'Order Fulfillment Automation',
        description: 'Automatically process new orders, update inventory, and send confirmation emails',
        useCase: 'Process e-commerce orders from payment to fulfillment',
        complexity: 'intermediate' as const,
        estimatedTime: '15 minutes',
        requiredIntegrations: ['shopify', 'stripe'],
        optionalIntegrations: ['slack', 'sendgrid'],
        steps: [
          {
            id: 'step_1',
            name: 'Receive Order Webhook',
            type: 'trigger' as const,
            description: 'Trigger when new order is created',
            configuration: {
              integrationType: 'shopify',
              action: 'order.created',
              parameters: { eventType: 'orders/create' }
            },
            position: { x: 100, y: 100 },
            connections: [{ fromStepId: 'step_1', toStepId: 'step_2' }],
            required: true
          }
        ],
        triggers: [
          {
            id: 'trigger_1',
            name: 'Order Created',
            type: 'webhook' as const,
            configuration: {
              webhook: {
                url: '/webhooks/shopify/order',
                method: 'POST' as const,
                authentication: { type: 'api_key', header: 'X-Shopify-Hmac-Sha256' }
              }
            }
          }
        ],
        conditions: [],
        actions: [],
        configuration: {
          variables: [
            { name: 'confirmationDelay', type: 'number' as const, description: 'Delay before sending confirmation', required: false, defaultValue: 0, validation: [], sensitive: false }
          ],
          environment: { required: [], optional: [], secrets: ['SHOPIFY_WEBHOOK_SECRET', 'STRIPE_API_KEY'] },
          security: {
            authentication: [{ type: 'api_key', name: 'Shopify Webhook' }],
            permissions: ['orders.read', 'inventory.write'],
            dataHandling: { encryption: true, anonymization: false, retention: 365, compliance: ['PCI-DSS'] }
          },
          monitoring: {
            metrics: ['orders_processed', 'processing_time', 'error_rate'],
            alerts: [
              { name: 'High Error Rate', condition: 'error_rate > 0.1', severity: 'high' as const, channels: ['email'] }
            ],
            logging: { level: 'info' as const, retention: 30, format: 'json' as const }
          }
        },
        documentation: {
          overview: 'This template automates the order fulfillment process for e-commerce stores...',
          setup: '1. Connect Shopify and Stripe accounts\n2. Configure webhook endpoints\n3. Set up email templates',
          configuration: 'Configure inventory management rules and notification preferences...',
          troubleshooting: 'Common issues and solutions...',
          apiReference: 'API endpoints and data structures...',
          changelog: 'Version history and updates...'
        },
        examples: [
          {
            title: 'Basic Order Processing',
            description: 'Simple order processing with inventory update',
            scenario: 'A customer places an order for a single item',
            configuration: { notifySlack: false, confirmationDelay: 0 },
            expectedResult: 'Order processed, inventory updated, confirmation sent'
          }
        ],
        version: '1.0.0',
        tags: ['ecommerce', 'shopify', 'stripe', 'automation']
      }
    ];

    for (const template of templates) {
      await this.createTemplate({
        ...template,
        category: { id: '', name: 'E-commerce', description: '', icon: '', color: '' },
        author: { id: '', name: 'Torqvio Team', email: 'team@torqvio.com', verified: true },
        popularity: 0,
        rating: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  async createTemplate(template: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowTemplate> {
    // Get or create author
    const author = await this.getOrCreateAuthor(template.author);

    // Get or create category
    const category = await this.getOrCreateCategory(template.category);

    const result = await this.db.query(`
      INSERT INTO workflow_templates (
        name, description, category_id, use_case, complexity, estimated_time,
        required_integrations, optional_integrations, steps, triggers, conditions, actions,
        configuration, documentation, examples, version, author_id, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      template.name,
      template.description,
      category.id,
      template.useCase,
      template.complexity,
      template.estimatedTime,
      template.requiredIntegrations,
      template.optionalIntegrations,
      JSON.stringify(template.steps),
      JSON.stringify(template.triggers),
      JSON.stringify(template.conditions),
      JSON.stringify(template.actions),
      JSON.stringify(template.configuration),
      JSON.stringify(template.documentation),
      JSON.stringify(template.examples),
      template.version,
      author.id,
      template.tags
    ]);

    return this.mapDbRowToTemplate(result[0]);
  }

  async getTemplates(filters: {
    category?: string;
    complexity?: string;
    integrations?: string[];
    tags?: string[];
    search?: string;
    sort?: 'popularity' | 'newest' | 'rating' | 'name';
    limit?: number;
    offset?: number;
  } = {}): Promise<WorkflowTemplate[]> {
    let query = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
             a.name as author_name, a.verified as author_verified,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as rating_count
      FROM workflow_templates t
      JOIN workflow_categories c ON t.category_id = c.id
      JOIN template_authors a ON t.author_id = a.id
      LEFT JOIN template_ratings r ON t.id = r.template_id
    `;
    
    const conditions = ['t.is_active = true'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.category) {
      conditions.push(`c.name = $${paramIndex++}`);
      params.push(filters.category);
    }

    if (filters.complexity) {
      conditions.push(`t.complexity = $${paramIndex++}`);
      params.push(filters.complexity);
    }

    if (filters.integrations && filters.integrations.length > 0) {
      conditions.push(`t.required_integrations && $${paramIndex++}`);
      params.push(filters.integrations);
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`t.tags && $${paramIndex++}`);
      params.push(filters.tags);
    }

    if (filters.search) {
      conditions.push(`(t.name ILIKE $${paramIndex++} OR t.description ILIKE $${paramIndex++} OR t.use_case ILIKE $${paramIndex++})`);
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    query += ` WHERE ${conditions.join(' AND ')}`;

    query += ` GROUP BY t.id, c.name, c.icon, c.color, a.name, a.verified`;

    // Add sorting
    switch (filters.sort) {
      case 'popularity':
        query += ` ORDER BY t.popularity DESC`;
        break;
      case 'newest':
        query += ` ORDER BY t.created_at DESC`;
        break;
      case 'rating':
        query += ` ORDER BY average_rating DESC, rating_count DESC`;
        break;
      case 'name':
        query += ` ORDER BY t.name ASC`;
        break;
      default:
        query += ` ORDER BY t.popularity DESC, t.created_at DESC`;
    }

    // Add pagination
    if (filters.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await this.db.query(query, params);
    return result.map(row => this.mapDbRowToTemplate(row));
  }

  async getTemplate(templateId: string): Promise<WorkflowTemplate | null> {
    const result = await this.db.query(`
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
             a.name as author_name, a.verified as author_verified,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as rating_count
      FROM workflow_templates t
      JOIN workflow_categories c ON t.category_id = c.id
      JOIN template_authors a ON t.author_id = a.id
      LEFT JOIN template_ratings r ON t.id = r.template_id
      WHERE t.id = $1 AND t.is_active = true
      GROUP BY t.id, c.name, c.icon, c.color, a.name, a.verified
    `, [templateId]);

    if (result.length === 0) return null;

    return this.mapDbRowToTemplate(result[0]);
  }

  async useTemplate(templateId: string, projectId: string, userId: string): Promise<void> {
    // Record template usage
    await this.db.query(`
      INSERT INTO template_usage (template_id, project_id, user_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (template_id, project_id) DO UPDATE SET
        used_at = NOW(),
        status = 'active'
    `, [templateId, projectId, userId]);

    // Update popularity
    await this.db.query(`
      UPDATE workflow_templates 
      SET popularity = popularity + 1, updated_at = NOW()
      WHERE id = $1
    `, [templateId]);
  }

  async rateTemplate(templateId: string, userId: string, rating: number, review?: string): Promise<void> {
    await this.db.query(`
      INSERT INTO template_ratings (template_id, user_id, rating, review)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (template_id, user_id) DO UPDATE SET
        rating = EXCLUDED.rating,
        review = EXCLUDED.review
    `, [templateId, userId, rating, review]);

    // Update template rating
    await this.db.query(`
      UPDATE workflow_templates 
      SET rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM template_ratings 
        WHERE template_id = $1
      ),
      updated_at = NOW()
      WHERE id = $1
    `, [templateId]);
  }

  async getCategories(): Promise<WorkflowCategory[]> {
    const result = await this.db.query(`
      SELECT * FROM workflow_categories ORDER BY name ASC
    `);

    return result.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      color: row.color
    }));
  }

  async getPopularTemplates(limit: number = 10): Promise<WorkflowTemplate[]> {
    return this.getTemplates({
      sort: 'popularity',
      limit
    });
  }

  async getNewTemplates(limit: number = 10): Promise<WorkflowTemplate[]> {
    return this.getTemplates({
      sort: 'newest',
      limit
    });
  }

  async searchTemplates(query: string, limit: number = 20): Promise<WorkflowTemplate[]> {
    return this.getTemplates({
      search: query,
      limit
    });
  }

  private async getOrCreateAuthor(author: TemplateAuthor): Promise<TemplateAuthor> {
    const existing = await this.db.query(`
      SELECT * FROM template_authors WHERE email = $1
    `, [author.email]);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await this.db.query(`
      INSERT INTO template_authors (name, email, company, website, verified)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      author.name,
      author.email,
      author.company,
      author.website,
      author.verified
    ]);

    return result[0];
  }

  private async getOrCreateCategory(category: WorkflowCategory): Promise<WorkflowCategory> {
    const existing = await this.db.query(`
      SELECT * FROM workflow_categories WHERE name = $1
    `, [category.name]);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await this.db.query(`
      INSERT INTO workflow_categories (name, description, icon, color)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      category.name,
      category.description,
      category.icon,
      category.color
    ]);

    return result[0];
  }

  private mapDbRowToTemplate(row: any): WorkflowTemplate {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: {
        id: row.category_id,
        name: row.category_name,
        description: '',
        icon: row.category_icon,
        color: row.category_color
      },
      useCase: row.use_case,
      complexity: row.complexity,
      estimatedTime: row.estimated_time,
      requiredIntegrations: row.required_integrations,
      optionalIntegrations: row.optional_integrations,
      steps: row.steps,
      triggers: row.triggers,
      conditions: row.conditions,
      actions: row.actions,
      configuration: row.configuration,
      documentation: row.documentation,
      examples: row.examples,
      version: row.version,
      author: {
        id: row.author_id,
        name: row.author_name,
        email: '',
        verified: row.author_verified
      },
      popularity: row.popularity,
      rating: parseFloat(row.average_rating) || 0,
      tags: row.tags,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

// Supporting interfaces
interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
}

interface ValidationRule {
  type: string;
  config: Record<string, any>;
  message: string;
}

interface ErrorHandlingConfig {
  strategy: 'ignore' | 'retry' | 'fail';
  maxRetries?: number;
  retryDelay?: number;
}

interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  baseDelay: number;
  maxDelay: number;
}

interface AuthenticationConfig {
  type: string;
  name: string;
}
