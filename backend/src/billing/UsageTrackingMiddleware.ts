import { Request, Response, NextFunction } from 'express';
import { PricingService } from './PricingService';

const pricingService = new PricingService();

export const usageTrackingMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tenantId = req.headers['x-tenant-id'] as string | undefined;
    
    if (!tenantId) {
      next();
      return;
    }

    // Track usage for billing
    const usageEvent = {
      tenantId,
      event: getUsageEvent(req),
      timestamp: new Date(),
      metadata: {
        endpoint: req.path,
        method: req.method,
        userAgent: req.headers['user-agent']
      }
    };

    // Queue usage event (don't block request)
    await trackUsage(usageEvent);

    // Check limits for critical operations
    if (isLimitedOperation(req)) {
      const limitCheck = await pricingService.checkLimit(
        tenantId,
        getLimitMetric(req),
        1
      );

      if (!limitCheck.allowed) {
        res.status(429).json({
          error: 'Limit exceeded',
          limit: limitCheck.limit,
          currentUsage: limitCheck.currentUsage,
          upgradeUrl: '/billing/upgrade'
        });
        return;
      }
    }

    next();
  };
};

function getUsageEvent(req: Request): string {
  const path = req.path;
  
  if (path.includes('/executions')) return 'workflow_execution';
  if (path.includes('/integrations')) return 'integration_call';
  if (path.includes('/analytics')) return 'analytics_query';
  if (path.includes('/webhooks')) return 'webhook_received';
  
  return 'api_call';
}

function isLimitedOperation(req: Request): boolean {
  const limitedPaths = [
    '/api/v1/executions',
    '/api/v1/integrations',
    '/api/v1/webhooks'
  ];
  
  return limitedPaths.some(path => req.path.startsWith(path));
}

function getLimitMetric(req: Request): string {
  if (req.path.includes('/executions')) return 'executionsPerMonth';
  if (req.path.includes('/integrations')) return 'connectedIntegrations';
  
  return 'apiCalls';
}

async function trackUsage(usageEvent: any): Promise<void> {
  // Mock implementation - would queue for processing
  console.log('Tracking usage:', usageEvent);
}
