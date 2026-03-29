import { logger } from '../utils/logger.js';

export interface PricingExperiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  targetSegment: string;
  variants: PricingVariant[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  trafficAllocation: TrafficAllocation;
  startDate: Date;
  endDate?: Date;
  minSampleSize: number;
  confidenceLevel: number; // 0-1
  statisticalPower: number; // 0-1
  primaryMetric: ExperimentMetric;
  secondaryMetrics: ExperimentMetric[];
  results?: ExperimentResults;
  insights?: ExperimentInsights[];
}

export interface PricingVariant {
  id: string;
  name: string;
  description: string;
  pricingConfig: PricingConfig;
  weight: number; // Traffic allocation percentage
  psychologicalAngle: string;
  expectedLift: number; // Expected improvement percentage
  riskLevel: 'low' | 'medium' | 'high';
  implementation: VariantImplementation;
}

export interface PricingConfig {
  model: 'static' | 'adaptive' | 'revenue_share' | 'hybrid';
  basePrice: number;
  valueMultiplier: number;
  volumeDiscount: number;
  psychologicalAnchors: PsychologicalAnchor[];
  messaging: MessagingConfig;
  limits: LimitConfig;
  features: FeatureConfig;
}

export interface PsychologicalAnchor {
  type: 'price_anchor' | 'value_ratio' | 'social_proof' | 'scarcity' | 'urgency';
  value: number | string;
  placement: 'header' | 'pricing_card' | 'cta' | 'footer';
  weight: number; // Influence on decision
}

export interface MessagingConfig {
  headline: string;
  subheadline: string;
  valueProposition: string;
  socialProof: string[];
  urgencyElements: string[];
  psychologicalTriggers: string[];
}

export interface LimitConfig {
  type: 'hard' | 'soft' | 'psychological';
  displayLimits: Record<string, number>;
  actualLimits: Record<string, number>;
  warningThresholds: Record<string, number>;
}

export interface FeatureConfig {
  included: string[];
  highlighted: string[];
  shadowFeatures: string[];
  upgradePaths: string[];
}

export interface VariantImplementation {
  frontendChanges: FrontendChange[];
  backendChanges: BackendChange[];
  databaseChanges?: DatabaseChange[];
  rolloutStrategy: 'immediate' | 'gradual' | 'feature_flag';
}

export interface FrontendChange {
  component: string;
  type: 'copy' | 'style' | 'layout' | 'interaction';
  change: any;
  priority: 'low' | 'medium' | 'high';
}

export interface BackendChange {
  service: string;
  type: 'pricing_logic' | 'calculation' | 'validation' | 'notification';
  change: any;
  priority: 'low' | 'medium' | 'high';
}

export interface DatabaseChange {
  table: string;
  type: 'schema' | 'data' | 'index';
  change: any;
  rollback?: any;
}

export interface TrafficAllocation {
  strategy: 'equal' | 'weighted' | 'adaptive';
  allocations: Record<string, number>; // variant_id -> percentage
  rebalancing: boolean;
  minSamplesPerVariant: number;
}

export interface ExperimentMetric {
  name: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'retention' | 'satisfaction';
  calculation: string; // How to calculate this metric
  target: number; // Target value for success
  weight: number; // Importance in overall evaluation
  direction: 'increase' | 'decrease'; // Whether we want this to go up or down
}

export interface ExperimentResults {
  status: 'significant' | 'inconclusive' | 'failed';
  winner?: string; // variant ID
  confidence: number; // Statistical confidence
  sampleSize: number;
  duration: number; // Days
  primaryMetricResults: MetricResult[];
  secondaryMetricResults: MetricResult[];
  statisticalTests: StatisticalTest[];
  businessImpact: BusinessImpact;
  recommendations: string[];
}

export interface MetricResult {
  metricName: string;
  control: MetricValue;
  treatment: MetricValue;
  lift: number; // Percentage change
  pValue: number;
  confidenceInterval: [number, number];
  significance: boolean;
  practicalSignificance: boolean;
}

