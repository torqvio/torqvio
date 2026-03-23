import { getWebhookDbConnection } from '../database/webhook-connection.js';
import { logger } from '../utils/logger.js';
import cron from 'node-cron';

export class SmartCleanupSystem {
  private db = getWebhookDbConnection();
  private cleanupStats = {
    lastRun: null as Date | null,
    totalDeleted: 0,
    runsCount: 0
  };
  private realtimeCleanupEnabled = true;
  private realtimeCleanupRunning = false;
  private cleanupThresholds = {
    maxWebhooksPerMinute: 50,
    maxWebhooksPerDomain: 20,
    rapidCleanupInterval: 5000 // 5 seconds
  };

  constructor() {
    this.initializeScheduledCleanup();
    this.initializeRealtimeCleanup();
  }

  /**
   * Initialize real-time cleanup triggers for high-volume webhook creation
   */
  private initializeRealtimeCleanup(): void {
    if (!this.realtimeCleanupEnabled) return;

    // Monitor webhook creation rate every 5 seconds
    setInterval(async () => {
      await this.checkWebhookCreationRate();
    }, this.cleanupThresholds.rapidCleanupInterval);

    logger.info('Real-time cleanup monitoring initialized');
  }

  /**
   * Check webhook creation rate and trigger cleanup if needed
   */
  private async checkWebhookCreationRate(): Promise<void> {
    if (this.realtimeCleanupRunning) return;
    this.realtimeCleanupRunning = true;
    try {
      // Check webhooks created in the last minute
      const recentWebhooks = await this.db.query(`
        SELECT COUNT(*) as count, 
               SUBSTRING(url FROM '://([^/]+)') as domain
        FROM webhooks 
        WHERE created_at > NOW() - INTERVAL '1 minute'
        GROUP BY domain
        HAVING COUNT(*) > $1
      `, [this.cleanupThresholds.maxWebhooksPerDomain]);

      if (recentWebhooks.length > 0) {
        logger.warn('High webhook creation rate detected', {
          domains: recentWebhooks,
          threshold: this.cleanupThresholds.maxWebhooksPerDomain
        });
        
        // Trigger immediate cleanup for abusive domains
        await this.performImmediateAbuseCleanup(recentWebhooks.map((r: any) => r.domain));
      }

      // Check total webhook creation rate
      const totalResult = await this.db.query(`
        SELECT COUNT(*) as count
        FROM webhooks 
        WHERE created_at > NOW() - INTERVAL '1 minute'
      `);

      const totalCount = parseInt(totalResult[0]?.count || '0');
      if (totalCount > this.cleanupThresholds.maxWebhooksPerMinute) {
        logger.warn('High total webhook creation rate detected', {
          totalCount,
          threshold: this.cleanupThresholds.maxWebhooksPerMinute
        });
        
        await this.performEmergencyCleanup();
      }

    } catch (error) {
      logger.error('Real-time cleanup check failed:', error);
    } finally {
      this.realtimeCleanupRunning = false;
    }
  }

  /**
   * Immediate cleanup for specific abusive domains
   */
  private async performImmediateAbuseCleanup(abusiveDomains: string[]): Promise<void> {
    const startTime = Date.now();
    let totalDeleted = 0;

    try {
      logger.warn('Performing immediate abuse cleanup', { abusiveDomains });

      for (const domain of abusiveDomains) {
        const result = await this.db.query(`
          DELETE FROM webhooks
          WHERE url ILIKE $1
          AND created_at > NOW() - INTERVAL '10 minutes'
          RETURNING id
        `, [`%://${domain}%`]);

        totalDeleted += result.length;
      }

      this.updateCleanupStats(totalDeleted);
      
      const duration = Date.now() - startTime;
      logger.error(`Immediate abuse cleanup completed`, {
        duration: `${duration}ms`,
        totalDeleted,
        abusiveDomains
      });

    } catch (error) {
      logger.error('Immediate abuse cleanup failed:', error);
    }
  }

