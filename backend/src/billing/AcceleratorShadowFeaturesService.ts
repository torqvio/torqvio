import { logger } from '../utils/logger.js';

export interface ShadowFeature {
  id: string;
  name: string;
  description: string;
  category: 'monitoring' | 'integrations' | 'collaboration' | 'analytics' | 'branding' | 'support';
  requiredPlan: 'growth' | 'autopilot';
  previewType: 'read_only' | 'demo_data' | 'limited_functionality' | 'template_view';
  previewData?: any;
  upgradeBenefit: string;
  psychologicalTriggers: PsychologicalTrigger[];
  previewInteractions: number; // Track how many times user engages with preview
  upgradeConversionRate: number; // Track conversion from preview to upgrade
}

export interface PsychologicalTrigger {
  type: 'curiosity' | 'fomo' | 'status' | 'efficiency' | 'security' | 'opportunity';
  message: string;
  triggerCondition: string;
  emotion: 'positive' | 'neutral' | 'negative';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ShadowFeatureInteraction {
  id: string;
  tenantId: string;
  featureId: string;
  interactionType: 'view' | 'click' | 'explore' | 'attempt_use' | 'share';
  timestamp: Date;
  duration?: number; // How long they spent with the preview
  metadata?: any;
  category?: string;
}

export interface ShadowFeaturePreview {
  feature: ShadowFeature;
  isAccessible: boolean;
  previewContent: any;
  upgradePrompt: UpgradePrompt;
  psychologicalContext: PsychologicalContext;
}

export interface UpgradePrompt {
  title: string;
  message: string;
  benefits: string[];
  socialProof?: string;
  urgencyMessage?: string;
  ctaText: string;
  ctaUrgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface PsychologicalContext {
  userPersonas: string[];
  emotionalState: 'exploring' | 'frustrated' | 'ambitious' | 'cost_conscious' | 'time_pressed';
  decisionFactors: string[];
  previousInteractions: ShadowFeatureInteraction[];
  conversionProbability: number;
}

export class AcceleratorShadowFeaturesService {
  private shadowFeatures: Map<string, ShadowFeature> = new Map();
  private interactions: Map<string, ShadowFeatureInteraction[]> = new Map();
  private userProfiles: Map<string, PsychologicalContext> = new Map();
  
  constructor() {
    this.initializeShadowFeatures();
  }

