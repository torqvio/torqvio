import { logger } from '../utils/logger.js';

export interface PsychologicalMessage {
  id: string;
  tenantId: string;
  type: 'urgency' | 'scarcity' | 'social_proof' | 'authority' | 'loss_aversion' | 'opportunity' | 'status' | 'fear';
  title: string;
  message: string;
  emotionalWeight: number; // 0-1 impact on emotions
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  timingTrigger: TimingTrigger;
  personalizationFactors: PersonalizationFactor[];
  visualElements: VisualElement[];
  callToAction: CallToAction;
  psychologicalMechanism: PsychologicalMechanism;
  timestamp: Date;
  status: 'pending' | 'shown' | 'clicked' | 'dismissed' | 'converted';
  effectiveness: number; // 0-1 measure of effectiveness
}

export interface TimingTrigger {
  type: 'immediate' | 'delayed' | 'behavioral' | 'seasonal' | 'milestone';
  condition: string;
  delay?: number; // Minutes/hours to wait
  optimalTiming: string[]; // Best times to show
  avoidTimes: string[]; // Times to avoid showing
}

export interface PersonalizationFactor {
  type: 'usage_pattern' | 'value_generated' | 'team_size' | 'industry' | 'emotional_state' | 'decision_speed';
  factor: string;
  weight: number; // How much this factor influences the message
  adaptation: string; // How the message adapts based on this factor
}

export interface VisualElement {
  type: 'progress_bar' | 'countdown_timer' | 'comparison_chart' | 'testimonial' | 'badge' | 'alert';
  content: any;
  emotionalImpact: number; // 0-1 visual emotional impact
  position: 'header' | 'body' | 'sidebar' | 'footer' | 'modal';
  animation?: 'pulse' | 'slide' | 'fade' | 'bounce';
}

export interface CallToAction {
  text: string;
  urgency: 'calm' | 'friendly' | 'urgent' | 'critical' | 'medium';
  color: string;
  size: 'small' | 'medium' | 'large';
  position: 'inline' | 'sticky' | 'modal';
  psychologicalTrigger: string;
}

export interface PsychologicalMechanism {
  primary: 'loss_aversion' | 'social_proof' | 'authority_bias' | 'scarcity_effect' | 'anchoring' | 'reciprocity';
  secondary?: 'commitment_consistency' | 'liking' | 'social_influence' | 'authority';
  cognitiveBias: string;
  emotionalLeverage: number; // 0-1 emotional leverage
  decisionInfluence: number; // 0-1 influence on decision
}

export interface UrgencyCampaign {
  id: string;
  name: string;
  targetSegment: string;
  psychologicalAngle: string;
  messages: PsychologicalMessage[];
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics: CampaignMetrics;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
  clickThroughRate: number;
  psychologicalImpact: number; // Average emotional impact
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: 'upgrade' | 'retention' | 'engagement' | 'reactivation';
  psychologicalAngle: string;
  baseMessage: string;
  variables: MessageVariable[];
  visualElements: VisualElement[];
  callToAction: CallToAction;
  effectiveness: number;
  usageCount: number;
}

export interface MessageVariable {
  name: string;
  type: 'metric' | 'text' | 'number' | 'percentage' | 'currency';
  source: string; // Where to get the value
  formatting: string; // How to format the value
  emotionalWeight: number;
}

export class AcceleratorPsychologicalMessagingService {
  private messageTemplates: Map<string, MessageTemplate> = new Map();
  private activeCampaigns: Map<string, UrgencyCampaign> = new Map();
  private messageHistory: Map<string, PsychologicalMessage[]> = new Map();
  private userPsychProfiles: Map<string, UserPsychProfile> = new Map();
  
  constructor() {
    this.initializeMessageTemplates();
  }

