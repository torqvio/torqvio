import { Request, Response, NextFunction } from 'express';
import { AdaptivePricingService } from '../billing/PricingService.js';
import { logger } from '../utils/logger.js';

const pricingService = new AdaptivePricingService();

export interface BillingRequest extends Request {
  user?: any;
  tenantPlan?: any;
}

/**
 * Middleware to check if user has access to a specific feature
 */
export function requireFeature(feature: string) {
  return async (req: BillingRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user?.userId;
      
      if (!tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const hasAccess = await pricingService.checkFeatureAccess(tenantId, feature);
      
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Feature not available on current plan',
          feature,
          upgradeRequired: true
        });
      }

      next();
    } catch (error: any) {
      logger.error('Feature check middleware error:', error);
      res.status(500).json({ error: 'Failed to check feature access' });
    }
  };
}

/**
 * Middleware to check if user is within plan limits for a specific metric
 */
export function requireLimit(metric: string, requestedAmount: number = 1) {
  return async (req: BillingRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user?.userId;
      
      if (!tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const limitCheck = await pricingService.checkLimit(tenantId, metric, requestedAmount);
      
      if (!limitCheck.allowed) {
        return res.status(429).json({ 
          error: 'Plan limit exceeded',
          metric,
          requestedAmount,
          currentUsage: limitCheck.currentUsage,
          limit: limitCheck.limit,
          remaining: limitCheck.remaining,
          upgradeRequired: true
        });
      }

      // Attach limit check to request for use in downstream handlers
      (req as any).limitCheck = limitCheck;
      next();
    } catch (error: any) {
      logger.error('Limit check middleware error:', error);
      res.status(500).json({ error: 'Failed to check plan limits' });
    }
  };
}

/**
 * Middleware to attach current plan information to request
 */
export async function attachTenantPlan(req: BillingRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = (req as any).user?.userId;
    
    if (!tenantId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const tenantPlan = await pricingService.getCurrentPlan(tenantId);
    (req as any).tenantPlan = tenantPlan;
    
    next();
  } catch (error: any) {
    logger.error('Tenant plan attachment error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant plan' });
  }
}

/**
 * Middleware to increment usage metrics after successful request
 */
export function trackUsage(metric: string, amount: number = 1) {
  return async (req: BillingRequest, res: Response, next: NextFunction) => {
    // Store original send method
    const originalSend = res.send;
    
    // Override send to track usage after successful response
    res.send = function(data: any) {
      // Only track usage on successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const tenantId = (req as any).user?.userId;
        
        if (tenantId) {
          pricingService.incrementUsage(tenantId, metric, amount).catch((error: any) => {
            logger.error('Failed to track usage:', error);
          });
        }
      }
      
      // Call original send
      return originalSend.call(this, data);
    };
    
    next();
  };
}

/**
 * Combined middleware for common workflow operations
 */
export const workflowLimits = {
  // Check if user can create workflows
  canCreateWorkflow: requireLimit('workflows', 1),
  
  // Check if user can execute workflows  
  canExecuteWorkflow: requireLimit('executionsPerMonth', 1),
  
  // Check if user can add team members
  canAddTeamMember: requireLimit('teamMembers', 1),
  
  // Check if user can connect integrations
  canConnectIntegration: requireLimit('connectedIntegrations', 1),
  
  // Track usage after operations
  trackWorkflowCreation: trackUsage('workflows', 1),
  trackWorkflowExecution: trackUsage('executionsPerMonth', 1),
  trackTeamMemberAddition: trackUsage('teamMembers', 1),
  trackIntegrationConnection: trackUsage('connectedIntegrations', 1),
  
  // Feature access checks
  requiresAdvancedAnalytics: requireFeature('advanced_analytics'),
  requiresApiAccess: requireFeature('api_access'),
  requiresWebhooks: requireFeature('webhooks'),
  requiresPrioritySupport: requireFeature('priority_support'),
  requiresSlaMonitoring: requireFeature('sla_monitoring'),
  requiresCustomIntegrations: requireFeature('custom_integrations'),
  requiresDedicatedSupport: requireFeature('dedicated_support'),
};