  private initializeShadowFeatures() {
    // Free tier shadow features
    this.shadowFeatures.set('advanced_monitoring', {
      id: 'advanced_monitoring',
      name: 'Advanced Monitoring Dashboard',
      description: 'Real-time workflow performance metrics, anomaly detection, and predictive analytics',
      category: 'monitoring',
      requiredPlan: 'growth',
      previewType: 'demo_data',
      upgradeBenefit: 'Get real-time monitoring and prevent issues before they impact your business',
      previewInteractions: 0,
      upgradeConversionRate: 0,
      psychologicalTriggers: [
        {
          type: 'fomo',
          message: '87% of Growth Mode users catch issues 2x faster with advanced monitoring',
          triggerCondition: 'workflow_count >= 3',
          emotion: 'neutral',
          urgencyLevel: 'medium'
        },
        {
          type: 'security',
          message: 'Don\'t let hidden issues cost your business. Advanced monitoring prevents costly failures.',
          triggerCondition: 'error_rate > 0',
          emotion: 'negative',
          urgencyLevel: 'high'
        }
      ]
    });

    this.shadowFeatures.set('custom_integrations', {
      id: 'custom_integrations',
      name: 'Custom Integration Builder',
      description: 'Build custom integrations with any API using our visual workflow designer',
      category: 'integrations',
      requiredPlan: 'growth',
      previewType: 'template_view',
      upgradeBenefit: 'Connect to any system and automate your entire business stack',
      previewInteractions: 0,
      upgradeConversionRate: 0,
      psychologicalTriggers: [
        {
          type: 'opportunity',
          message: 'Teams using custom integrations save 15+ hours per week on manual data entry',
          triggerCondition: 'manual_processes > 5',
          emotion: 'positive',
          urgencyLevel: 'medium'
        },
        {
          type: 'efficiency',
          message: 'Your competitors are already automating their custom workflows. Don\'t fall behind.',
          triggerCondition: 'integrations_count >= 3',
          emotion: 'neutral',
          urgencyLevel: 'high'
        }
      ]
    });

    this.shadowFeatures.set('priority_support', {
      id: 'priority_support',
      name: 'Priority Support Queue',
      description: 'Get priority access to our support team with guaranteed response times',
      category: 'support',
      requiredPlan: 'growth',
      previewType: 'read_only',
      upgradeBenefit: 'Never wait for help - get answers when you need them most',
      previewInteractions: 0,
      upgradeConversionRate: 0,
      psychologicalTriggers: [
        {
          type: 'status',
          message: 'Growth Mode users get priority support - join the teams that get help first',
          triggerCondition: 'support_tickets > 0',
          emotion: 'positive',
          urgencyLevel: 'medium'
        }
      ]
    });

    // Starter tier shadow features
    this.shadowFeatures.set('team_collaboration', {
      id: 'team_collaboration',
      name: 'Team Collaboration Hub',
      description: 'Share workflows, assign tasks, and collaborate with your team in real-time',
      category: 'collaboration',
      requiredPlan: 'growth',
      previewType: 'demo_data',
      upgradeBenefit: 'Transform your team\'s productivity with shared automation workflows',
      previewInteractions: 0,
      upgradeConversionRate: 0,
      psychologicalTriggers: [
        {
          type: 'status',
          message: 'Top-performing teams collaborate 5x more with automation. See what you\'re missing.',
          triggerCondition: 'team_members >= 3',
          emotion: 'positive',
          urgencyLevel: 'medium'
        },
        {
          type: 'efficiency',
          message: 'Your team could accomplish 3x more with proper collaboration tools.',
          triggerCondition: 'workflow_sharing_attempts > 0',
          emotion: 'neutral',
          urgencyLevel: 'high'
        }
      ]
    });

    this.shadowFeatures.set('advanced_analytics', {
      id: 'advanced_analytics',
      name: 'Advanced Analytics Reports',
      description: 'Deep insights into your automation performance, ROI tracking, and business impact',
      category: 'analytics',
      requiredPlan: 'growth',
      previewType: 'demo_data',
      upgradeBenefit: 'Understand your automation ROI and make data-driven decisions',
      previewInteractions: 0,
      upgradeConversionRate: 0,
      psychologicalTriggers: [
        {
          type: 'curiosity',
          message: 'Do you know the real ROI of your automation? Growth Mode users track $50K+ in value.',
          triggerCondition: 'usage_days >= 30',
          emotion: 'positive',
          urgencyLevel: 'medium'
        },
        {
          type: 'opportunity',
          message: 'Companies that measure automation ROI grow 40% faster. Start measuring today.',
          triggerCondition: 'revenue_generated > 1000',
          emotion: 'positive',
          urgencyLevel: 'high'
        }
      ]
    });

    this.shadowFeatures.set('custom_branding', {
      id: 'custom_branding',
      name: 'Custom Branding & White-label',
      description: 'Apply your company branding to workflows and share with clients',
      category: 'branding',
      requiredPlan: 'autopilot',
      previewType: 'template_view',
      upgradeBenefit: 'Present professional, branded automation to your clients',
      previewInteractions: 0,
      upgradeConversionRate: 0,
      psychologicalTriggers: [
        {
          type: 'status',
          message: 'Enterprise teams use custom branding to impress clients. Ready to level up?',
          triggerCondition: 'client_workflows > 0',
          emotion: 'positive',
          urgencyLevel: 'medium'
        }
      ]
    });

    logger.info('Initialized shadow features for psychological upgrade triggers');
  }

  async getAvailableShadowFeatures(tenantId: string, currentPlan: string): Promise<ShadowFeaturePreview[]> {
    const previews: ShadowFeaturePreview[] = [];
    const userProfile = await this.getUserPsychologicalProfile(tenantId);

    for (const feature of this.shadowFeatures.values()) {
      // Only show features that require a higher plan
      if (this.shouldShowFeature(feature, currentPlan, userProfile)) {
        const preview = await this.createFeaturePreview(tenantId, feature, userProfile);
        previews.push(preview);
      }
    }

    // Sort by psychological priority
    return previews.sort((a, b) => {
      const aPriority = this.calculatePsychologicalPriority(a.feature, userProfile);
      const bPriority = this.calculatePsychologicalPriority(b.feature, userProfile);
      return bPriority - aPriority;
    });
  }

