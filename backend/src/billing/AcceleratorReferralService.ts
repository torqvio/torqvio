import { logger } from '../utils/logger.js';

export interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  targetAudience: string;
  rewardStructure: RewardStructure;
  trackingConfig: TrackingConfig;
  psychologicalTriggers: PsychologicalTrigger[];
  performanceMetrics: ProgramMetrics;
}

export interface RewardStructure {
  advocateReward: {
    type: 'percentage' | 'fixed' | 'credit' | 'tiered';
    value: number;
    calculation: string;
    cap?: number;
    duration?: number; // Months
  };
  friendReward: {
    type: 'percentage' | 'fixed' | 'credit' | 'time';
    value: number;
    conditions: string[];
    duration?: number;
  };
  tieredRewards?: TieredReward[];
  bonusRewards: BonusReward[];
}

export interface TieredReward {
  tier: number;
  name: string;
  minReferrals: number;
  advocateReward: number;
  friendReward: number;
  multiplier: number;
  perks: string[];
}

export interface BonusReward {
  id: string;
  name: string;
  condition: string;
  reward: number;
  type: 'multiplier' | 'bonus' | 'perk';
  psychologicalAppeal: string;
}

export interface TrackingConfig {
  cookieDuration: number; // Days
  attributionModel: 'last_click' | 'first_click' | 'linear' | 'time_decay';
  trackingMethods: ('cookie' | 'url_param' | 'referral_code' | 'email_link')[];
  fraudDetection: FraudDetection;
  conversionEvents: ConversionEvent[];
}

export interface FraudDetection {
  ipTracking: boolean;
  deviceFingerprinting: boolean;
  behaviorAnalysis: boolean;
  suspiciousPatterns: SuspiciousPattern[];
  autoFlag: boolean;
  manualReview: boolean;
}

export interface SuspiciousPattern {
  pattern: string;
  threshold: number;
  action: 'flag' | 'block' | 'review';
  description: string;
}

export interface ConversionEvent {
  name: string;
  type: 'signup' | 'upgrade' | 'purchase' | 'activation';
  value: number;
  conditions: string[];
  trackingMethod: 'server' | 'client' | 'hybrid';
}

export interface PsychologicalTrigger {
  type: 'reciprocity' | 'social_proof' | 'scarcity' | 'authority' | 'achievement' | 'exclusivity';
  message: string;
  visualElements: string[];
  emotionalWeight: number;
  timing: string;
}

export interface ProgramMetrics {
  totalReferrals: number;
  successfulReferrals: number;
  conversionRate: number;
  averageReward: number;
  totalPayout: number;
  roi: number;
  advocateSatisfaction: number;
  friendSatisfaction: number;
  viralCoefficient: number;
  // Dominance plan enhancements
  weeklyGrowthRate: number;
  marketShareImpact: number;
  competitorConversionRate: number;
  loopVelocity: number;
  sustainabilityScore: number;
  acquisitionCost: number;
  lifetimeValue: number;
}

export interface Referral {
  id: string;
  advocateId: string;
  advocateEmail: string;
  friendId?: string;
  friendEmail?: string;
  referralCode: string;
  status: 'pending' | 'clicked' | 'signed_up' | 'converted' | 'rewarded' | 'expired' | 'fraud';
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  trackingData: TrackingData;
  conversionData?: ConversionData;
  rewardData?: RewardData;
  fraudScore: number; // 0-1 likelihood of fraud
  psychologicalProfile?: ReferralPsychProfile;
}

export interface TrackingData {
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  sessionId?: string;
  landingPage: string;
  referrer?: string;
  utmParams?: Record<string, string>;
  clickCount: number;
  lastActivity: Date;
  conversionPath: string[];
}

export interface ConversionData {
  eventType: string;
  eventTime: Date;
  value: number;
  plan?: string;
  subscriptionId?: string;
  attributionWindow: number; // Days from click to conversion
  touchpoints: Touchpoint[];
}

export interface Touchpoint {
  type: 'email' | 'social' | 'direct' | 'ad';
  timestamp: Date;
  channel: string;
  message: string;
  engagement: number;
}

export interface RewardData {
  advocateReward: number;
  friendReward: number;
  totalReward: number;
  status: 'pending' | 'processed' | 'paid' | 'expired';
  processedAt?: Date;
  paidAt?: Date;
  method: 'credit' | 'cash' | 'bank_transfer' | 'paypal';
  psychologicalImpact: number; // How rewarding it feels
}

export interface ReferralPsychProfile {
  motivation: 'financial' | 'social' | 'altruistic' | 'competitive' | 'mixed';
  communicationStyle: 'direct' | 'passive' | 'enthusiastic' | 'professional';
  socialInfluence: 'low' | 'medium' | 'high';
  techSavviness: 'low' | 'medium' | 'high';
  priceSensitivity: 'high' | 'medium' | 'low';
  personalityTraits: string[];
  recommendedMessaging: string[];
}

