import { logger } from '../utils/logger.js';
import { UserStateService } from './UserStateService.js';
import { InvisibleMonetizationService } from './InvisibleMonetizationService.js';

export interface BillingEvent {
  id: string;
  tenantId: string;
  eventType: 'execution' | 'micro_commitment' | 'upgrade' | 'value_capture' | 'infra_usage';
  timestamp: Date;
  amount: number;
  currency: string;
  metadata: {
    workflowId?: string;
    executionTime?: number;
    performanceTier?: string;
    commitmentType?: string;
    valueGenerated?: number;
    region?: string;
    compliance?: string[];
  };
  processed: boolean;
  stripeChargeId?: string;
}

export interface EventStream {
  streamName: string;
  events: BillingEvent[];
  lastProcessed: Date;
  processingStatus: 'active' | 'paused' | 'error';
}

export interface BillingAggregation {
  tenantId: string;
  period: 'hourly' | 'daily' | 'monthly';
  startTime: Date;
  endTime: Date;
  totalAmount: number;
  eventCounts: Record<string, number>;
  breakdown: {
    executions: number;
    microCommitments: number;
    upgrades: number;
    valueCapture: number;
    infraUsage: number;
  };
}

export class EventBasedBillingService {
  private eventStreams: Map<string, EventStream> = new Map();
  private pendingEvents: BillingEvent[] = [];
  private aggregations: Map<string, BillingAggregation[]> = new Map();
  
  constructor(
    private userStateService: UserStateService,
    private invisibleMonetizationService: InvisibleMonetizationService
  ) {
    this.initializeEventStreams();
    this.startEventProcessor();
  }

  private initializeEventStreams() {
    // Initialize different event streams for different billing categories
    this.eventStreams.set('executions', {
      streamName: 'executions',
      events: [],
      lastProcessed: new Date(),
      processingStatus: 'active'
    });

    this.eventStreams.set('micro_commitments', {
      streamName: 'micro_commitments',
      events: [],
      lastProcessed: new Date(),
      processingStatus: 'active'
    });

    this.eventStreams.set('value_capture', {
      streamName: 'value_capture',
      events: [],
      lastProcessed: new Date(),
      processingStatus: 'active'
    });

    this.eventStreams.set('infra_usage', {
      streamName: 'infra_usage',
      events: [],
      lastProcessed: new Date(),
      processingStatus: 'active'
    });
  }

  async recordExecutionEvent(
    tenantId: string,
    workflowId: string,
    executionTime: number,
    performanceTier: string,
    metadata: any = {}
  ): Promise<void> {
    const userState = await this.userStateService.getCurrentUserState(tenantId);
    
    let amount = 0;
    
    // Calculate execution cost based on user state
    switch (userState.state) {
      case 'explore':
        amount = 0; // Free in explore state
        break;
      case 'build':
        amount = 0.001; // €0.001 per execution
        break;
      case 'scale':
        amount = 0.0008; // €0.0008 per execution (volume discount)
        break;
      case 'depend':
        amount = 0.0005; // €0.0005 per execution (enterprise rate)
        break;
    }

    // Performance tier multipliers
    const performanceMultipliers = {
      standard: 1,
      optimized: 1.5,
      priority: 2.5
    };
    amount *= performanceMultipliers[performanceTier as keyof typeof performanceMultipliers] || 1;

    const event: BillingEvent = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      eventType: 'execution',
      timestamp: new Date(),
      amount,
      currency: 'EUR',
      metadata: {
        workflowId,
        executionTime,
        performanceTier,
        ...metadata
      },
      processed: false
    };

    this.addEventToStream('executions', event);
    this.pendingEvents.push(event);