  /**
   * Initialize automated cleanup schedules - Optimized for serverless
   */
  private initializeScheduledCleanup(): void {
    // Every 5 minutes - rapid abuse detection for serverless
    cron.schedule('*/5 * * * *', async () => {
      await this.performRapidAbuseCleanup();
    });

    // Every 15 minutes - lightweight cleanup
    cron.schedule('*/15 * * * *', async () => {
      await this.performLightweightCleanup();
    });

    // Hourly - moderate cleanup
    cron.schedule('0 * * * *', async () => {
      await this.performHourlyCleanup();
    });

    // Daily at 2 AM - comprehensive cleanup
    cron.schedule('0 2 * * *', async () => {
      await this.performDailyCleanup();
    });

    // Weekly on Sunday - deep cleanup
    cron.schedule('0 3 * * 0', async () => {
      await this.performWeeklyCleanup();
    });

    logger.info('Smart cleanup system initialized with serverless-optimized schedules');
  }

  /**
   * Rapid abuse cleanup - every 5 minutes for serverless environments
   * Focuses on immediate threats and high-volume abuse
   */
  async performRapidAbuseCleanup(): Promise<void> {
    const startTime = Date.now();
    let totalDeleted = 0;

    try {
      logger.debug('Starting rapid abuse cleanup (5min)...');

      // 1. Immediate removal of obvious test webhooks
      const testResult = await this.db.query(`
        DELETE FROM webhooks
        WHERE url ILIKE ANY(ARRAY['%webhook.site%', '%localhost%', '%127.0.0.1%'])
        AND created_at > NOW() - INTERVAL '10 minutes'
        RETURNING id
      `);

      totalDeleted += testResult.length;

      // 2. Detect and block high-frequency spam (same domain, >20 in 5min)
      const spamResult = await this.db.query(`
        DELETE FROM webhooks
        WHERE id IN (
          SELECT id FROM (
            SELECT id,
            ROW_NUMBER() OVER (PARTITION BY SUBSTRING(url FROM '://([^/]+)') ORDER BY created_at DESC) as rn
            FROM webhooks
            WHERE created_at > NOW() - INTERVAL '5 minutes'
          ) ranked
          WHERE rn > 20
        )
        RETURNING id
      `);

      totalDeleted += spamResult.length;

      // 3. Emergency deactivation of failing webhooks
      const failureResult = await this.db.query(`
        UPDATE webhooks
        SET active = false
        WHERE retry_count > 5
        AND last_triggered_at < NOW() - INTERVAL '5 minutes'
        RETURNING id
      `);

      const deactivatedCount = failureResult.length;

      this.updateCleanupStats(totalDeleted);
      
      const duration = Date.now() - startTime;
      logger.debug(`Rapid abuse cleanup completed`, {
        duration: `${duration}ms`,
        totalDeleted,
        deactivatedCount
      });

    } catch (error) {
      logger.error('Rapid abuse cleanup failed:', error);
    }
  }

  /**
   * Lightweight cleanup - every 15 minutes
   * Quick cleanup with minimal database load
   */
  async performLightweightCleanup(): Promise<void> {
    const startTime = Date.now();
    let totalDeleted = 0;

    try {
      logger.debug('Starting lightweight cleanup (15min)...');

      // 1. Remove recent inactive webhooks (failed quickly)
      const inactiveResult = await this.db.query(`
        DELETE FROM webhooks
        WHERE active = false
        AND created_at < NOW() - INTERVAL '30 minutes'
        RETURNING id
      `);

      totalDeleted += inactiveResult.length;

      // 2. Remove recent test webhooks
      const testResult = await this.db.query(`
        DELETE FROM webhooks
        WHERE url ILIKE ANY(ARRAY['%test%', '%example%', '%mock%'])
        AND created_at < NOW() - INTERVAL '1 hour'
        RETURNING id
      `);

      totalDeleted += testResult.length;

      this.updateCleanupStats(totalDeleted);
      
      const duration = Date.now() - startTime;
      logger.debug(`Lightweight cleanup completed`, {
        duration: `${duration}ms`,
        totalDeleted
      });

    } catch (error) {
      logger.error('Lightweight cleanup failed:', error);
    }
  }

