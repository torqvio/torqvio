import { Request, Response, NextFunction } from 'express';
import { authenticateApiKey, AuthenticatedRequest } from '../utils/auth.js';

// Wrapper middleware to fix type compatibility issues
export function apiAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Re-enable authentication - documentation requires it!
  authenticateApiKey(req as unknown as AuthenticatedRequest, res, next);
}