    logger.info(`Recorded execution event for tenant ${tenantId}: €${amount}`);
  }

  async recordMicroCommitment(
    tenantId: string,
    commitmentType: string,
    amount: number,
    metadata: any = {}
  ): Promise<void> {
    const event: BillingEvent = {
      id: `micro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      eventType: 'micro_commitment',
      timestamp: new Date(),
      amount,
      currency: 'EUR',
      metadata: {
        commitmentType,
        ...metadata
      },
      processed: false
    };

    this.addEventToStream('micro_commitments', event);
    this.pendingEvents.push(event);

    logger.info(`Recorded micro-commitment for tenant ${tenantId}: ${commitmentType} (€${amount})`);
  }

  async recordValueCapture(
    tenantId: string,
    valueGenerated: number,
    metadata: any = {}
  ): Promise<void> {
    const valueTax = await this.invisibleMonetizationService.calculateValueTax(tenantId, valueGenerated);
    
    const event: BillingEvent = {
      id: `value_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      eventType: 'value_capture',
      timestamp: new Date(),
      amount: valueTax.capturedAmount,
      currency: 'EUR',
      metadata: {
        valueGenerated,
        taxRate: valueTax.taxRate,
        billingMethod: valueTax.billingMethod,
        userPerception: valueTax.userPerception,
        ...metadata
      },
      processed: false
    };

    this.addEventToStream('value_capture', event);
    this.pendingEvents.push(event);

    logger.info(`Recorded value capture for tenant ${tenantId}: €${valueTax.capturedAmount} (${(valueTax.taxRate * 100)}% of €${valueGenerated})`);
  }

  async recordInfrastructureUsage(
    tenantId: string,
    region: string,
    usageType: string,
    amount: number,
    metadata: any = {}
  ): Promise<void> {
    const event: BillingEvent = {
      id: `infra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      eventType: 'infra_usage',
      timestamp: new Date(),
      amount,
      currency: 'EUR',
      metadata: {
        region,
        usageType,
        ...metadata
      },
      processed: false
    };

    this.addEventToStream('infra_usage', event);
    this.pendingEvents.push(event);

    logger.info(`Recorded infrastructure usage for tenant ${tenantId}: ${usageType} in ${region} (€${amount})`);
  }

  private addEventToStream(streamName: string, event: BillingEvent): void {
    const stream = this.eventStreams.get(streamName);
    if (stream) {
      stream.events.push(event);
    }
  }

  private startEventProcessor(): void {
    // Process events every 30 seconds
    setInterval(() => {
      this.processPendingEvents();
    }, 30000);

    // Create aggregations every hour
    setInterval(() => {
      this.createHourlyAggregations();
    }, 3600000);

    // Create daily aggregations at midnight
    setInterval(() => {
      this.createDailyAggregations();
    }, 86400000);

    // Create monthly aggregations on the 1st of each month
    setInterval(() => {
      const now = new Date();
      if (now.getDate() === 1) {
        this.createMonthlyAggregations();
      }
    }, 3600000);
  }

  private async processPendingEvents(): Promise<void> {
    if (this.pendingEvents.length === 0) return;

    const eventsToProcess = this.pendingEvents.splice(0, 100); // Process in batches
    const processedEvents: BillingEvent[] = [];

    for (const event of eventsToProcess) {
      try {
        // Process event through Stripe
        const chargeId = await this.processStripeCharge(event);
        
        event.processed = true;
        event.stripeChargeId = chargeId;
        processedEvents.push(event);

        logger.info(`Processed billing event ${event.id} for tenant ${event.tenantId}: €${event.amount}`);
      } catch (error) {
        logger.error(`Failed to process billing event ${event.id}:`, error);
        // Re-add to pending for retry
        this.pendingEvents.push(event);
      }
    }

    // Update event streams
    for (const stream of this.eventStreams.values()) {
      stream.events = stream.events.filter(event => !processedEvents.includes(event));
    }
  }

  private async processStripeCharge(event: BillingEvent): Promise<string> {
    // In real implementation, this would call Stripe API
    // For now, we'll simulate the charge creation
    
    const chargeId = `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return chargeId;

    /* Real implementation would be:
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const charge = await stripe.charges.create({
      amount: Math.round(event.amount * 100), // Convert to cents
      currency: event.currency.toLowerCase(),
      source: 'cus_default', // Customer's default payment method
      description: `${event.eventType} - ${event.tenantId}`,
      metadata: {
        tenantId: event.tenantId,
        eventType: event.eventType,
        eventId: event.id,
        ...event.metadata
      }
    });
    
    return charge.id;
    */
  }

  private async createHourlyAggregations(): Promise<void> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    const tenants = await this.getActiveTenants();
    
    for (const tenantId of tenants) {
      const aggregation = await this.aggregateEvents(tenantId, oneHourAgo, now, 'hourly');
      
      if (!this.aggregations.has(tenantId)) {
        this.aggregations.set(tenantId, []);
      }
      
      this.aggregations.get(tenantId)!.push(aggregation);
    }
  }

  private async createDailyAggregations(): Promise<void> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 86400000);

    const tenants = await this.getActiveTenants();
    
    for (const tenantId of tenants) {
      const aggregation = await this.aggregateEvents(tenantId, oneDayAgo, now, 'daily');
      
      if (!this.aggregations.has(tenantId)) {
        this.aggregations.set(tenantId, []);
      }
      
      this.aggregations.get(tenantId)!.push(aggregation);
    }
  }

  private async createMonthlyAggregations(): Promise<void> {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 86400000);

    const tenants = await this.getActiveTenants();
    
    for (const tenantId of tenants) {
      const aggregation = await this.aggregateEvents(tenantId, oneMonthAgo, now, 'monthly');
      
      if (!this.aggregations.has(tenantId)) {
        this.aggregations.set(tenantId, []);
      }
      
      this.aggregations.get(tenantId)!.push(aggregation);
    }
  }

  private async aggregateEvents(
    tenantId: string,
    startTime: Date,
    endTime: Date,
    period: 'hourly' | 'daily' | 'monthly'
  ): Promise<BillingAggregation> {
    // Get all events for the tenant in the time period
    const allEvents: BillingEvent[] = [];
    
    for (const stream of this.eventStreams.values()) {
      const streamEvents = stream.events.filter(event => 
        event.tenantId === tenantId &&
        event.timestamp >= startTime &&
        event.timestamp <= endTime &&
        event.processed
      );
      allEvents.push(...streamEvents);
    }

    // Calculate totals
    const totalAmount = allEvents.reduce((sum, event) => sum + event.amount, 0);
    
    // Count events by type
    const eventCounts = allEvents.reduce((counts, event) => {
      counts[event.eventType] = (counts[event.eventType] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Create breakdown
    const breakdown = {
      executions: 0,
      microCommitments: 0,
      upgrades: 0,
      valueCapture: 0,
      infraUsage: 0
    };

    for (const event of allEvents) {
      switch (event.eventType) {
        case 'execution':
          breakdown.executions += event.amount;
          break;
        case 'micro_commitment':
          breakdown.microCommitments += event.amount;
          break;
        case 'upgrade':
          breakdown.upgrades += event.amount;
          break;
        case 'value_capture':
          breakdown.valueCapture += event.amount;
          break;
        case 'infra_usage':
          breakdown.infraUsage += event.amount;
          break;
      }
    }

    return {
      tenantId,
      period,
      startTime,
      endTime,
      totalAmount,
      eventCounts,
      breakdown
    };
  }

  private async getActiveTenants(): Promise<string[]> {
    // In real implementation, this would query the database for active tenants
    // For now, return mock data
    return ['tenant_1', 'tenant_2', 'tenant_3'];
  }

  async getBillingAggregations(
    tenantId: string,
    period: 'hourly' | 'daily' | 'monthly',
    limit: number = 10
  ): Promise<BillingAggregation[]> {
    const aggregations = this.aggregations.get(tenantId) || [];
    
    return aggregations
      .filter(agg => agg.period === period)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  async getPendingEventsCount(): Promise<number> {
    return this.pendingEvents.length;
  }

  async getEventStreamStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {};
    
    for (const [streamName, stream] of this.eventStreams) {
      status[streamName] = {
        eventCount: stream.events.length,
        lastProcessed: stream.lastProcessed,
        processingStatus: stream.processingStatus
      };
    }
    
    return status;
  }

  async pauseEventProcessing(streamName?: string): Promise<void> {
    if (streamName) {
      const stream = this.eventStreams.get(streamName);
      if (stream) {
        stream.processingStatus = 'paused';
      }
    } else {
      // Pause all streams
      for (const stream of this.eventStreams.values()) {
        stream.processingStatus = 'paused';
      }
    }
  }

  async resumeEventProcessing(streamName?: string): Promise<void> {
    if (streamName) {
      const stream = this.eventStreams.get(streamName);
      if (stream) {
        stream.processingStatus = 'active';
      }
    } else {
      // Resume all streams
      for (const stream of this.eventStreams.values()) {
        stream.processingStatus = 'active';
      }
    }
  }
}
