import { DatabaseConnection } from '../../database/connection';
import { v4 as uuidv4 } from 'uuid';

export interface MarketplaceConnector {
  id: string;
  name: string;
  description: string;
  category: ConnectorCategory;
  developer: DeveloperInfo;
  version: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'deprecated';
  documentation: Documentation;
  configuration: ConnectorConfiguration;
  pricing: PricingModel;
  usageStats: UsageStats;
  reviews: Review[];
  tags: string[];
  compatibility: CompatibilityInfo;
  security: SecurityInfo;
  support: SupportInfo;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface DeveloperInfo {
  id: string;
  name: string;
  email: string;
  company?: string;
  website?: string;
  verified: boolean;
  reputation: number;
}

export interface ConnectorCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  popular: boolean;
}

export interface Documentation {
  overview: string;
  setupGuide: string;
  apiReference: string;
  examples: DocumentationExample[];
  troubleshooting: string;
  changelog: string;
}

export interface DocumentationExample {
  title: string;
  description: string;
  code: string;
  language: string;
  useCase: string;
}

export interface ConnectorConfiguration {
  authentication: AuthenticationConfig[];
  endpoints: EndpointConfig[];
  webhooks: WebhookConfig[];
  rateLimiting: RateLimitConfig;
  fields: ConfigurationField[];
  testing: TestingConfig;
}

export interface AuthenticationConfig {
  type: 'oauth2' | 'api_key' | 'basic' | 'bearer' | 'custom';
  name: string;
  description: string;
  required: boolean;
  fields: AuthenticationField[];
  setupInstructions?: string;
}

export interface AuthenticationField {
  name: string;
  type: 'text' | 'password' | 'url' | 'select' | 'multiselect' | 'textarea';
  label: string;
  description: string;
  required: boolean;
  options?: string[];
  validation?: ValidationRule[];
}

export interface EndpointConfig {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  parameters: ParameterConfig[];
  requestBody?: RequestBodyConfig;
  responses: ResponseConfig[];
  rateLimit?: EndpointRateLimit;
}

export interface ParameterConfig {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  location: 'query' | 'path' | 'header';
  required: boolean;
  description: string;
  validation?: ValidationRule[];
}

export interface RequestBodyConfig {
  contentType: string;
  schema: any;
  required: boolean;
  description: string;
}

export interface ResponseConfig {
  statusCode: number;
  description: string;
  schema: any;
  example?: any;
}

export interface WebhookConfig {
  name: string;
  events: WebhookEvent[];
  signature: WebhookSignature;
  retryPolicy: RetryPolicy;
}

export interface WebhookEvent {
  name: string;
  description: string;
  payload: any;
  samplePayload: any;
}

export interface WebhookSignature {
  algorithm: string;
  header: string;
  secretRequired: boolean;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  baseDelay: number;
  maxDelay: number;
}

export interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
}

export interface EndpointRateLimit {
  requestsPerSecond: number;
  requestsPerMinute: number;
}

export interface ConfigurationField {
  name: string;
  type: 'text' | 'password' | 'url' | 'select' | 'multiselect' | 'textarea' | 'number' | 'boolean';
  label: string;
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: ValidationRule[];
  group?: string;
}

export interface ValidationRule {
  type: 'required' | 'pattern' | 'length' | 'range' | 'custom';
  config: Record<string, any>;
  message: string;
}

export interface TestingConfig {
  testEndpoints: TestEndpoint[];
  mockData: any;
  healthCheck: HealthCheckConfig;
}

export interface TestEndpoint {
  name: string;
  endpoint: string;
  method: string;
  expectedResponse: any;
  testScript?: string;
}

export interface HealthCheckConfig {
  endpoint: string;
  method: string;
  expectedStatus: number;
  interval: number;
}

export interface PricingModel {
  type: 'free' | 'freemium' | 'paid' | 'usage_based' | 'subscription';
  freeTierLimits?: FreeTierLimits;
  paidPlans?: PaidPlan[];
  usageRates?: UsageRate[];
}

export interface FreeTierLimits {
  requestsPerMonth: number;
  features: string[];
  supportLevel: string;
}

export interface PaidPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  limits: PlanLimits;
  supportLevel: string;
}

export interface PlanLimits {
  requestsPerMonth: number;
  concurrentConnections: number;
  dataRetention: number;
  customSupport: boolean;
}

export interface UsageRate {
  metric: string;
  unitPrice: number;
  unit: string;
  tieredRates?: TieredRate[];
}

export interface TieredRate {
  minVolume: number;
  maxVolume: number;
  unitPrice: number;
}