export interface ReferralCampaign {
  id: string;
  name: string;
  programId: string;
  targetSegment: string;
  psychologicalAngle: string;
  messaging: CampaignMessaging;
  incentives: CampaignIncentive[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  metrics: CampaignMetrics;
}

export interface CampaignMessaging {
  subject: string;
  body: string;
  psychologicalTriggers: string[];
  personalizationTokens: string[];
  visualElements: string[];
  callToAction: string;
  urgencyElements: string[];
}

export interface CampaignIncentive {
  type: 'bonus' | 'multiplier' | 'deadline' | 'exclusive';
  value: number;
  condition: string;
  duration?: number;
  scarcity: boolean;
  psychologicalAppeal: string;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  conversions: number;
  revenue: number;
  cost: number;
  roi: number;
  engagementRate: number;
  conversionRate: number;
}

export class AcceleratorReferralService {
  private programs: Map<string, ReferralProgram> = new Map();
  private referrals: Map<string, Referral> = new Map();
  private campaigns: Map<string, ReferralCampaign> = new Map();
  private advocateProfiles: Map<string, ReferralPsychProfile> = new Map();
  
  constructor() {
    this.initializeDefaultProgram();
  }

  private initializeDefaultProgram() {
    const defaultProgram: ReferralProgram = {
      id: 'default_referral_program',
      name: 'Torqvio Growth Ambassador',
      description: 'Share Torqvio with your network and earn rewards while helping others automate their success',
      status: 'active',
      startDate: new Date(),
      targetAudience: 'all_users',
      rewardStructure: {
        advocateReward: {
          type: 'tiered',
          value: 20, // Base 20%
          calculation: 'friend_first_year_revenue * 0.20',
          duration: 12,
          cap: 50000 // $50k annual cap
        },
        friendReward: {
          type: 'percentage',
          value: 20, // 20% discount
          conditions: ['first_purchase_only', 'new_customers_only'],
          duration: 6 // Extended to 6 months for dominance plan
        },
        tieredRewards: [
          {
            tier: 1,
            name: 'Bronze Ambassador',
            minReferrals: 1,
            advocateReward: 20,
            friendReward: 20,
            multiplier: 1.0,
            perks: ['Basic dashboard access', 'Monthly referral reports']
          },
          {
            tier: 2,
            name: 'Silver Ambassador',
            minReferrals: 3, // Reduced from 5 for faster progression
            advocateReward: 25,
            friendReward: 25,
            multiplier: 1.2,
            perks: ['Advanced analytics', 'Priority support', 'Referral coaching']
          },
          {
            tier: 3,
            name: 'Gold Ambassador',
            minReferrals: 10, // Reduced from 15
            advocateReward: 30,
            friendReward: 30,
            multiplier: 1.5,
            perks: ['White-glove support', 'Custom referral links', 'Revenue sharing options']
          },
          {
            tier: 4,
            name: 'Platinum Ambassador',
            minReferrals: 25, // Reduced from 50
            advocateReward: 35,
            friendReward: 35,
            multiplier: 2.0,
            perks: ['Partnership opportunities', 'Equity options', 'Strategic consulting']
          },
          {
            tier: 5, // New tier for dominance plan
            name: 'Diamond Ambassador',
            minReferrals: 100,
            advocateReward: 40,
            friendReward: 40,
            multiplier: 3.0,
            perks: ['Exclusive partnership', 'Revenue sharing 2.0', 'Strategic board access', 'Market expansion opportunities']
          }
        ],
        bonusRewards: [
          {
            id: 'triple_bonus',
            name: 'Triple Reward Weekend',
            condition: 'referrals_in_weekend >= 3',
            reward: 3,
            type: 'multiplier',
            psychologicalAppeal: 'Limited time opportunity for extra rewards'
          },
          {
            id: 'quality_bonus',
            name: 'High-Value Referral Bonus',
            condition: 'friend_plan_value >= 299',
            reward: 100,
            type: 'bonus',
            psychologicalAppeal: 'Reward for bringing valuable customers'
          },
          {
            id: 'streak_bonus',
            name: 'Referral Streak Bonus',
            condition: 'consecutive_monthly_referrals >= 3',
            reward: 50,
            type: 'bonus',
            psychologicalAppeal: 'Consistency reward for loyal advocates'
          },
          {
            id: 'market_dominator_bonus', // New dominance plan bonus
            name: 'Market Dominator Bonus',
            condition: 'monthly_referrals >= 50',
            reward: 500,
            type: 'bonus',
            psychologicalAppeal: 'Elite status for market domination leaders'
          },
          {
            id: 'competitor_conversion_bonus', // New dominance plan bonus
            name: 'Competitor Conversion Bonus',
            condition: 'competitor_migration >= 5',
            reward: 250,
            type: 'bonus',
            psychologicalAppeal: 'Bonus for converting competitors\' customers'
          },
          {
            id: 'viral_accelerator', // New dominance plan bonus
            name: 'Viral Accelerator',
            condition: 'viral_coefficient >= 2.5',
            reward: 1000,
            type: 'bonus',
            psychologicalAppeal: 'Exponential growth achievement reward'
          }
        ]
      },
      trackingConfig: {
        cookieDuration: 30, // Reduced from 90 for faster attribution
        attributionModel: 'last_click',
        trackingMethods: ['cookie', 'url_param', 'referral_code', 'email_link'], // Added email_link
        fraudDetection: {
          ipTracking: true,
          deviceFingerprinting: true,
          behaviorAnalysis: true,
          suspiciousPatterns: [
            {
              pattern: 'same_ip_multiple_referrals',
              threshold: 5,
              action: 'flag',
              description: 'Multiple referrals from same IP address'
            },
            {
              pattern: 'rapid_conversions',
              threshold: 3,
              action: 'review',
              description: 'Conversions happening unusually quickly'
            },
            {
              pattern: 'high_churn_rate',
              threshold: 0.8,
              action: 'flag',
              description: 'Referred customers churning at high rate'
            }
          ],
          autoFlag: true,
          manualReview: true
        },
        conversionEvents: [
          {
            name: 'signup',
            type: 'signup',
            value: 1,
            conditions: ['email_verified', 'not_existing_customer'],
            trackingMethod: 'server'
          },
          {
            name: 'upgrade',
            type: 'upgrade',
            value: 29,
            conditions: ['paid_plan', 'first_payment'],
            trackingMethod: 'server'
          },
          {
            name: 'annual_upgrade',
            type: 'purchase',
            value: 290,
            conditions: ['annual_plan', 'first_payment'],
            trackingMethod: 'server'
          }
        ]
      },
      psychologicalTriggers: [
        {
          type: 'reciprocity',
          message: 'Share the automation love and get rewarded for helping others succeed',
          visualElements: ['gift_icon', 'reward_badge'],
          emotionalWeight: 0.8,
          timing: 'immediate'
        },
        {
          type: 'social_proof',
          message: 'Join 1,000+ ambassadors earning $500+ monthly by sharing Torqvio',
          visualElements: ['testimonials', 'leaderboard'],
          emotionalWeight: 0.7,
          timing: 'delayed'
        },
        {
          type: 'achievement',
          message: 'Unlock exclusive perks and recognition as you grow your referral network',
          visualElements: ['progress_bar', 'tier_badges'],
          emotionalWeight: 0.9,
          timing: 'milestone'
        },
        {
          type: 'exclusivity',
          message: 'Get access to ambassador-only features and insider benefits',
          visualElements: ['vip_badge', 'exclusive_content'],
          emotionalWeight: 0.6,
          timing: 'ongoing'
        }
      ],
      performanceMetrics: {
        totalReferrals: 0,
        successfulReferrals: 0,
        conversionRate: 0,
        averageReward: 0,
        totalPayout: 0,
        roi: 0,
        advocateSatisfaction: 0,
        friendSatisfaction: 0,
        viralCoefficient: 0,
        // Dominance plan metrics
        weeklyGrowthRate: 0,
        marketShareImpact: 0,
        competitorConversionRate: 0,
        loopVelocity: 0,
        sustainabilityScore: 0,
        acquisitionCost: 0,
        lifetimeValue: 0
      }
    };

    this.programs.set(defaultProgram.id, defaultProgram);
    
    logger.info('Initialized default referral program');
  }