  private shouldShowFeature(feature: ShadowFeature, currentPlan: string, userProfile: PsychologicalContext): boolean {
    // Don't show if user already has access
    if (currentPlan === 'autopilot') return false;
    if (currentPlan === 'growth' && feature.requiredPlan === 'growth') return false;

    // Check psychological triggers
    for (const trigger of feature.psychologicalTriggers) {
      if (this.evaluateTriggerCondition(trigger.triggerCondition, userProfile)) {
        return true;
      }
    }

    // Show based on user behavior patterns
    return this.shouldShowBasedOnBehavior(feature, userProfile);
  }

  private shouldShowBasedOnBehavior(feature: ShadowFeature, userProfile: PsychologicalContext): boolean {
    const interactions = userProfile.previousInteractions;
    
    // Show features related to user's current activities
    switch (feature.category) {
      case 'monitoring':
        return interactions.some(i => i.featureId.includes('monitoring') || i.interactionType === 'attempt_use');
      case 'integrations':
        return interactions.some(i => i.featureId.includes('integration') || i.interactionType === 'explore');
      case 'collaboration':
        return userProfile.userPersonas.includes('team_player') || 
               interactions.some(i => i.interactionType === 'share');
      case 'analytics':
        return userProfile.userPersonas.includes('data_driven') ||
               userProfile.decisionFactors.includes('roi');
      case 'branding':
        return userProfile.userPersonas.includes('enterprise') ||
               userProfile.decisionFactors.includes('professional_appearance');
      case 'support':
        return userProfile.emotionalState === 'frustrated' ||
               interactions.some(i => i.interactionType === 'view' && i.featureId.includes('support'));
      default:
        return false;
    }
  }

  private calculatePsychologicalPriority(feature: ShadowFeature, userProfile: PsychologicalContext): number {
    let priority = 0;

    // Base priority by category
    const categoryPriorities = {
      monitoring: 8,
      integrations: 7,
      collaboration: 6,
      analytics: 7,
      branding: 5,
      support: 9 // High priority for frustrated users
    };

    priority += categoryPriorities[feature.category] || 5;

    // Adjust based on user emotional state
    if (userProfile.emotionalState === 'frustrated' && feature.category === 'support') {
      priority += 3;
    }
    if (userProfile.emotionalState === 'ambitious' && feature.category === 'analytics') {
      priority += 2;
    }
    if (userProfile.emotionalState === 'time_pressed' && feature.category === 'integrations') {
      priority += 2;
    }

    // Adjust based on previous interactions
    const featureInteractions = userProfile.previousInteractions.filter(i => i.featureId === feature.id);
    if (featureInteractions.length > 0) {
      priority += featureInteractions.length * 0.5; // Increase priority for engaged users
    }

    // Adjust based on conversion probability
    priority += userProfile.conversionProbability * 2;

    return priority;
  }

  private async createFeaturePreview(tenantId: string, feature: ShadowFeature, userProfile: PsychologicalContext): Promise<ShadowFeaturePreview> {
    const previewContent = await this.generatePreviewContent(feature, userProfile);
    const upgradePrompt = await this.generateUpgradePrompt(feature, userProfile);
    const psychologicalContext = await this.enhancePsychologicalContext(feature, userProfile);

    return {
      feature,
      isAccessible: true, // Always accessible for preview
      previewContent,
      upgradePrompt,
      psychologicalContext
    };
  }

  private async generatePreviewContent(feature: ShadowFeature, userProfile: PsychologicalContext): Promise<any> {
    switch (feature.previewType) {
      case 'demo_data':
        return this.generateDemoData(feature);
      case 'template_view':
        return this.generateTemplateView(feature);
      case 'read_only':
        return this.generateReadOnlyView(feature);
      case 'limited_functionality':
        return this.generateLimitedFunctionality(feature);
      default:
        return {};
    }
  }

