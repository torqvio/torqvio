import { DatabaseConnection } from '../connection.js';

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'trial' | 'active' | 'canceled' | 'past_due';
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageMetrics {
  id: string;
  tenantId: string;
  metric: string;
  currentUsage: number;
  period: 'monthly' | 'yearly';
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddOnSubscription {
  id: string;
  tenantId: string;
  addOnId: string;
  active: boolean;
  subscribedAt?: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingInvoice {
  id: string;
  tenantId: string;
  invoiceId?: string; // Stripe invoice ID
  periodStart: Date;
  periodEnd: Date;
  basePrice: number;
  usageCharges: number;
  addOnCharges: number;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'failed';
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class SubscriptionModel {
  private db: ReturnType<typeof DatabaseConnection.getInstance>;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async create(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const result = await this.db.queryOne<Subscription>(
      `INSERT INTO subscriptions (
        tenant_id, plan_id, status, stripe_subscription_id, stripe_customer_id,
        current_period_start, current_period_end, trial_end, canceled_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        subscription.tenantId,
        subscription.planId,
        subscription.status,
        subscription.stripeSubscriptionId,
        subscription.stripeCustomerId,
        subscription.currentPeriodStart,
        subscription.currentPeriodEnd,
        subscription.trialEnd,
        subscription.canceledAt
      ]
    );

    if (!result) {
      throw new Error('Failed to create subscription');
    }

    return result;
  }

  async findById(id: string): Promise<Subscription | null> {
    return await this.db.queryOne<Subscription>(
      'SELECT * FROM subscriptions WHERE id = $1',
      [id]
    );
  }

  async findByTenantId(tenantId: string): Promise<Subscription | null> {
    return await this.db.queryOne<Subscription>(
      'SELECT * FROM subscriptions WHERE tenant_id = $1 AND status IN ($2, $3, $4) ORDER BY created_at DESC LIMIT 1',
      [tenantId, 'trial', 'active', 'past_due']
    );
  }

  async update(id: string, updates: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Subscription> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${this.camelToSnake(key)} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.db.queryOne<Subscription>(
      `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (!result) {
      throw new Error('Failed to update subscription');
    }

    return result;
  }

  async cancel(id: string): Promise<Subscription> {
    return await this.update(id, { status: 'canceled', canceledAt: new Date() });
  }

  // Usage metrics methods
  async createOrUpdateUsage(metrics: Omit<UsageMetrics, 'id' | 'createdAt' | 'updatedAt'>): Promise<UsageMetrics> {
    const existing = await this.findUsageByTenantAndMetric(metrics.tenantId, metrics.metric, metrics.period);
    
    if (existing) {
      return await this.updateUsage(existing.id, { currentUsage: metrics.currentUsage });
    } else {
      return await this.createUsage(metrics);
    }
  }

  async createUsage(metrics: Omit<UsageMetrics, 'id' | 'createdAt' | 'updatedAt'>): Promise<UsageMetrics> {
    const result = await this.db.queryOne<UsageMetrics>(
      `INSERT INTO usage_metrics (
        tenant_id, metric, current_usage, period, period_start, period_end, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [
        metrics.tenantId,
        metrics.metric,
        metrics.currentUsage,
        metrics.period,
        metrics.periodStart,
        metrics.periodEnd
      ]
    );

    if (!result) {
      throw new Error('Failed to create usage metrics');
    }

    return result;
  }

  async findUsageByTenantAndMetric(tenantId: string, metric: string, period: 'monthly' | 'yearly'): Promise<UsageMetrics | null> {
    const now = new Date();
    const periodStart = period === 'monthly' 
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getFullYear(), 0, 1);
    const periodEnd = period === 'monthly'
      ? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      : new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    return await this.db.queryOne<UsageMetrics>(
      `SELECT * FROM usage_metrics 
       WHERE tenant_id = $1 AND metric = $2 AND period = $3 
       AND period_start <= $4 AND period_end >= $5`,
      [tenantId, metric, period, now, periodStart]
    );
  }

  async updateUsage(id: string, updates: Partial<Omit<UsageMetrics, 'id' | 'createdAt' | 'updatedAt'>>): Promise<UsageMetrics> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${this.camelToSnake(key)} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.db.queryOne<UsageMetrics>(
      `UPDATE usage_metrics SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (!result) {
      throw new Error('Failed to update usage metrics');
    }

    return result;
  }

  async incrementUsage(tenantId: string, metric: string, amount: number = 1): Promise<UsageMetrics> {
    const existing = await this.findUsageByTenantAndMetric(tenantId, metric, 'monthly');
    
    if (existing) {
      return await this.updateUsage(existing.id, { currentUsage: existing.currentUsage + amount });
    } else {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      return await this.createUsage({
        tenantId,
        metric,
        currentUsage: amount,
        period: 'monthly',
        periodStart,
        periodEnd
      });
    }
  }

  async getAllUsageForTenant(tenantId: string): Promise<UsageMetrics[]> {
    return await this.db.query<UsageMetrics>(
      `SELECT * FROM usage_metrics WHERE tenant_id = $1 ORDER BY metric, period_start DESC`,
      [tenantId]
    );
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
