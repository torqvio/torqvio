import { Scheduler } from './scheduler/Scheduler.js';
import { ExecutionEngine } from './engine/ExecutionEngine.js';
import { FlowModel, FlowExecutionModel } from './database/models.js';
import { createDatabaseConnection } from './database/connection.js';
import { runMigrations } from './database/migrate.js';
import { flow } from './engine/FlowBuilder.js';
import { ExecutionStatus, BackoffStrategy } from './types/index.js';
import type { FlowDefinition } from './types/index.js';

export class TorqvioApp {
  private scheduler: Scheduler;
  private executionEngine: ExecutionEngine;
  private flowModel: FlowModel;
  private executionModel: FlowExecutionModel;
  private db = createDatabaseConnection();

  constructor() {
    this.scheduler = new Scheduler();
    this.executionEngine = new ExecutionEngine();
    this.flowModel = new FlowModel(this.db);
    this.executionModel = new FlowExecutionModel(this.db);
  }

  /**
   * Initialize the Torqvio application
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Torqvio...');
    
    try {
      // Run database migrations
      await runMigrations();
      
      // Test database connection
      const isHealthy = await this.db.healthCheck();
      if (!isHealthy) {
        throw new Error('Database health check failed');
      }
      
      // Start the scheduler
      await this.scheduler.start();
      
      console.log('✅ Torqvio initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Torqvio:', error);
      throw error;
    }
  }

  /**
   * Shutdown the application
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Torqvio...');
    
    try {
      await this.scheduler.stop();
      await this.db.close();
      
      console.log('✅ Torqvio shutdown complete');
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Create and store a flow
   */
  async createFlow(name: string, flowBuilder: any): Promise<any> {
    console.log(`📝 Creating flow: ${name}`);
    
    const flowDefinition = flowBuilder.build();
    
    // Store the flow in database
    const storedFlow = await this.flowModel.create({
      name: flowDefinition.name,
      steps: flowDefinition.steps,
      retryPolicy: flowDefinition.retryPolicy
    });
    
    console.log(`✅ Flow created: ${storedFlow.id}`);
    return storedFlow;
  }

  /**
   * Execute a flow by name
   */
  async executeFlow(flowName: string, payload: Record<string, any> = {}): Promise<any> {
    console.log(`🎯 Executing flow: ${flowName}`);
    
    // Find the flow
    const flowDefinition = await this.flowModel.findByName(flowName);
    if (!flowDefinition) {
      throw new Error(`Flow not found: ${flowName}`);
    }
    
    // Execute the flow
    const execution = await this.executionEngine.executeFlow(flowDefinition, payload);
    
    console.log(`✅ Flow execution started: ${execution.id}`);
    return execution;
  }

  /**
   * Schedule a flow execution
   */
  async scheduleFlow(
    flowName: string, 
    payload: Record<string, any> = {},
    delay: string
  ): Promise<any> {
    console.log(`⏰ Scheduling flow: ${flowName} in ${delay}`);
    
    // Find the flow
    const flowDefinition = await this.flowModel.findByName(flowName);
    if (!flowDefinition) {
      throw new Error(`Flow not found: ${flowName}`);
    }
    
    // Create execution record
    const execution = await this.executionModel.create({
      flowId: flowDefinition.id,
      status: ExecutionStatus.SLEEPING,
      payload,
      context: {
        stepResults: {},
        retryCount: {},
        errors: [],
        metadata: {}
      },
      nextRunAt: Scheduler.calculateNextRunAt(delay)
    });
    
    console.log(`✅ Flow scheduled: ${execution.id}`);
    return execution;
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<any> {
    const execution = await this.executionModel.findById(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }
    
    return execution;
  }

  /**
   * List all flows
   */
  async listFlows(): Promise<any[]> {
    return await this.flowModel.findAll();
  }

  /**
   * List executions for a flow
   */
  async listExecutions(flowName: string): Promise<any[]> {
    const flow = await this.flowModel.findByName(flowName);
    if (!flow) {
      throw new Error(`Flow not found: ${flowName}`);
    }
    
    return await this.executionModel.findByFlowId(flow.id);
  }

  /**
   * Get application status
   */
  getStatus(): {
    database: boolean;
    scheduler: any;
    flows: number;
    activeExecutions: number;
  } {
    return {
      database: true, // Would check actual health
      scheduler: this.scheduler.getStatus(),
      flows: 0, // Would query actual count
      activeExecutions: 0 // Would query actual count
    };
  }
}

// Example usage
async function demo() {
  const app = new TorqvioApp();
  
  try {
    // Initialize the app
    await app.initialize();
    
    // Create a demo flow
    const demoFlow = flow('demo-user-onboarding')
      .step((user: any) => {
        console.log(`👋 Welcome ${user.name}!`);
        return { message: `Welcome ${user.name}!`, timestamp: new Date() };
      })
      .sleep('10s')
      .step((result: any) => {
        console.log('📧 Sending follow-up email...');
        return { emailSent: true, ...result };
      })
      .retry(3, BackoffStrategy.EXPONENTIAL);
    
    // Store the flow
    const storedFlow = await app.createFlow('demo-user-onboarding', demoFlow);
    
    // Execute the flow immediately
    const execution1 = await app.executeFlow('demo-user-onboarding', {
      name: 'Alice',
      email: 'alice@example.com'
    });
    
    // Schedule another execution
    const execution2 = await app.scheduleFlow('demo-user-onboarding', {
      name: 'Bob',
      email: 'bob@example.com'
    }, '30s');
    
    console.log('🎉 Demo completed successfully!');
    console.log('📊 App status:', app.getStatus());
    
    // Keep running for demo
    console.log('⏳ Running for 60 seconds...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    await app.shutdown();
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo();
}