  private generateDemoData(feature: ShadowFeature): any {
    const demoDataTemplates = {
      advanced_monitoring: {
        metrics: {
          successRate: 98.7,
          avgExecutionTime: 2.3,
          errorRate: 0.3,
          costSavings: 1247.89,
          uptime: 99.9
        },
        alerts: [
          { type: 'performance', message: 'Workflow "Customer Onboarding" running 20% slower than usual', severity: 'warning' },
          { type: 'anomaly', message: 'Unusual spike in API calls to payment system', severity: 'info' },
          { type: 'success', message: 'All critical workflows performing optimally', severity: 'success' }
        ],
        charts: {
          performance: [95, 97, 96, 98, 99, 97, 98],
          errors: [2, 1, 3, 1, 0, 1, 0],
          volume: [120, 135, 128, 142, 156, 148, 163]
        }
      },
      team_collaboration: {
        teamMembers: [
          { name: 'Sarah Chen', role: 'Developer', activeWorkflows: 12, lastActive: '2 hours ago' },
          { name: 'Mike Johnson', role: 'Ops Manager', activeWorkflows: 8, lastActive: '1 hour ago' },
          { name: 'Lisa Wang', role: 'Data Analyst', activeWorkflows: 15, lastActive: '30 minutes ago' }
        ],
        sharedWorkflows: [
          { name: 'Customer Data Sync', sharedBy: 'Sarah Chen', usage: 45, team: 'Sales' },
          { name: 'Invoice Processing', sharedBy: 'Mike Johnson', usage: 128, team: 'Finance' },
          { name: 'Report Generation', sharedBy: 'Lisa Wang', usage: 67, team: 'Analytics' }
        ],
        activityFeed: [
          { user: 'Sarah Chen', action: 'shared workflow', target: 'Customer Data Sync', time: '1 hour ago' },
          { user: 'Mike Johnson', action: 'commented on', target: 'Invoice Processing', time: '3 hours ago' },
          { user: 'Lisa Wang', action: 'created', target: 'Weekly Reports', time: '5 hours ago' }
        ]
      },
      advanced_analytics: {
        roiMetrics: {
          totalValueGenerated: 45678.90,
          monthlySavings: 3456.78,
          timeSaved: 234, // hours
          errorPrevention: 45,
          automationRate: 78
        },
        trends: {
          valueGrowth: [1200, 1450, 1680, 1920, 2340, 2670, 3120],
          efficiencyGains: [15, 18, 22, 25, 28, 32, 35],
          costReduction: [890, 1020, 1180, 1350, 1480, 1620, 1890]
        },
        insights: [
          'Your automation ROI increased 23% this month',
          'Peak efficiency hours: 9AM - 11AM',
          'Most valuable workflow: Customer Onboarding ($2,340/month)',
          'Opportunity: Invoice processing could save 15 more hours/month'
        ]
      }
    };

    return demoDataTemplates[feature.id as keyof typeof demoDataTemplates] || {};
  }

  private generateTemplateView(feature: ShadowFeature): any {
    const templates = {
      custom_integrations: {
        availableTemplates: [
          { name: 'Salesforce Connector', category: 'CRM', complexity: 'medium', estimatedTime: '2 hours' },
          { name: 'Shopify Webhook Handler', category: 'E-commerce', complexity: 'easy', estimatedTime: '30 minutes' },
          { name: 'Slack Bot Integration', category: 'Communication', complexity: 'easy', estimatedTime: '45 minutes' },
          { name: 'QuickBooks Sync', category: 'Accounting', complexity: 'hard', estimatedTime: '4 hours' }
        ],
        builderPreview: {
          steps: ['Trigger', 'Authentication', 'Data Mapping', 'Transformation', 'Action'],
          availableConnectors: ['REST API', 'Webhook', 'Database', 'File', 'Email'],
          sampleFlow: {
            trigger: 'New Customer in Salesforce',
            actions: ['Check ERP System', 'Create Invoice', 'Send Slack Notification'],
            estimatedSavings: '3 hours per customer'
          }
        }
      },
      custom_branding: {
        brandElements: {
          logo: 'Your Company Logo',
          colors: ['#1a73e8', '#34a853', '#fbbc04', '#ea4335'],
          fonts: ['Inter', 'Roboto', 'Open Sans'],
          layout: 'Professional Dashboard Layout'
        },
        previewWorkflows: [
          { name: 'Client Onboarding', branded: true, clientFacing: true },
          { name: 'Monthly Reports', branded: true, clientFacing: true },
          { name: 'Data Processing', branded: false, internal: true }
        ],
        whiteLabelOptions: [
          'Remove Torqvio branding',
          'Add your company logo',
          'Custom color scheme',
          'Custom domain support',
          'Client portal access'
        ]
      }
    };

    return templates[feature.id as keyof typeof templates] || {};
  }

