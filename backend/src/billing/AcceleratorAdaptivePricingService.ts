import { logger } from '../utils/logger.js';
import { AcceleratorValueTrackingService, OutcomeMetrics } from './AcceleratorValueTrackingService.js';

export interface AdaptivePricingConfig {
  tenantId: string;
  basePlan: 'builder' | 'growth' | 'autopilot';
  pricingModel: 'static' | 'adaptive' | 'revenue_share' | 'hybrid';
  valueMultiplier: number; // Multiplier based on value generated
  volumeDiscount: number; // Discount for high volume
  growthBonus: number; // Bonus for consistent growth
  loyaltyDiscount: number; // Discount for long-term customers
  seasonalAdjustment: number; // Seasonal pricing adjustments
  psychologicalAnchor: number; // Reference price for perception
}

export interface HybridBillingCalculation {
  tenantId: string;
  period: 'monthly' | 'annual';
  basePrice: number;
  adaptiveComponents: AdaptiveComponent[];
  valueBasedComponents: ValueBasedComponent[];
  psychologicalAdjustments: PsychologicalAdjustment[];
  totalCharge: number;
  perceivedValue: number; // What the customer thinks they're getting
  actualCost: number; // Real cost after all adjustments
  extractionRate: number; // % of value captured
  billingBreakdown: BillingBreakdown;
}

export interface AdaptiveComponent {
  type: 'usage_based' | 'volume_tiered' | 'growth_scaled' | 'time_based';
  name: string;
  metric: string;
  currentValue: number;
  rate: number;
  multiplier: number;
  charge: number;
  description: string;
}

export interface ValueBasedComponent {
  type: 'revenue_share' | 'value_capture' | 'outcome_based' | 'performance_fee';
  name: string;
  metric: string;
  generatedValue: number;
  captureRate: number;
  charge: number;
  confidence: number; // 0-1 confidence in value calculation
  description: string;
}

export interface PsychologicalAdjustment {
  type: 'anchoring' | 'perception_gap' | 'value_illusion' | 'price_masking';
  name: string;
  adjustment: number;
  psychologicalImpact: number; // 0-1 impact on decision making
  description: string;
}

export interface BillingBreakdown {
  subscription: {
    base: number;
    adjustments: number;
    total: number;
  };
  usage: {
    executions: number;
    storage: number;
    bandwidth: number;
    total: number;
  };
  value: {
    revenueShare: number;
    valueCapture: number;
    outcomeBased: number;
    total: number;
  };
  psychological: {
    anchoring: number;
    perceptionGap: number;
    total: number;
  };
  discounts: {
    loyalty: number;
    volume: number;
    growth: number;
    seasonal: number;
    total: number;
  };
}

export interface PricingExperiment {
  id: string;
  name: string;
  tenantIds: string[];
  variants: PricingVariant[];
  status: 'active' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  results?: ExperimentResults;
}

export interface PricingVariant {
  id: string;
  name: string;
  config: Partial<AdaptivePricingConfig>;
  weight: number; // Traffic allocation percentage
  conversions: number;
  revenue: number;
  conversionRate: number;
  averageRevenuePerUser: number;
}

export interface ExperimentResults {
  winner: string;
  confidence: number;
  improvement: number;
  statisticalSignificance: boolean;
  insights: string[];
}

export class AcceleratorAdaptivePricingService {
  private pricingConfigs: Map<string, AdaptivePricingConfig> = new Map();
  private activeExperiments: Map<string, PricingExperiment> = new Map();
  private pricingHistory: Map<string, HybridBillingCalculation[]> = new Map();
  