export interface UsageStats {
  totalInstalls: number;
  activeInstalls: number;
  totalRequests: number;
  averageResponseTime: number;
  uptime: number;
  errorRate: number;
  lastUpdated: Date;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompatibilityInfo {
  platforms: string[];
  apiVersions: string[];
  dependencies: Dependency[];
  testedVersions: string[];
}

export interface Dependency {
  name: string;
  version: string;
  required: boolean;
}

export interface SecurityInfo {
  compliance: SecurityCompliance[];
  certifications: string[];
  dataHandling: DataHandlingInfo;
  auditTrail: boolean;
  encryption: EncryptionInfo;
}

export interface SecurityCompliance {
  standard: string;
  version: string;
  certified: boolean;
  lastAuditDate?: Date;
}

export interface DataHandlingInfo {
  dataStored: boolean;
  dataShared: boolean;
  dataRetention: string;
  dataLocation: string[];
  anonymization: boolean;
}

export interface EncryptionInfo {
  inTransit: boolean;
  atRest: boolean;
  algorithm: string;
}

export interface SupportInfo {
  level: 'community' | 'basic' | 'premium' | 'enterprise';
  responseTime: string;
  channels: string[];
  documentation: string;
  community: string;
  email?: string;
  phone?: string;
}

export class ConnectorMarketplace {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
    this.initializeTables();
  }