  private initializeMessageTemplates() {
    // Upgrade urgency templates
    this.messageTemplates.set('usage_limit_urgency', {
      id: 'usage_limit_urgency',
      name: 'Usage Limit Urgency',
      category: 'upgrade',
      psychologicalAngle: 'loss_aversion + scarcity',
      baseMessage: 'You\'re using {{percentage_used}}% of your {{limit_type}} limit. In {{time_remaining}}, your workflows could stop running.',
      variables: [
        { name: 'percentage_used', type: 'percentage', source: 'usage.percentage_used', formatting: '0%', emotionalWeight: 0.8 },
        { name: 'limit_type', type: 'text', source: 'limit.type', formatting: 'capitalize', emotionalWeight: 0.3 },
        { name: 'time_remaining', type: 'text', source: 'time.until_limit', formatting: 'duration', emotionalWeight: 0.9 }
      ],
      visualElements: [
        {
          type: 'progress_bar',
          content: { progress: '{{percentage_used}}', color: 'red' },
          emotionalImpact: 0.7,
          position: 'header',
          animation: 'pulse'
        },
        {
          type: 'countdown_timer',
          content: { endTime: '{{limit_reached_time}}' },
          emotionalImpact: 0.9,
          position: 'body',
          animation: 'slide'
        }
      ],
      callToAction: {
        text: 'Upgrade Now to Continue',
        urgency: 'critical',
        color: '#ef4444',
        size: 'large',
        position: 'modal',
        psychologicalTrigger: 'fear_of_loss'
      },
      effectiveness: 0.85,
      usageCount: 0
    });

    // Social proof templates
    this.messageTemplates.set('peer_success_social_proof', {
      id: 'peer_success_social_proof',
      name: 'Peer Success Social Proof',
      category: 'upgrade',
      psychologicalAngle: 'social_proof + authority',
      baseMessage: '{{peer_count}} companies like yours upgraded to Growth Mode and increased their automation ROI by {{roi_increase}}%.',
      variables: [
        { name: 'peer_count', type: 'number', source: 'peers.upgraded_count', formatting: 'number', emotionalWeight: 0.6 },
        { name: 'roi_increase', type: 'percentage', source: 'peers.avg_roi_increase', formatting: '+0%', emotionalWeight: 0.7 }
      ],
      visualElements: [
        {
          type: 'comparison_chart',
          content: { before: 100, after: 250, metric: 'ROI' },
          emotionalImpact: 0.6,
          position: 'body'
        },
        {
          type: 'testimonial',
          content: { company: '{{similar_company}}', quote: 'Growth Mode transformed our automation' },
          emotionalImpact: 0.8,
          position: 'sidebar'
        }
      ],
      callToAction: {
        text: 'Join Successful Teams',
        urgency: 'friendly',
        color: '#10b981',
        size: 'medium',
        position: 'inline',
        psychologicalTrigger: 'fear_of_missing_out'
      },
      effectiveness: 0.72,
      usageCount: 0
    });

    // Opportunity cost templates
    this.messageTemplates.set('opportunity_cost_urgency', {
      id: 'opportunity_cost_urgency',
      name: 'Opportunity Cost Urgency',
      category: 'upgrade',
      psychologicalAngle: 'opportunity_cost + loss_aversion',
      baseMessage: 'Every day you wait, you\'re losing {{daily_loss}} in potential savings. That\'s {{monthly_loss}} this month alone.',
      variables: [
        { name: 'daily_loss', type: 'currency', source: 'value.daily_opportunity_cost', formatting: '$0', emotionalWeight: 0.8 },
        { name: 'monthly_loss', type: 'currency', source: 'value.monthly_opportunity_cost', formatting: '$0', emotionalWeight: 0.9 }
      ],
      visualElements: [
        {
          type: 'comparison_chart',
          content: { current: 0, potential: '{{monthly_savings}}', metric: 'Monthly Savings' },
          emotionalImpact: 0.7,
          position: 'header',
          animation: 'slide'
        },
        {
          type: 'alert',
          content: { type: 'warning', message: 'Money leaking daily' },
          emotionalImpact: 0.8,
          position: 'body',
          animation: 'pulse'
        }
      ],
      callToAction: {
        text: 'Stop Losing Money Today',
        urgency: 'urgent',
        color: '#f59e0b',
        size: 'large',
        position: 'sticky',
        psychologicalTrigger: 'loss_aversion'
      },
      effectiveness: 0.78,
      usageCount: 0
    });

    // Status and achievement templates
    this.messageTemplates.set('achievement_unlock', {
      id: 'achievement_unlock',
      name: 'Achievement Unlock',
      category: 'engagement',
      psychologicalAngle: 'status + achievement',
      baseMessage: 'Congratulations! You\'ve unlocked {{achievement_name}}. You\'re now in the top {{percentile}}% of users.',
      variables: [
        { name: 'achievement_name', type: 'text', source: 'achievement.name', formatting: 'capitalize', emotionalWeight: 0.6 },
        { name: 'percentile', type: 'percentage', source: 'user.percentile', formatting: 'top 0%', emotionalWeight: 0.8 }
      ],
      visualElements: [
        {
          type: 'badge',
          content: { icon: 'trophy', text: '{{achievement_name}}', color: 'gold' },
          emotionalImpact: 0.9,
          position: 'header',
          animation: 'bounce'
        },
        {
          type: 'progress_bar',
          content: { progress: '{{percentile}}', color: 'gold' },
          emotionalImpact: 0.6,
          position: 'body'
        }
      ],
      callToAction: {
        text: 'Share Your Achievement',
        urgency: 'friendly',
        color: '#8b5cf6',
        size: 'medium',
        position: 'inline',
        psychologicalTrigger: 'status_seeking'
      },
      effectiveness: 0.65,
      usageCount: 0
    });

    // Milestone urgency templates
    this.messageTemplates.set('milestone_urgency', {
      id: 'milestone_urgency',
      name: 'Milestone Urgency',
      category: 'upgrade',
      psychologicalAngle: 'milestone + opportunity',
      baseMessage: 'You\'ve been using Torqvio for {{days_used}} days! Here\'s a special milestone offer: {{discount}} off Growth Mode.',
      variables: [
        { name: 'days_used', type: 'number', source: 'user.days_since_signup', formatting: '0', emotionalWeight: 0.4 },
        { name: 'discount', type: 'percentage', source: 'offer.discount', formatting: '0%', emotionalWeight: 0.8 }
      ],
      visualElements: [
        {
          type: 'badge',
          content: { icon: 'calendar', text: '{{days_used}} Days', color: 'blue' },
          emotionalImpact: 0.5,
          position: 'header'
        },
        {
          type: 'alert',
          content: { type: 'success', message: 'Limited time milestone offer' },
          emotionalImpact: 0.7,
          position: 'body',
          animation: 'fade'
        }
      ],
      callToAction: {
        text: 'Claim Your Milestone Discount',
        urgency: 'medium',
        color: '#3b82f6',
        size: 'medium',
        position: 'modal',
        psychologicalTrigger: 'reciprocity'
      },
      effectiveness: 0.70,
      usageCount: 0
    });

    logger.info('Initialized psychological message templates');
  }