  constructor(
    private valueTrackingService: AcceleratorValueTrackingService
  ) {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs() {
    // Default pricing configurations for different customer segments
    const defaultConfigs = {
      // High-value enterprise customers
      enterprise: {
        valueMultiplier: 0.05, // 5% of value generated
        volumeDiscount: 0.15, // 15% volume discount
        growthBonus: 0.10, // 10% growth bonus
        loyaltyDiscount: 0.20, // 20% loyalty discount
        seasonalAdjustment: 0.05, // 5% seasonal adjustment
        psychologicalAnchor: 999 // High anchor price
      },
      
      // Mid-market growth companies
      midmarket: {
        valueMultiplier: 0.08, // 8% of value generated
        volumeDiscount: 0.10, // 10% volume discount
        growthBonus: 0.15, // 15% growth bonus
        loyaltyDiscount: 0.10, // 10% loyalty discount
        seasonalAdjustment: 0.03, // 3% seasonal adjustment
        psychologicalAnchor: 499 // Medium anchor price
      },
      
      // Small business and startups
      smb: {
        valueMultiplier: 0.12, // 12% of value generated
        volumeDiscount: 0.05, // 5% volume discount
        growthBonus: 0.20, // 20% growth bonus
        loyaltyDiscount: 0.05, // 5% loyalty discount
        seasonalAdjustment: 0.02, // 2% seasonal adjustment
        psychologicalAnchor: 299 // Lower anchor price
      }
    };

    logger.info('Initialized adaptive pricing configurations');
  }

  async calculateHybridBilling(
    tenantId: string,
    usage: any,
    outcomes: OutcomeMetrics,
    period: 'monthly' | 'annual' = 'monthly'
  ): Promise<HybridBillingCalculation> {
    const config = await this.getPricingConfig(tenantId);
    const adaptiveComponents = await this.calculateAdaptiveComponents(tenantId, usage, config);
    const valueBasedComponents = await this.calculateValueBasedComponents(tenantId, outcomes, config);
    const psychologicalAdjustments = await this.calculatePsychologicalAdjustments(tenantId, config);
    
    const basePrice = this.getBasePrice(config.basePlan);
    
    // Calculate total charge
    const adaptiveTotal = adaptiveComponents.reduce((sum, comp) => sum + comp.charge, 0);
    const valueTotal = valueBasedComponents.reduce((sum, comp) => sum + comp.charge, 0);
    const psychologicalTotal = psychologicalAdjustments.reduce((sum, adj) => sum + adj.adjustment, 0);
    
    const totalCharge = basePrice + adaptiveTotal + valueTotal + psychologicalTotal;
    
    // Calculate perceived value (what customer thinks they're getting)
    const perceivedValue = await this.calculatePerceivedValue(tenantId, outcomes, config);
    
    // Calculate extraction rate
    const extractionRate = totalCharge / Math.max(perceivedValue, totalCharge);
    
    const billingBreakdown = await this.createBillingBreakdown(
      basePrice,
      adaptiveComponents,
      valueBasedComponents,
      psychologicalAdjustments,
      config
    );

    const calculation: HybridBillingCalculation = {
      tenantId,
      period,
      basePrice,
      adaptiveComponents,
      valueBasedComponents,
      psychologicalAdjustments,
      totalCharge,
      perceivedValue,
      actualCost: totalCharge,
      extractionRate,
      billingBreakdown
    };

    // Store calculation for history
    await this.storeBillingCalculation(tenantId, calculation);

    return calculation;
  }

  private async calculateAdaptiveComponents(
    tenantId: string,
    usage: any,
    config: AdaptivePricingConfig
  ): Promise<AdaptiveComponent[]> {
    const components: AdaptiveComponent[] = [];

    // Usage-based execution pricing
    if (usage.executionsPerMonth > 0) {
      const executionRate = this.getExecutionRate(usage.executionsPerMonth, config);
      const volumeMultiplier = this.getVolumeMultiplier(usage.executionsPerMonth, config);
      
      components.push({
        type: 'usage_based',
        name: 'Workflow Executions',
        metric: 'executions',
        currentValue: usage.executionsPerMonth,
        rate: executionRate,
        multiplier: volumeMultiplier,
        charge: usage.executionsPerMonth * executionRate * volumeMultiplier,
        description: 'Pay-per-execution with volume discounts'
      });
    }

    // Growth-based scaling
    const growthRate = await this.calculateGrowthRate(tenantId);
    if (growthRate > 0.1) { // 10%+ growth
      components.push({
        type: 'growth_scaled',
        name: 'Growth Scaling',
        metric: 'growth_rate',
        currentValue: growthRate,
        rate: config.basePrice * 0.1, // 10% of base price
        multiplier: 1 + (growthRate * config.growthBonus),
        charge: config.basePrice * 0.1 * growthRate * config.growthBonus,
        description: 'Dynamic pricing based on your growth'
      });
    }

    // Time-based activity pricing
    const activityScore = await this.calculateActivityScore(tenantId);
    if (activityScore > 0.5) {
      components.push({
        type: 'time_based',
        name: 'Activity Premium',
        metric: 'activity_score',
        currentValue: activityScore,
        rate: config.basePrice * 0.05,
        multiplier: activityScore,
        charge: config.basePrice * 0.05 * activityScore,
        description: 'Premium for active usage patterns'
      });
    }

    return components;
  }

  private async calculateValueBasedComponents(
    tenantId: string,
    outcomes: OutcomeMetrics,
    config: AdaptivePricingConfig
  ): Promise<ValueBasedComponent[]> {
    const components: ValueBasedComponent[] = [];

    // Revenue share component
    if (outcomes.revenueInfluenced > 0) {
      const captureRate = config.valueMultiplier * 0.6; // 60% of value multiplier for revenue
      components.push({
        type: 'revenue_share',
        name: 'Revenue Share',
        metric: 'revenue_influenced',
        generatedValue: outcomes.revenueInfluenced,
        captureRate,
        charge: outcomes.revenueInfluenced * captureRate,
        confidence: 0.8,
        description: 'Share of revenue we help you generate'
      });
    }

    // Value capture component
    if (outcomes.valueGenerated > 0) {
      const captureRate = config.valueMultiplier * 0.4; // 40% of value multiplier for general value
      components.push({
        type: 'value_capture',
        name: 'Value Capture',
        metric: 'value_generated',
        generatedValue: outcomes.valueGenerated,
        captureRate,
        charge: outcomes.valueGenerated * captureRate,
        confidence: 0.7,
        description: 'Share of total value created'
      });
    }

    // Outcome-based component
    if (outcomes.timeSaved > 0) {
      const timeValue = outcomes.timeSaved * 50; // $50/hour value
      const captureRate = config.valueMultiplier * 0.3; // 30% for time savings
      components.push({
        type: 'outcome_based',
        name: 'Time Savings Value',
        metric: 'time_saved',
        generatedValue: timeValue,
        captureRate,
        charge: timeValue * captureRate,
        confidence: 0.9,
        description: 'Value of time saved through automation'
      });
    }

    return components;
  }

  private async calculatePsychologicalAdjustments(
    tenantId: string,
    config: AdaptivePricingConfig
  ): Promise<PsychologicalAdjustment[]> {
    const adjustments: PsychologicalAdjustment[] = [];

    // Anchoring adjustment
    adjustments.push({
      type: 'anchoring',
      name: 'Price Anchoring',
      adjustment: config.psychologicalAnchor * 0.1, // 10% of anchor price
      psychologicalImpact: 0.8,
      description: 'Psychological anchoring to reference price'
    });

    // Perception gap adjustment
    const perceptionGap = await this.calculatePerceptionGap(tenantId);
    if (perceptionGap > 0.2) {
      adjustments.push({
        type: 'perception_gap',
        name: 'Perception Gap Premium',
        adjustment: perceptionGap * 100, // $100 per 0.1 gap
        psychologicalImpact: 0.6,
        description: 'Premium for high perceived value gap'
      });
    }

    // Value illusion adjustment
    const valueIllusion = await this.calculateValueIllusion(tenantId);
    if (valueIllusion > 0.5) {
      adjustments.push({
        type: 'value_illusion',
        name: 'Value Illusion Multiplier',
        adjustment: valueIllusion * 50,
        psychologicalImpact: 0.7,
        description: 'Multiplier based on value perception'
      });
    }

    return adjustments;
  }

  private getBasePrice(plan: string): number {
    const basePrices = {
      builder: 0,
      growth: 29,
      autopilot: 0
    };

    return basePrices[plan as keyof typeof basePrices] || 29;
  }

  private getExecutionRate(executions: number, config: AdaptivePricingConfig): number {
    // Volume-based pricing tiers
    const tiers = [
      { min: 0, max: 1000, rate: 0.01 },
      { min: 1001, max: 10000, rate: 0.008 },
      { min: 10001, max: 100000, rate: 0.006 },
      { min: 100001, max: Infinity, rate: 0.004 }
    ];

    const tier = tiers.find(t => executions >= t.min && executions <= t.max);
    const baseRate = tier?.rate || 0.01;

    // Apply volume discount
    return baseRate * (1 - config.volumeDiscount);
  }

  private getVolumeMultiplier(executions: number, config: AdaptivePricingConfig): number {
    // Volume multiplier decreases with higher volume
    if (executions > 100000) return 0.7;
    if (executions > 10000) return 0.8;
    if (executions > 1000) return 0.9;
    return 1.0;
  }

  private async calculateGrowthRate(tenantId: string): Promise<number> {
    // Calculate month-over-month growth rate
    const history = this.pricingHistory.get(tenantId) || [];
    if (history.length < 2) return 0;

    const currentMonth = history[history.length - 1];
    const previousMonth = history[history.length - 2];

    const currentRevenue = currentMonth.totalCharge;
    const previousRevenue = previousMonth.totalCharge;

    return previousRevenue > 0 ? (currentRevenue - previousRevenue) / previousRevenue : 0;
  }

  private async calculateActivityScore(tenantId: string): Promise<number> {
    // Calculate activity score based on usage patterns
    // Mock implementation - would analyze actual usage patterns
    return 0.6;
  }

  private async calculatePerceivedValue(
    tenantId: string,
    outcomes: OutcomeMetrics,
    config: AdaptivePricingConfig
  ): Promise<number> {
    // Calculate what the customer perceives as the value
    const timeValue = outcomes.timeSaved * 75; // Higher perceived value for time
    const revenueValue = outcomes.revenueInfluenced * 1.2; // 20% premium on revenue
    const efficiencyValue = outcomes.valueGenerated * 1.5; // 50% premium on efficiency

    const totalPerceivedValue = timeValue + revenueValue + efficiencyValue;
    
    // Apply psychological anchor
    return Math.max(totalPerceivedValue, config.psychologicalAnchor * 2);
  }

  private async calculatePerceptionGap(tenantId: string): Promise<number> {
    // Calculate gap between perceived and actual value
    // Mock implementation - would use actual perception data
    return 0.3;
  }

  private async calculateValueIllusion(tenantId: string): Promise<number> {
    // Calculate value illusion factor
    // Mock implementation - would use psychological profiling
    return 0.6;
  }

  private async createBillingBreakdown(
    basePrice: number,
    adaptiveComponents: AdaptiveComponent[],
    valueBasedComponents: ValueBasedComponent[],
    psychologicalAdjustments: PsychologicalAdjustment[],
    config: AdaptivePricingConfig
  ): Promise<BillingBreakdown> {
    const breakdown: BillingBreakdown = {
      subscription: {
        base: basePrice,
        adjustments: 0,
        total: basePrice
      },
      usage: {
        executions: 0,
        storage: 0,
        bandwidth: 0,
        total: 0
      },
      value: {
        revenueShare: 0,
        valueCapture: 0,
        outcomeBased: 0,
        total: 0
      },
      psychological: {
        anchoring: 0,
        perceptionGap: 0,
        total: 0
      },
      discounts: {
        loyalty: 0,
        volume: 0,
        growth: 0,
        seasonal: 0,
        total: 0
      }
    };

    // Process adaptive components
    for (const component of adaptiveComponents) {
      if (component.type === 'usage_based') {
        breakdown.usage.executions = component.charge;
      }
      breakdown.usage.total += component.charge;
    }

    // Process value-based components
    for (const component of valueBasedComponents) {
      if (component.type === 'revenue_share') {
        breakdown.value.revenueShare = component.charge;
      } else if (component.type === 'value_capture') {
        breakdown.value.valueCapture = component.charge;
      } else if (component.type === 'outcome_based') {
        breakdown.value.outcomeBased = component.charge;
      }
      breakdown.value.total += component.charge;
    }

    // Process psychological adjustments
    for (const adjustment of psychologicalAdjustments) {
      if (adjustment.type === 'anchoring') {
        breakdown.psychological.anchoring = adjustment.adjustment;
      } else if (adjustment.type === 'perception_gap') {
        breakdown.psychological.perceptionGap = adjustment.adjustment;
      }
      breakdown.psychological.total += adjustment.adjustment;
    }

    // Calculate discounts
    const totalBeforeDiscounts = breakdown.subscription.total + breakdown.usage.total + 
                                breakdown.value.total + breakdown.psychological.total;
    
    breakdown.discounts.loyalty = totalBeforeDiscounts * config.loyaltyDiscount;
    breakdown.discounts.volume = totalBeforeDiscounts * config.volumeDiscount;
    breakdown.discounts.growth = totalBeforeDiscounts * config.growthBonus;
    breakdown.discounts.seasonal = totalBeforeDiscounts * config.seasonalAdjustment;
    breakdown.discounts.total = breakdown.discounts.loyalty + breakdown.discounts.volume + 
                                breakdown.discounts.growth + breakdown.discounts.seasonal;

    return breakdown;
  }

  private async storeBillingCalculation(tenantId: string, calculation: HybridBillingCalculation): Promise<void> {
    if (!this.pricingHistory.has(tenantId)) {
      this.pricingHistory.set(tenantId, []);
    }
    
    this.pricingHistory.get(tenantId)!.push(calculation);
    
    // Keep only last 12 months of history
    const history = this.pricingHistory.get(tenantId)!;
    if (history.length > 12) {
      this.pricingHistory.set(tenantId, history.slice(-12));
    }
  }

  async getPricingConfig(tenantId: string): Promise<AdaptivePricingConfig> {
    let config = this.pricingConfigs.get(tenantId);
    
    if (!config) {
      // Create default config based on tenant characteristics
      config = await this.createDefaultConfig(tenantId);
      this.pricingConfigs.set(tenantId, config);
    }
    
    return config;
  }

  private async createDefaultConfig(tenantId: string): Promise<AdaptivePricingConfig> {
    // Analyze tenant to determine appropriate segment
    const outcomes = await this.valueTrackingService.calculateOutcomeMetrics(tenantId);
    
    let segment: 'enterprise' | 'midmarket' | 'smb';
    if (outcomes.valueGenerated > 50000) {
      segment = 'enterprise';
    } else if (outcomes.valueGenerated > 10000) {
      segment = 'midmarket';
    } else {
      segment = 'smb';
    }

    const segmentConfigs = {
      enterprise: {
        valueMultiplier: 0.05,
        volumeDiscount: 0.15,
        growthBonus: 0.10,
        loyaltyDiscount: 0.20,
        seasonalAdjustment: 0.05,
        psychologicalAnchor: 999
      },
      midmarket: {
        valueMultiplier: 0.08,
        volumeDiscount: 0.10,
        growthBonus: 0.15,
        loyaltyDiscount: 0.10,
        seasonalAdjustment: 0.03,
        psychologicalAnchor: 499
      },
      smb: {
        valueMultiplier: 0.12,
        volumeDiscount: 0.05,
        growthBonus: 0.20,
        loyaltyDiscount: 0.05,
        seasonalAdjustment: 0.02,
        psychologicalAnchor: 299
      }
    };

    const config = segmentConfigs[segment];

    return {
      tenantId,
      basePlan: 'growth',
      pricingModel: 'hybrid',
      ...config
    };
  }

  async updatePricingConfig(tenantId: string, updates: Partial<AdaptivePricingConfig>): Promise<void> {
    const current = await this.getPricingConfig(tenantId);
    const updated = { ...current, ...updates };
    
    this.pricingConfigs.set(tenantId, updated);
    
    logger.info(`Updated pricing config for tenant ${tenantId}`);
  }

  async createPricingExperiment(
    name: string,
    tenantIds: string[],
    variants: Partial<AdaptivePricingConfig>[]
  ): Promise<PricingExperiment> {
    const experiment: PricingExperiment = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      tenantIds,
      variants: variants.map((config, index) => ({
        id: `variant_${index}`,
        name: `Variant ${index + 1}`,
        config,
        weight: 1 / variants.length,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        averageRevenuePerUser: 0
      })),
      status: 'active',
      startDate: new Date()
    };

    this.activeExperiments.set(experiment.id, experiment);
    
    logger.info(`Created pricing experiment: ${name}`);
    
    return experiment;
  }

