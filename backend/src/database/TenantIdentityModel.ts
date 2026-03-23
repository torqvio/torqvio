import { DatabaseConnection } from './connection.js';

export interface TenantIdentity {
  id: string;
  projectId: string;
  companyName: string;
  industry: string;
  revenueTier: string;
  totalRevenueProtected: number;
  recoveryStory: string;
  trustScore: number;
  notificationPreferences: {
    ltvFramed: boolean;
    reportFrequency: 'daily' | 'weekly' | 'monthly';
    notificationEmail?: string;
    slackWebhook?: string;
  };
  brandingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantIdentityRequest {
  projectId: string;
  companyName: string;
  industry: string;
  revenueTier: string;
  notificationPreferences?: {
    ltvFramed?: boolean;
    reportFrequency?: 'daily' | 'weekly' | 'monthly';
    notificationEmail?: string;
    slackWebhook?: string;
  };
  brandingEnabled?: boolean;
}

export class TenantIdentityModel {
  constructor(private db: DatabaseConnection) {}

  async create(request: CreateTenantIdentityRequest): Promise<TenantIdentity> {
    const query = `
      INSERT INTO tenant_identity (
        project_id, company_name, industry, revenue_tier,
        notification_preferences, branding_enabled
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const [result] = await this.db.query<TenantIdentity>(query, [
      request.projectId,
      request.companyName,
      request.industry,
      request.revenueTier,
      JSON.stringify(request.notificationPreferences || {
        ltvFramed: true,
        reportFrequency: 'weekly'
      }),
      request.brandingEnabled !== false
    ]);
    
    return result;
  }

  async findByProjectId(projectId: string): Promise<TenantIdentity | null> {
    const query = `
      SELECT * FROM tenant_identity 
      WHERE project_id = $1
    `;
    
    return await this.db.queryOne<TenantIdentity>(query, [projectId]);
  }

  async update(projectId: string, updates: Partial<CreateTenantIdentityRequest>): Promise<TenantIdentity | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.companyName) {
      fields.push(`company_name = $${paramIndex++}`);
      values.push(updates.companyName);
    }
    if (updates.industry) {
      fields.push(`industry = $${paramIndex++}`);
      values.push(updates.industry);
    }
    if (updates.revenueTier) {
      fields.push(`revenue_tier = $${paramIndex++}`);
      values.push(updates.revenueTier);
    }
    if (updates.notificationPreferences) {
      fields.push(`notification_preferences = $${paramIndex++}`);
      values.push(JSON.stringify(updates.notificationPreferences));
    }
    if (updates.brandingEnabled !== undefined) {
      fields.push(`branding_enabled = $${paramIndex++}`);
      values.push(updates.brandingEnabled);
    }

    if (fields.length === 0) return null;

    values.push(projectId);
    const query = `
      UPDATE tenant_identity 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE project_id = $${paramIndex}
      RETURNING *
    `;

    const [result] = await this.db.query<TenantIdentity>(query, values);
    return result;
  }

  async updateNotificationPreferences(
    projectId: string, 
    preferences: {
      ltvFramed?: boolean;
      reportFrequency?: 'daily' | 'weekly' | 'monthly';
      notificationEmail?: string;
      slackWebhook?: string;
    }
  ): Promise<TenantIdentity | null> {
    const query = `
      UPDATE tenant_identity 
      SET notification_preferences = COALESCE(notification_preferences, '{}') || $1::jsonb,
          updated_at = NOW()
      WHERE project_id = $2
      RETURNING *
    `;
    
    const [result] = await this.db.query<TenantIdentity>(query, [
      JSON.stringify(preferences),
      projectId
    ]);
    
    return result;
  }

  async updateRevenueMetrics(
    projectId: string,
    totalRevenueProtected: number,
    recoveryStory: string,
    trustScore: number
  ): Promise<TenantIdentity | null> {
    const query = `
      UPDATE tenant_identity 
      SET total_revenue_protected = $1,
          recovery_story = $2,
          trust_score = $3,
          updated_at = NOW()
      WHERE project_id = $4
      RETURNING *
    `;
    
    const [result] = await this.db.query<TenantIdentity>(query, [
      totalRevenueProtected,
      recoveryStory,
      trustScore,
      projectId
    ]);
    
    return result;
  }

  async getNotificationPreferences(projectId: string): Promise<{
    ltvFramed: boolean;
    reportFrequency: 'daily' | 'weekly' | 'monthly';
    notificationEmail?: string;
    slackWebhook?: string;
  } | null> {
    const query = `
      SELECT notification_preferences 
      FROM tenant_identity 
      WHERE project_id = $1
    `;
    
    const result = await this.db.queryOne(query, [projectId]);
    
    if (!result) {
      return null;
    }
    
    const preferences = result.notification_preferences || {};
    
    return {
      ltvFramed: preferences.ltvFramed !== false, // Default to true
      reportFrequency: preferences.reportFrequency || 'weekly',
      notificationEmail: preferences.notificationEmail,
      slackWebhook: preferences.slackWebhook
    };
  }

  async getLTVMultiplier(projectId: string): Promise<number> {
    const query = `
      SELECT industry FROM tenant_identity 
      WHERE project_id = $1
    `;
    
    const result = await this.db.queryOne(query, [projectId]);
    
    if (!result) {
      return 5; // Default multiplier
    }
    
    const ltvMultipliers = {
      'saas': 12,        // 12x monthly revenue for LTV
      'ecommerce': 3,    // 3x average order value
      'subscription': 8, // 8x monthly subscription
      'default': 5       // 5x average
    };
    
    return ltvMultipliers[result.industry as keyof typeof ltvMultipliers] || ltvMultipliers.default;
  }

  async getTenantInfo(projectId: string): Promise<{
    companyName: string;
    industry: string;
    revenueTier: string;
  }> {
    const query = `
      SELECT company_name, industry, revenue_tier
      FROM tenant_identity 
      WHERE project_id = $1
    `;
    
    const result = await this.db.queryOne(query, [projectId]);
    
    if (!result) {
      return {
        companyName: 'Unknown Company',
        industry: 'default',
        revenueTier: 'startup'
      };
    }
    
    return {
      companyName: result.company_name,
      industry: result.industry,
      revenueTier: result.revenue_tier
    };
  }

  async getAllTenants(): Promise<TenantIdentity[]> {
    const query = `
      SELECT * FROM tenant_identity 
      ORDER BY created_at DESC
    `;
    
    return await this.db.query<TenantIdentity>(query);
  }

  async getTenantsByIndustry(industry: string): Promise<TenantIdentity[]> {
    const query = `
      SELECT * FROM tenant_identity 
      WHERE industry = $1
      ORDER BY total_revenue_protected DESC
    `;
    
    return await this.db.query<TenantIdentity>(query, [industry]);
  }

  async getTenantsByRevenueTier(tier: string): Promise<TenantIdentity[]> {
    const query = `
      SELECT * FROM tenant_identity 
      WHERE revenue_tier = $1
      ORDER BY total_revenue_protected DESC
    `;
    
    return await this.db.query<TenantIdentity>(query, [tier]);
  }

  async delete(projectId: string): Promise<boolean> {
    const query = 'DELETE FROM tenant_identity WHERE project_id = $1';
    const result = await this.db.query(query, [projectId]);
    return result.length > 0;
  }
}