  private generateReadOnlyView(feature: ShadowFeature): any {
    const readOnlyViews = {
      priority_support: {
        currentQueue: {
          position: 3,
          estimatedWaitTime: '45 minutes',
          priorityLevel: 'Standard'
        },
        priorityQueue: {
          position: 1,
          estimatedWaitTime: '5 minutes',
          priorityLevel: 'Priority',
          features: ['Direct line to senior support', '24/7 availability', 'Screen sharing support']
        },
        supportHistory: [
          { ticket: '#1234', status: 'resolved', waitTime: '2 hours', satisfaction: 4.5 },
          { ticket: '#1235', status: 'in progress', waitTime: '1 hour 30 minutes', satisfaction: null }
        ]
      }
    };

    return readOnlyViews[feature.id as keyof typeof readOnlyViews] || {};
  }

  private generateLimitedFunctionality(feature: ShadowFeature): any {
    // Return limited version of the feature
    return {
      limitedAccess: true,
      availableActions: ['View', 'Explore'],
      restrictedActions: ['Create', 'Edit', 'Delete', 'Share'],
      upgradeMessage: 'Upgrade to unlock full functionality'
    };
  }

  private async generateUpgradePrompt(feature: ShadowFeature, userProfile: PsychologicalContext): Promise<UpgradePrompt> {
    const trigger = this.selectBestTrigger(feature, userProfile);
    
    let title = `Unlock ${feature.name}`;
    let message = trigger.message;
    let urgencyMessage = '';
    let socialProof = '';
    let ctaUrgency = trigger.urgencyLevel;

    // Add social proof based on feature
    if (feature.category === 'monitoring') {
      socialProof = '87% of Growth Mode users report catching issues 2x faster';
    } else if (feature.category === 'integrations') {
      socialProof = 'Teams with custom integrations save 15+ hours per week';
    } else if (feature.category === 'collaboration') {
      socialProof = 'Teams using collaboration features see 3x productivity gains';
    }

    // Add urgency based on emotional state
    if (userProfile.emotionalState === 'frustrated') {
      urgencyMessage = 'Don\'t let these issues slow down your progress another day';
      ctaUrgency = 'high';
    } else if (userProfile.emotionalState === 'ambitious') {
      urgencyMessage = 'Top teams are already using these features to get ahead';
      ctaUrgency = 'medium';
    }

    const benefits = [feature.upgradeBenefit];
    
    // Add specific benefits based on feature
    if (feature.requiredPlan === 'growth') {
      benefits.push('Unlimited workflows and executions', 'Advanced AI optimization', 'Priority email support');
    } else if (feature.requiredPlan === 'autopilot') {
      benefits.push('Zero upfront cost', 'All features included', 'Dedicated support');
    }

    return {
      title,
      message,
      benefits,
      socialProof,
      urgencyMessage,
      ctaText: this.getUpgradeCTA(feature, ctaUrgency),
      ctaUrgency
    };
  }

  private selectBestTrigger(feature: ShadowFeature, userProfile: PsychologicalContext): PsychologicalTrigger {
    // Find the trigger that best matches the user's current state
    let bestTrigger = feature.psychologicalTriggers[0];
    let bestScore = 0;

    for (const trigger of feature.psychologicalTriggers) {
      let score = 0;

      // Score based on emotional state match
      if (userProfile.emotionalState === 'frustrated' && trigger.emotion === 'negative') score += 3;
      if (userProfile.emotionalState === 'ambitious' && trigger.emotion === 'positive') score += 2;
      if (userProfile.emotionalState === 'time_pressed' && trigger.type === 'efficiency') score += 3;

      // Score based on urgency
      if (trigger.urgencyLevel === 'high') score += 2;
      if (trigger.urgencyLevel === 'critical') score += 3;

      // Score based on condition match
      if (this.evaluateTriggerCondition(trigger.triggerCondition, userProfile)) score += 2;

      if (score > bestScore) {
        bestScore = score;
        bestTrigger = trigger;
      }
    }

    return bestTrigger;
  }