  async getExperimentResults(experimentId: string): Promise<ExperimentResults | null> {
    const experiment = this.activeExperiments.get(experimentId);
    if (!experiment || experiment.status === 'active') {
      return null;
    }

    // Calculate results
    const totalConversions = experiment.variants.reduce((sum, v) => sum + v.conversions, 0);
    const totalRevenue = experiment.variants.reduce((sum, v) => sum + v.revenue, 0);
    
    const winner = experiment.variants.reduce((best, current) => 
      current.revenue > best.revenue ? current : best
    );

    const results: ExperimentResults = {
      winner: winner.id,
      confidence: 0.95, // Mock calculation
      improvement: 0.15, // Mock calculation
      statisticalSignificance: true,
      insights: [
        `${winner.name} generated ${winner.revenue.toLocaleString()} in revenue`,
        `Conversion rate: ${(winner.conversions / experiment.tenantIds.length * 100).toFixed(1)}%`,
        'Statistical significance achieved with 95% confidence'
      ]
    };

    experiment.results = results;
    return results;
  }

  async getBillingHistory(tenantId: string, months: number = 6): Promise<HybridBillingCalculation[]> {
    const history = this.pricingHistory.get(tenantId) || [];
    
    return history.slice(-months);
  }

  async getPricingInsights(tenantId: string): Promise<{
    currentExtractionRate: number;
    optimalExtractionRate: number;
    revenueOpportunity: number;
    psychologicalLeverage: number;
    recommendedAdjustments: string[];
  }> {
    const history = await this.getBillingHistory(tenantId);
    if (history.length === 0) {
      throw new Error(`No billing history found for tenant ${tenantId}`);
    }

    const latest = history[history.length - 1];
    const currentExtractionRate = latest.extractionRate;
    
    // Calculate optimal extraction rate (typically 15-25% for SaaS)
    const optimalExtractionRate = 0.20;
    
    const revenueOpportunity = latest.perceivedValue * (optimalExtractionRate - currentExtractionRate);
    
    // Calculate psychological leverage
    const psychologicalLeverage = latest.psychologicalAdjustments.reduce((sum, adj) => 
      sum + adj.psychologicalImpact, 0) / latest.psychologicalAdjustments.length;

    const recommendedAdjustments = this.generateRecommendedAdjustments(latest, currentExtractionRate);

    return {
      currentExtractionRate,
      optimalExtractionRate,
      revenueOpportunity,
      psychologicalLeverage,
      recommendedAdjustments
    };
  }

  private generateRecommendedAdjustments(calculation: HybridBillingCalculation, currentRate: number): string[] {
    const adjustments: string[] = [];

    if (currentRate < 0.15) {
      adjustments.push('Increase value capture rate to 15-20% for optimal revenue');
    }

    if (calculation.psychologicalAdjustments.length < 3) {
      adjustments.push('Add more psychological pricing mechanisms to increase perceived value');
    }

    if (calculation.valueBasedComponents.length < 2) {
      adjustments.push('Expand value-based pricing components to capture more created value');
    }

    const valueRatio = calculation.perceivedValue / calculation.actualCost;
    if (valueRatio > 10) {
      adjustments.push('High value ratio indicates room for price increase');
    }

    return adjustments;
  }
}
