import { Router } from 'express';
import { RecoveryAnalyticsModel } from '../../database/RecoveryAnalyticsModel.js';
import { DatabaseConnection } from '../../database/connection.js';
import { authenticateApiKey, AuthenticatedRequest } from '../../utils/auth.js';
import { CounterfactualEngine } from '../../engine/CounterfactualEngine.js';

export function createAnalyticsRouter(db: DatabaseConnection): Router {
  const router = Router();
  const analyticsModel = new RecoveryAnalyticsModel(db);
  const counterfactualEngine = new CounterfactualEngine(db, analyticsModel);

  // GET /api/v1/analytics/recovery
  router.get('/recovery', authenticateApiKey, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = req.projectId;
      const days = parseInt(req.query.days as string) || 7;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      const stats = await analyticsModel.getRecoveryStats(projectId, days);
      const recentEvents = await analyticsModel.getRecentRecoveryEvents(projectId, 10);

      res.json({
        success: true,
        data: {
          ...stats,
          recentEvents,
          killerLine: `Torqvio recovered €${stats.totalRecovered.toLocaleString()} in the last ${days} days`,
          wouldHaveLost: stats.totalFailed - stats.totalRecovered,
          period: `Last ${days} days`
        }
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // GET /api/v1/analytics/recovery/live
  router.get('/recovery/live', authenticateApiKey, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = req.projectId;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      const todayStats = await analyticsModel.getTodayRecoveryStats(projectId);
      
      res.json({
        success: true,
        data: {
          liveCounter: todayStats.totalRecovered,
          todayRecovered: todayStats.totalRecovered,
          todayFailed: todayStats.totalFailed,
          todayRate: todayStats.recoveryRate,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Live analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch live analytics' });
    }
  });

  // GET /api/v1/analytics/recovery/daily
  router.get('/recovery/daily', authenticateApiKey, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = req.projectId;
      const days = parseInt(req.query.days as string) || 30;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      const dailyStats = await analyticsModel.getDailyRecoveryStats(projectId, days);

      res.json({
        success: true,
        data: {
          dailyStats,
          period: `Last ${days} days`
        }
      });
    } catch (error) {
      console.error('Daily analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch daily analytics' });
    }
  });

  // POST /api/v1/analytics/recovery/events (for testing/manual recording)
  router.post('/recovery/events', authenticateApiKey, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = req.projectId;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      const event = req.body;
      const recordedEvent = await analyticsModel.recordRecoveryEvent({
        ...event,
        projectId
      });

      res.json({
        success: true,
        data: recordedEvent
      });
    } catch (error) {
      console.error('Event recording error:', error);
      res.status(500).json({ error: 'Failed to record event' });
    }
  });

  // GET /api/v1/analytics/impact - Main impact dashboard data
  router.get('/impact', authenticateApiKey, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = req.projectId;
      const days = parseInt(req.query.days as string) || 30;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      const impactData = await counterfactualEngine.calculateImpactSummary(projectId, days);
      
      res.json({
        success: true,
        data: {
          recovered: impactData.totalRecovered,
          preventedLoss: impactData.totalPreventedLoss,
          efficiency: impactData.averageEfficiencyScore,
          confidence: impactData.averageConfidenceScore,
          killerLine: `We didn't just recover €${impactData.totalRecovered.toLocaleString()}. 
                      We prevented €${impactData.totalPreventedLoss.toLocaleString()} in loss.`,
          revenueProtectionScore: impactData.revenueProtectionScore,
          period: `Last ${days} days`
        }
      });
    } catch (error) {
      console.error('Impact analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch impact data' });
    }
  });

  // GET /api/v1/analytics/identity - Revenue identity data
  router.get('/identity', authenticateApiKey, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = req.projectId;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      const identity = await counterfactualEngine.generateRevenueIdentity(projectId);
      
      res.json({
        success: true,
        data: identity
      });
    } catch (error) {
      console.error('Revenue identity error:', error);
      res.status(500).json({ error: 'Failed to generate revenue identity' });
    }
  });

  // POST /api/v1/analytics/impact/weekly-report - Generate weekly report
  router.post('/impact/weekly-report', authenticateApiKey, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = req.projectId;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      // For now, return a placeholder - will be implemented with notification service
      const impactData = await counterfactualEngine.calculateImpactSummary(projectId, 7);
      const identity = await counterfactualEngine.generateRevenueIdentity(projectId);
      
      const report = {
        headline: `Torqvio protected €${impactData.totalPreventedLoss.toLocaleString()} for your company this week`,
        metrics: {
          recovered: impactData.totalRecovered,
          prevented: impactData.totalPreventedLoss,
          efficiency: impactData.averageEfficiencyScore,
          customersProtected: impactData.customersProtected
        },
        period: 'Last 7 days',
        generatedAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Weekly report error:', error);
      res.status(500).json({ error: 'Failed to generate weekly report' });
    }
  });

  // POST /api/v1/analytics/impact/calculate - Calculate counterfactual impact for a specific date
  router.post('/impact/calculate', authenticateApiKey, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = req.projectId;
      const { date } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      if (!date) {
        return res.status(400).json({ error: 'Date is required' });
      }

      const impactDate = new Date(date);
      const impact = await counterfactualEngine.calculateCounterfactualImpact(projectId, impactDate);
      
      res.json({
        success: true,
        data: impact
      });
    } catch (error) {
      console.error('Counterfactual calculation error:', error);
      res.status(500).json({ error: 'Failed to calculate counterfactual impact' });
    }
  });

  // POST /api/v1/analytics/milestones - Record a milestone
  router.post('/milestones', authenticateApiKey, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = req.projectId;
      const { type, value, description } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      if (!type || !value || !description) {
        return res.status(400).json({ error: 'Type, value, and description are required' });
      }

      await counterfactualEngine.recordMilestone(projectId, type, value, description);
      
      res.json({
        success: true,
        message: 'Milestone recorded successfully'
      });
    } catch (error) {
      console.error('Milestone recording error:', error);
      res.status(500).json({ error: 'Failed to record milestone' });
    }
  });

  return router;
}