  async generatePersonalizedMessage(
    tenantId: string,
    templateId: string,
    context: any,
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<PsychologicalMessage> {
    const template = this.messageTemplates.get(templateId);
    if (!template) {
      throw new Error(`Message template not found: ${templateId}`);
    }

    const psychProfile = await this.getUserPsychProfile(tenantId);
    const personalizedContent = await this.personalizeMessage(template, context, psychProfile);
    const optimalTiming = await this.calculateOptimalTiming(template, psychProfile);

    const message: PsychologicalMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      type: this.getMessageType(template.psychologicalAngle),
      title: personalizedContent.title,
      message: personalizedContent.message,
      emotionalWeight: this.calculateEmotionalWeight(template, psychProfile),
      urgencyLevel,
      timingTrigger: optimalTiming,
      personalizationFactors: this.extractPersonalizationFactors(template, context),
      visualElements: personalizedContent.visualElements,
      callToAction: personalizedContent.callToAction,
      psychologicalMechanism: this.extractPsychologicalMechanism(template),
      timestamp: new Date(),
      status: 'pending',
      effectiveness: template.effectiveness
    };

    // Store message
    await this.storeMessage(tenantId, message);

    return message;
  }

  private async personalizeMessage(
    template: MessageTemplate,
    context: any,
    psychProfile: UserPsychProfile
  ): Promise<any> {
    let message = template.baseMessage;
    let title = template.name;

    // Replace variables
    for (const variable of template.variables) {
      const value = this.getVariableValue(variable, context);
      const formattedValue = this.formatVariableValue(variable, value);
      
      message = message.replace(new RegExp(`{{${variable.name}}}`, 'g'), formattedValue);
      title = title.replace(new RegExp(`{{${variable.name}}}`, 'g'), formattedValue);
    }

    // Adapt visual elements based on psychological profile
    const adaptedVisuals = template.visualElements.map(element => 
      this.adaptVisualElement(element, psychProfile)
    );

    // Adapt CTA based on urgency and profile
    const adaptedCTA = this.adaptCallToAction(template.callToAction, psychProfile);

    return {
      title,
      message,
      visualElements: adaptedVisuals,
      callToAction: adaptedCTA
    };
  }

