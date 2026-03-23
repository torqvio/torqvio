import { DatabaseConnection } from '../database/connection';
import { FailureContext, FailurePrediction } from '../integrations/types';
import { v4 as uuidv4 } from 'uuid';

export class PredictiveEngine {
  private db: DatabaseConnection;
  private model: any; // TensorFlow.js model or external ML service

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async initialize(): Promise<void> {
    // Load pre-trained model or initialize connection to ML service
    this.model = await this.loadFailurePredictionModel();
  }

  async predictFailureRisk(context: FailureContext): Promise<FailurePrediction> {
    const features = this.extractFeatures(context);
    const prediction = await this.model.predict(features);
    
    const riskScore = prediction.probability || this.calculateSimpleRiskScore(context);
    const riskLevel = this.categorizeRisk(riskScore);
    const contributingFactors = prediction.featureImportance || this.identifyContributingFactors(context);
    const recommendedActions = this.generateRecommendations(riskLevel, context);

    const failurePrediction: FailurePrediction = {
      riskScore,
      riskLevel,
      contributingFactors,
      recommendedActions
    };

    // Store prediction for analytics
    await this.storePrediction(context.customer.id, failurePrediction, context);

    return failurePrediction;
  }

  private extractFeatures(context: FailureContext): number[] {
    return [
      context.customer.paymentHistory?.failureRate || 0,
      context.customer.ltv || 0,
      context.amount,
      context.timeOfDay,
      context.dayOfWeek,
      this.getPaymentMethodRisk(context.paymentMethod.type),
      context.paymentMethod.age,
      context.recentAttempts,
      this.getAmountRiskScore(context.amount),
      this.getCustomerHistoryRisk(context.customer.paymentHistory)
    ];
  }

  private calculateSimpleRiskScore(context: FailureContext): number {
    let riskScore = 0.1; // Base risk

    // Customer history factors
    if (context.customer.paymentHistory) {
      const failureRate = context.customer.paymentHistory.failureRate;
      riskScore += failureRate * 0.3; // Weight: 30%
      
      if (context.customer.paymentHistory.lastFailureDate) {
        const daysSinceLastFailure = Math.floor(
          (Date.now() - context.customer.paymentHistory.lastFailureDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastFailure < 7) riskScore += 0.2; // Recent failure
      }
    }

    // Amount factors
    if (context.amount > 1000) riskScore += 0.1; // Large amounts
    if (context.amount > 5000) riskScore += 0.1; // Very large amounts

    // Time factors
    if (context.timeOfDay < 6 || context.timeOfDay > 22) riskScore += 0.1; // Odd hours
    if (context.dayOfWeek === 0 || context.dayOfWeek === 6) riskScore += 0.05; // Weekend

    // Payment method factors
    if (context.paymentMethod.type === 'bank_account') riskScore += 0.05; // ACH risk
    if (context.paymentMethod.age < 30) riskScore += 0.1; // New payment method

    // Recent attempts
    if (context.recentAttempts > 2) riskScore += 0.15; // Multiple recent attempts
    if (context.recentAttempts > 5) riskScore += 0.25; // High retry attempts

    return Math.min(riskScore, 0.95); // Cap at 95%
  }

  private getPaymentMethodRisk(type: string): number {
    const riskScores: Record<string, number> = {
      'credit_card': 0.1,
      'debit_card': 0.15,
      'bank_account': 0.25,
      'paypal': 0.12,
      'apple_pay': 0.08,
      'google_pay': 0.08,
      'crypto': 0.3
    };
    return riskScores[type] || 0.15;
  }

  private getAmountRiskScore(amount: number): number {
    if (amount < 50) return 0.05;
    if (amount < 100) return 0.08;
    if (amount < 500) return 0.1;
    if (amount < 1000) return 0.15;
    if (amount < 5000) return 0.2;
    return 0.25;
  }

  private getCustomerHistoryRisk(paymentHistory?: any): number {
    if (!paymentHistory) return 0.2; // No history = higher risk
    
    const failureRate = paymentHistory.failureRate || 0;
    const totalPayments = paymentHistory.totalPayments || 1;
    
    // New customers with few payments
    if (totalPayments < 5) return 0.15;
    
    // High failure rate
    if (failureRate > 0.1) return failureRate * 0.5;
    
    return 0.05;
  }

  private categorizeRisk(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score < 0.3) return 'low';
    if (score < 0.6) return 'medium';
    if (score < 0.8) return 'high';
    return 'critical';
  }

  private identifyContributingFactors(context: FailureContext): number[] {
    const factors = [];
    
    // Customer history contribution
    if (context.customer.paymentHistory?.failureRate > 0.1) {
      factors.push(0.3); // 30% contribution
    }
    
    // Amount contribution
    if (context.amount > 1000) {
      factors.push(0.2); // 20% contribution
    }
    
    // Time contribution
    if (context.timeOfDay < 6 || context.timeOfDay > 22) {
      factors.push(0.15); // 15% contribution
    }
    
    // Payment method contribution
    if (context.paymentMethod.age < 30) {
      factors.push(0.25); // 25% contribution
    }
    
    // Recent attempts contribution
    if (context.recentAttempts > 2) {
      factors.push(0.35); // 35% contribution
    }
    
    return factors.length > 0 ? factors : [0.5]; // Default contribution
  }