export interface MetricValue {
  value: number;
  sampleSize: number;
  standardError: number;
  variance: number;
}

export interface StatisticalTest {
  name: string;
  testType: 't_test' | 'chi_square' | 'mann_whitney' | 'anova';
  statistic: number;
  pValue: number;
  criticalValue: number;
  significant: boolean;
  interpretation: string;
}

export interface BusinessImpact {
  revenueImpact: number; // Dollar amount
  conversionImpact: number; // Percentage
  customerLifetimeValueImpact: number;
  marketShareImpact: number;
  strategicValue: number; // 0-1 score
}

export interface ExperimentInsights {
  category: 'psychological' | 'pricing' | 'messaging' | 'segment' | 'technical';
  insight: string;
  evidence: string[];
  confidence: number; // 0-1
  actionability: 'high' | 'medium' | 'low';
  relatedExperiments: string[];
}

export interface ExperimentParticipant {
  tenantId: string;
  experimentId: string;
  variantId: string;
  enrollmentDate: Date;
  cohort: string;
  segment: string;
  behavior: ParticipantBehavior;
}

export interface ParticipantBehavior {
  pageViews: number;
  timeOnPage: number;
  clicks: number;
  conversions: number;
  revenue: number;
  interactions: string[];
  dropOffPoints: string[];
  feedbackScore?: number;
}

export class AcceleratorABTestingService {
  private experiments: Map<string, PricingExperiment> = new Map();
  private participants: Map<string, ExperimentParticipant[]> = new Map();
  private experimentMetrics: Map<string, Map<string, number[]>> = new Map(); // experiment_id -> metric_name -> values
  
  constructor() {
    this.initializeDefaultExperiments();
  }