  private getVariableValue(variable: MessageVariable, context: any): any {
    const parts = variable.source.split('.');
    let value = context;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value ?? 0;
  }

  private formatVariableValue(variable: MessageVariable, value: any): string {
    switch (variable.type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return new Intl.NumberFormat('en-US', { style: 'percent' }).format(value);
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      case 'text':
        return variable.formatting === 'capitalize' ? 
          value.charAt(0).toUpperCase() + value.slice(1) : value;
      default:
        return value.toString();
    }
  }

  private adaptVisualElement(element: VisualElement, profile: UserPsychProfile): VisualElement {
    const adapted = { ...element };

    // Adjust emotional impact based on user profile
    if (profile.emotionalSensitivity === 'high') {
      adapted.emotionalImpact = Math.min(1, element.emotionalImpact * 1.2);
    } else if (profile.emotionalSensitivity === 'low') {
      adapted.emotionalImpact = element.emotionalImpact * 0.8;
    }

    // Add animation for high-urgency users
    if (profile.urgencyResponse === 'high' && !adapted.animation) {
      adapted.animation = 'pulse';
    }

    return adapted;
  }

  private adaptCallToAction(cta: CallToAction, profile: UserPsychProfile): CallToAction {
    const adapted = { ...cta };

    // Adjust urgency based on profile
    if (profile.urgencyResponse === 'high') {
      adapted.urgency = adapted.urgency === 'calm' ? 'friendly' : 
                      adapted.urgency === 'friendly' ? 'urgent' : 'critical';
    }

    // Adjust size based on decision speed
    if (profile.decisionSpeed === 'slow') {
      adapted.size = adapted.size === 'small' ? 'medium' : 'large';
    }

    return adapted;
  }

  private calculateEmotionalWeight(template: MessageTemplate, profile: UserPsychProfile): number {
    let weight = template.effectiveness;

    // Adjust based on emotional sensitivity
    if (profile.emotionalSensitivity === 'high') {
      weight *= 1.2;
    } else if (profile.emotionalSensitivity === 'low') {
      weight *= 0.8;
    }

    // Adjust based on current emotional state
    if (profile.currentEmotionalState === 'frustrated' && template.category === 'upgrade') {
      weight *= 1.3;
    }

    return Math.min(1, weight);
  }

  private async calculateOptimalTiming(template: MessageTemplate, profile: UserPsychProfile): Promise<TimingTrigger> {
    // Calculate optimal timing based on user patterns
    const optimalTimes = this.getOptimalTimesForUser(profile);
    const avoidTimes = this.getAvoidTimesForUser(profile);

    return {
      type: 'behavioral',
      condition: 'user_active && low_cognitive_load',
      optimalTiming: optimalTimes,
      avoidTimes,
      delay: profile.decisionSpeed === 'slow' ? 30 : 5 // 30 min for slow deciders, 5 min for fast
    };
  }

  private getOptimalTimesForUser(profile: UserPsychProfile): string[] {
    // Return optimal times based on user behavior patterns
    if (profile.peakProductivityHours.includes('morning')) {
      return ['9:00-11:00', '14:00-16:00'];
    } else if (profile.peakProductivityHours.includes('evening')) {
      return ['16:00-18:00', '19:00-21:00'];
    }
    
    return ['10:00-12:00', '15:00-17:00'];
  }

  private getAvoidTimesForUser(profile: UserPsychProfile): string[] {
    // Avoid times when user is typically less responsive
    const avoidTimes = ['06:00-09:00', '22:00-06:00']; // Early morning and late night
    
    if (profile.meetingHeavy) {
      avoidTimes.push('13:00-14:00'); // Lunch meeting time
    }
    
    return avoidTimes;
  }

  private extractPersonalizationFactors(template: MessageTemplate, context: any): PersonalizationFactor[] {
    return template.variables.map(variable => ({
      type: this.mapVariableTypeToPersonalization(variable.type),
      factor: variable.name,
      weight: variable.emotionalWeight,
      adaptation: `Message adapts based on ${variable.name}`
    }));
  }

