import cron from 'node-cron';
import { FlowExecutionModel } from '../database/models.js';
import { ExecutionEngine } from '../engine/ExecutionEngine.js';
import { DatabaseConnection } from '../database/connection.js';
import { ExecutionStatus } from '../types/index.js';

export class Scheduler {
  private executionModel: FlowExecutionModel;
  private executionEngine: ExecutionEngine;
  private isRunning = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private cronJobs: Map<string, any> = new Map();

  constructor() {
    const db = DatabaseConnection.getInstance();
    this.executionModel = new FlowExecutionModel(db);
    this.executionEngine = new ExecutionEngine();
  }

  /**
   * Start the scheduler service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⏰ Scheduler is already running');
      return;
    }

    console.log('🚀 Starting Torqvio Scheduler...');
    this.isRunning = true;

    // Start polling for due executions
    this.startPolling();

    // Start any cron jobs
    this.startCronJobs();

    console.log('✅ Scheduler started successfully');
  }

  /**
   * Stop the scheduler service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('⏰ Scheduler is not running');
      return;
    }

    console.log('🛑 Stopping Torqvio Scheduler...');
    this.isRunning = false;

    // Stop polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    // Stop all cron jobs
    this.cronJobs.forEach(job => clearInterval(job));
    this.cronJobs.clear();

    console.log('✅ Scheduler stopped successfully');
  }

  /**
   * Schedule a flow execution for a specific time
   */
  async scheduleExecution(executionId: string, runAt: Date): Promise<void> {
    console.log(`📅 Scheduling execution ${executionId} for ${runAt.toISOString()}`);
    
    await this.executionModel.update(executionId, {
      nextRunAt: runAt,
      status: ExecutionStatus.SLEEPING
    });
  }

  /**
   * Schedule a recurring cron job
   */
  scheduleCronJob(
    name: string, 
    cronExpression: string, 
    callback: () => Promise<void>
  ): void {
    console.log(`⏰ Scheduling cron job: ${name} (${cronExpression})`);

    if (!cron.validate(cronExpression)) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }

    const job = cron.schedule(cronExpression, async () => {
      try {
        console.log(`⚡ Executing cron job: ${name}`);
        await callback();
      } catch (error) {
        console.error(`❌ Cron job failed: ${name}`, error);
      }
    });

    job.start();
    this.cronJobs.set(name, job);
  }

  /**
   * Start polling for due executions
   */
  private startPolling(): void {
    const intervalMs = parseInt(process.env.SCHEDULER_INTERVAL_MS || '5000');
    
    console.log(`🔄 Starting polling interval: ${intervalMs}ms`);

    this.pollingInterval = setInterval(async () => {
      try {
        await this.processDueExecutions();
      } catch (error) {
        console.error('❌ Error processing due executions:', error);
      }
    }, intervalMs);
  }

  /**
   * Process executions that are due for running
   */
  private async processDueExecutions(): Promise<void> {
    const dueExecutions = await this.executionModel.findDueForExecution();
    
    if (dueExecutions.length === 0) {
      return;
    }

    console.log(`⚡ Found ${dueExecutions.length} due executions`);

    // Process each due execution
    const promises = dueExecutions.map(execution => 
      this.processExecution(execution)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Process a single execution
   */
  private async processExecution(execution: any): Promise<void> {
    try {
      console.log(`🎯 Processing execution: ${execution.id}`);

      switch (execution.status) {
        case ExecutionStatus.PENDING:
        case ExecutionStatus.RUNNING:
          // Resume the execution
          await this.executionEngine.resumeExecution(execution.id);
          break;

        case ExecutionStatus.SLEEPING:
        case ExecutionStatus.RETRYING:
          // Wake up the execution
          await this.executionEngine.resumeExecution(execution.id);
          break;

        default:
          console.log(`⏭️ Skipping execution in status: ${execution.status}`);
      }

    } catch (error) {
      console.error(`❌ Failed to process execution ${execution.id}:`, error);
      
      // Mark as failed if it's a critical error
      await this.executionModel.update(execution.id, {
        status: ExecutionStatus.FAILED,
        completedAt: new Date()
      });
    }
  }

  /**
   * Start built-in cron jobs
   */
  private startCronJobs(): void {
    // Cleanup expired locks every minute
    this.scheduleCronJob('cleanup-locks', '* * * * *', async () => {
      await this.cleanupExpiredLocks();
    });

    // Health check every 5 minutes
    this.scheduleCronJob('health-check', '*/5 * * * *', async () => {
      await this.performHealthCheck();
    });

    // Metrics collection every minute
    this.scheduleCronJob('metrics', '* * * * *', async () => {
      await this.collectMetrics();
    });
  }

  /**
   * Cleanup expired execution locks
   */
  private async cleanupExpiredLocks(): Promise<void> {
    try {
      const db = DatabaseConnection.getInstance();
      await db.query('SELECT cleanup_expired_locks()');
      console.log('🧹 Cleaned up expired locks');
    } catch (error) {
      console.error('❌ Failed to cleanup locks:', error);
    }
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const db = DatabaseConnection.getInstance();
      const isHealthy = await db.healthCheck();
      
      if (!isHealthy) {
        console.error('❌ Database health check failed');
        // Could implement alerting here
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  /**
   * Collect and report metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const db = DatabaseConnection.getInstance();
      
      // Count executions by status
      const statusCounts = await db.query(`
        SELECT status, COUNT(*) as count 
        FROM flow_executions 
        WHERE created_at > NOW() - INTERVAL '1 hour'
        GROUP BY status
      `);

      // Log metrics
      console.log('📊 Execution metrics (last hour):');
      statusCounts.forEach((row: any) => {
        console.log(`  ${row.status}: ${row.count}`);
      });

    } catch (error) {
      console.error('❌ Failed to collect metrics:', error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    activeCronJobs: number;
    pollingInterval: number;
  } {
    return {
      isRunning: this.isRunning,
      activeCronJobs: this.cronJobs.size,
      pollingInterval: parseInt(process.env.SCHEDULER_INTERVAL_MS || '5000')
    };
  }

  /**
   * Calculate next run time based on delay
   */
  static calculateNextRunAt(delay: string): Date {
    const ms = Scheduler.parseDelayToMs(delay);
    return new Date(Date.now() + ms);
  }

  /**
   * Parse delay string to milliseconds
   */
  static parseDelayToMs(delay: string): number {
    const match = delay.match(/^(\d+)(s|m|h|d)$/);
    if (!match) {
      throw new Error(`Invalid delay format: ${delay}`);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: throw new Error(`Unknown delay unit: ${unit}`);
    }
  }
}
