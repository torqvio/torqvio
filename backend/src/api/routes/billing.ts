import { Router, Request, Response, NextFunction } from 'express';
import { AdaptivePricingService, type Subscription, type TenantPlan } from '../../billing/PricingService.js';
import { authenticateToken, AuthenticatedRequest } from '../../utils/auth.js';
import { logger } from '../../utils/logger.js';
import { DatabaseConnection } from '../../database/connection.js';

const router: Router = Router();
const pricingService = new AdaptivePricingService();

// GET /api/v1/billing/plans - Get all available plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = pricingService.getAllAdaptivePlans();
    res.json({ plans });
  } catch (error: any) {
    logger.error('Failed to fetch plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// GET /api/v1/billing/current - Get current plan for authenticated user
router.get('/current', authenticateToken, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.userId;
    const currentPlan = await pricingService.getCurrentPlan(tenantId);
    res.json(currentPlan);
  } catch (error: any) {
    logger.error('Failed to fetch current plan:', error);
    res.status(500).json({ error: 'Failed to fetch current plan' });
  }
});

// POST /api/v1/billing/subscribe - Create or upgrade subscription
router.post('/subscribe', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { planId } = req.body;
    const tenantId = (req as any).user?.userId;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    const subscription = await pricingService.upgradePlan(tenantId, planId);
    res.json(subscription);
  } catch (error: any) {
    logger.error('Failed to create subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// GET /api/v1/billing/usage - Get current usage metrics
router.get('/usage', authenticateToken, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.userId;
    const usage = await pricingService.getCurrentUsage(tenantId);
    res.json({ usage });
  } catch (error: any) {
    logger.error('Failed to fetch usage:', error);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

// POST /api/v1/billing/check-limit - Check if action is within plan limits
router.post('/check-limit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { metric, requestedAmount } = req.body;
    const tenantId = (req as any).user?.userId;

    if (!metric || typeof requestedAmount !== 'number') {
      return res.status(400).json({ error: 'Metric and requestedAmount are required' });
    }

    const limitCheck = await pricingService.checkLimit(tenantId, metric, requestedAmount);
    res.json(limitCheck);
  } catch (error: any) {
    logger.error('Failed to check limit:', error);
    res.status(500).json({ error: 'Failed to check limit' });
  }
});

// GET /api/v1/billing/features/:feature - Check if user has access to specific feature
router.get('/features/:feature', authenticateToken, async (req: Request, res: Response) => {
  try {
    const feature = req.params.feature as string;
    const tenantId = (req as any).user?.userId;

    if (!feature) {
      return res.status(400).json({ error: 'Feature parameter is required' });
    }

    const hasAccess = await pricingService.checkFeatureAccess(tenantId, feature);
    res.json({ hasAccess, feature });
  } catch (error: any) {
    logger.error('Failed to check feature access:', error);
    res.status(500).json({ error: 'Failed to check feature access' });
  }
});

// GET /api/v1/billing/addons - Get available add-ons
router.get('/addons', async (req: Request, res: Response) => {
  try {
    const addOns = pricingService.getAvailableCapabilityLayers();
    res.json({ addOns });
  } catch (error: any) {
    logger.error('Failed to fetch add-ons:', error);
    res.status(500).json({ error: 'Failed to fetch add-ons' });
  }
});

// POST /api/v1/billing/calculate - Calculate monthly billing
router.post('/calculate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.userId;
    const billing = await pricingService.calculateHybridBilling(tenantId);
    res.json(billing);
  } catch (error: any) {
    logger.error('Failed to calculate billing:', error);
    res.status(500).json({ error: 'Failed to calculate billing' });
  }
});

// POST /api/v1/billing/addons/:addonId/subscribe - Subscribe to add-on
router.post('/addons/:addonId/subscribe', authenticateToken, async (req: Request, res: Response) => {
  try {
    const addonId = req.params.addonId as string;
    const tenantId = (req as any).user?.userId;
    
    if (!addonId) {
      return res.status(400).json({ error: 'Add-on ID is required' });
    }

    await pricingService.subscribeToCapability(tenantId, addonId);
    res.json({ message: 'Successfully subscribed to add-on' });
  } catch (error: any) {
    logger.error('Failed to subscribe to add-on:', error);
    res.status(500).json({ error: 'Failed to subscribe to add-on' });
  }
});

// POST /api/v1/billing/addons/:addonId/unsubscribe - Unsubscribe from add-on
router.post('/addons/:addonId/unsubscribe', authenticateToken, async (req: Request, res: Response) => {
  try {
    const addonId = req.params.addonId as string;
    const tenantId = (req as any).user?.userId;
    
    if (!addonId) {
      return res.status(400).json({ error: 'Add-on ID is required' });
    }

    await pricingService.unsubscribeFromCapability(tenantId, addonId);
    res.json({ message: 'Successfully unsubscribed from add-on' });
  } catch (error: any) {
    logger.error('Failed to unsubscribe from add-on:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from add-on' });
  }
});

export default router;