  /**
   * Hourly cleanup - removes obvious abuse/test webhooks
   */
  async performHourlyCleanup(): Promise<void> {
    const startTime = Date.now();
    let totalDeleted = 0;

    try {
      logger.info('Starting hourly smart cleanup...');

      // 1. Remove webhooks with test URLs (webhook.site, localhost, etc.)
      const testWebhooksResult = await this.db.query(`
        DELETE FROM webhooks
        WHERE url ILIKE ANY(ARRAY['%webhook.site%', '%localhost%', '%127.0.0.1%', '%test%', '%example%'])
        RETURNING id
      `);

      const testWebhooksDeleted = testWebhooksResult.length;
      totalDeleted += testWebhooksDeleted;

      // 2. Remove inactive webhooks older than 1 hour (likely abandoned)
      const inactiveResult = await this.db.query(`
        DELETE FROM webhooks
        WHERE active = false
        AND created_at < NOW() - INTERVAL '1 hour'
        RETURNING id
      `);

      const inactiveDeleted = inactiveResult.length;
      totalDeleted += inactiveDeleted;

      // 3. Remove webhooks with high failure rates (abuse detection)
      const failureResult = await this.db.query(`
        UPDATE webhooks
        SET active = false
        WHERE retry_count > 10
        AND last_triggered_at < NOW() - INTERVAL '30 minutes'
        RETURNING id
      `);

      const deactivatedCount = failureResult.length;

      // 4. Rate limiting cleanup - remove webhooks from same domain spamming
      // Use a window function to both count per domain and rank rows in one pass
      const spamResult = await this.db.query(`
        DELETE FROM webhooks
        WHERE id IN (
          SELECT id FROM (
            SELECT id,
            ROW_NUMBER() OVER (PARTITION BY SUBSTRING(url FROM '://([^/]+)') ORDER BY created_at DESC) as rn,
            COUNT(*) OVER (PARTITION BY SUBSTRING(url FROM '://([^/]+)')) as domain_count
            FROM webhooks
            WHERE created_at > NOW() - INTERVAL '1 hour'
          ) ranked
          WHERE domain_count > 50
          AND rn > 10
        )
        RETURNING id
      `);

      const spamDeleted = spamResult.length;
      totalDeleted += spamDeleted;

      this.updateCleanupStats(totalDeleted);
      
      const duration = Date.now() - startTime;
      logger.info(`Hourly cleanup completed`, {
        duration: `${duration}ms`,
        testWebhooksDeleted,
        inactiveDeleted,
        deactivatedCount,
        spamDeleted,
        totalDeleted
      });

    } catch (error) {
      logger.error('Hourly cleanup failed:', error);
    }
  }

  /**
   * Daily cleanup - more thorough cleaning
   */
  async performDailyCleanup(): Promise<void> {
    const startTime = Date.now();
    let totalDeleted = 0;

    try {
      logger.info('Starting daily smart cleanup...');

      // 1. Remove inactive webhooks older than 24 hours
      const result1 = await this.db.query(`
        DELETE FROM webhooks
        WHERE active = false
        AND created_at < NOW() - INTERVAL '24 hours'
        RETURNING id
      `);

      totalDeleted += result1.length;

      // 2. Remove webhooks that haven't been triggered in 7 days
      const result2 = await this.db.query(`
        DELETE FROM webhooks
        WHERE last_triggered_at IS NULL
        AND created_at < NOW() - INTERVAL '7 days'
        AND active = true
        RETURNING id
      `);

      totalDeleted += result2.length;

      // 3. Remove webhooks with suspicious patterns
      const result3 = await this.db.query(`
        DELETE FROM webhooks
        WHERE (
          url ~* '(bin|paste|dump|temp|test|mock|fake|sample)'
          OR url LIKE '%://%.%.%/%'
          OR LENGTH(url) > 500
        )
        AND created_at < NOW() - INTERVAL '12 hours'
        RETURNING id
      `);

      totalDeleted += result3.length;

      // 4. Free tier limits - enforce reasonable limits per domain
      const result4 = await this.db.query(`
        DELETE FROM webhooks
        WHERE id IN (
          SELECT id FROM (
            SELECT id,
            ROW_NUMBER() OVER (PARTITION BY SUBSTRING(url FROM '://([^/]+)') ORDER BY created_at DESC) as rn
            FROM webhooks
            WHERE created_at > NOW() - INTERVAL '24 hours'
            AND active = true
          ) ranked
          WHERE rn > 100
        )
        RETURNING id
      `);

      totalDeleted += result4.length;

      this.updateCleanupStats(totalDeleted);
      
      const duration = Date.now() - startTime;
      logger.info(`Daily cleanup completed`, {
        duration: `${duration}ms`,
        totalDeleted
      });

    } catch (error) {
      logger.error('Daily cleanup failed:', error);
    }
  }