  async generateReferralCode(advocateId: string, advocateEmail: string): Promise<string> {
    // Generate unique referral code
    const baseCode = advocateEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.random().toString(36).substr(2, 6);
    const referralCode = `${baseCode}_${randomSuffix}`;

    // Check for uniqueness
    const existingReferral = Array.from(this.referrals.values())
      .find(r => r.referralCode === referralCode);
    
    if (existingReferral) {
      return this.generateReferralCode(advocateId, advocateEmail); // Regenerate if collision
    }

    return referralCode;
  }

  async createReferral(
    advocateId: string,
    advocateEmail: string,
    programId: string = 'default_referral_program'
  ): Promise<Referral> {
    const program = this.programs.get(programId);
    if (!program) {
      throw new Error(`Referral program not found: ${programId}`);
    }

    const referralCode = await this.generateReferralCode(advocateId, advocateEmail);
    
    const referral: Referral = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      advocateId,
      advocateEmail,
      referralCode,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + program.trackingConfig.cookieDuration * 24 * 60 * 60 * 1000),
      trackingData: {
        ipAddress: '',
        userAgent: '',
        landingPage: '',
        clickCount: 0,
        lastActivity: new Date(),
        conversionPath: []
      },
      fraudScore: 0
    };

    this.referrals.set(referral.id, referral);
    
