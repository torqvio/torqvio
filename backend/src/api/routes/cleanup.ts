import { Router, Request, Response } from 'express';
import { smartCleanup } from '../../cleanup/SmartCleanupSystem.js';
import { logger } from '../../utils/logger.js';

const router = Router() as Router;

// GET /api/v1/webhooks/cleanup/stats - Get cleanup statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = smartCleanup.getCleanupStats();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get cleanup stats:', error);
    res.status(500).json({
      error: 'Failed to get cleanup stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/v1/webhooks/cleanup/manual - Manual cleanup
router.post('/manual', async (req: Request, res: Response) => {
  try {
    const { url_pattern, older_than_hours, inactive_only, limit } = req.body;
    
    // Validate request
    if (!url_pattern && !older_than_hours && !inactive_only) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Provide at least one criteria: url_pattern, older_than_hours, or inactive_only'
      });
    }

    const result = await smartCleanup.performManualCleanup({
      url_pattern,
      older_than_hours: older_than_hours ? Number(older_than_hours) : undefined,
      inactive_only: Boolean(inactive_only),
      limit: limit ? Number(limit) : undefined
    } as any);

    logger.warn(`Manual cleanup triggered`, {
      criteria: req.body,
      result,
      timestamp: new Date().toISOString()
    });

    res.json({
      message: result.message,
      deleted: result.deleted,
      criteria: req.body,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Manual cleanup failed:', error);
    res.status(500).json({
      error: 'Manual cleanup failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/v1/webhooks/cleanup/emergency - Emergency cleanup (admin only)
router.post('/emergency', async (req: Request, res: Response) => {
  try {
    // In production, add admin authentication here
    logger.error('EMERGENCY CLEANUP TRIGGERED', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    await smartCleanup.performEmergencyCleanup();

    res.json({
      message: 'Emergency cleanup completed',
      timestamp: new Date().toISOString(),
      warning: 'This was an aggressive cleanup - review logs for details'
    });

  } catch (error) {
    logger.error('Emergency cleanup failed:', error);
    res.status(500).json({
      error: 'Emergency cleanup failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
