import { DatabaseConnection } from './connection.js';

export interface RecoveryAnalytics {
  id: string;
  projectId: string;
  date: string;
  recoveredAmount: number;
  failureAmount: number;
  recoveryRate: number;
  retryAttempts: number;
  successfulRetries: number;
  timeToRecoveryMs: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryEvent {
  id: string;
  projectId: string;
  executionId: string;
  eventType: 'payment_failed' | 'payment_recovered';
  amount: number;
  currency: string;
  customerId: string;
  paymentIntentId: string;
  recoveryAttempt: number;
  metadata: any;
  createdAt: string;
}

export class RecoveryAnalyticsModel {
  constructor(private db: DatabaseConnection) {}

  async recordRecoveryEvent(event: Omit<RecoveryEvent, 'id' | 'createdAt'>): Promise<RecoveryEvent> {
    const query = `
      INSERT INTO recovery_events (
        project_id, execution_id, event_type, amount, currency,
        customer_id, payment_intent_id, recovery_attempt, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const [result] = await this.db.query<RecoveryEvent>(query, [
      event.projectId,
      event.executionId,
      event.eventType,
      event.amount,
      event.currency,
      event.customerId,
      event.paymentIntentId,
      event.recoveryAttempt,
      JSON.stringify(event.metadata)
    ]);
    
    // Update daily analytics
    await this.updateDailyAnalytics(event.projectId, (event as any).date || new Date().toISOString().split('T')[0]);
    
    return result;
  }

  private async updateDailyAnalytics(projectId: string, date: string): Promise<void> {
    const query = `
      INSERT INTO recovery_analytics (project_id, date, recovered_amount, failure_amount, recovery_rate, retry_attempts, successful_retries)
      SELECT 
        $1,
        $2,
        COALESCE(SUM(CASE WHEN event_type = 'payment_recovered' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN event_type = 'payment_failed' THEN amount ELSE 0 END), 0),
        CASE 
          WHEN SUM(CASE WHEN event_type = 'payment_failed' THEN amount ELSE 0 END) > 0
          THEN ROUND(
            (SUM(CASE WHEN event_type = 'payment_recovered' THEN amount ELSE 0 END) * 100.0) /
            SUM(CASE WHEN event_type = 'payment_failed' THEN amount ELSE 0 END), 2
          )
          ELSE 0
        END,
        COUNT(*) FILTER (WHERE event_type = 'payment_failed'),
        COUNT(*) FILTER (WHERE event_type = 'payment_recovered')
      FROM recovery_events
      WHERE project_id = $1 AND DATE(created_at) = $2::date
      ON CONFLICT (project_id, date) DO UPDATE SET
        recovered_amount = EXCLUDED.recovered_amount,
        failure_amount = EXCLUDED.failure_amount,
        recovery_rate = EXCLUDED.recovery_rate,
        retry_attempts = EXCLUDED.retry_attempts,
        successful_retries = EXCLUDED.successful_retries,
        updated_at = NOW()
    `;
    
    await this.db.query(query, [projectId, date]);
  }

  async getRecoveryStats(projectId: string, days: number = 7): Promise<{
    totalRecovered: number;
    totalFailed: number;
    recoveryRate: number;
    retryAttempts: number;
    avgTimeToRecovery: number;
  }> {
    const query = `
      SELECT 
        COALESCE(SUM(recovered_amount), 0) as total_recovered,
        COALESCE(SUM(failure_amount), 0) as total_failed,
        COALESCE(AVG(recovery_rate), 0) as recovery_rate,
        COALESCE(SUM(retry_attempts), 0) as retry_attempts,
        COALESCE(AVG(time_to_recovery_ms), 0) as avg_time_to_recovery
      FROM recovery_analytics
      WHERE project_id = $1 AND date >= CURRENT_DATE - INTERVAL '${days} days'
    `;
    
    const result = await this.db.queryOne(query, [projectId]);
    
    return {
      totalRecovered: parseFloat(result.total_recovered) || 0,
      totalFailed: parseFloat(result.total_failed) || 0,
      recoveryRate: parseFloat(result.recovery_rate) || 0,
      retryAttempts: parseInt(result.retry_attempts) || 0,
      avgTimeToRecovery: parseFloat(result.avg_time_to_recovery) || 0
    };
  }

  async getRecentRecoveryEvents(projectId: string, limit: number = 10): Promise<RecoveryEvent[]> {
    const limitedCount = Math.min(limit, 100); // Max 100 for safety
    const query = `
      SELECT id, project_id, flow_id, execution_id, event_type, severity, 
             recovery_time, recovery_action, created_at, updated_at, metadata
      FROM recovery_events
      WHERE project_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    return await this.db.query<RecoveryEvent>(query, [projectId, limit]);
  }

  async getDailyRecoveryStats(projectId: string, days: number = 30): Promise<RecoveryAnalytics[]> {
    const limitedDays = Math.min(days, 365); // Max 1 year for safety
    const query = `
      SELECT id, project_id, date, total_executions, failed_executions, 
             recovery_rate, avg_recovery_time, created_at, updated_at
      FROM recovery_analytics
      WHERE project_id = $1 AND date >= CURRENT_DATE - INTERVAL '${limitedDays} days'
      ORDER BY date DESC
      LIMIT $2
    `;
    
    return await this.db.query<RecoveryAnalytics>(query, [projectId, limitedDays]);
  }

  async getTodayRecoveryStats(projectId: string): Promise<{
    totalRecovered: number;
    totalFailed: number;
    recoveryRate: number;
    retryAttempts: number;
    successfulRetries: number;
  }> {
    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN event_type = 'payment_recovered' THEN amount ELSE 0 END), 0) as total_recovered,
        COALESCE(SUM(CASE WHEN event_type = 'payment_failed' THEN amount ELSE 0 END), 0) as total_failed,
        COUNT(*) FILTER (WHERE event_type = 'payment_failed') as retry_attempts,
        COUNT(*) FILTER (WHERE event_type = 'payment_recovered') as successful_retries
      FROM recovery_events
      WHERE project_id = $1 AND DATE(created_at) = CURRENT_DATE
    `;
    
    const result = await this.db.queryOne(query, [projectId]);
    
    const totalRecovered = parseFloat(result.total_recovered) || 0;
    const totalFailed = parseFloat(result.total_failed) || 0;
    
    return {
      totalRecovered,
      totalFailed,
      recoveryRate: totalFailed > 0 ? Math.round((totalRecovered / totalFailed) * 100 * 100) / 100 : 0,
      retryAttempts: parseInt(result.retry_attempts) || 0,
      successfulRetries: parseInt(result.successful_retries) || 0
    };
  }
}