  private getUpgradeCTA(feature: ShadowFeature, urgency: string): string {
    const ctas = {
      growth: {
        low: 'Explore Growth Mode',
        medium: 'Start Growing',
        high: 'Upgrade to Growth',
        critical: 'Unlock Growth Features Now'
      },
      autopilot: {
        low: 'Learn about Autopilot',
        medium: 'Try Autopilot Mode',
        high: 'Activate Autopilot',
        critical: 'Enable Autopilot Now'
      }
    };

    return ctas[feature.requiredPlan as keyof typeof ctas]?.[urgency as keyof typeof ctas.growth] || 'Upgrade';
  }

  private async enhancePsychologicalContext(feature: ShadowFeature, userProfile: PsychologicalContext): Promise<PsychologicalContext> {
    // Enhance context based on specific feature
    const enhancedContext = { ...userProfile };

    // Add feature-specific decision factors
    if (feature.category === 'monitoring') {
      enhancedContext.decisionFactors.push('reliability', 'proactive_support');
    } else if (feature.category === 'integrations') {
      enhancedContext.decisionFactors.push('efficiency', 'scalability');
    } else if (feature.category === 'collaboration') {
      enhancedContext.decisionFactors.push('team_productivity', 'knowledge_sharing');
    }

    // Update conversion probability based on feature engagement
    const featureInteractions = userProfile.previousInteractions.filter(i => i.featureId === feature.id);
    const engagementScore = featureInteractions.length;
    enhancedContext.conversionProbability = Math.min(0.9, userProfile.conversionProbability + engagementScore * 0.1);

    return enhancedContext;
  }

  private async getUserPsychologicalProfile(tenantId: string): Promise<PsychologicalContext> {
    const existing = this.userProfiles.get(tenantId);
    
    if (existing) {
      return existing;
    }

    // Create new profile with defaults
    const newProfile: PsychologicalContext = {
      userPersonas: ['developer'],
      emotionalState: 'exploring',
      decisionFactors: ['cost', 'ease_of_use'],
      previousInteractions: [],
      conversionProbability: 0.3
    };

    this.userProfiles.set(tenantId, newProfile);
    return newProfile;
  }

  private evaluateTriggerCondition(condition: string, userProfile: PsychologicalContext): boolean {
    // Simplified condition evaluation
    const context = {
      workflow_count: userProfile.previousInteractions.filter(i => i.interactionType === 'view').length,
      error_rate: 0.1, // Mock value
      support_tickets: userProfile.previousInteractions.filter(i => i.featureId.includes('support')).length,
      manual_processes: 5, // Mock value
      integrations_count: userProfile.previousInteractions.filter(i => i.category === 'integrations').length,
      usage_days: Math.floor((Date.now() - userProfile.previousInteractions[0]?.timestamp?.getTime() || 0) / (24 * 60 * 60 * 1000)),
      revenue_generated: 1000, // Mock value
      team_members: userProfile.userPersonas.includes('team_player') ? 5 : 1,
      workflow_sharing_attempts: userProfile.previousInteractions.filter(i => i.interactionType === 'share').length,
      client_workflows: userProfile.userPersonas.includes('enterprise') ? 3 : 0
    };

    try {
      let evalCondition = condition;
      for (const [key, value] of Object.entries(context)) {
        evalCondition = evalCondition.replace(new RegExp(key, 'g'), value.toString());
      }
      return eval(evalCondition);
    } catch (error) {
      logger.error(`Failed to evaluate trigger condition: ${condition}`, error);
      return false;
    }
  }

  async trackFeatureInteraction(tenantId: string, featureId: string, interactionType: ShadowFeatureInteraction['interactionType'], metadata?: any): Promise<void> {
    const interaction: ShadowFeatureInteraction = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      featureId,
      interactionType,
      timestamp: new Date(),
      metadata
    };