  /**
   * Weekly cleanup - deep cleaning and optimization
   */
  async performWeeklyCleanup(): Promise<void> {
    const startTime = Date.now();
    let totalDeleted = 0;

    try {
      logger.info('Starting weekly deep cleanup...');

      // 1. Archive old inactive webhooks instead of deleting
      const archiveResult = await this.db.query(`
        UPDATE webhooks
        SET active = false,
        trigger_id = JSON_BUILD_OBJECT('archived', true, 'archived_at', NOW(), 'original_events', trigger_id)
        WHERE active = false
        AND created_at < NOW() - INTERVAL '30 days'
        RETURNING id
      `);

      // 2. Remove very old test webhooks
      const result1 = await this.db.query(`
        DELETE FROM webhooks
        WHERE (
          url ILIKE ANY(ARRAY['%webhook.site%', '%test%', '%example%'])
          OR trigger_id::text LIKE '%"test"%'
        )
        AND created_at < NOW() - INTERVAL '7 days'
        RETURNING id
      `);

      totalDeleted += result1.length;

      // 3. Optimize database
      await this.db.query('VACUUM ANALYZE webhooks');

      this.updateCleanupStats(totalDeleted);
      
      const duration = Date.now() - startTime;
      logger.info(`Weekly cleanup completed`, {
        duration: `${duration}ms`,
        archivedCount: archiveResult.length,
        totalDeleted
      });

    } catch (error) {
      logger.error('Weekly cleanup failed:', error);
    }
  }

  /**
   * Manual cleanup with specific criteria
   */
  async performManualCleanup(criteria: {
    url_pattern?: string;
    older_than_hours?: number;
    inactive_only?: boolean;
    limit?: number;
  }): Promise<{ deleted: number; message: string }> {
    try {
      let query = 'DELETE FROM webhooks WHERE ';
      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (criteria.url_pattern) {
        conditions.push(`url ILIKE $${paramIndex++}`);
        params.push(`%${criteria.url_pattern}%`);
      }

      if (criteria.older_than_hours) {
        conditions.push(`created_at < NOW() - INTERVAL '${criteria.older_than_hours} hours'`);
      }

      if (criteria.inactive_only) {
        conditions.push(`active = false`);
      }

      if (conditions.length === 0) {
        return { deleted: 0, message: 'No criteria provided' };
      }

      query += conditions.join(' AND ');

      if (criteria.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(criteria.limit);
      }

      const result = await this.db.query(query, params);
      const deleted = result.rowCount || 0;

      logger.warn(`Manual cleanup executed`, {
        criteria,
        deleted,
        timestamp: new Date().toISOString()
      });

      return {
        deleted,
        message: `Successfully deleted ${deleted} webhooks`
      };

    } catch (error) {
      logger.error('Manual cleanup failed:', error);
      return {
        deleted: 0,
        message: `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get cleanup statistics
   */
  getCleanupStats() {
    return {
      ...this.cleanupStats,
      lastRun: this.cleanupStats.lastRun?.toISOString() || null,
      nextRuns: {
        rapid: this.getNextRunTime('*/5 * * * *'),
        lightweight: this.getNextRunTime('*/15 * * * *'),
        hourly: this.getNextRunTime('0 * * * *'),
        daily: this.getNextRunTime('0 2 * * *'),
        weekly: this.getNextRunTime('0 3 * * 0')
      }
    };
  }

  /**
   * Update cleanup statistics
   */
  private updateCleanupStats(deleted: number): void {
    this.cleanupStats.lastRun = new Date();
    this.cleanupStats.totalDeleted += deleted;
    this.cleanupStats.runsCount++;
  }

  /**
   * Get next run time for a cron schedule
   */
  private getNextRunTime(cronSchedule: string): string {
    // Simplified - in production, use a proper cron parser
    const now = new Date();
    const nextRun = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    return nextRun.toISOString();
  }

  /**
   * Emergency cleanup for when system is overloaded
   */
  async performEmergencyCleanup(): Promise<void> {
    logger.warn('EMERGENCY CLEANUP ACTIVATED');
    
    try {
      // Aggressive cleanup - delete most recent test webhooks
      const result = await this.db.query(`
        DELETE FROM webhooks
        WHERE (
          url ILIKE ANY(ARRAY['%webhook.site%', '%test%', '%localhost%'])
          OR created_at > NOW() - INTERVAL '1 hour'
        )
        RETURNING id
      `);

      const deleted = result.length;
      
      logger.error(`Emergency cleanup completed - deleted ${deleted} webhooks`, {
        deleted,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Emergency cleanup failed:', error);
    }
  }
}

// Export singleton instance
export const smartCleanup = new SmartCleanupSystem();
