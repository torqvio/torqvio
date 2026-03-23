import { DatabaseConnection } from '../database/connection';
import { SimulationScenario, SimulationResult, SimulatedMetrics } from '../integrations/types';
import { v4 as uuidv4 } from 'uuid';

export class SimulationEngine {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async runScenarioSimulation(scenario: SimulationScenario): Promise<SimulationResult> {
    const baseline = await this.getBaselineMetrics(scenario.tenantId, scenario.period);
    const simulated = await this.runSimulation(scenario, baseline);

    const impact = {
      additionalRevenue: simulated.revenueProtected - baseline.revenueProtected,
      roi: this.calculateROI(simulated, baseline, scenario.investment),
      paybackPeriod: this.calculatePaybackPeriod(scenario.investment, simulated.revenueProtected - baseline.revenueProtected)
    };

    const result: SimulationResult = {
      scenario: scenario.name,
      period: scenario.period,
      baseline: {
        recoveryRate: baseline.recoveryRate,
        revenueProtected: baseline.revenueProtected,
        costs: baseline.costs
      },
      simulated: {
        recoveryRate: simulated.recoveryRate,
        revenueProtected: simulated.revenueProtected,
        costs: simulated.costs
      },
      impact
    };

    // Store simulation result
    await this.storeSimulationResult(scenario, result);

    return result;
  }

  private async getBaselineMetrics(tenantId: string, period: string): Promise<SimulatedMetrics> {
    const dateRange = this.getDateRange(period);

    // Get current metrics
    const metrics = await this.db.query(`
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_recoveries,
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as revenue_protected,
        COALESCE(AVG(amount), 0) as avg_amount
      FROM recovery_analytics 
      WHERE tenant_id = $1 
      AND created_at BETWEEN $2 AND $3
    `, [tenantId, dateRange.start, dateRange.end]);

    const result = metrics[0] || { total_attempts: 0, successful_recoveries: 0, revenue_protected: 0 };

    // Get current costs (template deployments, integrations, etc.)
    const costs = await this.getCurrentCosts(tenantId, period);

    return {
      recoveryRate: result.total_attempts > 0 ? result.successful_recoveries / result.total_attempts : 0,
      revenueProtected: result.revenue_protected || 0,
      costs
    };
  }

  private async getCurrentCosts(tenantId: string, period: string): Promise<number> {
    // Calculate current monthly costs
    const dateRange = this.getDateRange(period);
    
    // Get active integrations and their costs
    const integrations = await this.db.query(`
      SELECT COUNT(*) as active_integrations
      FROM integrations 
      WHERE project_id IN (SELECT id FROM projects WHERE tenant_id = $1)
      AND status = 'active'
    `, [tenantId]);

    // Get active templates and their costs
    const templates = await this.db.query(`
      SELECT COUNT(*) as active_templates
      FROM flow_executions 
      WHERE tenant_id = $1 
      AND created_at BETWEEN $2 AND $3
      GROUP BY template_id
    `, [tenantId, dateRange.start, dateRange.end]);

    const integrationCosts = (integrations[0]?.active_integrations || 0) * 50; // $50 per integration per month
    const templateCosts = (templates.length || 0) * 25; // $25 per template per month
    const baseCosts = 100; // Base platform fee

    return integrationCosts + templateCosts + baseCosts;
  }

  private async runSimulation(scenario: SimulationScenario, baseline: SimulatedMetrics): Promise<SimulatedMetrics> {
    switch (scenario.type) {
      case 'template_deployment':
        return this.simulateTemplateDeployment(scenario, baseline);
      case 'notification_upgrade':
        return this.simulateNotificationUpgrade(scenario, baseline);
      case 'retry_strategy_change':
        return this.simulateRetryStrategyChange(scenario, baseline);
      case 'integration_addition':
        return this.simulateIntegrationAddition(scenario, baseline);
      default:
        throw new Error(`Unknown simulation type: ${scenario.type}`);
    }
  }