  private mapVariableTypeToPersonalization(type: string): PersonalizationFactor['type'] {
    const mapping = {
      'currency': 'value_generated',
      'percentage': 'usage_pattern',
      'number': 'team_size',
      'text': 'industry'
    };
    
    const result = mapping[type as keyof typeof mapping] || 'usage_pattern';
    return result as PersonalizationFactor['type'];
  }

  private extractPsychologicalMechanism(template: MessageTemplate): PsychologicalMechanism {
    const mechanisms = {
      'loss_aversion + scarcity': { primary: 'loss_aversion', secondary: 'scarcity_effect' },
      'social_proof + authority': { primary: 'social_proof', secondary: 'authority_bias' },
      'opportunity_cost + loss_aversion': { primary: 'loss_aversion', secondary: 'anchoring' },
      'status + achievement': { primary: 'social_proof', secondary: 'commitment_consistency' },
      'milestone + opportunity': { primary: 'reciprocity', secondary: 'social_influence' }
    };

    const mechanism = mechanisms[template.psychologicalAngle as keyof typeof mechanisms] || 
                    { primary: 'social_proof' as const };

    return {
      primary: mechanism.primary as any,
      secondary: mechanism.secondary as any,
      cognitiveBias: template.psychologicalAngle,
      emotionalLeverage: 0.7,
      decisionInfluence: 0.8
    };
  }

  private getMessageType(psychologicalAngle: string): PsychologicalMessage['type'] {
    if (psychologicalAngle.includes('loss_aversion') || psychologicalAngle.includes('scarcity')) {
      return 'urgency';
    } else if (psychologicalAngle.includes('social_proof')) {
      return 'social_proof';
    } else if (psychologicalAngle.includes('authority')) {
      return 'authority';
    } else if (psychologicalAngle.includes('opportunity')) {
      return 'opportunity';
    } else if (psychologicalAngle.includes('status')) {
      return 'status';
    } else if (psychologicalAngle.includes('fear')) {
      return 'fear';
    }
    
    return 'urgency';
  }

  private async getUserPsychProfile(tenantId: string): Promise<UserPsychProfile> {
    let profile = this.userPsychProfiles.get(tenantId);
    
    if (!profile) {
      profile = await this.createDefaultPsychProfile(tenantId);
      this.userPsychProfiles.set(tenantId, profile);
    }
    
    return profile;
  }

  private async createDefaultPsychProfile(tenantId: string): Promise<UserPsychProfile> {
    return {
      tenantId,
      emotionalSensitivity: 'medium',
      urgencyResponse: 'medium',
      decisionSpeed: 'medium',
      currentEmotionalState: 'neutral',
      peakProductivityHours: ['morning'],
      meetingHeavy: false,
      cognitiveLoadProfile: 'balanced',
      socialInfluenceSusceptibility: 'medium',
      lossAversionLevel: 'medium',
      achievementMotivation: 'medium'
    };
  }

  private async storeMessage(tenantId: string, message: PsychologicalMessage): Promise<void> {
    if (!this.messageHistory.has(tenantId)) {
      this.messageHistory.set(tenantId, []);
    }
    
    this.messageHistory.get(tenantId)!.push(message);
    
    logger.info(`Stored psychological message for tenant ${tenantId}: ${message.type}`);
  }

  async createUrgencyCampaign(
    name: string,
    targetSegment: string,
    psychologicalAngle: string,
    templateIds: string[],
    durationDays: number = 30
  ): Promise<UrgencyCampaign> {
    const campaign: UrgencyCampaign = {
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      targetSegment,
      psychologicalAngle,
      messages: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      status: 'draft',
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        clickThroughRate: 0,
        psychologicalImpact: 0
      }
    };

    this.activeCampaigns.set(campaign.id, campaign);
    
    logger.info(`Created urgency campaign: ${name}`);
    