  private initializeDefaultExperiments() {
    // Price anchoring experiment
    this.createExperiment({
      name: 'Price Anchoring Effects',
      description: 'Test different price anchors on conversion rates',
      hypothesis: 'Higher price anchors will increase perceived value and conversion to mid-tier plans',
      targetSegment: 'new_users',
      variants: [
        {
          id: 'control',
          name: 'Current Pricing',
          description: 'Existing pricing structure',
          pricingConfig: {
            model: 'static',
            basePrice: 29,
            valueMultiplier: 0.08,
            volumeDiscount: 0.10,
            psychologicalAnchors: [
              { type: 'price_anchor', value: 29, placement: 'pricing_card', weight: 1.0 }
            ],
            messaging: {
              headline: 'Simple, Transparent Pricing',
              subheadline: 'Start for free, scale as you grow',
              valueProposition: 'Automate your workflows with predictable pricing',
              socialProof: [],
              urgencyElements: [],
              psychologicalTriggers: []
            },
            limits: {
              type: 'hard',
              displayLimits: { workflows: 5, executions: 1000 },
              actualLimits: { workflows: 5, executions: 1000 },
              warningThresholds: { workflows: 4, executions: 800 }
            },
            features: {
              included: ['basic_workflows', 'webhooks', 'email_support'],
              highlighted: ['unlimited_free_workflows'],
              shadowFeatures: [],
              upgradePaths: ['growth_mode']
            }
          },
          weight: 0.5,
          psychologicalAngle: 'neutral',
          expectedLift: 0,
          riskLevel: 'low',
          implementation: {
            frontendChanges: [],
            backendChanges: [],
            rolloutStrategy: 'immediate'
          }
        },
        {
          id: 'high_anchor',
          name: 'High Anchor Pricing',
          description: 'Introduce high-priced anchor to make mid-tier seem more valuable',
          pricingConfig: {
            model: 'static',
            basePrice: 29,
            valueMultiplier: 0.08,
            volumeDiscount: 0.10,
            psychologicalAnchors: [
              { type: 'price_anchor', value: 99, placement: 'header', weight: 0.8 },
              { type: 'price_anchor', value: 29, placement: 'pricing_card', weight: 1.0 }
            ],
            messaging: {
              headline: 'Enterprise Features, Startup Pricing',
              subheadline: 'Get 70% off enterprise capabilities',
              valueProposition: 'Professional automation at a fraction of the cost',
              socialProof: ['Usually $99/month'],
              urgencyElements: ['limited_time_offer'],
              psychologicalTriggers: ['anchoring', 'value_perception']
            },
            limits: {
              type: 'psychological',
              displayLimits: { workflows: 10, executions: 2000 },
              actualLimits: { workflows: 5, executions: 1000 },
              warningThresholds: { workflows: 4, executions: 800 }
            },
            features: {
              included: ['basic_workflows', 'webhooks', 'email_support'],
              highlighted: ['enterprise_features', 'professional_support'],
              shadowFeatures: ['advanced_monitoring', 'custom_integrations'],
              upgradePaths: ['growth_mode']
            }
          },
          weight: 0.5,
          psychologicalAngle: 'anchoring + value_perception',
          expectedLift: 15,
          riskLevel: 'medium',
          implementation: {
            frontendChanges: [
              {
                component: 'PricingCard',
                type: 'copy',
                change: { header: 'Usually $99/month' },
                priority: 'high'
              }
            ],
            backendChanges: [],
            rolloutStrategy: 'feature_flag'
          }
        }
      ],
      trafficAllocation: {
        strategy: 'equal',
        allocations: { control: 0.5, high_anchor: 0.5 },
        rebalancing: false,
        minSamplesPerVariant: 1000
      },
      minSampleSize: 2000,
      confidenceLevel: 0.95,
      statisticalPower: 0.8,
      primaryMetric: {
        name: 'conversion_rate',
        type: 'conversion',
        calculation: 'conversions / visitors',
        target: 0.15,
        weight: 0.6,
        direction: 'increase'
      },
      secondaryMetrics: [
        {
          name: 'average_revenue_per_user',
          type: 'revenue',
          calculation: 'total_revenue / users',
          target: 45,
          weight: 0.3,
          direction: 'increase'
        },
        {
          name: 'time_to_conversion',
          type: 'engagement',
          calculation: 'avg_time_to_first_conversion',
          target: 1800, // 30 minutes
          weight: 0.1,
          direction: 'decrease'
        }
      ]
    });

    // Urgency messaging experiment
    this.createExperiment({
      name: 'Urgency Messaging Impact',
      description: 'Test different urgency messaging techniques on upgrade conversion',
      hypothesis: 'Loss aversion messaging will outperform opportunity messaging for upgrade conversions',
      targetSegment: 'active_free_users',
      variants: [
        {
          id: 'opportunity_messaging',
          name: 'Opportunity Messaging',
          description: 'Focus on positive outcomes and opportunities',
          pricingConfig: {
            model: 'static',
            basePrice: 29,
            valueMultiplier: 0.08,
            volumeDiscount: 0.10,
            psychologicalAnchors: [],
            messaging: {
              headline: 'Unlock Your Full Potential',
              subheadline: 'See what\'s possible with Growth Mode',
              valueProposition: 'Advanced features to accelerate your success',
              socialProof: ['Teams like yours grow 3x faster'],
              urgencyElements: ['limited_opportunity'],
              psychologicalTriggers: ['opportunity_cost', 'achievement']
            },
            limits: {
              type: 'soft',
              displayLimits: { workflows: 10, executions: 2000 },
              actualLimits: { workflows: 5, executions: 1000 },
              warningThresholds: { workflows: 4, executions: 800 }
            },
            features: {
              included: ['basic_workflows', 'webhooks'],
              highlighted: ['unlimited_workflows', 'ai_optimization'],
              shadowFeatures: ['team_collaboration', 'advanced_analytics'],
              upgradePaths: ['growth_mode']
            }
          },
          weight: 0.5,
          psychologicalAngle: 'opportunity + achievement',
          expectedLift: 10,
          riskLevel: 'low',
          implementation: {
            frontendChanges: [
              {
                component: 'UpgradePrompt',
                type: 'copy',
                change: { title: 'Unlock Your Full Potential', message: 'See what\'s possible' },
                priority: 'high'
              }
            ],
            backendChanges: [],
            rolloutStrategy: 'immediate'
          }
        },
        {
          id: 'loss_aversion_messaging',
          name: 'Loss Aversion Messaging',
          description: 'Focus on what users will lose by not upgrading',
          pricingConfig: {
            model: 'static',
            basePrice: 29,
            valueMultiplier: 0.08,
            volumeDiscount: 0.10,
            psychologicalAnchors: [],
            messaging: {
              headline: 'Don\'t Lose Your Progress',
              subheadline: 'Your workflows are at risk',
              valueProposition: 'Protect your automation investment',
              socialProof: ['87% of users upgrade after hitting limits'],
              urgencyElements: ['imminent_limit', 'progress_loss'],
              psychologicalTriggers: ['loss_aversion', 'fear', 'regret_avoidance']
            },
            limits: {
              type: 'psychological',
              displayLimits: { workflows: 3, executions: 500 },
              actualLimits: { workflows: 5, executions: 1000 },
              warningThresholds: { workflows: 2, executions: 400 }
            },
            features: {
              included: ['basic_workflows', 'webhooks'],
              highlighted: ['unlimited_workflows', 'priority_support'],
              shadowFeatures: ['backup_workflows', 'recovery_tools'],
              upgradePaths: ['growth_mode']
            }
          },
          weight: 0.5,
          psychologicalAngle: 'loss_aversion + fear',
          expectedLift: 20,
          riskLevel: 'medium',
          implementation: {
            frontendChanges: [
              {
                component: 'UpgradePrompt',
                type: 'copy',
                change: { title: 'Don\'t Lose Your Progress', message: 'Your workflows are at risk' },
                priority: 'high'
              }
            ],
            backendChanges: [],
            rolloutStrategy: 'feature_flag'
          }
        }
      ],
      trafficAllocation: {
        strategy: 'equal',
        allocations: { opportunity_messaging: 0.5, loss_aversion_messaging: 0.5 },
        rebalancing: false,
        minSamplesPerVariant: 800
      },
      minSampleSize: 1600,
      confidenceLevel: 0.95,
      statisticalPower: 0.8,
      primaryMetric: {
        name: 'upgrade_conversion_rate',
        type: 'conversion',
        calculation: 'upgrades / active_users',
        target: 0.08,
        weight: 0.7,
        direction: 'increase'
      },
      secondaryMetrics: [
        {
          name: 'time_to_upgrade',
          type: 'engagement',
          calculation: 'avg_time_to_upgrade',
          target: 7200, // 2 hours
          weight: 0.2,
          direction: 'decrease'
        },
        {
          name: 'feature_engagement',
          type: 'engagement',
          calculation: 'premium_feature_interactions / users',
          target: 0.3,
          weight: 0.1,
          direction: 'increase'
        }
      ]
    });

    logger.info('Initialized default A/B testing experiments');
  }