  private simulateTemplateDeployment(scenario: SimulationScenario, baseline: SimulatedMetrics): SimulatedMetrics {
    const template = scenario.config.template;
    const coverageIncrease = template.estimatedCoverage || 0.15; // 15% additional coverage
    const expectedRecoveryRate = template.estimatedRecoveryRate || 0.75; // 75% recovery rate for new template
    const monthlyCost = template.monthlyCost || 25;

    // Calculate new recovery rate
    const currentCoverage = baseline.recoveryRate;
    const additionalRecoveryRate = coverageIncrease * expectedRecoveryRate;
    const newRecoveryRate = Math.min(currentCoverage + additionalRecoveryRate, 0.95); // Cap at 95%

    // Calculate new revenue protection
    const additionalRevenue = baseline.revenueProtected * (coverageIncrease * expectedRecoveryRate);
    const newRevenueProtected = baseline.revenueProtected + additionalRevenue;

    return {
      recoveryRate: newRecoveryRate,
      revenueProtected: newRevenueProtected,
      costs: baseline.costs + monthlyCost
    };
  }

  private simulateNotificationUpgrade(scenario: SimulationScenario, baseline: SimulatedMetrics): SimulatedMetrics {
    const upgradeConfig = scenario.config;
    const recoveryImprovement = upgradeConfig.recoveryImprovement || 0.1; // 10% improvement
    const timeReduction = upgradeConfig.timeReduction || 0.2; // 20% faster recovery
    const monthlyCost = upgradeConfig.monthlyCost || 50;

    // Improved recovery rate
    const newRecoveryRate = Math.min(baseline.recoveryRate * (1 + recoveryImprovement), 0.95);

    // Improved revenue protection (faster recovery = higher success rate)
    const newRevenueProtected = baseline.revenueProtected * (1 + recoveryImprovement);

    return {
      recoveryRate: newRecoveryRate,
      revenueProtected: newRevenueProtected,
      costs: baseline.costs + monthlyCost
    };
  }

  private simulateRetryStrategyChange(scenario: SimulationScenario, baseline: SimulatedMetrics): SimulatedMetrics {
    const strategyConfig = scenario.config;
    const recoveryImprovement = strategyConfig.recoveryImprovement || 0.08; // 8% improvement
    const costSavings = strategyConfig.costSavings || 0; // Usually no additional cost
    const monthlyCost = costSavings; // Could be negative (savings)

    // Better retry strategy improves recovery rate
    const newRecoveryRate = Math.min(baseline.recoveryRate * (1 + recoveryImprovement), 0.95);

    // Revenue protection improves with better recovery
    const newRevenueProtected = baseline.revenueProtected * (1 + recoveryImprovement);

    return {
      recoveryRate: newRecoveryRate,
      revenueProtected: newRevenueProtected,
      costs: baseline.costs + monthlyCost
    };
  }

  private simulateIntegrationAddition(scenario: SimulationScenario, baseline: SimulatedMetrics): SimulatedMetrics {
    const integrationConfig = scenario.config;
    const coverageIncrease = integrationConfig.estimatedCoverage || 0.2; // 20% additional coverage
    const expectedRecoveryRate = integrationConfig.estimatedRecoveryRate || 0.8; // 80% recovery rate
    const monthlyCost = integrationConfig.monthlyCost || 75;

    // Calculate new recovery rate
    const additionalRecoveryRate = coverageIncrease * expectedRecoveryRate;
    const newRecoveryRate = Math.min(baseline.recoveryRate + additionalRecoveryRate, 0.95);

    // Calculate new revenue protection
    const additionalRevenue = baseline.revenueProtected * (coverageIncrease * expectedRecoveryRate);
    const newRevenueProtected = baseline.revenueProtected + additionalRevenue;

    return {
      recoveryRate: newRecoveryRate,
      revenueProtected: newRevenueProtected,
      costs: baseline.costs + monthlyCost
    };
  }

  private calculateROI(simulated: SimulatedMetrics, baseline: SimulatedMetrics, investment: number): number {
    const additionalRevenue = simulated.revenueProtected - baseline.revenueProtected;
    const additionalCosts = simulated.costs - baseline.costs;
    const netGain = additionalRevenue - additionalCosts - investment;
    
    return additionalCosts > 0 ? (netGain / (additionalCosts + investment)) * 100 : 0;
  }