  private async initializeTables(): Promise<void> {
    // Main connectors table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS marketplace_connectors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category_id UUID REFERENCES connector_categories(id),
        developer_id UUID REFERENCES connector_developers(id),
        version VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        documentation JSONB NOT NULL,
        configuration JSONB NOT NULL,
        pricing JSONB NOT NULL,
        usage_stats JSONB NOT NULL DEFAULT '{}',
        tags TEXT[] DEFAULT '{}',
        compatibility JSONB NOT NULL,
        security JSONB NOT NULL,
        support JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        published_at TIMESTAMP
      );
    `);

    // Categories table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS connector_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        popular BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Developers table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS connector_developers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        company VARCHAR(200),
        website VARCHAR(500),
        verified BOOLEAN DEFAULT false,
        reputation INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Reviews table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS connector_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        connector_id UUID REFERENCES marketplace_connectors(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(200) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(200),
        content TEXT,
        verified BOOLEAN DEFAULT false,
        helpful INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Installations table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS connector_installations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        connector_id UUID REFERENCES marketplace_connectors(id) ON DELETE CASCADE,
        project_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        version VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        installed_at TIMESTAMP DEFAULT NOW(),
        last_used TIMESTAMP,
        usage_count INTEGER DEFAULT 0
      );
    `);

    // Usage metrics table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS connector_usage_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        connector_id UUID REFERENCES marketplace_connectors(id) ON DELETE CASCADE,
        project_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        requests INTEGER DEFAULT 0,
        errors INTEGER DEFAULT 0,
        response_time_sum INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_marketplace_connectors_category ON marketplace_connectors(category_id)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_marketplace_connectors_status ON marketplace_connectors(status)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_marketplace_connectors_popularity ON marketplace_connectors(usage_stats)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_connector_reviews_connector ON connector_reviews(connector_id)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_connector_installations_connector ON connector_installations(connector_id)');
  }

  async submitConnector(connector: Omit<MarketplaceConnector, 'id' | 'createdAt' | 'updatedAt'>): Promise<MarketplaceConnector> {
    // Validate developer exists or create new one
    const developer = await this.getOrCreateDeveloper(connector.developer);

    // Validate category exists
    const category = await this.getOrCreateCategory(connector.category);

    const result = await this.db.query(`
      INSERT INTO marketplace_connectors (
        name, description, category_id, developer_id, version, status,
        documentation, configuration, pricing, tags, compatibility, security, support
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      connector.name,
      connector.description,
      category.id,
      developer.id,
      connector.version,
      connector.status,
      JSON.stringify(connector.documentation),
      JSON.stringify(connector.configuration),
      JSON.stringify(connector.pricing),
      connector.tags,
      JSON.stringify(connector.compatibility),
      JSON.stringify(connector.security),
      JSON.stringify(connector.support)
    ]);

    return this.mapDbConnectorToMarketplaceConnector(result[0]);
  }

  async getConnectors(filters: {
    category?: string;
    status?: string;
    tags?: string[];
    search?: string;
    sort?: 'popularity' | 'newest' | 'rating' | 'name';
    limit?: number;
    offset?: number;
  } = {}): Promise<MarketplaceConnector[]> {
    let query = `
      SELECT c.*, d.name as developer_name, d.verified as developer_verified,
             cat.name as category_name, cat.icon as category_icon,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count
      FROM marketplace_connectors c
      JOIN connector_developers d ON c.developer_id = d.id
      JOIN connector_categories cat ON c.category_id = cat.id
      LEFT JOIN connector_reviews r ON c.id = r.connector_id
    `;
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`c.status = $${paramIndex++}`);
      params.push(filters.status);
    }

    if (filters.category) {
      conditions.push(`cat.name = $${paramIndex++}`);
      params.push(filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`c.tags && $${paramIndex++}`);
      params.push(filters.tags);
    }

    if (filters.search) {
      conditions.push(`(c.name ILIKE $${paramIndex++} OR c.description ILIKE $${paramIndex++})`);
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY c.id, d.name, d.verified, cat.name, cat.icon`;

    // Add sorting
    switch (filters.sort) {
      case 'popularity':
        query += ` ORDER BY (c.usage_stats->>'totalInstalls')::INTEGER DESC`;
        break;
      case 'newest':
        query += ` ORDER BY c.created_at DESC`;
        break;
      case 'rating':
        query += ` ORDER BY average_rating DESC, review_count DESC`;
        break;
      case 'name':
        query += ` ORDER BY c.name ASC`;
        break;
      default:
        query += ` ORDER BY c.created_at DESC`;
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
    return result.map(row => this.mapDbRowToMarketplaceConnector(row));
  }

  async getConnector(connectorId: string): Promise<MarketplaceConnector | null> {
    const result = await this.db.query(`
      SELECT c.*, d.name as developer_name, d.verified as developer_verified,
             cat.name as category_name, cat.icon as category_icon
      FROM marketplace_connectors c
      JOIN connector_developers d ON c.developer_id = d.id
      JOIN connector_categories cat ON c.category_id = cat.id
      WHERE c.id = $1
    `, [connectorId]);

    if (result.length === 0) return null;

    const connector = this.mapDbRowToMarketplaceConnector(result[0]);
    
    // Load reviews
    connector.reviews = await this.getConnectorReviews(connectorId);

    return connector;
  }

  async installConnector(connectorId: string, projectId: string, userId: string): Promise<void> {
    const connector = await this.getConnector(connectorId);
    if (!connector) {
      throw new Error('Connector not found');
    }

    if (connector.status !== 'approved') {
      throw new Error('Connector is not approved for installation');
    }

    // Check if already installed
    const existing = await this.db.query(`
      SELECT id FROM connector_installations 
      WHERE connector_id = $1 AND project_id = $2
    `, [connectorId, projectId]);

    if (existing.length > 0) {
      throw new Error('Connector already installed');
    }

    // Create installation record
    await this.db.query(`
      INSERT INTO connector_installations (connector_id, project_id, user_id, version)
      VALUES ($1, $2, $3, $4)
    `, [connectorId, projectId, userId, connector.version]);

    // Update usage stats
    await this.updateUsageStats(connectorId, 'install');
  }

  async uninstallConnector(connectorId: string, projectId: string): Promise<void> {
    await this.db.query(`
      DELETE FROM connector_installations 
      WHERE connector_id = $1 AND project_id = $2
    `, [connectorId, projectId]);

    await this.updateUsageStats(connectorId, 'uninstall');
  }

  async addReview(connectorId: string, review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    const result = await this.db.query(`
      INSERT INTO connector_reviews (
        connector_id, user_id, user_name, rating, title, content, verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      connectorId,
      review.userId,
      review.userName,
      review.rating,
      review.title,
      review.content,
      review.verified
    ]);

    return result[0];
  }

  async updateUsageStats(connectorId: string, action: 'install' | 'uninstall' | 'request' | 'error'): Promise<void> {
    const connector = await this.db.query(`
      SELECT usage_stats FROM marketplace_connectors WHERE id = $1
    `, [connectorId]);

    if (connector.length === 0) return;

    const stats = connector[0].usage_stats as any;

    switch (action) {
      case 'install':
        stats.totalInstalls = (stats.totalInstalls || 0) + 1;
        stats.activeInstalls = (stats.activeInstalls || 0) + 1;
        break;
      case 'uninstall':
        stats.activeInstalls = Math.max(0, (stats.activeInstalls || 0) - 1);
        break;
      case 'request':
        stats.totalRequests = (stats.totalRequests || 0) + 1;
        break;
      case 'error':
        // Error rate would be calculated separately
        break;
    }

    stats.lastUpdated = new Date();

    await this.db.query(`
      UPDATE marketplace_connectors 
      SET usage_stats = $1, updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify(stats), connectorId]);
  }

  async getCategories(): Promise<ConnectorCategory[]> {
    const result = await this.db.query(`
      SELECT * FROM connector_categories ORDER BY popular DESC, name ASC
    `);

    return result.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      popular: row.popular
    }));
  }

  async getPopularConnectors(limit: number = 10): Promise<MarketplaceConnector[]> {
    return this.getConnectors({
      status: 'approved',
      sort: 'popularity',
      limit
    });
  }

  async getNewConnectors(limit: number = 10): Promise<MarketplaceConnector[]> {
    return this.getConnectors({
      status: 'approved',
      sort: 'newest',
      limit
    });
  }

  async searchConnectors(query: string, limit: number = 20): Promise<MarketplaceConnector[]> {
    return this.getConnectors({
      search: query,
      status: 'approved',
      limit
    });
  }

  private async getOrCreateDeveloper(developer: DeveloperInfo): Promise<DeveloperInfo> {
    const existing = await this.db.query(`
      SELECT * FROM connector_developers WHERE email = $1
    `, [developer.email]);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await this.db.query(`
      INSERT INTO connector_developers (name, email, company, website, verified, reputation)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      developer.name,
      developer.email,
      developer.company,
      developer.website,
      developer.verified,
      developer.reputation
    ]);

    return result[0];
  }

  private async getOrCreateCategory(category: ConnectorCategory): Promise<ConnectorCategory> {
    const existing = await this.db.query(`
      SELECT * FROM connector_categories WHERE name = $1
    `, [category.name]);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await this.db.query(`
      INSERT INTO connector_categories (name, description, icon, popular)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      category.name,
      category.description,
      category.icon,
      category.popular
    ]);

    return result[0];
  }

  private async getConnectorReviews(connectorId: string): Promise<Review[]> {
    const result = await this.db.query(`
      SELECT * FROM connector_reviews 
      WHERE connector_id = $1 
      ORDER BY created_at DESC
    `, [connectorId]);

    return result.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      rating: row.rating,
      title: row.title,
      content: row.content,
      verified: row.verified,
      helpful: row.helpful,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  private mapDbConnectorToMarketplaceConnector(row: any): MarketplaceConnector {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category_id, // Would need to fetch full category
      developer: row.developer_id, // Would need to fetch full developer
      version: row.version,
      status: row.status,
      documentation: row.documentation,
      configuration: row.configuration,
      pricing: row.pricing,
      usageStats: row.usage_stats,
      reviews: [], // Would need to fetch separately
      tags: row.tags,
      compatibility: row.compatibility,
      security: row.security,
      support: row.support,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at
    };
  }

  private mapDbRowToMarketplaceConnector(row: any): MarketplaceConnector {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: {
        id: row.category_id,
        name: row.category_name,
        description: '',
        icon: row.category_icon,
        popular: false
      },
      developer: {
        id: row.developer_id,
        name: row.developer_name,
        email: '',
        verified: row.developer_verified,
        reputation: 0
      },
      version: row.version,
      status: row.status,
      documentation: row.documentation,
      configuration: row.configuration,
      pricing: row.pricing,
      usageStats: row.usage_stats,
      reviews: [],
      tags: row.tags,
      compatibility: row.compatibility,
      security: row.security,
      support: row.support,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at
    };
  }

  async getDeveloperConnectors(developerId: string): Promise<MarketplaceConnector[]> {
    const result = await this.db.query(`
      SELECT c.*, d.name as developer_name, d.verified as developer_verified,
             cat.name as category_name, cat.icon as category_icon
      FROM marketplace_connectors c
      JOIN connector_developers d ON c.developer_id = d.id
      JOIN connector_categories cat ON c.category_id = cat.id
      WHERE c.developer_id = $1
      ORDER BY c.updated_at DESC
    `, [developerId]);

    return result.map(row => this.mapDbRowToMarketplaceConnector(row));
  }

  async updateConnectorStatus(connectorId: string, status: MarketplaceConnector['status'], reviewerId?: string): Promise<void> {
    await this.db.query(`
      UPDATE marketplace_connectors 
      SET status = $1, updated_at = NOW(), 
          published_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE published_at END
      WHERE id = $2
    `, [status, connectorId]);

    // Log status change for audit
    await this.db.query(`
      INSERT INTO connector_status_history (connector_id, old_status, new_status, reviewer_id, changed_at)
      SELECT $1, status, $2, $3, NOW()
      FROM marketplace_connectors WHERE id = $1
    `, [connectorId, status, reviewerId]);
  }
}