    return campaign;
  }

  async updateMessageEffectiveness(messageId: string, effectiveness: number): Promise<void> {
    // Find and update message effectiveness
    for (const [tenantId, messages] of this.messageHistory.entries()) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        message.effectiveness = effectiveness;
        
        // Update template effectiveness
        const template = this.findTemplateForMessage(message);
        if (template) {
          template.effectiveness = (template.effectiveness + effectiveness) / 2;
          template.usageCount++;
        }
        
        logger.info(`Updated message effectiveness: ${messageId} -> ${effectiveness}`);
        break;
      }
    }
  }

  private findTemplateForMessage(message: PsychologicalMessage): MessageTemplate | null {
    for (const template of this.messageTemplates.values()) {
      if (template.name === message.title) {
        return template;
      }
    }
    return null;
  }

  async getMessageAnalytics(tenantId: string, days: number = 30): Promise<{
    totalMessages: number;
    averageEffectiveness: number;
    mostEffectiveType: string;
    psychologicalImpact: number;
    conversionCorrelation: number;
    recommendations: string[];
  }> {
    const messages = this.messageHistory.get(tenantId) || [];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentMessages = messages.filter(m => m.timestamp >= cutoffDate);

    const totalMessages = recentMessages.length;
    const averageEffectiveness = totalMessages > 0 ? 
      recentMessages.reduce((sum, m) => sum + m.effectiveness, 0) / totalMessages : 0;

    const typeEffectiveness = recentMessages.reduce((types, message) => {
      types[message.type] = (types[message.type] || []).concat(message.effectiveness);
      return types;
    }, {} as Record<string, number[]>);

    const mostEffectiveType = Object.entries(typeEffectiveness)
      .reduce((best, [type, effectivenesses]) => {
        const avg = effectivenesses.reduce((sum, e) => sum + e, 0) / effectivenesses.length;
        return avg > (best.avg || 0) ? { type, avg } : best;
      }, {} as { type: string; avg: number }).type || '';

    const psychologicalImpact = recentMessages.reduce((sum, m) => 
      sum + m.emotionalWeight, 0) / Math.max(totalMessages, 1);

    const convertedMessages = recentMessages.filter(m => m.status === 'converted');
    const conversionCorrelation = totalMessages > 0 ? convertedMessages.length / totalMessages : 0;

    const recommendations = this.generateMessageRecommendations(recentMessages, averageEffectiveness);

    return {
      totalMessages,
      averageEffectiveness,
      mostEffectiveType,
      psychologicalImpact,
      conversionCorrelation,
      recommendations
    };
  }

  private generateMessageRecommendations(messages: PsychologicalMessage[], avgEffectiveness: number): string[] {
    const recommendations: string[] = [];

    if (avgEffectiveness < 0.5) {
      recommendations.push('Consider revising message templates - low effectiveness detected');
    }

    const urgencyMessages = messages.filter(m => m.type === 'urgency');
    const urgencyEffectiveness = urgencyMessages.length > 0 ? 
      urgencyMessages.reduce((sum, m) => sum + m.effectiveness, 0) / urgencyMessages.length : 0;

    if (urgencyEffectiveness > 0.8) {
      recommendations.push('Urgency messages performing well - consider increasing frequency');
    } else if (urgencyEffectiveness < 0.4) {
      recommendations.push('Urgency messages underperforming - test different psychological angles');
    }

    const socialProofMessages = messages.filter(m => m.type === 'social_proof');
    if (socialProofMessages.length === 0) {
      recommendations.push('Consider adding social proof messages - currently missing');
    }

    return recommendations;
  }

  async updateUserPsychProfile(tenantId: string, updates: Partial<UserPsychProfile>): Promise<void> {
    const profile = await this.getUserPsychProfile(tenantId);
    const updated = { ...profile, ...updates };
    
    this.userPsychProfiles.set(tenantId, updated);
    
    logger.info(`Updated psychological profile for tenant ${tenantId}`);
  }
}

interface UserPsychProfile {
  tenantId: string;
  emotionalSensitivity: 'low' | 'medium' | 'high';
  urgencyResponse: 'low' | 'medium' | 'high';
  decisionSpeed: 'slow' | 'medium' | 'fast';
  currentEmotionalState: 'positive' | 'neutral' | 'negative' | 'frustrated' | 'ambitious';
  peakProductivityHours: string[];
  meetingHeavy: boolean;
  cognitiveLoadProfile: 'low' | 'balanced' | 'high';
  socialInfluenceSusceptibility: 'low' | 'medium' | 'high';
  lossAversionLevel: 'low' | 'medium' | 'high';
  achievementMotivation: 'low' | 'medium' | 'high';
}