  private calculatePaybackPeriod(investment: number, monthlyGain: number): number {
    if (monthlyGain <= 0) return -1; // Never pays back
    return Math.ceil(investment / monthlyGain); // Months to pay back
  }

  private async storeSimulationResult(scenario: SimulationScenario, result: SimulationResult): Promise<void> {
    await this.db.query(`
      INSERT INTO simulation_results (
        id, tenant_id, scenario_name, scenario_type, period, investment,
        baseline_recovery_rate, baseline_revenue_protected, baseline_costs,
        simulated_recovery_rate, simulated_revenue_protected, simulated_costs,
        additional_revenue, roi, payback_period, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
    `, [
      uuidv4(),
      scenario.tenantId,
      scenario.name,
      scenario.type,
      scenario.period,
      scenario.investment,
      result.baseline.recoveryRate,
      result.baseline.revenueProtected,
      result.baseline.costs,
      result.simulated.recoveryRate,
      result.simulated.revenueProtected,
      result.simulated.costs,
      result.impact.additionalRevenue,
      result.impact.roi,
      result.impact.paybackPeriod
    ]);
  }

  async getSimulationHistory(tenantId: string, limit: number = 50): Promise<any[]> {
    const simulations = await this.db.query(`
      SELECT * FROM simulation_results 
      WHERE tenant_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `, [tenantId, limit]);

    return simulations.map(row => ({
      id: row.id,
      scenarioName: row.scenario_name,
      scenarioType: row.scenario_type,
      period: row.period,
      investment: row.investment,
      baseline: {
        recoveryRate: row.baseline_recovery_rate,
        revenueProtected: row.baseline_revenue_protected,
        costs: row.baseline_costs
      },
      simulated: {
        recoveryRate: row.simulated_recovery_rate,
        revenueProtected: row.simulated_revenue_protected,
        costs: row.simulated_costs
      },
      impact: {
        additionalRevenue: row.additional_revenue,
        roi: row.roi,
        paybackPeriod: row.payback_period
      },
      createdAt: row.created_at
    }));
  }

  async getRecommendedScenarios(tenantId: string): Promise<SimulationScenario[]> {
    const baseline = await this.getBaselineMetrics(tenantId, '30d');
    
    const recommendations: SimulationScenario[] = [];

    // Recommend template deployment if coverage is low
    if (baseline.recoveryRate < 0.7) {
      recommendations.push({
        name: 'Deploy Payment Recovery Template',
        tenantId,
        type: 'template_deployment',
        period: '30d',
        investment: 25,
        baseline,
        config: {
          template: {
            estimatedCoverage: 0.25,
            estimatedRecoveryRate: 0.8,
            monthlyCost: 25
          }
        }
      });
    }

    // Recommend integration addition if coverage is moderate
    if (baseline.recoveryRate >= 0.7 && baseline.recoveryRate < 0.85) {
      recommendations.push({
        name: 'Add Stripe Integration',
        tenantId,
        type: 'integration_addition',
        period: '30d',
        investment: 75,
        baseline,
        config: {
          estimatedCoverage: 0.3,
          estimatedRecoveryRate: 0.85,
          monthlyCost: 75
        }
      });
    }

    // Recommend retry strategy optimization
    recommendations.push({
      name: 'Optimize Retry Strategy',
      tenantId,
      type: 'retry_strategy_change',
      period: '30d',
      investment: 0,
      baseline,
      config: {
        recoveryImprovement: 0.12,
        costSavings: 0
      }
    });

    return recommendations;
  }

  private getDateRange(period: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setDate(end.getDate() - 30);
    }

    return { start, end };
  }

  async compareScenarios(tenantId: string, scenarios: SimulationScenario[]): Promise<SimulationResult[]> {
    const results: SimulationResult[] = [];
    
    for (const scenario of scenarios) {
      try {
        const result = await this.runScenarioSimulation(scenario);
        results.push(result);
      } catch (error) {
        console.error(`Failed to simulate scenario ${scenario.name}:`, error);
      }
    }

    return results.sort((a, b) => b.impact.roi - a.impact.roi); // Sort by ROI
  }
}