  async createExperiment(experimentData: Omit<PricingExperiment, 'id' | 'status' | 'startDate'>): Promise<PricingExperiment> {
    const experiment: PricingExperiment = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'draft',
      startDate: new Date(),
      ...experimentData
    };

    this.experiments.set(experiment.id, experiment);
    
    // Initialize metrics tracking
    this.experimentMetrics.set(experiment.id, new Map());
    
    logger.info(`Created A/B testing experiment: ${experiment.name}`);
    
    return experiment;
  }

  async startExperiment(experimentId: string): Promise<void> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment not found: ${experimentId}`);
    }

    if (experiment.status !== 'draft') {
      throw new Error(`Experiment ${experimentId} is not in draft status`);
    }

    experiment.status = 'active';
    
    logger.info(`Started A/B testing experiment: ${experiment.name}`);
  }

  async enrollParticipant(
    tenantId: string,
    experimentId: string,
    segment?: string,
    cohort?: string
  ): Promise<string> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'active') {
      throw new Error(`Experiment ${experimentId} is not active for enrollment`);
    }

    // Check if already enrolled
    const existingParticipants = this.participants.get(tenantId) || [];
    const alreadyEnrolled = existingParticipants.find(p => p.experimentId === experimentId);
    if (alreadyEnrolled) {
      return alreadyEnrolled.variantId;
    }

    // Allocate to variant
    const variantId = this.allocateToVariant(experiment, tenantId);
    
    const participant: ExperimentParticipant = {
      tenantId,
      experimentId,
      variantId,
      enrollmentDate: new Date(),
      cohort: cohort || 'default',
      segment: segment || 'default',
      behavior: {
        pageViews: 0,
        timeOnPage: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        interactions: [],
        dropOffPoints: []
      }
    };

    if (!this.participants.has(tenantId)) {
      this.participants.set(tenantId, []);
    }
    this.participants.get(tenantId)!.push(participant);

    logger.info(`Enrolled tenant ${tenantId} in experiment ${experimentId} -> variant ${variantId}`);
    
    return variantId;
  }

  private allocateToVariant(experiment: PricingExperiment, tenantId: string): string {
    const allocation = experiment.trafficAllocation;
    
    switch (allocation.strategy) {
      case 'equal':
        return this.equalAllocation(experiment, tenantId);
      case 'weighted':
        return this.weightedAllocation(experiment, tenantId);
      case 'adaptive':
        return this.adaptiveAllocation(experiment, tenantId);
      default:
        return this.equalAllocation(experiment, tenantId);
    }
  }

  private equalAllocation(experiment: PricingExperiment, tenantId: string): string {
    const variants = experiment.variants;
    const hash = this.hashString(tenantId + experiment.id);
    const index = hash % variants.length;
    return variants[index].id;
  }

  private weightedAllocation(experiment: PricingExperiment, tenantId: string): string {
    const allocations = experiment.trafficAllocation.allocations;
    const hash = this.hashString(tenantId + experiment.id) / 100; // Normalize to 0-1
    let cumulative = 0;
    
    for (const [variantId, weight] of Object.entries(allocations)) {
      cumulative += weight;
      if (hash <= cumulative) {
        return variantId;
      }
    }
    
    return experiment.variants[0].id; // Fallback
  }

  private adaptiveAllocation(experiment: PricingExperiment, tenantId: string): string {
    // Adaptive allocation based on current performance
    // For now, fall back to weighted allocation
    return this.weightedAllocation(experiment, tenantId);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async trackMetric(
    experimentId: string,
    tenantId: string,
    metricName: string,
    value: number
  ): Promise<void> {
    const participant = this.findParticipant(tenantId, experimentId);
    if (!participant) {
      return; // Not enrolled in experiment
    }

    // Update participant behavior
    this.updateParticipantBehavior(participant, metricName, value);

    // Store metric value
    if (!this.experimentMetrics.has(experimentId)) {
      this.experimentMetrics.set(experimentId, new Map());
    }
    
    const experimentMetrics = this.experimentMetrics.get(experimentId)!;
    if (!experimentMetrics.has(metricName)) {
      experimentMetrics.set(metricName, []);
    }
    
    experimentMetrics.get(metricName)!.push(value);
  }

  private findParticipant(tenantId: string, experimentId: string): ExperimentParticipant | undefined {
    const participants = this.participants.get(tenantId) || [];
    return participants.find(p => p.experimentId === experimentId);
  }

  private updateParticipantBehavior(participant: ExperimentParticipant, metricName: string, value: number): void {
    const behavior = participant.behavior;
    
    switch (metricName) {
      case 'page_view':
        behavior.pageViews++;
        break;
      case 'time_on_page':
        behavior.timeOnPage += value;
        break;
      case 'click':
        behavior.clicks++;
        behavior.interactions.push(`click_${Date.now()}`);
        break;
      case 'conversion':
        behavior.conversions++;
        break;
      case 'revenue':
        behavior.revenue += value;
        break;
      case 'drop_off':
        behavior.dropOffPoints.push(`drop_${Date.now()}`);
        break;
      case 'feedback_score':
        behavior.feedbackScore = value;
        break;
    }
  }

  async analyzeExperiment(experimentId: string): Promise<ExperimentResults> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment not found: ${experimentId}`);
    }

    const participants = this.getExperimentParticipants(experimentId);
    const sampleSize = participants.length;
    
    if (sampleSize < experiment.minSampleSize) {
      throw new Error(`Insufficient sample size: ${sampleSize} < ${experiment.minSampleSize}`);
    }

    // Calculate primary metric results
    const primaryMetricResults = await this.calculateMetricResults(
      experiment.primaryMetric,
      participants,
      experiment
    );

    // Calculate secondary metric results
    const secondaryMetricResults = await Promise.all(
      experiment.secondaryMetrics.map(metric => 
        this.calculateMetricResults(metric, participants, experiment)
      )
    );

    // Perform statistical tests
    const statisticalTests = await this.performStatisticalTests(
      [primaryMetricResults],
      secondaryMetricResults,
      experiment.confidenceLevel
    );

    // Calculate business impact
    const businessImpact = await this.calculateBusinessImpact(
      [primaryMetricResults],
      secondaryMetricResults,
      experiment
    );

    // Determine winner and significance
    const winner = this.determineWinner([primaryMetricResults], statisticalTests);
    const confidence = this.calculateOverallConfidence(statisticalTests);

    const results: ExperimentResults = {
      status: confidence >= experiment.confidenceLevel ? 'significant' : 'inconclusive',
      winner,
      confidence,
      sampleSize,
      duration: Math.floor((Date.now() - experiment.startDate.getTime()) / (24 * 60 * 60 * 1000)),
      primaryMetricResults: [primaryMetricResults],
      secondaryMetricResults,
      statisticalTests,
      businessImpact,
      recommendations: [] // Will be filled below
    };

    // Generate recommendations after creating the results object
    results.recommendations = this.generateRecommendations(results, experiment);

    experiment.results = results;
    experiment.status = 'completed';

    logger.info(`Analyzed experiment ${experimentId}: ${results.status}, winner: ${winner}`);

    return results;
  }

  private getExperimentParticipants(experimentId: string): ExperimentParticipant[] {
    const allParticipants: ExperimentParticipant[] = [];
    
    for (const participants of this.participants.values()) {
      allParticipants.push(...participants.filter(p => p.experimentId === experimentId));
    }
    
    return allParticipants;
  }

  private async calculateMetricResults(
    metric: ExperimentMetric,
    participants: ExperimentParticipant[],
    experiment: PricingExperiment
  ): Promise<MetricResult> {
    const controlParticipants = participants.filter(p => p.variantId === experiment.variants[0].id);
    const treatmentParticipants = participants.filter(p => p.variantId === experiment.variants[1].id);

    const controlValue = this.calculateMetricValue(metric, controlParticipants);
    const treatmentValue = this.calculateMetricValue(metric, treatmentParticipants);

    const lift = this.calculateLift(controlValue.value, treatmentValue.value);
    const pValue = this.calculatePValue(controlValue, treatmentValue);
    const confidenceInterval = this.calculateConfidenceInterval(
      controlValue.value,
      treatmentValue.value,
      controlValue.standardError,
      treatmentValue.standardError,
      0.95
    );

    return {
      metricName: metric.name,
      control: controlValue,
      treatment: treatmentValue,
      lift,
      pValue,
      confidenceInterval,
      significance: pValue < 0.05,
      practicalSignificance: Math.abs(lift) > 0.05 // 5% minimum practical significance
    };
  }

  private calculateMetricValue(metric: ExperimentMetric, participants: ExperimentParticipant[]): MetricValue {
    const values = participants.map(p => this.extractMetricValue(p, metric));
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
    const standardError = Math.sqrt(variance / values.length);

    return {
      value: mean,
      sampleSize: values.length,
      standardError,
      variance
    };
  }

  private extractMetricValue(participant: ExperimentParticipant, metric: ExperimentMetric): number {
    switch (metric.name) {
      case 'conversion_rate':
        return participant.behavior.conversions / Math.max(participant.behavior.pageViews, 1);
      case 'upgrade_conversion_rate':
        return participant.behavior.conversions / 1; // Each participant represents one opportunity
      case 'average_revenue_per_user':
        return participant.behavior.revenue;
      case 'time_to_conversion':
        return participant.behavior.timeOnPage;
      case 'time_to_upgrade':
        return participant.behavior.timeOnPage;
      case 'feature_engagement':
        return participant.behavior.interactions.length / Math.max(participant.behavior.pageViews, 1);
      default:
        return 0;
    }
  }

  private calculateLift(control: number, treatment: number): number {
    return control === 0 ? 0 : ((treatment - control) / control) * 100;
  }

  private calculatePValue(control: MetricValue, treatment: MetricValue): number {
    // Simplified t-test calculation
    const pooledStandardError = Math.sqrt(
      Math.pow(control.standardError, 2) + Math.pow(treatment.standardError, 2)
    );
    const tStatistic = (treatment.value - control.value) / pooledStandardError;
    
    // Simplified p-value calculation (would use proper t-distribution in production)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(tStatistic)));
    
    return pValue;
  }

  private normalCDF(x: number): number {
    // Approximation of normal CDF
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private calculateConfidenceInterval(
    controlMean: number,
    treatmentMean: number,
    controlSE: number,
    treatmentSE: number,
    confidenceLevel: number
  ): [number, number] {
    const zScore = confidenceLevel === 0.95 ? 1.96 : 1.645; // 90% confidence
    const standardError = Math.sqrt(controlSE * controlSE + treatmentSE * treatmentSE);
    const lift = treatmentMean - controlMean;
    
    const lowerBound = lift - zScore * standardError;
    const upperBound = lift + zScore * standardError;
    
    return [lowerBound, upperBound];
  }

  private async performStatisticalTests(
    primaryResults: MetricResult[],
    secondaryResults: MetricResult[],
    confidenceLevel: number
  ): Promise<StatisticalTest[]> {
    const tests: StatisticalTest[] = [];

    // T-test for primary metric
    if (primaryResults.length > 0) {
      const result = primaryResults[0];
      tests.push({
        name: 'Two-Sample T-Test',
        testType: 't_test',
        statistic: (result.treatment.value - result.control.value) / 
                 Math.sqrt(Math.pow(result.control.standardError, 2) + Math.pow(result.treatment.standardError, 2)),
        pValue: result.pValue,
        criticalValue: confidenceLevel === 0.95 ? 1.96 : 1.645,
        significant: result.significance,
        interpretation: result.significance ? 
          'Statistically significant difference detected' : 
          'No statistically significant difference detected'
      });
    }

    return tests;
  }

  private async calculateBusinessImpact(
    primaryResults: MetricResult[],
    secondaryResults: MetricResult[],
    experiment: PricingExperiment
  ): Promise<BusinessImpact> {
    const conversionResult = primaryResults.find(r => r.metricName.includes('conversion'));
    const revenueResult = secondaryResults.find(r => r.metricName.includes('revenue'));

    const revenueImpact = revenueResult ? 
      (revenueResult.treatment.value - revenueResult.control.value) * 1000 : 0; // Scale by 1000 users
    const conversionImpact = conversionResult ? conversionResult.lift : 0;

    return {
      revenueImpact,
      conversionImpact,
      customerLifetimeValueImpact: conversionImpact * 0.3, // Simplified CLV impact
      marketShareImpact: conversionImpact * 0.1, // Simplified market share impact
      strategicValue: this.calculateStrategicValue(experiment, primaryResults)
    };
  }

  private calculateStrategicValue(
    experiment: PricingExperiment,
    results: MetricResult[]
  ): number {
    // Calculate strategic value based on experiment importance and results
    let strategicValue = 0.5; // Base value

    // Higher value for psychological experiments
    if (experiment.name.includes('Psychological') || 
        experiment.name.includes('Messaging') || 
        experiment.name.includes('Anchoring')) {
      strategicValue += 0.2;
    }

    // Higher value for significant results
    const significantResults = results.filter(r => r.significance);
    if (significantResults.length > 0) {
      strategicValue += 0.2;
    }

    // Higher value for large lifts
    const largeLifts = results.filter(r => Math.abs(r.lift) > 10);
    if (largeLifts.length > 0) {
      strategicValue += 0.1;
    }

    return Math.min(1.0, strategicValue);
  }

  private determineWinner(primaryResults: MetricResult[], tests: StatisticalTest[]): string | undefined {
    if (primaryResults.length === 0) return undefined;

    const result = primaryResults[0];
    const test = tests.find(t => t.testType === 't_test');

    if (!test || !test.significant) return undefined;

    return result.lift > 0 ? 'treatment' : 'control';
  }

  private calculateOverallConfidence(tests: StatisticalTest[]): number {
    if (tests.length === 0) return 0;

    const significantTests = tests.filter(t => t.significant);
    return significantTests.length / tests.length;
  }

  private generateRecommendations(results: ExperimentResults, experiment: PricingExperiment): string[] {
    const recommendations: string[] = [];

    if (results.status === 'significant') {
      recommendations.push(`Implement winning variant: ${results.winner}`);
      
      if (results.businessImpact.revenueImpact > 0) {
        recommendations.push(`Expected annual revenue impact: $${(results.businessImpact.revenueImpact * 12).toLocaleString()}`);
      }
    } else {
      recommendations.push('Inconclusive results - consider running experiment longer');
      recommendations.push('Test different psychological angles or pricing structures');
    }

    if (results.sampleSize < experiment.minSampleSize * 2) {
      recommendations.push('Consider increasing sample size for more reliable results');
    }

    return recommendations;
  }

  async getExperimentSummary(experimentId: string): Promise<{
    experiment: PricingExperiment;
    participantCount: number;
    currentMetrics: Record<string, number>;
    status: string;
    recommendations: string[];
  }> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment not found: ${experimentId}`);
    }

    const participants = this.getExperimentParticipants(experimentId);
    const currentMetrics = this.calculateCurrentMetrics(experimentId, participants);

    return {
      experiment,
      participantCount: participants.length,
      currentMetrics,
      status: experiment.status,
      recommendations: experiment.results?.recommendations || []
    };
  }

  private calculateCurrentMetrics(experimentId: string, participants: ExperimentParticipant[]): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    const totalConversions = participants.reduce((sum, p) => sum + p.behavior.conversions, 0);
    const totalRevenue = participants.reduce((sum, p) => sum + p.behavior.revenue, 0);
    const totalPageViews = participants.reduce((sum, p) => sum + p.behavior.pageViews, 0);

    metrics.conversion_rate = totalPageViews > 0 ? totalConversions / totalPageViews : 0;
    metrics.revenue_per_user = participants.length > 0 ? totalRevenue / participants.length : 0;
    metrics.avg_time_on_page = participants.length > 0 ? 
      participants.reduce((sum, p) => sum + p.behavior.timeOnPage, 0) / participants.length : 0;

    return metrics;
  }

  async getActiveExperiments(): Promise<PricingExperiment[]> {
    return Array.from(this.experiments.values()).filter(exp => exp.status === 'active');
  }

  async getExperimentHistory(tenantId: string): Promise<ExperimentParticipant[]> {
    return this.participants.get(tenantId) || [];
  }
}