    logger.info(`Created referral for advocate ${advocateId}: ${referralCode}`);
    
    return referral;
  }

  async trackReferralClick(
    referralCode: string,
    trackingData: Partial<TrackingData>
  ): Promise<Referral | null> {
    const referral = Array.from(this.referrals.values())
      .find(r => r.referralCode === referralCode && r.status !== 'expired');
    
    if (!referral) {
      return null;
    }

    // Update tracking data
    referral.trackingData = {
      ...referral.trackingData,
      ...trackingData,
      clickCount: referral.trackingData.clickCount + 1,
      lastActivity: new Date()
    };

    if (referral.status === 'pending') {
      referral.status = 'clicked';
    }

    referral.updatedAt = new Date();

    // Check for fraud patterns
    await this.analyzeFraudPatterns(referral);

    logger.info(`Tracked referral click: ${referralCode} (${referral.trackingData.clickCount} clicks)`);
    
    return referral;
  }

  async trackReferralConversion(
    referralCode: string,
    friendId: string,
    friendEmail: string,
    conversionEvent: string,
    value: number,
    trackingData?: Partial<TrackingData>
  ): Promise<Referral | null> {
    const referral = Array.from(this.referrals.values())
      .find(r => r.referralCode === referralCode && r.status !== 'expired');
    
    if (!referral) {
      return null;
    }

    const program = this.programs.get('default_referral_program');
    if (!program) {
      throw new Error('Default referral program not found');
    }

    // Update referral with conversion data
    referral.friendId = friendId;
    referral.friendEmail = friendEmail;
    referral.status = 'converted';
    referral.updatedAt = new Date();

    const conversionData: ConversionData = {
      eventType: conversionEvent,
      eventTime: new Date(),
      value,
      attributionWindow: Math.floor((Date.now() - referral.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
      touchpoints: [{
        type: 'direct',
        timestamp: new Date(),
        channel: 'referral_link',
        message: 'Converted via referral link',
        engagement: 1.0
      }]
    };

    referral.conversionData = conversionData;

    // Calculate rewards
    const rewardData = await this.calculateRewards(referral, conversionEvent, value);
    referral.rewardData = rewardData;

    // Update program metrics
    await this.updateProgramMetrics(program, referral);

    logger.info(`Tracked referral conversion: ${referralCode} -> ${friendEmail} (${conversionEvent}, $${value})`);
    
    return referral;
  }

  private async calculateRewards(
    referral: Referral,
    conversionEvent: string,
    value: number
  ): Promise<RewardData> {
    const program = this.programs.get('default_referral_program')!;
    const rewardStructure = program.rewardStructure;

    // Calculate advocate reward
    let advocateReward = 0;
    if (rewardStructure.advocateReward.type === 'percentage') {
      advocateReward = value * (rewardStructure.advocateReward.value / 100);
    } else if (rewardStructure.advocateReward.type === 'tiered') {
      advocateReward = value * (rewardStructure.advocateReward.value / 100);
      
      // Apply tier multiplier
      const advocateReferralCount = await this.getAdvocateReferralCount(referral.advocateId);
      const tier = this.getAdvocateTier(advocateReferralCount);
      if (tier) {
        advocateReward *= tier.multiplier;
      }
    }

    // Apply cap
    if (rewardStructure.advocateReward.cap && advocateReward > rewardStructure.advocateReward.cap) {
      advocateReward = rewardStructure.advocateReward.cap;
    }

    // Calculate friend reward
    let friendReward = 0;
    if (rewardStructure.friendReward.type === 'percentage') {
      friendReward = value * (rewardStructure.friendReward.value / 100);
    }

    // Check for bonus rewards
    const bonusRewards = await this.calculateBonusRewards(referral, advocateReward);
    advocateReward += bonusRewards;

    const totalReward = advocateReward + friendReward;

    return {
      advocateReward,
      friendReward,
      totalReward,
      status: 'pending',
      method: 'credit',
      psychologicalImpact: this.calculatePsychologicalImpact(advocateReward, friendReward)
    };
  }

  private async getAdvocateReferralCount(advocateId: string): Promise<number> {
    return Array.from(this.referrals.values())
      .filter(r => r.advocateId === advocateId && r.status === 'converted')
      .length;
  }

  private getAdvocateTier(referralCount: number): TieredReward | undefined {
    const program = this.programs.get('default_referral_program')!;
    const tieredRewards = program.rewardStructure.tieredRewards || [];
    
    return tieredRewards
      .filter(tier => referralCount >= tier.minReferrals)
      .sort((a, b) => b.tier - a.tier)[0]; // Highest qualifying tier
  }

  private async calculateBonusRewards(referral: Referral, baseReward: number): Promise<number> {
    const program = this.programs.get('default_referral_program')!;
    let bonusReward = 0;

    for (const bonus of program.rewardStructure.bonusRewards) {
      if (await this.evaluateBonusCondition(bonus.condition, referral)) {
        if (bonus.type === 'multiplier') {
          bonusReward += baseReward * (bonus.reward - 1);
        } else if (bonus.type === 'bonus') {
          bonusReward += bonus.reward;
        }
      }
    }

    return bonusReward;
  }

  private async evaluateBonusCondition(condition: string, referral: Referral): Promise<boolean> {
    // Simplified condition evaluation
    // In production, would use proper expression parser
    
    const context = {
      referrals_in_weekend: 0, // Mock - would check actual data
      friend_plan_value: referral.conversionData?.value || 0,
      consecutive_monthly_referrals: 0 // Mock - would check actual data
    };

    try {
      // Replace variables in condition
      let evalCondition = condition;
      for (const [key, value] of Object.entries(context)) {
        evalCondition = evalCondition.replace(new RegExp(key, 'g'), value.toString());
      }

      return eval(evalCondition);
    } catch (error) {
      logger.error(`Failed to evaluate bonus condition: ${condition}`, error);
      return false;
    }
  }

  private calculatePsychologicalImpact(advocateReward: number, friendReward: number): number {
    // Calculate psychological impact based on reward sizes
    const totalReward = advocateReward + friendReward;
    
    // Higher impact for larger rewards
    if (totalReward > 100) return 0.9;
    if (totalReward > 50) return 0.7;
    if (totalReward > 25) return 0.5;
    if (totalReward > 10) return 0.3;
    
    return 0.1;
  }

  private async updateProgramMetrics(program: ReferralProgram, referral: Referral): Promise<void> {
    const metrics = program.performanceMetrics;
    
    metrics.totalReferrals++;
    
    if (referral.status === 'converted') {
      metrics.successfulReferrals++;
    }

    metrics.conversionRate = metrics.successfulReferrals / metrics.totalReferrals;

    if (referral.rewardData) {
      metrics.averageReward = (metrics.averageReward * (metrics.successfulReferrals - 1) + 
                              referral.rewardData.totalReward) / metrics.successfulReferrals;
      metrics.totalPayout += referral.rewardData.totalReward;
    }

    // Calculate viral coefficient (simplified)
    metrics.viralCoefficient = metrics.conversionRate * 0.5; // Assume each converted user refers 0.5 others

    // Calculate ROI (simplified)
    const customerLifetimeValue = 500; // Mock CLV
    const acquisitionCost = metrics.totalPayout / Math.max(metrics.successfulReferrals, 1);
    metrics.roi = (customerLifetimeValue - acquisitionCost) / acquisitionCost;
  }

  private async analyzeFraudPatterns(referral: Referral): Promise<void> {
    const program = this.programs.get('default_referral_program')!;
    const fraudDetection = program.trackingConfig.fraudDetection;
    
    let fraudScore = 0;

    for (const pattern of fraudDetection.suspiciousPatterns) {
      if (await this.evaluateSuspiciousPattern(pattern, referral)) {
        fraudScore += 0.3; // Add to fraud score
      }
    }

    referral.fraudScore = Math.min(1, fraudScore);

    if (fraudScore > 0.7) {
      logger.warn(`High fraud score detected for referral ${referral.id}: ${fraudScore}`);
    }
  }

  private async evaluateSuspiciousPattern(pattern: SuspiciousPattern, referral: Referral): Promise<boolean> {
    // Simplified pattern evaluation
    switch (pattern.pattern) {
      case 'same_ip_multiple_referrals':
        // Check if multiple referrals from same advocate have same IP
        {
          const sameIpReferrals = Array.from(this.referrals.values())
            .filter(r => r.advocateId === referral.advocateId && 
                       r.trackingData.ipAddress === referral.trackingData.ipAddress);
          return sameIpReferrals.length >= pattern.threshold;
        }
      
      case 'rapid_conversions':
        // Check if conversion happened too quickly
        if (referral.conversionData) {
          const conversionTime = referral.conversionData.eventTime.getTime() - referral.createdAt.getTime();
          const conversionHours = conversionTime / (60 * 60 * 1000);
          return conversionHours < 24; // Less than 24 hours
        }
        return false;
      
      case 'high_churn_rate':
        // Would check if referred customers churn at high rate
        return false; // Mock implementation
      
      default:
        return false;
    }
  }

  async createReferralCampaign(
    name: string,
    targetSegment: string,
    psychologicalAngle: string,
    messaging: CampaignMessaging,
    incentives: CampaignIncentive[]
  ): Promise<ReferralCampaign> {
    const campaign: ReferralCampaign = {
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      programId: 'default_referral_program',
      targetSegment,
      psychologicalAngle,
      messaging,
      incentives,
      status: 'draft',
      startDate: new Date(),
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        conversions: 0,
        revenue: 0,
        cost: 0,
        roi: 0,
        engagementRate: 0,
        conversionRate: 0
      }
    };

    this.campaigns.set(campaign.id, campaign);
    
    logger.info(`Created referral campaign: ${name}`);
    
    return campaign;
  }

  async getAdvocateProfile(advocateId: string): Promise<ReferralPsychProfile> {
    let profile = this.advocateProfiles.get(advocateId);
    
    if (!profile) {
      profile = await this.createAdvocateProfile(advocateId);
      this.advocateProfiles.set(advocateId, profile);
    }
    
    return profile;
  }

  private async createAdvocateProfile(advocateId: string): Promise<ReferralPsychProfile> {
    // Analyze advocate's referral behavior to create psychological profile
    const referrals = Array.from(this.referrals.values())
      .filter(r => r.advocateId === advocateId);

    const totalReferrals = referrals.length;
    const successfulReferrals = referrals.filter(r => r.status === 'converted').length;
    const conversionRate = totalReferrals > 0 ? successfulReferrals / totalReferrals : 0;

    // Determine motivation based on patterns
    let motivation: ReferralPsychProfile['motivation'] = 'mixed';
    if (conversionRate > 0.3) {
      motivation = 'financial'; // High conversion suggests financial motivation
    } else if (totalReferrals > 10) {
      motivation = 'social'; // High volume suggests social motivation
    }

    // Determine communication style
    let communicationStyle: ReferralPsychProfile['communicationStyle'] = 'direct';
    if (successfulReferrals > 5) {
      communicationStyle = 'enthusiastic'; // Successful advocates tend to be enthusiastic
    }

    return {
      motivation,
      communicationStyle,
      socialInfluence: conversionRate > 0.2 ? 'high' : conversionRate > 0.1 ? 'medium' : 'low',
      techSavviness: 'medium', // Would analyze actual behavior
      priceSensitivity: 'medium', // Would analyze plan preferences
      personalityTraits: this.extractPersonalityTraits(referrals),
      recommendedMessaging: this.generateRecommendedMessaging(motivation, communicationStyle)
    };
  }

  private extractPersonalityTraits(referrals: Referral[]): string[] {
    const traits: string[] = [];
    
    if (referrals.length > 20) traits.push('consistent');
    if (referrals.filter(r => r.status === 'converted').length > 10) traits.push('persuasive');
    if (referrals.some(r => r.trackingData.clickCount > 5)) traits.push('persistent');
    
    return traits;
  }

  private generateRecommendedMessaging(
    motivation: ReferralPsychProfile['motivation'],
    communicationStyle: ReferralPsychProfile['communicationStyle']
  ): string[] {
    const messaging: string[] = [];
    
    if (motivation === 'financial') {
      messaging.push('Focus on earning potential and ROI');
      messaging.push('Highlight success stories and earnings');
    } else if (motivation === 'social') {
      messaging.push('Emphasize community and helping others');
      messaging.push('Show social proof and recognition');
    }
    
    if (communicationStyle === 'enthusiastic') {
      messaging.push('Use energetic and exciting language');
      messaging.push('Include celebration elements');
    } else if (communicationStyle === 'professional') {
      messaging.push('Focus on business value and professionalism');
      messaging.push('Use data-driven messaging');
    }
    
    return messaging;
  }

  async getReferralAnalytics(advocateId?: string): Promise<{
    totalReferrals: number;
    successfulReferrals: number;
    conversionRate: number;
    totalRevenue: number;
    averageReward: number;
    topAdvocates: Array<{ advocateId: string; referrals: number; revenue: number }>;
    programMetrics: ProgramMetrics;
  }> {
    const allReferrals = Array.from(this.referrals.values());
    const advocateReferrals = advocateId ? 
      allReferrals.filter(r => r.advocateId === advocateId) : 
      allReferrals;

    const successfulReferrals = advocateReferrals.filter(r => r.status === 'converted');
    const totalRevenue = successfulReferrals.reduce((sum, r) => sum + (r.conversionData?.value || 0), 0);
    const totalRewards = successfulReferrals.reduce((sum, r) => sum + (r.rewardData?.totalReward || 0), 0);

    // Get top advocates (if not filtered by specific advocate)
    let topAdvocates: Array<{ advocateId: string; referrals: number; revenue: number }> = [];
    if (!advocateId) {
      const advocateStats = new Map<string, { referrals: number; revenue: number }>();
      
      for (const referral of allReferrals) {
        const stats = advocateStats.get(referral.advocateId) || { referrals: 0, revenue: 0 };
        stats.referrals++;
        if (referral.conversionData) {
          stats.revenue += referral.conversionData.value;
        }
        advocateStats.set(referral.advocateId, stats);
      }
      
      topAdvocates = Array.from(advocateStats.entries())
        .map(([advocateId, stats]) => ({ advocateId, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    }

    const program = this.programs.get('default_referral_program')!;

    return {
      totalReferrals: advocateReferrals.length,
      successfulReferrals: successfulReferrals.length,
      conversionRate: advocateReferrals.length > 0 ? successfulReferrals.length / advocateReferrals.length : 0,
      totalRevenue,
      averageReward: successfulReferrals.length > 0 ? totalRewards / successfulReferrals.length : 0,
      topAdvocates,
      programMetrics: program.performanceMetrics
    };
  }

  async processRewardPayout(referralId: string): Promise<boolean> {
    const referral = this.referrals.get(referralId);
    if (!referral || !referral.rewardData) {
      return false;
    }

    if (referral.rewardData.status === 'processed') {
      return true; // Already processed
    }

    // Process the payout (would integrate with payment processor)
    referral.rewardData.status = 'processed';
    referral.rewardData.processedAt = new Date();

    logger.info(`Processed reward payout for referral ${referralId}: $${referral.rewardData.totalReward}`);
    
    return true;
  }

  async getProgramMetrics(programId: string = 'default_referral_program'): Promise<ProgramMetrics> {
    const program = this.programs.get(programId);
    if (!program) {
      throw new Error(`Referral program not found: ${programId}`);
    }

    return program.performanceMetrics;
  }

  // Dominance plan enhancements
  async calculateDominanceMetrics(): Promise<{
    viralCoefficient: number;
    weeklyGrowthRate: number;
    marketShareImpact: number;
    competitorConversionRate: number;
    loopVelocity: number;
    sustainabilityScore: number;
  }> {
    const program = this.programs.get('default_referral_program')!;
    const metrics = program.performanceMetrics;
    
    // Calculate viral coefficient (enhanced for dominance plan)
    const invitationsPerUser = 3.5; // Target from dominance plan
    const conversionRate = metrics.conversionRate;
    const viralCoefficient = invitationsPerUser * conversionRate;
    
    // Calculate weekly growth rate
    const weeklyGrowthRate = this.calculateWeeklyGrowthRate();
    
    // Estimate market share impact
    const marketShareImpact = (metrics.successfulReferrals / 5000) * 0.15; // 15% target market share
    
    // Competitor conversion rate (mock - would track actual migrations)
    const competitorConversionRate = 0.35; // 35% from dominance plan
    
    // Loop velocity (time for one viral cycle)
    const loopVelocity = 7 / conversionRate; // 7 days average time to conversion
    
    // Sustainability score (based on retention and growth)
    const sustainabilityScore = Math.min(1, (viralCoefficient * 0.3 + weeklyGrowthRate * 0.4 + competitorConversionRate * 0.3));
    
    // Update program metrics
    metrics.viralCoefficient = viralCoefficient;
    metrics.weeklyGrowthRate = weeklyGrowthRate;
    metrics.marketShareImpact = marketShareImpact;
    metrics.competitorConversionRate = competitorConversionRate;
    metrics.loopVelocity = loopVelocity;
    metrics.sustainabilityScore = sustainabilityScore;
    
    return {
      viralCoefficient,
      weeklyGrowthRate,
      marketShareImpact,
      competitorConversionRate,
      loopVelocity,
      sustainabilityScore
    };
  }
  
  private calculateWeeklyGrowthRate(): number {
    const referrals = Array.from(this.referrals.values());
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);
    
    const thisWeekReferrals = referrals.filter(r => r.createdAt.getTime() >= oneWeekAgo).length;
    const lastWeekReferrals = referrals.filter(r => 
      r.createdAt.getTime() >= twoWeeksAgo && r.createdAt.getTime() < oneWeekAgo
    ).length;
    
    if (lastWeekReferrals === 0) return 0;
    return (thisWeekReferrals - lastWeekReferrals) / lastWeekReferrals;
  }
  
  async trackCompetitorMigration(
    referralCode: string,
    competitor: 'zapier' | 'make' | 'n8n' | 'airbyte' | 'fivetran',
    migrationData: {
      workflowsMigrated: number;
      complexity: 'simple' | 'medium' | 'complex';
      estimatedValue: number;
    }
  ): Promise<Referral | null> {
    const referral = Array.from(this.referrals.values())
      .find(r => r.referralCode === referralCode && r.status !== 'expired');
    
    if (!referral) {
      return null;
    }
    
    // Add competitor migration data to tracking
    referral.trackingData.conversionPath.push(`competitor_migration_${competitor}`);
    referral.trackingData.conversionPath.push(`workflows_${migrationData.workflowsMigrated}`);
    referral.trackingData.conversionPath.push(`complexity_${migrationData.complexity}`);
    
    // Update fraud score for high-value migrations
    if (migrationData.estimatedValue > 1000) {
      referral.fraudScore = Math.max(0, referral.fraudScore - 0.1); // Reduce fraud score for high-value
    }
    
    // Check for competitor conversion bonus
    const program = this.programs.get('default_referral_program')!;
    const competitorBonus = program.rewardStructure.bonusRewards.find(
      b => b.id === 'competitor_conversion_bonus'
    );
    
    if (competitorBonus && referral.rewardData) {
      // This would be evaluated during reward calculation
      referral.trackingData.conversionPath.push('competitor_bonus_eligible');
    }
    
    logger.info(`Tracked competitor migration: ${competitor} -> ${migrationData.workflowsMigrated} workflows`);
    
    return referral;
  }
  
  async generateViralAccelerationReport(): Promise<{
    currentViralCoefficient: number;
    targetViralCoefficient: number;
    gap: number;
    recommendations: string[];
    highLeverageActions: string[];
  }> {
    const metrics = await this.calculateDominanceMetrics();
    const targetViralCoefficient = 2.5; // From dominance plan
    const gap = targetViralCoefficient - metrics.viralCoefficient;
    
    const recommendations: string[] = [];
    const highLeverageActions: string[] = [];
    
    if (gap > 1.0) {
      recommendations.push('Increase referral incentive to 25%');
      recommendations.push('Launch double-sided referral campaign');
      highLeverageActions.push('Triple Reward Weekend promotion');
      highLeverageActions.push('Competitor migration bonus activation');
    } else if (gap > 0.5) {
      recommendations.push('Optimize referral messaging');
      recommendations.push('Add social proof elements');
      highLeverageActions.push('Top advocate spotlight campaign');
    } else if (gap > 0) {
      recommendations.push('Increase referral reminders');
      recommendations.push('Add urgency elements');
    }
    
    return {
      currentViralCoefficient: metrics.viralCoefficient,
      targetViralCoefficient,
      gap,
      recommendations,
      highLeverageActions
    };
  }
  
  async createMarketDominanceCampaign(
    targetSegment: 'enterprise' | 'midmarket' | 'small_business' | 'all',
    focusArea: 'competitor_conversion' | 'viral_growth' | 'market_penetration'
  ): Promise<ReferralCampaign> {
    const messaging = this.generateDominanceCampaignMessaging(targetSegment, focusArea);
    const incentives = this.generateDominanceCampaignIncentives(focusArea);
    
    return this.createReferralCampaign(
      `Market Dominance - ${targetSegment} - ${focusArea}`,
      targetSegment,
      focusArea,
      messaging,
      incentives
    );
  }
  
  private generateDominanceCampaignMessaging(
    targetSegment: string,
    focusArea: string
  ): CampaignMessaging {
    const baseMessaging = {
      subject: '',
      body: '',
      psychologicalTriggers: [],
      personalizationTokens: [],
      visualElements: [],
      callToAction: '',
      urgencyElements: []
    };
    
    if (focusArea === 'competitor_conversion') {
      return {
        ...baseMessaging,
        subject: 'Switch from [Competitor] and earn 40% more',
        body: 'Join 1,000+ teams who migrated from [Competitor] and are now earning 20x ROI with Torqvio. Get 6 months free plus exclusive migration bonuses.',
        psychologicalTriggers: ['loss_aversion', 'social_proof', 'achievement'],
        callToAction: 'Start Your Migration Now',
        urgencyElements: ['Limited migration bonuses', '6-month free trial ending']
      };
    } else if (focusArea === 'viral_growth') {
      return {
        ...baseMessaging,
        subject: 'Earn $500+ monthly by sharing Torqvio',
        body: 'Top advocates are earning $1,000+ monthly. Join the Diamond Ambassador program and unlock exclusive partnership opportunities.',
        psychologicalTriggers: ['achievement', 'exclusivity', 'reciprocity'],
        callToAction: 'Become an Ambassador',
        urgencyElements: ['Limited Diamond spots', 'Triple Reward Weekend active']
      };
    }
    
    return baseMessaging;
  }
  
  private generateDominanceCampaignIncentives(focusArea: string): CampaignIncentive[] {
    if (focusArea === 'competitor_conversion') {
      return [
        {
          type: 'bonus',
          value: 250,
          condition: 'competitor_migration >= 1',
          scarcity: true,
          psychologicalAppeal: 'Bonus for switching from competitors'
        },
        {
          type: 'deadline',
          value: 6,
          condition: 'migration_within_30_days',
          duration: 30,
          scarcity: true,
          psychologicalAppeal: '6 months free for fast movers'
        }
      ];
    } else if (focusArea === 'viral_growth') {
      return [
        {
          type: 'multiplier',
          value: 3,
          condition: 'referrals_in_weekend >= 5',
          scarcity: true,
          psychologicalAppeal: 'Triple rewards for viral weekends'
        },
        {
          type: 'exclusive',
          value: 1000,
          condition: 'viral_coefficient >= 2.5',
          scarcity: true,
          psychologicalAppeal: 'Viral accelerator bonus for top performers'
        }
      ];
    }
    
    return [];
  }
}