    if (!this.interactions.has(tenantId)) {
      this.interactions.set(tenantId, []);
    }
    
    this.interactions.get(tenantId)!.push(interaction);

    // Update feature interaction count
    const feature = this.shadowFeatures.get(featureId);
    if (feature) {
      feature.previewInteractions++;
    }

    // Update user profile
    await this.updateUserProfile(tenantId, interaction);

    logger.info(`Tracked shadow feature interaction: ${tenantId} -> ${featureId} (${interactionType})`);
  }

  private async updateUserProfile(tenantId: string, interaction: ShadowFeatureInteraction): Promise<void> {
    const profile = await this.getUserPsychologicalProfile(tenantId);
    profile.previousInteractions.push(interaction);

    // Update emotional state based on interactions
    if (interaction.interactionType === 'attempt_use' && interaction.featureId.includes('support')) {
      profile.emotionalState = 'frustrated';
    } else if (interaction.interactionType === 'explore' && interaction.featureId.includes('analytics')) {
      profile.emotionalState = 'ambitious';
    } else if (interaction.interactionType === 'view' && interaction.duration && interaction.duration < 30000) {
      profile.emotionalState = 'time_pressed';
    }

    // Update conversion probability
    const totalInteractions = profile.previousInteractions.length;
    const attemptUseInteractions = profile.previousInteractions.filter(i => i.interactionType === 'attempt_use').length;
    profile.conversionProbability = Math.min(0.9, (attemptUseInteractions / Math.max(totalInteractions, 1)) * 2);

    this.userProfiles.set(tenantId, profile);
  }

  async getFeatureAnalytics(tenantId: string): Promise<{
    totalInteractions: number;
    featureEngagement: Record<string, number>;
    conversionSignals: string[];
    recommendedActions: string[];
  }> {
    const interactions = this.interactions.get(tenantId) || [];
    
    const featureEngagement = interactions.reduce((engagement, interaction) => {
      engagement[interaction.featureId] = (engagement[interaction.featureId] || 0) + 1;
      return engagement;
    }, {} as Record<string, number>);

    const conversionSignals = this.identifyConversionSignals(interactions);
    const recommendedActions = this.generateRecommendedActions(interactions);

    return {
      totalInteractions: interactions.length,
      featureEngagement,
      conversionSignals,
      recommendedActions
    };
  }

  private identifyConversionSignals(interactions: ShadowFeatureInteraction[]): string[] {
    const signals: string[] = [];
    
    const attemptUseCount = interactions.filter(i => i.interactionType === 'attempt_use').length;
    const exploreCount = interactions.filter(i => i.interactionType === 'explore').length;
    const shareCount = interactions.filter(i => i.interactionType === 'share').length;

    if (attemptUseCount > 3) signals.push('High intent to use premium features');
    if (exploreCount > 5) signals.push('Strong curiosity about advanced capabilities');
    if (shareCount > 0) signals.push('Team collaboration needs identified');
    if (interactions.some(i => i.featureId.includes('support'))) signals.push('Support limitations encountered');

    return signals;
  }

  private generateRecommendedActions(interactions: ShadowFeatureInteraction[]): string[] {
    const actions: string[] = [];
    
    const mostViewedFeature = this.getMostViewedFeature(interactions);
    if (mostViewedFeature) {
      actions.push(`Highlight ${mostViewedFeature} in next upgrade prompt`);
    }

    const frustratedUser = interactions.some(i => i.featureId.includes('support'));
    if (frustratedUser) {
      actions.push('Emphasize priority support in Growth Mode');
    }

    const teamUser = interactions.some(i => i.interactionType === 'share');
    if (teamUser) {
      actions.push('Show team collaboration benefits');
    }

    return actions;
  }

  private getMostViewedFeature(interactions: ShadowFeatureInteraction[]): string | null {
    const featureCounts = interactions.reduce((counts, interaction) => {
      if (interaction.interactionType === 'view') {
        counts[interaction.featureId] = (counts[interaction.featureId] || 0) + 1;
      }
      return counts;
    }, {} as Record<string, number>);

    let mostViewed = null;
    let maxCount = 0;

    for (const [featureId, count] of Object.entries(featureCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostViewed = featureId;
      }
    }

    return mostViewed;
  }
}