  private generateRecommendations(riskLevel: string, context: FailureContext): string[] {
    const recommendations = [];

    switch (riskLevel) {
      case 'critical':
        recommendations.push('Immediate manual review required');
        recommendations.push('Consider alternative payment methods');
        recommendations.push('Contact customer for payment method update');
        recommendations.push('Delay automated retry attempts');
        break;
      
      case 'high':
        recommendations.push('Use enhanced dunning sequence');
        recommendations.push('Send immediate payment reminder');
        recommendations.push('Consider offering payment plan');
        recommendations.push('Increase retry interval');
        break;
      
      case 'medium':
        recommendations.push('Standard retry sequence');
        recommendations.push('Send payment reminder after 24 hours');
        recommendations.push('Monitor payment attempt results');
        break;
      
      case 'low':
        recommendations.push('Proceed with standard processing');
        recommendations.push('Monitor for pattern changes');
        break;
    }

    // Context-specific recommendations
    if (context.amount > 1000) {
      recommendations.push('High-value payment - consider manual verification');
    }

    if (context.recentAttempts > 3) {
      recommendations.push('Multiple recent failures - contact customer');
    }

    if (context.paymentMethod.age < 7) {
      recommendations.push('New payment method - verify with customer');
    }

    return recommendations;
  }

  async generateProactiveAlert(prediction: FailurePrediction, context: FailureContext): Promise<void> {
    if (prediction.riskLevel === 'high' || prediction.riskLevel === 'critical') {
      // Store alert for dashboard
      await this.db.query(`
        INSERT INTO failure_predictions (
          id, tenant_id, customer_id, context, prediction, risk_score, risk_level, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [
        uuidv4(),
        'tenant_id', // TODO: Get from context
        context.customer.id,
        JSON.stringify(context),
        JSON.stringify(prediction),
        prediction.riskScore,
        prediction.riskLevel
      ]);

      // TODO: Send notification via NotificationService
      console.log('Proactive failure alert generated:', {
        customerId: context.customer.id,
        riskScore: prediction.riskScore,
        riskLevel: prediction.riskLevel,
        recommendedActions: prediction.recommendedActions,
        estimatedLoss: context.amount * prediction.riskScore
      });
    }
  }

  private async storePrediction(customerId: string, prediction: FailurePrediction, context: FailureContext): Promise<void> {
    await this.db.query(`
      INSERT INTO failure_predictions (
        id, tenant_id, customer_id, context, prediction, risk_score, risk_level, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (customer_id) DO UPDATE SET
        context = $4,
        prediction = $5,
        risk_score = $6,
        risk_level = $7,
        created_at = NOW()
    `, [
      uuidv4(),
      'tenant_id', // TODO: Get from context
      customerId,
      JSON.stringify(context),
      JSON.stringify(prediction),
      prediction.riskScore,
      prediction.riskLevel
    ]);
  }

  async getActiveAlerts(tenantId: string): Promise<any[]> {
    const alerts = await this.db.query(`
      SELECT * FROM failure_predictions 
      WHERE tenant_id = $1 
      AND created_at > NOW() - INTERVAL '24 hours'
      AND risk_level IN ('high', 'critical')
      ORDER BY risk_score DESC, created_at DESC
    `, [tenantId]);

    return alerts;
  }

  async getPredictionAccuracy(tenantId: string, period: string = '30d'): Promise<number> {
    // Calculate prediction accuracy by comparing predicted failures with actual failures
    const predictions = await this.db.query(`
      SELECT * FROM failure_predictions 
      WHERE tenant_id = $1 
      AND created_at > NOW() - INTERVAL '${period}'
    `, [tenantId]);

    // TODO: Implement actual accuracy calculation
    // For now, return a mock accuracy
    return 0.87; // 87% accuracy
  }

  private async loadFailurePredictionModel(): Promise<any> {
    // For now, return a simple mock model
    // In production, this would load a TensorFlow.js model or connect to an ML service
    return {
      predict: async (features: number[]) => {
        // Simple mock prediction based on feature sum
        const featureSum = features.reduce((a, b) => a + b, 0);
        const probability = Math.min(featureSum / features.length, 0.95);
        
        return {
          probability,
          featureImportance: features.map((f, i) => f / featureSum)
        };
      }
    };
  }

  async trainModel(tenantId: string): Promise<void> {
    // Collect training data
    const trainingData = await this.db.query(`
      SELECT context, prediction, outcome 
      FROM failure_predictions fp
      JOIN payment_outcomes po ON fp.customer_id = po.customer_id
      WHERE fp.tenant_id = $1
      AND fp.created_at > NOW() - INTERVAL '90 days'
    `, [tenantId]);

    // TODO: Implement actual model training
    console.log(`Training model with ${trainingData.length} samples for tenant ${tenantId}`);
  }
}
